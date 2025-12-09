import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvrtvanrqnaltnjklit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnJ0dmFucnFuYWx0bmprbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE4NDAsImV4cCI6MjA4MDUyNzg0MH0.E4rqnB332sQwM_FwaTfDQ8URjD7iTUcD65QjxVlIJyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUpdate() {
  const newLocation = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3161.7549939097453!2d40.114652668433074!3d-3.209112360925889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18158fad4103df15%3A0xdad4c1a468e867dc!2sMaimoon%20Hospital!5e0!3m2!1sen!2ske!4v1765046154316!5m2!1sen!2ske';

  const { data, error } = await supabase
    .from('projects')
    .update({ location: newLocation })
    .eq('slug', 'furaha')
    .select();

  console.log('Update result:');
  console.log('Data:', data);
  console.log('Error:', error);
}

checkUpdate();
