import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AgentApproval: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_registration')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        return;
      }

      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAgentStatus = async (agentId: string, status: 'approved' | 'rejected') => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      // Set approved_at when approving
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('agent_registration')
        .update(updateData)
        .eq('id', agentId);

      if (error) {
        console.error('Error updating agent status:', error);
        alert('Failed to update agent status');
        return;
      }

      // Refresh the list
      fetchAgents();
      alert(`Agent ${status} successfully!`);
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Approvals</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {agents.filter(a => a.status === 'pending').length} pending approvals
        </div>
      </div>

      <div className="grid gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.full_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : agent.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Email:</strong> {agent.email}</p>
                    <p><strong>Phone:</strong> {agent.phone}</p>
                    {agent.company_name && <p><strong>Company:</strong> {agent.company_name}</p>}
                    {agent.license_number && <p><strong>License:</strong> {agent.license_number}</p>}
                    {agent.experience_years && <p><strong>Experience:</strong> {agent.experience_years} years</p>}
                    <p><strong>Applied:</strong> {new Date(agent.created_at).toLocaleDateString()}</p>
                    {agent.approved_at && (
                      <p><strong>Approved:</strong> {new Date(agent.approved_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {agent.bio && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Bio:</strong> {agent.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {agent.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'approved')}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'rejected')}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No agent applications found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentApproval;