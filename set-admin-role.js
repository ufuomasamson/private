// Script to set admin role for a user
// Run this in your browser console or as a Node.js script

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdminRole(email) {
  try {
    // First, get the user by email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !user) {
      console.error('User not found:', userError);
      return;
    }

    // Update the user role in the users table
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating role:', error);
      return;
    }

    console.log('Successfully set admin role for:', email);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Set admin role for your email
setAdminRole('okoroufuoma001@gmail.com'); 