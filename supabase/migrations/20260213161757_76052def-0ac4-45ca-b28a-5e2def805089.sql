-- Add trigger for support ticket notifications to admins
CREATE OR REPLACE FUNCTION public.notify_admins_on_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  user_name TEXT;
BEGIN
  SELECT display_name INTO user_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_record.user_id,
      'support',
      'New support ticket',
      COALESCE(user_name, 'A user') || ': ' || NEW.subject,
      NEW.id,
      'ticket'
    );
  END LOOP;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_notify_admin_ticket
  AFTER INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_ticket();
