-- Insert admin user role
-- This assumes the admin user has already signed up with email: admin@admin.com
-- Replace the UUID below with the actual user_id after signup

-- First, let's query to find the admin user
-- Run this after signing up: SELECT id FROM auth.users WHERE email = 'admin@admin.com';

-- Then manually insert the role:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (user_id, role) DO NOTHING;