import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';

type PendingListing = {
  id: string;
  title: string;
  price: number;
  property_type: 'sale' | 'rent' | 'shortstay';
  location_city: string | null;
  location_state: string | null;
  images: string[] | null;
  created_at: string;
  is_approved: boolean | null;
  agent_id: string | null;
};

type ListingCategory = 'all' | 'sale' | 'rent' | 'shortstay';

const DEFAULT_ADMIN_EMAILS = ['agantiembennett@gmail.com', 'pythonbook@hotmail.com', 'sharellerealty677@gmail.com'];

const AdminPortal: React.FC = () => {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [activeCategory, setActiveCategory] = useState<ListingCategory>('all');
  const [listingsLoading, setListingsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState('');

  const adminEmails = useMemo(
    () =>
      Array.from(
        new Set([
          ...DEFAULT_ADMIN_EMAILS,
          ...(import.meta.env.VITE_ADMIN_EMAILS || '')
            .split(',')
            .map((entry: string) => entry.trim().toLowerCase())
            .filter(Boolean),
        ])
      ),
    []
  );

  const formatPrice = (price: number, type: string) => {
    const amount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price || 0);

    if (type === 'rent') return `${amount}/year`;
    if (type === 'shortstay') return `${amount}/night`;
    return amount;
  };

  const formatCategoryLabel = (category: ListingCategory) => {
    if (category === 'shortstay') return 'Short Stay';
    if (category === 'sale') return 'Sale';
    if (category === 'rent') return 'Rent';
    return 'All';
  };

  const categoryCounts = useMemo(() => {
    const counts = {
      all: pendingListings.length,
      sale: 0,
      rent: 0,
      shortstay: 0,
    };

    for (const listing of pendingListings) {
      const key = (listing.property_type || 'sale') as Exclude<ListingCategory, 'all'>;
      if (key in counts) {
        counts[key] += 1;
      }
    }

    return counts;
  }, [pendingListings]);

  const filteredPendingListings = useMemo(() => {
    if (activeCategory === 'all') return pendingListings;
    return pendingListings.filter((listing) => (listing.property_type || 'sale') === activeCategory);
  }, [activeCategory, pendingListings]);

  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    setCheckingAdmin(true);
    setDashboardError('');

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.id) {
        setIsAdmin(true);
        return;
      }

      // Fallback for deployments without admin_users table or seed.
      const emailIsAdmin = adminEmails.includes(user.email.toLowerCase());
      if (error && !emailIsAdmin && error.code !== 'PGRST116' && error.code !== '42P01') {
        setDashboardError('Could not verify admin access. Check database permissions.');
      }
      setIsAdmin(emailIsAdmin);
    } catch (error) {
      const emailIsAdmin = adminEmails.includes(user.email.toLowerCase());
      setIsAdmin(emailIsAdmin);
      if (!emailIsAdmin) {
        setDashboardError('Could not verify admin access.');
      }
    } finally {
      setCheckingAdmin(false);
    }
  }, [adminEmails, user]);

  const fetchPendingListings = useCallback(async () => {
    if (!isAdmin) return;

    setListingsLoading(true);
    setDashboardError('');

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id,title,price,property_type,location_city,location_state,images,created_at,is_approved,agent_id')
        .or('is_approved.eq.false,is_approved.is.null')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setPendingListings((data as PendingListing[]) || []);
    } catch (error) {
      setPendingListings([]);
      setDashboardError('Failed to load pending listings.');
    } finally {
      setListingsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    fetchPendingListings();
  }, [fetchPendingListings]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      const ok = await login(email.trim(), password);
      if (!ok) {
        setAuthError('Invalid credentials.');
      }
    } catch (error) {
      setAuthError('Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (listingId: string) => {
    setProcessingId(listingId);
    setDashboardError('');

    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_approved: true })
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      setPendingListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch (error) {
      setDashboardError('Failed to approve listing.');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="panel rounded-xl px-6 py-5 text-sm text-[color:var(--text-muted)]">
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section-shell min-h-screen py-10 sm:py-16">
        <div className="enterprise-header mx-auto max-w-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Admin Portal</p>
            <h1 className="mt-1 text-3xl font-bold text-[color:var(--text)]">Sign in</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="brand-input w-full rounded-lg px-3 py-2.5"
                placeholder="admin@company.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="brand-input w-full rounded-lg px-3 py-2.5"
                required
              />
            </div>

            {authError && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                {authError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="brand-button w-full rounded-lg py-2.5 font-semibold disabled:opacity-60">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="section-shell min-h-screen py-10 sm:py-16">
        <div className="enterprise-header mx-auto max-w-xl text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-3 text-2xl font-bold text-[color:var(--text)]">Admin Access Required</h1>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            This account does not have admin permissions.
          </p>
          {dashboardError && <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{dashboardError}</p>}
          <button onClick={logout} className="ghost-button mt-5 rounded-lg px-4 py-2 font-semibold">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="section-shell py-6 sm:py-8">
        <section className="enterprise-header">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Admin Operations</p>
              <h1 className="mt-1 text-3xl font-bold text-[color:var(--text)]">Listing Approvals</h1>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">Review and approve pending listings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchPendingListings} className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button onClick={logout} className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </section>

        <div className="mt-5 enterprise-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">Pending Queue</h2>
            <span className="rounded-md bg-[color:var(--surface-strong)] px-2 py-1 text-xs font-semibold text-[color:var(--text-muted)]">
              {filteredPendingListings.length} shown / {pendingListings.length} pending
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(['all', 'sale', 'rent', 'shortstay'] as ListingCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeCategory === category
                    ? 'bg-[color:var(--brand)] text-white'
                    : 'bg-[color:var(--surface-strong)] text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
                }`}
              >
                {formatCategoryLabel(category)} ({categoryCounts[category]})
              </button>
            ))}
          </div>

          {dashboardError && (
            <div className="mb-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
              {dashboardError}
            </div>
          )}

          {listingsLoading ? (
            <div className="py-10 text-center text-sm text-[color:var(--text-muted)]">Loading pending listings...</div>
          ) : filteredPendingListings.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                No pending {activeCategory === 'all' ? '' : formatCategoryLabel(activeCategory).toLowerCase() + ' '}listings right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingListings.map((listing) => (
                <article key={listing.id} className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <img
                      src={listing.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                      alt={listing.title}
                      className="h-28 w-full rounded-md object-cover sm:h-24 sm:w-32"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[color:var(--text)]">{listing.title}</h3>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                        {listing.location_city || 'Unknown city'}, {listing.location_state || 'Unknown state'}
                      </p>
                      <p className="text-sm font-semibold text-[color:var(--brand)]">
                        {formatPrice(listing.price, listing.property_type)}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                        Submitted: {new Date(listing.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApprove(listing.id)}
                      disabled={processingId === listing.id}
                      className="brand-button inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      {processingId === listing.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
