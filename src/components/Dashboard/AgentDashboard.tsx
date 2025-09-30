import React, { useState } from 'react';
import { Plus, Upload, CreditCard, BarChart3, Eye, Bookmark, Calendar, AlertCircle, CheckCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import PropertyUploadForm from '../Properties/PropertyUploadForm';

const AgentDashboard: React.FC = () => {
  const { user, agentStatus, refreshAgentStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'payment' | 'analytics'>('listings');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalBookmarks: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Enhanced subscription status with payment verification
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isActive: false,
    isVerified: false,
    paymentStatus: 'pending' as 'pending' | 'approved' | 'rejected',
    expiryDate: null as Date | null,
    plan: null as string | null
  });

  // Fetch agent's listings and stats
  const fetchListingsAndStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Try to get agent record first
      const { data: agentData, error: agentError } = await supabase
        .from('agent_registration')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agentError) {
        if (agentError.code === 'PGRST116') {
          // No agent record found - user is not an agent
          console.log('No agent record found for user');
          setListings([]);
          calculateStats([]);
          return;
        }
        console.error('Error fetching agent data:', agentError);
        setListings([]);
        calculateStats([]);
        return;
      }
      
      console.log('Agent ID found:', agentData.id); // Debug log
      
      // Fetch agent's listings using user.id as agent_id
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        setListings([]);
        calculateStats([]);
        return;
      }

      console.log('Listings found:', listingsData?.length || 0); // Debug log
      setListings(listingsData || []);
      calculateStats(listingsData || []);
    } catch (error) {
      console.error('Error fetching listings and stats:', error);
      setListings([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Check subscription status based on agent approval
  React.useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Get agent approval info
        const { data: agentData, error: agentError } = await supabase
          .from('agent_registration')
          .select('status, approved_at, created_at')
          .eq('user_id', user.id)
          .single();

        console.log('Agent data from database:', agentData); // Debug log

        if (agentError || !agentData) {
          // Not an agent or agent not found
          if (agentError?.code === 'PGRST116') {
            // No agent record found - user is not an agent
            setSubscriptionStatus({
              isActive: false,
              isVerified: false,
              paymentStatus: 'pending',
              expiryDate: null,
              plan: null
            });
            return;
          }
          // Other error, set basic subscription
          setSubscriptionStatus({
            isActive: true,
            isVerified: true,
            paymentStatus: 'approved',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            plan: 'monthly'
          });
          return;
        }

        if (agentData.status !== 'approved' && agentData.status !== 'approve') {
          // Agent not approved yet
          setSubscriptionStatus({
            isActive: false,
            isVerified: false,
            paymentStatus: 'pending',
            expiryDate: null,
            plan: null
          });
          return;
        }

        // For approved agents, allow immediate access
        // They can subscribe later but can start listing right away
        setSubscriptionStatus({
          isActive: true,
          isVerified: true,
          paymentStatus: 'approved',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          plan: 'active'
        });
        
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus({
          isActive: false,
          isVerified: false,
          paymentStatus: 'error',
          expiryDate: null,
          plan: null
        });
      }
    };

    checkSubscriptionStatus();
    fetchListingsAndStats();
  }, [user?.id, agentStatus]); // Add agentStatus as dependency to refresh when it changes

  // Manual refresh function that uses auth context
  const handleRefreshStatus = async () => {
    setLoading(true);
    await refreshAgentStatus();
    setTimeout(() => setLoading(false), 500);
  };

  const calculateStats = (listingsData: any[]) => {
    const totalListings = listingsData?.length || 0;
    const totalViews = 0; // Views column doesn't exist in database
    const totalBookmarks = 0; // Bookmarks column doesn't exist in database
    
    // Calculate this month's listings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = listingsData?.filter(listing => {
      const listingDate = new Date(listing.created_at);
      return listingDate.getMonth() === currentMonth && listingDate.getFullYear() === currentYear;
    }).length || 0;

    setStats({
      totalListings,
      totalViews,
      totalBookmarks,
      thisMonth
    });
  };

  const getStatusColor = (status: string, isApproved: boolean) => {
    if (isApproved) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
  };
  
  const getStatusText = (status: string, isApproved: boolean) => {
    if (isApproved) return 'Approved';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const handlePropertySubmit = (propertyData: any) => {
    // Refresh listings after new property is added
    console.log('New property submitted:', propertyData);
    fetchListingsAndStats();
    setShowUploadForm(false);
  };

  const SubscriptionStatus = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscription Status
          </h3>
          <div className="mt-2 space-y-1">
            <p className="text-gray-600 dark:text-gray-300">
              {subscriptionStatus.isActive 
                ? `Active until ${subscriptionStatus.expiryDate?.toLocaleDateString()}` 
                : subscriptionStatus.paymentStatus === 'pending'
                ? 'Payment verification pending'
                : subscriptionStatus.paymentStatus === 'rejected'
                ? 'Payment rejected - please resubmit'
                : 'Please subscribe to start listing properties'}
            </p>
            {subscriptionStatus.plan && (
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {subscriptionStatus.plan} plan
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {subscriptionStatus.paymentStatus === 'pending' && (
            <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Pending</span>
            </div>
          )}
          {subscriptionStatus.paymentStatus === 'approved' && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Verified</span>
            </div>
          )}
          {subscriptionStatus.paymentStatus === 'rejected' && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Rejected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SubscriptionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Subscription Plans
            </h2>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          {/* Subscription content here */}
        </div>
      </div>
    </div>
  );

  const PaymentForm = () => {
    const getDaysRemaining = () => {
      if (!subscriptionStatus.expiryDate) return 0;
      const now = new Date();
      const expiry = new Date(subscriptionStatus.expiryDate);
      return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    };

    const daysRemaining = getDaysRemaining();
    const isExpired = subscriptionStatus.paymentStatus === 'expired';
    const isTrial = subscriptionStatus.plan === 'free_trial';

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Subscription Status
        </h3>
        
        {isTrial && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🎉 Free Trial Active</h4>
            <p className="text-sm text-green-700 dark:text-green-200">
              You're currently on a free trial. {daysRemaining} days remaining.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">⚠️ Subscription Expired</h4>
            <p className="text-sm text-red-700 dark:text-red-200">
              Your subscription expired. Renew to continue listing properties.
            </p>
          </div>
        )}

        {!isExpired && !isTrial && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">✅ Account Active</h4>
            <p className="text-sm text-green-700 dark:text-green-200">
              You can start listing properties. Subscribe for continued access.
            </p>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">Monthly Plan</span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Recommended</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Full access to all features
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">₦15,000</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Instructions</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Transfer ₦15,000 to: <strong>Opay - 9080151095 - Benneth Agantiem</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            After payment, contact support to activate your subscription.
          </p>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View Subscription Plans
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Need help? Contact us at <strong>support@findshelta.com</strong>
          </p>
        </div>
      </div>
    );
  };

  const ListingsTab = () => (
    <div className="space-y-6">
      {agentStatus !== 'approved' && agentStatus !== 'approve' ? (
        <div className={`rounded-lg p-4 ${
          agentStatus === 'pending' 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
            : agentStatus === 'rejected'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
        }`}>
          <p className={`${
            agentStatus === 'pending' 
              ? 'text-yellow-800 dark:text-yellow-200'
              : agentStatus === 'rejected'
              ? 'text-red-800 dark:text-red-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {agentStatus === 'pending' 
              ? 'Your agent registration is pending approval. You will be able to list properties once approved by an admin.'
              : agentStatus === 'rejected'
              ? 'Your agent registration was rejected. Please contact support for more information.'
              : 'Agent approval required before you can list properties.'}
          </p>
        </div>
      ) : !subscriptionStatus.isActive ? (
        <div className={`border rounded-lg p-4 ${
          subscriptionStatus.paymentStatus === 'pending' 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
            : subscriptionStatus.paymentStatus === 'rejected'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
        }`}>
          <p className={`${
            subscriptionStatus.paymentStatus === 'pending' 
              ? 'text-yellow-800 dark:text-yellow-200'
              : subscriptionStatus.paymentStatus === 'rejected'
              ? 'text-red-800 dark:text-red-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {subscriptionStatus.paymentStatus === 'pending' 
              ? 'Your payment is being verified. You can start listing once approved.'
              : subscriptionStatus.paymentStatus === 'rejected'
              ? 'Your payment was rejected. Please resubmit payment to start listing.'
              : 'Please complete your subscription to start listing properties.'}
          </p>
        </div>
      ) : (
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Property</span>
        </button>
      )}
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Listings
          </h3>
          <button
            onClick={fetchListingsAndStats}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-1"
          >
            <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        {agentStatus !== 'approved' && agentStatus !== 'approve' ? (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {agentStatus === 'pending' ? 'Agent approval required to view listings' : 'Agent registration rejected'}
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {subscriptionStatus.isActive ? 'No properties listed yet' : 'Subscription required to list properties'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const getStatusColor = (status: string, isApproved: boolean) => {
                if (isApproved) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
              };
              
              const getStatusText = (status: string, isApproved: boolean) => {
                if (isApproved) return 'Approved';
                if (status === 'rejected') return 'Rejected';
                return 'Pending Approval';
              };
              
              return (
                <div key={listing.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={listing.images?.[0] || '/placeholder-property.jpg'}
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{listing.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status, listing.is_approved)}`}>
                          {getStatusText(listing.status, listing.is_approved)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {listing.location_city}, {listing.location_state}
                      </p>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        ₦{listing.price?.toLocaleString()}{listing.property_type === 'rent' ? '/year' : listing.property_type === 'shortstay' ? '/night' : ''}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created: {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status, listing.is_approved)}`}>
                        {getStatusText(listing.status, listing.is_approved)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bookmark className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookmarks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bookmarks</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-emerald-100">
                Manage your properties and grow your business
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalListings}</div>
              <div className="text-emerald-100 text-sm">Active Listings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBookmarks}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bookmarks</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Bookmark className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.thisMonth}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Subscription Status
              </h3>
              <div className="flex items-center space-x-3">
                {subscriptionStatus.isActive ? (
                  <>
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Active</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      Until {subscriptionStatus.expiryDate?.toLocaleDateString()}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Payment Pending</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {subscriptionStatus.plan} plan
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'listings', label: 'My Listings', icon: Upload },
              { id: 'payment', label: 'Subscription', icon: CreditCard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {agentStatus !== 'approved' && agentStatus !== 'approve' ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700 text-center">
            <div className="mb-4">
              {agentStatus === 'pending' && (
                <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400 mb-4">
                  <Clock className="w-8 h-8" />
                  <span className="text-xl font-semibold">Pending Approval</span>
                </div>
              )}
              {agentStatus === 'rejected' && (
                <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 mb-4">
                  <AlertCircle className="w-8 h-8" />
                  <span className="text-xl font-semibold">Registration Rejected</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {agentStatus === 'pending' 
                ? 'Your agent registration is being reviewed by our admin team. You will receive an email notification once approved.'
                : 'Your agent registration was not approved. Please contact our support team for assistance.'}
            </p>
            {agentStatus === 'pending' && (
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Subscribe now to start listing properties immediately after approval.
                </p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  View Subscription Plans
                </button>
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-4">
              <button
                onClick={handleRefreshStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Status
              </button>
              <p>Need help? Contact us at support@findshelta.com</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'listings' && <ListingsTab />}
            {activeTab === 'payment' && <PaymentForm />}
            {activeTab === 'analytics' && <AnalyticsTab />}
          </>
        )}
        
        {/* Property Upload Modal */}
        {showUploadForm && (
          <PropertyUploadForm
            onClose={() => setShowUploadForm(false)}
            onSubmit={handlePropertySubmit}
          />
        )}
        
        {/* Subscription Plans Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Agent Subscription Plans
                  </h2>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {/* Monthly Plan */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-blue-500 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Monthly
                      </h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        ₦15,000
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">per month</p>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Unlimited listings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Priority support</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('9080151095');
                        alert('Account number copied!');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-xs"
                    >
                      Copy Account
                    </button>
                  </div>

                  {/* Quarterly Plan */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Quarterly
                      </h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        ₦35,000
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">3 months</p>
                      <p className="text-green-600 dark:text-green-400 text-xs font-medium">Save ₦10,000</p>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Unlimited listings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Priority support</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('9080151095');
                        alert('Account number copied!');
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors text-xs"
                    >
                      Copy Account
                    </button>
                  </div>

                  {/* Annual Plan */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Annual
                      </h3>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        ₦110,000
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">12 months</p>
                      <p className="text-green-600 dark:text-green-400 text-xs font-medium">Save ₦70,000</p>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Unlimited listings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Priority support</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('9080151095');
                        alert('Account number copied!');
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors text-xs"
                    >
                      Copy Account
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Payment Details:
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div><strong>Bank:</strong> Opay</div>
                    <div><strong>Account:</strong> 9080151095</div>
                    <div><strong>Name:</strong> Benneth Agantiem</div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    After payment, send your receipt to:<br/>
                    <strong>Email:</strong> support@findshelta.com<br/>
                    <strong>WhatsApp:</strong> +2347025790877
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;