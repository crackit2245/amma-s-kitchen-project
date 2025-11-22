-- Function to make a user an admin (call this after admin signs up)
-- First sign up with email: admin@admin.com and password: amma123@admin
-- Then get the user_id and run: SELECT make_user_admin('USER_ID_HERE');

CREATE OR REPLACE FUNCTION public.make_user_admin(admin_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin role for the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.make_user_admin(UUID) TO authenticated;

COMMENT ON FUNCTION public.make_user_admin IS 'Helper function to assign admin role to a user. Usage: SELECT make_user_admin(''user-uuid-here'');';