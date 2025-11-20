import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function assignRole(email: string, role: string) {
  try {
    const { data, error } = await supabase.rpc('assign_user_role', {
      user_email: email,
      user_role: role
    });

    if (error) {
      console.error(`Error assigning ${role} to ${email}:`, error);
      return false;
    }

    console.log(`✓ Successfully assigned ${role} to ${email}`);
    return true;
  } catch (err) {
    console.error(`Exception assigning ${role} to ${email}:`, err);
    return false;
  }
}

async function main() {
  console.log('Starting role assignment...\n');

  const assignments = [
    { email: 'admin@example.com', role: 'super_admin' },
    { email: 'test@example.com', role: 'doctor' }
  ];

  for (const { email, role } of assignments) {
    await assignRole(email, role);
  }

  console.log('\nRole assignment complete!');
  console.log('\nPlease verify the roles by running:');
  console.log('SELECT p.email, ur.role FROM user_roles ur JOIN profiles p ON p.id = ur.user_id ORDER BY p.email;');
}

main();
