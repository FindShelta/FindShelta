import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvtldnyxnqmfhlpascel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking listings table structure...');
    
    // Try to select all columns from listings
    const { data: sampleData, error: sampleError } = await supabase
      .from('listings')
      .select('*')
      .limit(1);
        
    if (sampleError) {
      console.error('Error fetching sample data:', sampleError);
      
      // Try with specific columns we know exist
      const { data: basicData, error: basicError } = await supabase
        .from('listings')
        .select('id, title, price')
        .limit(1);
        
      if (basicError) {
        console.error('Error with basic columns:', basicError);
      } else {
        console.log('Basic columns work:', basicData);
      }
    } else {
      if (sampleData && sampleData.length > 0) {
        console.log('Listings table columns:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`- ${key}: ${typeof sampleData[0][key]}`);
        });
      } else {
        console.log('No data in listings table, trying to insert a test record...');
        
        // Try a minimal insert to see what columns are required
        const { data: insertData, error: insertError } = await supabase
          .from('listings')
          .insert({
            title: 'Test',
            description: 'Test',
            price: 100000
          })
          .select()
          .single();
          
        if (insertError) {
          console.log('Insert error (shows required columns):', insertError);
        } else {
          console.log('Insert successful, columns:', Object.keys(insertData));
          // Clean up test record
          await supabase.from('listings').delete().eq('id', insertData.id);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkSchema();