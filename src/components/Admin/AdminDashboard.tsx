import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Calendar, User, Home, RefreshCw, CreditCard, Bell, Mail, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import PaymentDashboard from './PaymentDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import SecurityDashboard from './SecurityDashboard';
import AgentApproval from './AgentApproval';

interface Listing {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  price: number;
  category: 'sale' | 'rent' | 'shortstay';
  location_city: string;
  location_state: string;
  images: string[];
  is_approved: boolean;
  agent_name?: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'recent' | 'agents' | 'payments' | 'analytics' | 'security'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [recentUploads, setRecentUploads] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    approvedToday: 0,
    rejectedToday: 0
  });

  const fetchPendingListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or('is_approved.eq.false,is_approved.is.null')
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('Fetched listings:', data);
      console.log('Error:', error);

      if (error) {
        console.log('Listings table not accessible:', error.message);
        setListings([]); // Set empty array if table doesn't exist
        setStats({
          totalListings: 0,
          pendingListings: 0,
          approvedToday: 0,
          rejectedToday: 0
        });
        return;
      }

      const mappedListings = data || [];
      
      setListings(mappedListings);
      
      // Fetch stats
      await fetchStats();
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
      setStats({
        totalListings: 0,
        pendingListings: 0,
        approvedToday: 0,
        rejectedToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total listings
      const { count: totalCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Get pending listings (false or null)
      const { count: pendingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .or('is_approved.eq.false,is_approved.is.null');

      // Get today's approvals
      const today = new Date().toISOString().split('T')[0];
      const { count: approvedToday } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .gte('created_at', today);

      // Get today's rejections - skip since rejected column doesn't exist
      const rejectedToday = 0;

      setStats({
        totalListings: totalCount || 0,
        pendingListings: pendingCount || 0,
        approvedToday: approvedToday || 0,
        rejectedToday: rejectedToday || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats if table doesn't exist
      setStats({
        totalListings: 0,
        pendingListings: 0,
        approvedToday: 0,
        rejectedToday: 0
      });
    }
  };

  const sendNotification = async (agentName: string, listingTitle: string, action: 'approved' | 'rejected') => {
    const message = `Listing "${listingTitle}" by ${agentName} has been ${action}`;
    setNotifications(prev => [...prev, message]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const fetchRecentUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setRecentUploads(data);
      }
    } catch (err) {
      console.error('Error fetching recent uploads:', err);
    }
  };

  useEffect(() => {
    fetchPendingListings();
    fetchRecentUploads();
  }, []);

  const handleApprove = async (listingId: string) => {
    setProcessingIds(prev => new Set(prev).add(listingId));
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_approved: true })
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      // Send notification
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await sendNotification(listing.agent_id, listing.title, 'approved');
      }

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (err) {
      console.error('Error approving listing:', err);
      setError('Failed to approve listing. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const handleReject = async (listingId: string) => {
    setProcessingIds(prev => new Set(prev).add(listingId));
    
    try {
      // Since there's no rejected column, just delete the listing
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      // Send notification
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await sendNotification(listing.agent_id, listing.title, 'rejected');
      }

      // Remove from local state
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (err) {
      console.error('Error rejecting listing:', err);
      setError('Failed to reject listing. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const formatPrice = (price: number, category: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    
    const suffix = category === 'rent' ? '/month' : category === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (category: string) => {
    switch (category) {
      case 'sale':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'rent':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'shortstay':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading pending listings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-2 sm:p-3 flex items-center space-x-2 max-w-full sm:max-w-sm"
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm truncate">{notification}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Manage property listings and payment approvals
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingListings}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.approvedToday}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.rejectedToday}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 mb-4 sm:mb-6">
          <nav className="flex overflow-x-auto space-x-4 sm:space-x-8 pb-1">
            {[
              { id: 'listings', label: 'Listings', fullLabel: 'Property Listings', icon: Home },
              { id: 'recent', label: 'Recent', fullLabel: 'Recent Uploads', icon: Calendar },
              { id: 'agents', label: 'Agents', fullLabel: 'Agent Approvals', icon: User },
              { id: 'payments', label: 'Payments', fullLabel: 'Payment Management', icon: CreditCard },
              { id: 'analytics', label: 'Analytics', fullLabel: 'Analytics', icon: BarChart3 },
              { id: 'security', label: 'Security', fullLabel: 'Security', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'recent' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Uploads</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Latest property listings uploaded to the platform</p>
            </div>
            
            <div className="p-6">
              {recentUploads.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                    No Recent Activity
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    When agents upload new properties, they'll appear here for quick review
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {recentUploads.map((listing, index) => (
                    <div key={listing.id} className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600">
                      <div className="relative overflow-hidden">
                        <img
                          src={listing.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                          alt={listing.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
                            listing.is_approved 
                              ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                              : 'bg-amber-500/90 text-white border-amber-400/50'
                          }`}>
                            {listing.is_approved ? '✓ Live' : '⏳ Review'}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="text-white font-bold text-lg mb-1 drop-shadow-lg">
                            {formatPrice(listing.price, listing.category)}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {listing.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <User className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="font-medium">{listing.agent_name || 'Agent'}</span>
                          </div>
                          <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                            <Home className="w-4 h-4 mr-2 text-emerald-500" />
                            <span>{listing.location_city}, {listing.location_state}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                            {formatDate(listing.created_at)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">#{String(index + 1).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="bg-white dark:bg-slate-800 rounded-lg px-3 sm:px-4 py-2 border border-gray-200 dark:border-slate-700">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending Listings</span>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stats.pendingListings}</p>
              </div>
              
              <button
                onClick={fetchPendingListings}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Listings */}
            {listings.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  There are no pending listings to review at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={listing.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                          alt={listing.title}
                          className="w-full h-48 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-3">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {listing.title}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{listing.agent_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">{formatDate(listing.created_at)}</span>
                              <span className="sm:hidden">{new Date(listing.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{listing.location_city}, {listing.location_state}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.category)}`}>
                              {listing.category === 'sale' ? 'Sale' : listing.category === 'rent' ? 'Rent' : 'Stay'}
                            </span>
                            <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(listing.price, listing.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 sm:space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => handleReject(listing.id)}
                        disabled={processingIds.has(listing.id)}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm"
                      >
                        {processingIds.has(listing.id) ? (
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                      
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={processingIds.has(listing.id)}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm"
                      >
                        {processingIds.has(listing.id) ? (
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && <AgentApproval />}
        {activeTab === 'payments' && <PaymentDashboard />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'security' && <SecurityDashboard />}
      </div>
    </div>
  );
};

export default AdminDashboard;