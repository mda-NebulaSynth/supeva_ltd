import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvrtvanrqnaltnjklit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnJ0dmFucnFuYWx0bmprbGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTE4NDAsImV4cCI6MjA4MDUyNzg0MH0.E4rqnB332sQwM_FwaTfDQ8URjD7iTUcD65QjxVlIJyM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLocation() {
  console.log('Searching for Furaha Residence...\n');
  
  const { data: projects, error: fetchError } = await supabase
    .from('projects')
    .select('id, title, slug, location')
    .ilike('title', '%furaha%');

  if (fetchError) {
    console.error('Error:', fetchError);
    return;
  }

  if (!projects || projects.length === 0) {
    console.error('Furaha Residence not found');
    return;
  }

  const project = projects[0];
  console.log('Found:', project.title);
  console.log('Current location:', project.location);
  console.log('\nUpdating...\n');

  const newLocation = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3161.7549939097453!2d40.114652668433074!3d-3.209112360925889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18158fad4103df15%3A0xdad4c1a468e867dc!2sMaimoon%20Hospital!5e0!3m2!1sen!2ske!4v1765046154316!5m2!1sen!2ske';

  const { data, error } = await supabase
    .from('projects')
    .update({ location: newLocation })
    .eq('id', project.id)
    .select();

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('✅ Success!');
    console.log('New location:', data[0].location.substring(0, 80) + '...');
  }
}

updateLocation();
