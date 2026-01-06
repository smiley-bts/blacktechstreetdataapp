-- Add input validation to log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  _action TEXT,
  _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _user_id UUID;
BEGIN
  -- Ensure user is authenticated
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to log activity';
  END IF;
  
  -- Validate action string (max 200 chars)
  IF _action IS NULL OR LENGTH(_action) = 0 THEN
    RAISE EXCEPTION 'Action cannot be empty';
  END IF;
  
  IF LENGTH(_action) > 200 THEN
    RAISE EXCEPTION 'Action string too long (max 200 characters)';
  END IF;
  
  -- Limit details JSON size to prevent DoS (max 50KB)
  IF _details IS NOT NULL AND LENGTH(_details::text) > 51200 THEN
    RAISE EXCEPTION 'Details JSON too large (max 50KB)';
  END IF;
  
  -- Ensure user is admin before logging
  IF NOT is_admin(_user_id) THEN
    RAISE EXCEPTION 'Only admins can log activities';
  END IF;
  
  INSERT INTO public.activity_logs (user_id, action, details)
  VALUES (_user_id, _action, _details)
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Improve is_admin to handle null input defensively
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role IN ('admin', 'owner')
    )
  END
$$;

-- Improve has_role to handle null input defensively
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
  END
$$;

-- Improve get_user_role to handle null input defensively
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _user_id IS NULL THEN NULL
    ELSE (
      SELECT role
      FROM public.user_roles
      WHERE user_id = _user_id
      LIMIT 1
    )
  END
$$;