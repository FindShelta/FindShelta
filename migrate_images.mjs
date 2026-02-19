import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

const supabaseUrl = 'https://vvtldnyxnqmfhlpascel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateImages() {
  console.log('🔄 Starting image migration...\n');

  // Get listing IDs only (no images)
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title')
    .eq('is_approved', true);

  if (error) {
    console.error('❌ Error fetching listings:', error);
    return;
  }

  console.log(`📋 Found ${listings.length} listings to process\n`);

  for (const listing of listings) {
    console.log(`Processing: ${listing.title}`);
    
    // Fetch images for this listing only
    const { data: listingData, error: imgError } = await supabase
      .from('listings')
      .select('images')
      .eq('id', listing.id)
      .single();

    if (imgError || !listingData?.images || listingData.images.length === 0) {
      console.log('  ⏭️  No images or error, skipping\n');
      continue;
    }

    const newImageUrls = [];

    for (let i = 0; i < Math.min(listingData.images.length, 5); i++) {
      const image = listingData.images[i];
      
      // Check if already a URL
      if (image.startsWith('http')) {
        newImageUrls.push(image);
        continue;
      }

      // Extract base64 data
      const base64Data = image.split(',')[1] || image;
      const fileName = `${listing.id}_${i}.jpg`;
      
      try {
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, decode(base64Data), {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
        console.log(`  ✅ Uploaded image ${i + 1}`);
      } catch (err) {
        console.error(`  ❌ Failed to upload image ${i + 1}:`, err.message);
        newImageUrls.push('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg');
      }
    }

    // Update listing with new URLs
    const { error: updateError } = await supabase
      .from('listings')
      .update({ images: newImageUrls })
      .eq('id', listing.id);

    if (updateError) {
      console.error(`  ❌ Failed to update listing:`, updateError);
    } else {
      console.log(`  ✅ Updated listing with ${newImageUrls.length} URLs\n`);
    }
  }

  console.log('🎉 Migration complete!');
}

migrateImages();
