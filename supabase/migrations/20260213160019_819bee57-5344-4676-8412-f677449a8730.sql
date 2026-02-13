
-- Create a function to insert notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id::text, p_related_type);
END;
$$;

-- Trigger: notify seller when they receive a new message
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT display_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;
  PERFORM public.create_notification(
    NEW.receiver_id,
    'message',
    'New message from ' || COALESCE(sender_name, 'Someone'),
    LEFT(NEW.content, 100),
    NEW.id,
    'message'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_message();

-- Trigger: notify seller when someone follows them
CREATE OR REPLACE FUNCTION public.notify_on_new_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT display_name INTO follower_name FROM public.profiles WHERE user_id = NEW.follower_id LIMIT 1;
  PERFORM public.create_notification(
    NEW.following_id,
    'follower',
    'New follower',
    COALESCE(follower_name, 'Someone') || ' started following you',
    NEW.follower_id,
    'follower'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_follow ON public.follows;
CREATE TRIGGER trg_notify_new_follow
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_follow();

-- Trigger: notify seller when they get a new review
CREATE OR REPLACE FUNCTION public.notify_on_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reviewer_name TEXT;
BEGIN
  SELECT display_name INTO reviewer_name FROM public.profiles WHERE user_id = NEW.reviewer_id LIMIT 1;
  PERFORM public.create_notification(
    NEW.seller_id,
    'review',
    'New review received',
    COALESCE(reviewer_name, 'Someone') || ' left a ' || NEW.rating || '-star review',
    NEW.id,
    'review'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
CREATE TRIGGER trg_notify_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_review();

-- Trigger: notify seller when their listing is approved or rejected
CREATE OR REPLACE FUNCTION public.notify_on_listing_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'active' AND OLD.status = 'pending' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'listing',
        'Listing approved',
        'Your listing "' || LEFT(NEW.title, 60) || '" has been approved',
        NEW.id,
        'listing'
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'listing',
        'Listing rejected',
        'Your listing "' || LEFT(NEW.title, 60) || '" was rejected' || COALESCE(': ' || NEW.rejection_note, ''),
        NEW.id,
        'listing'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_listing_status ON public.base_listings;
CREATE TRIGGER trg_notify_listing_status
AFTER UPDATE ON public.base_listings
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_listing_status_change();

-- Trigger: notify seller when someone saves their listing
CREATE OR REPLACE FUNCTION public.notify_on_favorite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  listing_owner UUID;
  listing_title TEXT;
  fav_user_name TEXT;
BEGIN
  SELECT user_id, title INTO listing_owner, listing_title FROM public.base_listings WHERE id = NEW.listing_id;
  IF listing_owner IS NOT NULL AND listing_owner != NEW.user_id THEN
    SELECT display_name INTO fav_user_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
    PERFORM public.create_notification(
      listing_owner,
      'favorite',
      'Listing saved',
      COALESCE(fav_user_name, 'Someone') || ' saved your listing "' || LEFT(COALESCE(listing_title, ''), 50) || '"',
      NEW.listing_id,
      'listing'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_favorite ON public.favorites;
CREATE TRIGGER trg_notify_favorite
AFTER INSERT ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_favorite();

-- Trigger: notify user when subscription status changes
CREATE OR REPLACE FUNCTION public.notify_on_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  pkg_name TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO pkg_name FROM public.subscription_packages WHERE id = NEW.package_id LIMIT 1;
    IF NEW.status = 'active' AND NEW.payment_status = 'completed' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'subscription',
        'Subscription activated',
        'Your ' || COALESCE(pkg_name, '') || ' subscription is now active',
        NEW.id,
        'subscription'
      );
    ELSIF NEW.status = 'expired' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'subscription',
        'Subscription expired',
        'Your ' || COALESCE(pkg_name, '') || ' subscription has expired. Renew to keep posting.',
        NEW.id,
        'subscription'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_subscription_change ON public.seller_subscriptions;
CREATE TRIGGER trg_notify_subscription_change
AFTER UPDATE ON public.seller_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_subscription_change();

-- Trigger: notify admin users when a contact submission is created
CREATE OR REPLACE FUNCTION public.notify_admins_on_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_record.user_id,
      'support',
      'New support message',
      NEW.name || ': ' || NEW.subject,
      NEW.id,
      'contact'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_contact ON public.contact_submissions;
CREATE TRIGGER trg_notify_admin_contact
AFTER INSERT ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_contact();

-- Trigger: notify admin when a report is filed
CREATE OR REPLACE FUNCTION public.notify_admins_on_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      admin_record.user_id,
      'report',
      'New report filed',
      NEW.reason,
      NEW.id,
      'report'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_report ON public.reports;
CREATE TRIGGER trg_notify_admin_report
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_report();

-- Trigger: notify admin when a new listing is submitted for review
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  IF NEW.status = 'pending' THEN
    FOR admin_record IN
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      PERFORM public.create_notification(
        admin_record.user_id,
        'listing',
        'New listing for review',
        '"' || LEFT(NEW.title, 60) || '" needs approval',
        NEW.id,
        'listing'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_listing ON public.base_listings;
CREATE TRIGGER trg_notify_admin_new_listing
AFTER INSERT ON public.base_listings
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_new_listing();

-- Trigger: notify admin on new verification request
CREATE OR REPLACE FUNCTION public.notify_admins_on_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_record RECORD;
  user_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT display_name INTO user_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
    FOR admin_record IN
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
      PERFORM public.create_notification(
        admin_record.user_id,
        'verification',
        'Verification request',
        COALESCE(user_name, 'A seller') || ' submitted a verification request',
        NEW.id,
        'verification'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_verification ON public.seller_verifications;
CREATE TRIGGER trg_notify_admin_verification
AFTER INSERT ON public.seller_verifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_on_verification();
