-- Block anonymous access to profiles table
-- Add policy requiring authentication for SELECT on profiles
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Block anonymous access to contacts table  
-- Add policy requiring authentication for SELECT on contacts
CREATE POLICY "Block anonymous access to contacts"
ON public.contacts
FOR SELECT
USING (auth.role() = 'authenticated');