import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvrtvanrqnaltnjklit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnJ0dmFucnFuYWx0bmprbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE4NDAsImV4cCI6MjA4MDUyNzg0MH0.E4rqnB332sQwM_FwaTfDQ8URjD7iTUcD65QjxVlIJyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  console.log('Checking authentication...\n');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('❌ Not authenticated');
    console.log('You need to log in to the admin panel first');
    return;
  }
  
  console.log('✅ Authenticated as:', user.email);
  
  // Check profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile) {
    console.log('Role:', profile.role);
    
    if (profile.role === 'admin') {
      console.log('✅ You have admin access');
    } else {
      console.log('❌ You need admin role to update projects');
      console.log('Current role:', profile.role);
    }
  }
}

checkAuth();
