import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFurahaLocation() {
  console.log('Fetching Furaha Residence project...\n');
  
  // First, find the Furaha Residence project
  const { data: projects, error: fetchError } = await supabase
    .from('projects')
    .select('id, title, slug, location')
    .ilike('title', '%furaha%');

  if (fetchError) {
    console.error('Error fetching project:', fetchError);
    return;
  }

  if (!projects || projects.length === 0) {
    console.error('Furaha Residence project not found');
    return;
  }

  console.log('Found project:');
  console.log('ID:', projects[0].id);
  console.log('Title:', projects[0].title);
  console.log('Slug:', projects[0].slug);
  console.log('Current Location:', projects[0].location);
  console.log('\n---\n');

  // Update with the new Google Maps embed URL
  const newLocation = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3161.7549939097453!2d40.114652668433074!3d-3.209112360925889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18158fad4103df15%3A0xdad4c1a468e867dc!2sMaimoon%20Hospital!5e0!3m2!1sen!2ske!4v1765046154316!5m2!1sen!2ske';

  console.log('Updating location to:');
  console.log(newLocation);
  console.log('\n');

  const { data, error } = await supabase
    .from('projects')
    .update({ location: newLocation })
    .eq('id', projects[0].id)
    .select();

  if (error) {
    console.error('Error updating project:', error);
  } else {
    console.log('✅ Successfully updated!');
    console.log('New location:', data[0].location);
  }
}

updateFurahaLocation();
