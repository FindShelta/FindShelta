import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import FindSheltaLogo from '../common/FindShelterLogo';
import Header from '../Layout/Header';
import PropertyUploadForm from '../Properties/PropertyUploadForm';

type AdminListing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  property_type: 'sale' | 'rent' | 'shortstay';
  location_city: string | null;
  location_state: string | null;
  location_address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[] | null;
  images: string[] | null;
  video_url: string | null;
  created_at: string;
  is_approved: boolean | null;
  status: string | null;
  is_hidden: boolean;
  hidden_note: string | null;
  hidden_at: string | null;
  agent_id: string | null;
  agent_name: string | null;
  agent_whatsapp: string | null;
};

type StatusFilter = 'all' | 'live' | 'booked' | 'pending';

const DEFAULT_ADMIN_EMAILS = [
  'agantiembennett@gmail.com',
  'pythonbook@hotmail.com',
  'sharellerealty677@gmail.com',
  'shezz2024@gmail.com',
  'shoppermonique20@gmail.com',
];

const getListingStatus = (listing: AdminListing) => {
  if (listing.is_hidden) return 'booked';
  if (listing.status === 'rejected') return 'rejected';
  if (listing.is_approved || listing.status === 'approved' || listing.status === 'approve') return 'live';
  return 'pending';
};

const statusStyles: Record<string, string> = {
  live: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  booked: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  pending: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
};

const statusLabels: Record<string, string> = {
  live: 'Live',
  booked: 'Booked / Hidden',
  pending: 'Pending',
  rejected: 'Rejected',
};

