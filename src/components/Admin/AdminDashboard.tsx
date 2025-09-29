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
  agent_name: string;
  created_at: string;
  price: number;
  type: 'sale' | 'rent' | 'shortstay';
  location: string;
  images: string[];
  approved: boolean;
  rejected: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'agents' | 'payments' | 'analytics' | 'security'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
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
        .select(`
          id, 
          title, 
          created_at, 
          price, 
          category, 
          location_city, 
          location_state, 
          images, 
          is_approved, 
          status,
          users!listings_agent_id_fkey(full_name)
        `)
        .eq('is_approved', false)
        .neq('status', 'rejected')
        .order('created_at', { ascending: false });

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

      // Map the data to include agent_name from the joined users table
      const mappedListings = (data || []).map(listing => ({
        ...listing,
        agent_name: listing.users?.full_name || 'Unknown Agent',
        type: listing.category,
        location: `${listing.location_city}, ${listing.location_state}`,
        approved: listing.is_approved,
        rejected: listing.status === 'rejected'
      }));
      
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

      // Get pending listings
      const { count: pendingCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .eq('status', 'pending');

      // Get today's approvals
      const today = new Date().toISOString().split('T')[0];
      const { count: approvedToday } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)
        .gte('updated_at', today);

      // Get today's rejections
      const { count: rejectedToday } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')
        .gte('updated_at', today);

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

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const handleApprove = async (listingId: string) => {
    setProcessingIds(prev => new Set(prev).add(listingId));
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_approved: true, status: 'approved' })
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      // Send notification
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await sendNotification(listing.agent_name, listing.title, 'approved');
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
      const { error } = await supabase
        .from('listings')
        .update({ status: 'rejected' })
        .eq('id', listingId);

      if (error) {
        throw error;
      }

      // Send notification
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await sendNotification(listing.agent_name, listing.title, 'rejected');
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

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    
    const suffix = type === 'rent' ? '/month' : type === 'shortstay' ? '/night' : '';
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

  const getTypeColor = (type: string) => {
    switch (type) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-3 flex items-center space-x-2 max-w-sm"
            >
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-blue-700 dark:text-blue-300 text-sm">{notification}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage property listings and payment approvals
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingListings}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approvedToday}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved Today</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejectedToday}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'listings', label: 'Property Listings', icon: Home },
              { id: 'agents', label: 'Agent Approvals', icon: User },
              { id: 'payments', label: 'Payment Management', icon: CreditCard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'security', label: 'Security', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-slate-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending Listings</span>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pendingListings}</p>
                </div>
              </div>
              
              <button
                onClick={fetchPendingListings}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={listing.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {listing.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{listing.agent_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(listing.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Home className="w-4 h-4" />
                                <span>{listing.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
                              {listing.type === 'sale' ? 'For Sale' : 
                               listing.type === 'rent' ? 'For Rent' : 
                               'Short Stay'}
                            </span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(listing.price, listing.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => handleReject(listing.id)}
                        disabled={processingIds.has(listing.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                      >
                        {processingIds.has(listing.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                      
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={processingIds.has(listing.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                      >
                        {processingIds.has(listing.id) ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
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