-- Allow public read of profiles for username lookup during login
CREATE POLICY "Allow username lookup for login"
  ON public.profiles FOR SELECT
  USING (true);

-- Drop the redundant policy since we now have a public lookup
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;