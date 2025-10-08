import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalRevenue: number;
  totalAgents: number;
  totalListings: number;
  totalViews: number;
  monthlyGrowth: number;
  recentActivity: Array<{
    type: 'payment' | 'listing' | 'registration';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalAgents: 0,
    totalListings: 0,
    totalViews: 0,
    monthlyGrowth: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch revenue from approved payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'approved')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Fetch total agents
      const { count: totalAgents } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent');

      // Fetch total listings
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Fetch total views
      const { data: listings } = await supabase
        .from('listings')
        .select('views_count');

      const totalViews = listings?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0;

      // Calculate monthly growth based on actual data
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const { data: previousPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'approved')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());
      
      const previousRevenue = previousPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const monthlyGrowth = previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100) : 0;

      // Fetch recent activity
      const recentActivity = [
        ...((payments || []).slice(0, 5).map(payment => ({
          type: 'payment' as const,
          description: `Payment of ₦${payment.amount.toLocaleString()} received`,
          timestamp: payment.created_at,
          amount: payment.amount
        }))),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setAnalytics({
        totalRevenue,
        totalAgents: totalAgents || 0,
        totalListings: totalListings || 0,
        totalViews,
        monthlyGrowth,
        recentActivity: recentActivity.slice(0, 10)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Platform performance and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAgents}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalListings}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Indicator */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Rate</h3>
            <p className="text-green-600 dark:text-green-400 font-medium">
              +{analytics.monthlyGrowth}% this month
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {analytics.recentActivity.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          ) : (
            analytics.recentActivity.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;