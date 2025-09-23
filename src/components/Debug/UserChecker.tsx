import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const UserChecker: React.FC = () => {
  const [supabaseUsers, setSupabaseUsers] = useState<any[]>([]);
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkUsers = async () => {
    setLoading(true);
    setError('');

    try {
      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1);
      console.log('Supabase connection test:', { testData, testError });

      // Check Supabase auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('Auth users error:', authError.message);
      } else {
        setSupabaseUsers(authUsers.users || []);
      }

      // Check local storage users
      const localStorageUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setLocalUsers(localStorageUsers);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUsers();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">User Database Check</h2>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={checkUsers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh Users'}
        </button>
        <button
          onClick={async () => {
            try {
              const { data, error } = await supabase.auth.signUp({
                email: 'test@example.com',
                password: 'test123456',
                options: {
                  data: {
                    name: 'Test User',
                    role: 'home_seeker'
                  }
                }
              });
              console.log('Test signup result:', { data, error });
              if (error) alert('Signup failed: ' + error.message);
              else alert('Signup successful!');
            } catch (err) {
              console.error('Test signup error:', err);
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Signup
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('users');
            localStorage.removeItem('user');
            alert('localStorage cleared!');
            checkUsers();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear LocalStorage
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Users */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Supabase Auth Users ({supabaseUsers.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {supabaseUsers.length === 0 ? (
              <p className="text-gray-500">No Supabase users found</p>
            ) : (
              supabaseUsers.map((user, index) => (
                <div key={user.id} className="p-2 bg-gray-50 dark:bg-slate-700 rounded text-sm">
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                  <div><strong>Metadata:</strong> {JSON.stringify(user.user_metadata)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Local Storage Users */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Local Storage Users ({localUsers.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {localUsers.length === 0 ? (
              <p className="text-gray-500">No local users found</p>
            ) : (
              localUsers.map((user, index) => (
                <div key={index} className="p-2 bg-gray-50 dark:bg-slate-700 rounded text-sm">
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Name:</strong> {user.name}</div>
                  <div><strong>Role:</strong> {user.role}</div>
                  <div><strong>ID:</strong> {user.id}</div>
                  {user.whatsappNumber && <div><strong>WhatsApp:</strong> {user.whatsappNumber}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChecker;