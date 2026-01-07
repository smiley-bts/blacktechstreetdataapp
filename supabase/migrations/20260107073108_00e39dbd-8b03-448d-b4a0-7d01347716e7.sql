-- Add field to track actual event attendance vs registration
ALTER TABLE public.contacts
ADD COLUMN events_actually_attended text DEFAULT NULL;