import React, { useState } from 'react';
import { Plus, Upload, CreditCard, BarChart3, Eye, Bookmark, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import PropertyUploadForm from '../Properties/PropertyUploadForm';

const AgentDashboard: React.FC = () => {
  const { user, agentStatus } = useAuth();
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
        if (agentError.code === '42P01') {
          // Agent registration table doesn't exist, fall back to old method
          const { data: listingsData, error: listingsError } = await supabase
            .from('listings')
            .select('*')
            .eq('agent_id', user.id)
            .order('created_at', { ascending: false });

          if (listingsError) {
            console.error('Error fetching listings:', listingsError);
            return;
          }

          setListings(listingsData || []);
          calculateStats(listingsData || []);
          return;
        }
        console.error('Agent not found:', agentError);
        return;
      }
      
      // Fetch agent's listings using agent_uuid
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('agent_uuid', agentData.id)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      setListings(listingsData || []);
      calculateStats(listingsData || []);
    } catch (error) {
      console.error('Error fetching listings and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check subscription and payment status
  React.useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Check if user exists in users table and get subscription info
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.log('No profile found for user:', user.id, userError.message);
          // Set default subscription status for all users
          setSubscriptionStatus({
            isActive: true, // Allow listing for all users
            isVerified: true,
            paymentStatus: 'approved',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            plan: 'monthly'
          });
          return;
        }

        // Try to check payments table if it exists
        try {
          const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('agent_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (payments && payments.length > 0) {
            const latestPayment = payments[0];
            const isActive = latestPayment.status === 'approved' && 
                            new Date(latestPayment.expires_at) > new Date();
            
            setSubscriptionStatus({
              isActive,
              isVerified: latestPayment.status === 'approved',
              paymentStatus: latestPayment.status,
              expiryDate: latestPayment.expires_at ? new Date(latestPayment.expires_at) : null,
              plan: latestPayment.plan
            });
          } else {
            // No payments found, set default for testing
            setSubscriptionStatus({
              isActive: true,
              isVerified: true,
              paymentStatus: 'approved',
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              plan: 'monthly'
            });
          }
        } catch (paymentError) {
          console.log('Payments table not accessible:', paymentError.message);
          // Payments table doesn't exist or not accessible, set default
          setSubscriptionStatus({
            isActive: true,
            isVerified: true,
            paymentStatus: 'approved',
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            plan: 'monthly'
          });
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // Set default subscription for testing
        setSubscriptionStatus({
          isActive: true,
          isVerified: true,
          paymentStatus: 'approved',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          plan: 'monthly'
        });
      }
    };

    checkSubscriptionStatus();
    fetchListingsAndStats();
  }, [user?.id]);

  const calculateStats = (listingsData: any[]) => {
    const totalListings = listingsData?.length || 0;
    const totalViews = listingsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;
    const totalBookmarks = listingsData?.reduce((sum, listing) => sum + (listing.bookmarks || 0), 0) || 0;
    
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

  const handlePropertySubmit = (propertyData: any) => {
    // Refresh listings after new property is added
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

  const PaymentForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Choose Your Plan
      </h3>
      
      <div className="space-y-4 mb-6">
        {[
          { plan: 'monthly', price: '₦15,000', duration: '1 Month', popular: false },
          { plan: 'quarterly', price: '₦35,000', duration: '3 Months', popular: true },
          { plan: 'yearly', price: '₦110,000', duration: '12 Months', popular: false }
        ].map((option) => (
          <div key={option.plan} className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            option.popular 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <input type="radio" name="plan" value={option.plan} className="text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">{option.duration}</span>
                  {option.popular && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Popular</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Full access to all features
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{option.price}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {option.plan === 'monthly' ? 'per month' : option.plan === 'quarterly' ? 'per 3 months' : 'per year'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Instructions</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Transfer to: <strong>Opay - 9080151095 - Benneth Agantiem</strong>
        </p>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Payment Proof
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
        Submit Payment for Verification
      </button>
    </div>
  );

  const ListingsTab = () => (
    <div className="space-y-6">
      {agentStatus === 'pending' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Your agent registration is pending approval. You will be able to list properties once approved by an admin.
          </p>
        </div>
      ) : agentStatus === 'rejected' ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Your agent registration was rejected. Please contact support for more information.
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Listings
        </h3>
        
        {agentStatus === 'pending' || agentStatus === 'rejected' ? (
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
              {subscriptionStatus.isActive ? 'No properties listed yet' : 'Complete subscription to start listing properties'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={listing.images?.[0] || '/placeholder-property.jpg'}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{listing.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{listing.location}</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      ₦{listing.price?.toLocaleString()}{listing.type === 'rent' ? '/year' : listing.type === 'shortstay' ? '/night' : ''}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <p>{listing.views || 0} views</p>
                    <p>{listing.bookmarks || 0} bookmarks</p>
                  </div>
                </div>
              </div>
            ))}
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
        {agentStatus === 'rejected' ? (
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
      </div>
    </div>
  );
};

export default AgentDashboard;