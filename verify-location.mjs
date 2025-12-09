import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvrtvanrqnaltnjklit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnJ0dmFucnFuYWx0bmprbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE4NDAsImV4cCI6MjA4MDUyNzg0MH0.E4rqnB332sQwM_FwaTfDQ8URjD7iTUcD65QjxVlIJyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data, error } = await supabase
    .from('projects')
    .select('title, slug, location')
    .ilike('title', '%furaha%')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Project:', data.title);
  console.log('Slug:', data.slug);
  console.log('Location:', data.location);
  console.log('\nChecking format:');
  console.log('Contains google.com/maps/embed?', data.location.includes('google.com/maps/embed'));
}

verify();
