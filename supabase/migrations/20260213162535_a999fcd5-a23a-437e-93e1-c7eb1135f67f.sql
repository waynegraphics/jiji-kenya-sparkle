
-- Remove duplicate/old triggers (keeping the trg_notify_on_* versions)

-- Favorites: remove old trg_notify_favorite, keep trg_notify_on_favorite
DROP TRIGGER IF EXISTS trg_notify_favorite ON public.favorites;

-- Follows: remove old trg_notify_new_follow, keep trg_notify_on_follow
DROP TRIGGER IF EXISTS trg_notify_new_follow ON public.follows;

-- Messages: remove old trg_notify_new_message, keep trg_notify_on_message
DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;

-- Reviews: remove old trg_notify_new_review, keep trg_notify_on_review
-- Also remove old individual rating triggers, keep consolidated trg_update_seller_rating
DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
DROP TRIGGER IF EXISTS update_rating_on_insert ON public.reviews;
DROP TRIGGER IF EXISTS update_rating_on_update ON public.reviews;
DROP TRIGGER IF EXISTS update_rating_on_delete ON public.reviews;

-- Profiles: remove old update_profiles_updated_at, keep trg_profiles_updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Base listings: remove old update_base_listings_updated_at, keep trg_base_listings_updated_at
DROP TRIGGER IF EXISTS update_base_listings_updated_at ON public.base_listings;
