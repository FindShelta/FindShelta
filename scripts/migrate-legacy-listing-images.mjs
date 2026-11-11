import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const environmentFile = existsSync('.env.migration.local')
  ? '.env.migration.local'
  : existsSync('.env.local')
    ? '.env.local'
    : null;

if (environmentFile) process.loadEnvFile(environmentFile);

const args = new Set(process.argv.slice(2));
const applyChanges = args.has('--apply');
const limitArgument = process.argv.find((argument) => argument.startsWith('--limit='));
const limit = limitArgument ? Number(limitArgument.split('=')[1]) : null;

const supabaseUrl = process.env.SUPABASE_URL
  || process.env.VITE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in a local environment file before running this migration.');
  process.exit(1);
}

const decodeJwtPayload = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const credentialPayload = decodeJwtPayload(serviceRoleKey);
const isServiceCredential = credentialPayload?.role === 'service_role' || serviceRoleKey.startsWith('sb_secret_');

if (!isServiceCredential) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not a service-role credential. Migration stopped.');
  process.exit(1);
}

if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
  console.error('--limit must be a positive integer.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const isPublicUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

const decodeImage = (value) => {
  if (typeof value !== 'string' || isPublicUrl(value)) return null;

  const dataUrlMatch = value.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/is);
  const mimeType = dataUrlMatch?.[1]?.toLowerCase() || 'image/jpeg';
  const encoded = (dataUrlMatch?.[2] || value).replace(/\s/g, '');
  const buffer = Buffer.from(encoded, 'base64');

  if (buffer.length === 0) throw new Error('Image contains no decodable data.');

  const extensionByMimeType = {
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return {
    buffer,
    mimeType,
    extension: extensionByMimeType[mimeType] || 'jpg',
  };
};

const verifyPublicObject = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Range: 'bytes=0-0' },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Storage verification returned HTTP ${response.status}.`);
  }
};

const fetchListingImages = async (id) => {
  const { data, error } = await supabase
    .from('listings')
    .select('images,cover_image_url')
    .eq('id', id)
    .single()
    .abortSignal(AbortSignal.timeout(60_000));

  if (error) throw error;
  return data;
};

const migrateListing = async (listing) => {
  const current = await fetchListingImages(listing.id);
  const originalImages = Array.isArray(current.images) ? current.images : [];
  const legacyCount = originalImages.filter((image) => !isPublicUrl(image)).length;

  if (!applyChanges) {
    return { legacyCount, uploadedCount: 0, updated: false };
  }

  const migratedImages = [...originalImages];
  let uploadedCount = 0;

  for (let index = 0; index < originalImages.length; index += 1) {
    const image = originalImages[index];
    if (isPublicUrl(image)) continue;

    const decoded = decodeImage(image);
    if (!decoded) continue;

    const digest = createHash('sha256').update(decoded.buffer).digest('hex').slice(0, 16);
    const objectPath = `legacy/${listing.id}/${index + 1}-${digest}.${decoded.extension}`;
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(objectPath, decoded.buffer, {
        contentType: decoded.mimeType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(objectPath);

    await verifyPublicObject(publicUrlData.publicUrl);
    migratedImages[index] = publicUrlData.publicUrl;
    uploadedCount += 1;
  }

  const coverImageUrl = migratedImages.find(isPublicUrl) || null;
  const shouldUpdate = uploadedCount > 0 || current.cover_image_url !== coverImageUrl;

  if (!shouldUpdate) {
    return { legacyCount, uploadedCount, updated: false };
  }

  const { data: updatedListing, error: updateError } = await supabase
    .from('listings')
    .update({
      images: migratedImages,
      cover_image_url: coverImageUrl,
    })
    .eq('id', listing.id)
    .select('id,cover_image_url')
    .single();

  if (updateError) throw updateError;
  if (updatedListing.cover_image_url !== coverImageUrl) {
    throw new Error('Database verification did not return the expected cover URL.');
  }

  return { legacyCount, uploadedCount, updated: true };
};

const { data: listingRows, error: listingError } = await supabase
  .from('listings')
  .select('id,title')
  .order('created_at', { ascending: true });

if (listingError) {
  console.error('Could not read listings:', listingError.message);
  process.exit(1);
}

const listings = limit ? listingRows.slice(0, limit) : listingRows;
const summary = {
  scanned: 0,
  legacyImages: 0,
  uploaded: 0,
  updated: 0,
  failed: 0,
};

console.log(applyChanges
  ? `Applying verified image migration to ${listings.length} listings.`
  : `Dry run: scanning ${listings.length} listings. Add --apply to write changes.`);

for (const listing of listings) {
  summary.scanned += 1;

  try {
    const result = await migrateListing(listing);
    summary.legacyImages += result.legacyCount;
    summary.uploaded += result.uploadedCount;
    if (result.updated) summary.updated += 1;
    console.log(`[${summary.scanned}/${listings.length}] ${listing.title || listing.id}: ${result.legacyCount} legacy, ${result.uploadedCount} uploaded`);
  } catch (error) {
    summary.failed += 1;
    console.error(`[${summary.scanned}/${listings.length}] ${listing.title || listing.id}: ${error.message}`);
  }
}

console.log('Migration summary:', summary);

if (summary.failed > 0) process.exitCode = 1;
