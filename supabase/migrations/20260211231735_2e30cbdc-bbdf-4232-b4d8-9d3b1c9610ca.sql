
-- Create a function for admins to get user emails
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id as user_id, email::text
  FROM auth.users
  WHERE public.is_admin(auth.uid())
$$;

-- Create a function for admins to change a user's account_type
CREATE OR REPLACE FUNCTION public.admin_set_account_type(target_user_id uuid, new_account_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET account_type = new_account_type WHERE user_id = target_user_id;
END;
$$;
