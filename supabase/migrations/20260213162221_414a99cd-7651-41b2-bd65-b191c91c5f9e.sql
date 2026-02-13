
-- Drop all triggers first to avoid conflicts, then recreate

DROP TRIGGER IF EXISTS trg_notify_on_message ON public.messages;
DROP TRIGGER IF EXISTS trg_notify_on_follow ON public.follows;
DROP TRIGGER IF EXISTS trg_notify_on_review ON public.reviews;
DROP TRIGGER IF EXISTS trg_update_seller_rating ON public.reviews;
DROP TRIGGER IF EXISTS trg_notify_on_favorite ON public.favorites;
DROP TRIGGER IF EXISTS trg_notify_listing_status ON public.base_listings;
DROP TRIGGER IF EXISTS trg_notify_admin_new_listing ON public.base_listings;
DROP TRIGGER IF EXISTS trg_notify_subscription_change ON public.seller_subscriptions;
DROP TRIGGER IF EXISTS trg_notify_admin_contact ON public.contact_submissions;
DROP TRIGGER IF EXISTS trg_notify_admin_report ON public.reports;
DROP TRIGGER IF EXISTS trg_notify_admin_verification ON public.seller_verifications;
DROP TRIGGER IF EXISTS trg_notify_admin_ticket ON public.support_tickets;
DROP TRIGGER IF EXISTS trg_sync_tier_priority ON public.base_listings;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_base_listings_updated_at ON public.base_listings;

-- Recreate all triggers
CREATE TRIGGER trg_notify_on_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();
CREATE TRIGGER trg_notify_on_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_follow();
CREATE TRIGGER trg_notify_on_review AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_review();
CREATE TRIGGER trg_update_seller_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();
CREATE TRIGGER trg_notify_on_favorite AFTER INSERT ON public.favorites FOR EACH ROW EXECUTE FUNCTION public.notify_on_favorite();
CREATE TRIGGER trg_notify_listing_status AFTER UPDATE ON public.base_listings FOR EACH ROW EXECUTE FUNCTION public.notify_on_listing_status_change();
CREATE TRIGGER trg_notify_admin_new_listing AFTER INSERT ON public.base_listings FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_new_listing();
CREATE TRIGGER trg_notify_subscription_change AFTER UPDATE ON public.seller_subscriptions FOR EACH ROW EXECUTE FUNCTION public.notify_on_subscription_change();
CREATE TRIGGER trg_notify_admin_contact AFTER INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_contact();
CREATE TRIGGER trg_notify_admin_report AFTER INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_report();
CREATE TRIGGER trg_notify_admin_verification AFTER INSERT ON public.seller_verifications FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_verification();
CREATE TRIGGER trg_notify_admin_ticket AFTER INSERT ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_ticket();
CREATE TRIGGER trg_sync_tier_priority BEFORE INSERT OR UPDATE ON public.base_listings FOR EACH ROW EXECUTE FUNCTION public.sync_listing_tier_priority();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_base_listings_updated_at BEFORE UPDATE ON public.base_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
