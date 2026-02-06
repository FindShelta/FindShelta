import { supabase } from '../lib/supabase';

export const makeCurrentUserAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user logged in');
      return false;
    }

    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        email: user.email
      });

    if (error) {
      console.error('Error making user admin:', error);
      return false;
    }

    console.log('✅ User is now an admin! Refresh the page.');
    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
};

if (typeof window !== 'undefined') {
  (window as any).makeCurrentUserAdmin = makeCurrentUserAdmin;
}
