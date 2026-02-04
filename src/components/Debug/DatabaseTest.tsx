import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const DatabaseTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDatabase = async () => {
      try {
        // Test 1: Get first listing with specific fields
        const { data: sample, error: sampleError } = await supabase
          .from('listings')
          .select('id, title, is_approved, rejected')
          .limit(1);

        console.log('Sample listing:', sample);

        // Test 2: Count approved
        const { count: approvedCount } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('is_approved', true);

        // Test 3: Count not approved
        const { count: notApprovedCount } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('is_approved', false);

        // Test 4: Get one approved listing
        const { data: approvedSample } = await supabase
          .from('listings')
          .select('id, title, is_approved')
          .eq('is_approved', true)
          .limit(1);

        // Test 5: Get total count
        const { count: totalCount } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true });

        setResult({
          sample: sample?.[0] || null,
          approvedSample: approvedSample?.[0] || null,
          sampleError,
          totalCount,
          approvedCount,
          notApprovedCount,
          message: `Total: ${totalCount}, Approved: ${approvedCount}, Not Approved: ${notApprovedCount}`
        });
      } catch (err) {
        console.error('Test error:', err);
        setResult({ error: err });
      } finally {
        setLoading(false);
      }
    };

    testDatabase();
  }, []);

  if (loading) return <div className="p-4">Testing database...</div>;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Database Test Results</h2>
      <pre className="bg-gray-100 dark:bg-slate-900 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

export default DatabaseTest;
