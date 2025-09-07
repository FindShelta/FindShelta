import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Clock, User, Mail, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SecurityLog {
  id: string;
  user_email: string;
  action: string;
  ip_address: string | null;
  timestamp: string;
  success: boolean;
}

interface SecurityStats {
  totalAttempts: number;
  successfulResets: number;
  failedAttempts: number;
  suspiciousActivity: number;
}

const SecurityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalAttempts: 0,
    successfulResets: 0,
    failedAttempts: 0,
    suspiciousActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchSecurityData();
  }, [timeRange]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch security logs
      const { data: logsData, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      setLogs(logsData || []);

      // Calculate stats
      const totalAttempts = logsData?.length || 0;
      const successfulResets = logsData?.filter(log => 
        log.action === 'password_reset_completed' && log.success
      ).length || 0;
      const failedAttempts = logsData?.filter(log => !log.success).length || 0;
      
      // Detect suspicious activity (multiple failed attempts from same email)
      const emailAttempts = new Map();
      logsData?.forEach(log => {
        if (!log.success) {
          const count = emailAttempts.get(log.user_email) || 0;
          emailAttempts.set(log.user_email, count + 1);
        }
      });
      const suspiciousActivity = Array.from(emailAttempts.values()).filter(count => count >= 5).length;

      setStats({
        totalAttempts,
        successfulResets,
        failedAttempts,
        suspiciousActivity
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'password_reset_requested':
        return <Mail className="w-4 h-4" />;
      case 'password_reset_verify_failed':
        return <XCircle className="w-4 h-4" />;
      case 'password_reset_completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'text-red-600 dark:text-red-400';
    
    switch (action) {
      case 'password_reset_completed':
        return 'text-green-600 dark:text-green-400';
      case 'password_reset_requested':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Monitor password reset attempts and security events</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulResets}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful Resets</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failedAttempts}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed Attempts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.suspiciousActivity}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suspicious Activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Activity Log</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No security events in the selected time range</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getActionColor(log.action, log.success)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatAction(log.action)}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{log.user_email}</span>
                        </div>
                        {log.ip_address && (
                          <span>IP: {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.success 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;