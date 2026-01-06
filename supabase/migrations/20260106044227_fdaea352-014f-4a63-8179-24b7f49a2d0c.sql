-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow username lookup for login" ON public.profiles;

-- Create a more secure policy that only allows username lookup without exposing email
CREATE POLICY "Allow public username lookup for authentication"
ON public.profiles
FOR SELECT
USING (true);

-- Note: For production, we need the public username lookup for the login flow.
-- The email column should be protected. Let's use a function instead.

-- Actually, let's create a security definer function for login lookup
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(lookup_username text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username = lower(lookup_username) LIMIT 1;
$$;

-- Now we can make the profiles table more restrictive
DROP POLICY IF EXISTS "Allow public username lookup for authentication" ON public.profiles;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Also allow the username lookup function (which runs as security definer)
-- This is handled by the function being SECURITY DEFINER