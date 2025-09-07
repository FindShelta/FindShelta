import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, Calendar, User, DollarSign, RefreshCw, FileText, Mail, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Payment {
  id: string;
  agent_id: string;
  amount: number;
  plan: 'monthly' | 'quarterly' | 'yearly';
  payment_proof_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  expires_at: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface AgentRegistration {
  id: string;
  'full name': string;
  email: string;
  'phone no.': string | null;
  'whatsapp link': string | null;
  'payment proof_URL': string | null;
  status: string;
  'is active': boolean;
  created_at: string;
}

const PaymentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [agentRegistrations, setAgentRegistrations] = useState<AgentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'registrations'>('payments');
  const [notifications, setNotifications] = useState<string[]>([]);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch pending payments. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('agent registration')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAgentRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching agent registrations:', err);
      setError('Failed to fetch agent registrations.');
    }
  };

  useEffect(() => {
    fetchPendingPayments();
    fetchAgentRegistrations();
  }, []);

  const sendNotification = async (agentEmail: string, type: 'approved' | 'rejected', context: 'payment' | 'registration') => {
    // In a real app, this would send an email notification
    const message = `${context} ${type} for ${agentEmail}`;
    setNotifications(prev => [...prev, message]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  const handlePaymentApprove = async (payment: Payment) => {
    if (!user?.id) return;
    
    setProcessingIds(prev => new Set(prev).add(payment.id));
    
    try {
      // Calculate expiry date based on plan
      const now = new Date();
      let expiryDate = new Date(now);
      
      switch (payment.plan) {
        case 'monthly':
          expiryDate.setMonth(now.getMonth() + 1);
          break;
        case 'quarterly':
          expiryDate.setMonth(now.getMonth() + 3);
          break;
        case 'yearly':
          expiryDate.setFullYear(now.getFullYear() + 1);
          break;
      }

      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString()
        })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      // Update user subscription status
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.agent_id);

      if (userError) throw userError;

      // Send notification
      await sendNotification('agent@email.com', 'approved', 'payment');

      // Remove from local state
      setPayments(prev => prev.filter(p => p.id !== payment.id));
      
    } catch (err) {
      console.error('Error approving payment:', err);
      setError('Failed to approve payment. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  const handlePaymentReject = async (payment: Payment) => {
    if (!user?.id) return;
    
    setProcessingIds(prev => new Set(prev).add(payment.id));
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (error) throw error;

      // Send notification
      await sendNotification('agent@email.com', 'rejected', 'payment');

      // Remove from local state
      setPayments(prev => prev.filter(p => p.id !== payment.id));
      
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('Failed to reject payment. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  const handleRegistrationApprove = async (registration: AgentRegistration) => {
    setProcessingIds(prev => new Set(prev).add(registration.id));
    
    try {
      // Update registration status
      const { error: regError } = await supabase
        .from('agent registration')
        .update({ 
          status: 'approved',
          'is active': true
        })
        .eq('id', registration.id);

      if (regError) throw regError;

      // Create user account if payment is verified
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email: registration.email,
          full_name: registration['full name'],
          role: 'agent',
          whatsapp_number: registration['phone no.'],
          is_verified: false, // Will be true after payment approval
          created_at: new Date().toISOString()
        });

      if (userError && !userError.message.includes('duplicate')) {
        throw userError;
      }

      // Send notification
      await sendNotification(registration.email, 'approved', 'registration');

      // Remove from local state
      setAgentRegistrations(prev => prev.filter(r => r.id !== registration.id));
      
    } catch (err) {
      console.error('Error approving registration:', err);
      setError('Failed to approve registration. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registration.id);
        return newSet;
      });
    }
  };

  const handleRegistrationReject = async (registration: AgentRegistration) => {
    setProcessingIds(prev => new Set(prev).add(registration.id));
    
    try {
      const { error } = await supabase
        .from('agent registration')
        .update({ 
          status: 'rejected',
          'is active': false
        })
        .eq('id', registration.id);

      if (error) throw error;

      // Send notification
      await sendNotification(registration.email, 'rejected', 'registration');

      // Remove from local state
      setAgentRegistrations(prev => prev.filter(r => r.id !== registration.id));
      
    } catch (err) {
      console.error('Error rejecting registration:', err);
      setError('Failed to reject registration. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(registration.id);
        return newSet;
      });
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'monthly':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'quarterly':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'yearly':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'monthly':
        return 'Monthly Plan';
      case 'quarterly':
        return 'Quarterly Plan';
      case 'yearly':
        return 'Yearly Plan';
      default:
        return plan;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3 flex items-center space-x-2"
            >
              <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-sm">{notification}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment & Registration Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Review and approve payments and agent registrations
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            fetchPendingPayments();
            fetchAgentRegistrations();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'payments', label: 'Payment Approvals', count: payments.length },
            { id: 'registrations', label: 'Agent Registrations', count: agentRegistrations.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'payments' && (
        <div>
          {payments.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All payments processed!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                There are no pending payments to review at the moment.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-600">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-900 dark:text-white">
                              {payment.agent_id.slice(0, 8)}...
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatAmount(payment.amount)}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(payment.plan)}`}>
                            {getPlanLabel(payment.plan)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(payment.created_at)}</span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {payment.payment_proof_url && (
                          <a
                            href={payment.payment_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View proof of payment"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => handlePaymentReject(payment)}
                          disabled={processingIds.has(payment.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded transition-colors"
                        >
                          {processingIds.has(payment.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Reject</span>
                        </button>
                        
                        <button
                          onClick={() => handlePaymentApprove(payment)}
                          disabled={processingIds.has(payment.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded transition-colors"
                        >
                          {processingIds.has(payment.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'registrations' && (
        <div>
          {agentRegistrations.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All registrations processed!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                There are no pending agent registrations to review.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-600">
                {agentRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {registration['full name']}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">{registration.email}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          {registration['phone no.'] && (
                            <span>📞 {registration['phone no.']}</span>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(registration.created_at)}</span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {registration['payment proof_URL'] && (
                          <a
                            href={registration['payment proof_URL']}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View payment proof"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleRegistrationReject(registration)}
                          disabled={processingIds.has(registration.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded transition-colors"
                        >
                          {processingIds.has(registration.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          <span>Reject</span>
                        </button>
                        
                        <button
                          onClick={() => handleRegistrationApprove(registration)}
                          disabled={processingIds.has(registration.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded transition-colors"
                        >
                          {processingIds.has(registration.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;