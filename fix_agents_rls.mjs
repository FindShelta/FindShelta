import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvtldnyxnqmfhlpascel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgentsTable() {
  // Try different table names
  const tableNames = ['agents', 'agent_registration', 'agent'];
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`Found table: ${tableName}`);
        console.log('Sample data:', data);
        return tableName;
      } else {
        console.log(`Table ${tableName} error:`, error.code, error.message);
      }
    } catch (err) {
      console.log(`Table ${tableName} failed:`, err.message);
    }
  }
  
  console.log('No accessible agents table found');
  return null;
}

checkAgentsTable();