const AdminPortal: React.FC = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingsLoading, setListingsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null);

  const adminEmails = useMemo(
    () => Array.from(new Set([
      ...DEFAULT_ADMIN_EMAILS,
      ...(import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((entry: string) => entry.trim().toLowerCase()).filter(Boolean),
    ])),
    []
  );

  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    setDashboardError('');
    const emailIsAdmin = adminEmails.includes(user.email.toLowerCase());

    try {
      const { data, error } = await supabase.from('admin_users').select('id').eq('user_id', user.id).maybeSingle();
      setIsAdmin(Boolean(data?.id) || emailIsAdmin);
      if (error && !emailIsAdmin && error.code !== 'PGRST116' && error.code !== '42P01') {
        setDashboardError('Could not verify admin access. Check database permissions.');
      }
    } catch {
      setIsAdmin(emailIsAdmin);
      if (!emailIsAdmin) setDashboardError('Could not verify admin access.');
    } finally {
      setCheckingAdmin(false);
    }
  }, [adminEmails, user]);

  const fetchListings = useCallback(async () => {
    if (!isAdmin) return;
    setListingsLoading(true);
    setDashboardError('');

    const { data, error } = await supabase
      .from('listings')
      .select('id,title,description,price,property_type,location_city,location_state,location_address,bedrooms,bathrooms,amenities,images,video_url,created_at,is_approved,status,is_hidden,hidden_note,hidden_at,agent_id,agent_name,agent_whatsapp')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      setListings([]);
      setDashboardError('Failed to load listings. Apply the latest database migration and check admin permissions.');
    } else {
      setListings((data as AdminListing[]) || []);
    }
    setListingsLoading(false);
  }, [isAdmin]);

  useEffect(() => { void checkAdminAccess(); }, [checkAdminAccess]);
  useEffect(() => { void fetchListings(); }, [fetchListings]);

  const counts = useMemo(() => ({
    all: listings.length,
    live: listings.filter((listing) => getListingStatus(listing) === 'live').length,
    booked: listings.filter((listing) => getListingStatus(listing) === 'booked').length,
    pending: listings.filter((listing) => getListingStatus(listing) === 'pending').length,
  }), [listings]);

  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesStatus = activeStatus === 'all' || getListingStatus(listing) === activeStatus;
    const needle = searchQuery.trim().toLowerCase();
    const matchesSearch = !needle || [listing.title, listing.location_city, listing.location_state, listing.agent_name]
      .some((value) => value?.toLowerCase().includes(needle));
    return matchesStatus && matchesSearch;
  }), [activeStatus, listings, searchQuery]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      if (!(await login(email.trim(), password))) setAuthError('Invalid credentials.');
    } catch {
      setAuthError('Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateListing = async (listingId: string, values: Record<string, unknown>, failureMessage: string) => {
    setProcessingId(listingId);
    setDashboardError('');
    const { data, error } = await supabase.from('listings').update(values).eq('id', listingId).select().single();
    if (error) setDashboardError(failureMessage);
    else setListings((current) => current.map((listing) => listing.id === listingId ? { ...listing, ...data } : listing));
    setProcessingId(null);
  };

  const handleVisibilityToggle = async (listing: AdminListing) => {
    if (listing.is_hidden) {
      await updateListing(listing.id, { is_hidden: false, hidden_note: null, hidden_at: null }, 'Failed to restore this listing.');
      return;
    }

    const note = window.prompt('Optional admin note (for example, “Booked until Nov 10”):', '') ?? null;
    if (note === null) return;
    await updateListing(
      listing.id,
      { is_hidden: true, hidden_note: note.trim() || null, hidden_at: new Date().toISOString() },
      'Failed to hide this listing.'
    );
  };

  const handleApprove = (listingId: string) =>
    updateListing(listingId, { is_approved: true, status: 'approved' }, 'Failed to approve this listing.');

  const handleDelete = async (listing: AdminListing) => {
    if (!window.confirm(`Permanently delete “${listing.title}”? This cannot be undone.`)) return;
    setProcessingId(listing.id);
    const { error } = await supabase.from('listings').delete().eq('id', listing.id);
    if (error) setDashboardError('Failed to delete this listing.');
    else setListings((current) => current.filter((item) => item.id !== listing.id));
    setProcessingId(null);
  };

  const handleListingSubmitted = async () => {
    setShowUploadForm(false);
    setEditingListing(null);
    await fetchListings();
  };

  const formatPrice = (listing: AdminListing) => {
    const amount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(listing.price || 0);
    return listing.property_type === 'shortstay' ? `${amount}/night` : amount;
  };

  if (authLoading || checkingAdmin) {
    return <div className="flex min-h-screen items-center justify-center"><div className="panel rounded-xl px-6 py-5 text-sm text-[color:var(--text-muted)]">Checking admin access…</div></div>;
  }

  if (!user) {
    return (
      <div className="section-shell min-h-screen py-10 sm:py-16">
        <div className="enterprise-header mx-auto max-w-md">
          <div className="mb-5 text-center">
            <FindSheltaLogo size={58} className="mb-3" />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">FindShelta Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-[color:var(--text)]">Sign in</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-medium text-[color:var(--text)]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="brand-input mt-2 w-full rounded-lg px-3 py-2.5" required /></label>
            <label className="block text-sm font-medium text-[color:var(--text)]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="brand-input mt-2 w-full rounded-lg px-3 py-2.5" required /></label>
            {authError && <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{authError}</div>}
            <button type="submit" disabled={isSubmitting} className="brand-button w-full rounded-lg py-2.5 font-semibold disabled:opacity-60">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="section-shell min-h-screen py-16"><div className="enterprise-header mx-auto max-w-xl text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-3 text-2xl font-bold">Admin Access Required</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">This account does not have admin permissions.</p>
        <button onClick={logout} className="ghost-button mt-5 rounded-lg px-4 py-2 font-semibold">Sign out</button>
      </div></div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="section-shell py-6 sm:py-8">
        <section className="enterprise-header">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Admin operations</p>
              <h1 className="mt-1 text-3xl font-bold text-[color:var(--text)]">All listings</h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">Review, hide, restore, edit, and remove every listing in one place.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void fetchListings()} className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button>
              <button onClick={() => setShowUploadForm(true)} className="brand-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><Plus className="h-4 w-4" /> Add short stay</button>
              <button onClick={logout} className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          </div>
        </section>

        <section className="mt-5 enterprise-card">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'live', 'booked', 'pending'] as StatusFilter[]).map((status) => (
                <button key={status} onClick={() => setActiveStatus(status)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${activeStatus === status ? 'bg-[color:var(--brand)] text-white' : 'bg-[color:var(--surface-strong)] text-[color:var(--text-muted)]'}`}>
                  {status === 'booked' ? 'Booked / Hidden' : status} ({counts[status]})
                </button>
              ))}
            </div>
            <label className="relative block w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search listing, city, or host" className="brand-input w-full rounded-lg py-2 pl-9 pr-3 text-sm" />
            </label>
          </div>

          {dashboardError && <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{dashboardError}</div>}

          {listingsLoading ? (
            <div className="py-12 text-center text-sm text-[color:var(--text-muted)]">Loading all listings…</div>
          ) : filteredListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-[color:var(--text-muted)]">No listings match this view.</div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing) => {
                const listingStatus = getListingStatus(listing);
                const isProcessing = processingId === listing.id;
                return (
                  <article key={listing.id} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 sm:p-4">
                    <div className="grid gap-4 md:grid-cols-[112px_1fr_auto] md:items-center">
                      <img src={listing.images?.[0] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'} alt="" className="h-24 w-full rounded-lg object-cover md:w-28" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-bold text-[color:var(--text)]">{listing.title}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[listingStatus]}`}>{statusLabels[listingStatus]}</span>
                        </div>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">{listing.location_city || 'Unknown city'}, {listing.location_state || 'Nigeria'} · Host: {listing.agent_name || 'Not provided'}</p>
                        <p className="mt-1 text-sm font-bold text-[color:var(--brand)]">{formatPrice(listing)}</p>
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">Listed {new Date(listing.created_at).toLocaleDateString()}{listing.hidden_note ? ` · Note: ${listing.hidden_note}` : ''}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:max-w-64 md:justify-end">
                        {listingStatus === 'pending' && <button disabled={isProcessing} onClick={() => void handleApprove(listing.id)} className="brand-button inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button>}
                        <button disabled={isProcessing} onClick={() => void handleVisibilityToggle(listing)} className="ghost-button inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50">
                          {listing.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} {listing.is_hidden ? 'Restore' : 'Hide'}
                        </button>
                        <button onClick={() => setEditingListing(listing)} className="ghost-button inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                        <button disabled={isProcessing} onClick={() => void handleDelete(listing)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {(showUploadForm || editingListing) && (
        <PropertyUploadForm
          onClose={() => { setShowUploadForm(false); setEditingListing(null); }}
          onSubmit={handleListingSubmitted}
          allowAdminUpload
          isEditing={Boolean(editingListing)}
          initialData={editingListing || undefined}
        />
      )}
    </div>
  );
};

export default AdminPortal;
