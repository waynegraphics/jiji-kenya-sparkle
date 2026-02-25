-- ============================================================
-- JIJI KENYA - Protected Tables Data Import
-- Run on VPS: docker exec -i supabase-db psql -U postgres -d postgres < vps-import-protected-data.sql
-- ============================================================

BEGIN;

-- Disable triggers/RLS for import
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- ===================== PROFILES =====================
INSERT INTO public.profiles (user_id, id, rating, total_reviews, is_verified, created_at, updated_at, bump_wallet_balance, user_number, display_name, phone, location, avatar_url, bio, account_type, business_name, whatsapp_number) VALUES
('a2612cfa-d9f7-4411-ab1f-3d6c7a28d5a9', '2fc649aa-c539-4e1b-98a5-f60e0989964b', 0.0, 0, false, '2026-01-31 23:45:27.136326+00', '2026-01-31 23:45:27.136326+00', 0, 1, 'Test User', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('cce1d02e-78c8-4874-999c-bad0978da227', '24607ba0-83bd-4f42-8266-7dea8e905c92', 0.0, 0, false, '2026-01-31 23:52:09.832422+00', '2026-01-31 23:52:09.832422+00', 0, 2, 'Test Seller', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('4f4fec96-cb25-4bd7-a199-aab77c926755', '643270b4-2274-415c-858a-cd566111d010', 0.0, 0, true, '2026-02-10 06:16:06.657661+00', '2026-02-11 20:30:17.900536+00', 0, 3, 'Waynekim', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('d88209d4-c49f-4542-a106-582c0fdd8d81', '547eae2e-c498-4269-a522-81d67cd55912', 0.0, 0, false, '2026-02-12 01:29:02.523083+00', '2026-02-15 16:15:06.718443+00', 14, 4, 'Peter Njuguna', '+254798435087', 'Nakuru, Nakuru Town', '', 'Affordable car sellers', 'business', 'Sapphire Car Dealer', '+254798435087'),
('27caa732-2b69-49e6-a33a-e517616990e1', '67fee916-9276-47d5-9015-d005a0003317', 5.0, 1, false, '2026-02-01 00:36:37.710801+00', '2026-02-23 21:41:50.213292+00', 0, 5, 'Ahem Jk Kim', '+254798435087', 'Nakuru, Nakuru Town', '', E'Wayne Graphics Solutions is a full-service digital marketing agency based in Nakuru. With our proven strategies, we deliver customized digital marketing services that help businesses grow and succeed online. Our specialty lies in search engine optimization, social media marketing, paid advertising, content marketing,Graphics and web development. At Wayne Graphics Solutions, we work closely with our clients to understand their unique needs and design tailor-made marketing solutions that deliver results. Our team of experts stays updated with the latest trends and technologies to ensure that our clients stay ahead in the digital game. Partner with us to boost your online reach and drive conversions. Contact us today for a free consultation!', 'customer', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Fix sequence
SELECT setval('profiles_user_number_seq', (SELECT COALESCE(MAX(user_number), 0) FROM profiles));

-- ===================== USER_ROLES =====================
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('40a6d724-5648-4be1-9a8e-23dc60d0c337', 'cce1d02e-78c8-4874-999c-bad0978da227', 'admin', '2026-02-01 00:23:37.781637+00'),
('b2fb908c-591e-443e-8570-358a5d5904fa', '27caa732-2b69-49e6-a33a-e517616990e1', 'admin', '2026-02-06 09:26:58.869666+00'),
('8d1a11fa-93e7-407e-8715-20601de3fad1', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'admin', '2026-02-10 06:18:01.074459+00')
ON CONFLICT DO NOTHING;

-- ===================== TEAM_MEMBERS =====================
INSERT INTO public.team_members (id, user_id, designation, is_active, permissions, created_at, updated_at, added_by) VALUES
('bcce13d1-6dc4-4a7a-a50e-55e99a1032be', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'super_admin', true, '{"manage_affiliates":true,"manage_listings":true,"manage_reports":true,"manage_settings":true,"manage_support":true,"manage_team":true,"manage_users":true,"view_affiliates":true,"view_analytics":true,"view_customer_dashboard":true,"view_finances":true,"view_listings":true,"view_reports":true,"view_seller_dashboard":true,"view_support":true,"view_users":true}'::jsonb, '2026-02-11 21:13:02.831436+00', '2026-02-11 21:13:02.831436+00', NULL),
('a0cee2b3-cdf2-439e-8fc6-457877da56da', '27caa732-2b69-49e6-a33a-e517616990e1', 'admin', true, '{"manage_affiliates":true,"manage_listings":true,"manage_reports":true,"manage_settings":true,"manage_support":true,"manage_team":true,"manage_users":true,"view_affiliates":true,"view_analytics":true,"view_customer_dashboard":true,"view_finances":true,"view_listings":true,"view_reports":true,"view_seller_dashboard":true,"view_support":true,"view_users":true}'::jsonb, '2026-02-23 22:32:19.308952+00', '2026-02-23 22:33:08.099073+00', '27caa732-2b69-49e6-a33a-e517616990e1')
ON CONFLICT DO NOTHING;

-- ===================== MESSAGES =====================
INSERT INTO public.messages (id, content, created_at, file_name, file_size, file_url, is_read, listing_id, message_type, receiver_id, sender_id) VALUES
('37f7b024-8851-4e8d-9691-512e8a148293', 'Hello am interested in this car', '2026-02-12 03:02:12.511724+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '27caa732-2b69-49e6-a33a-e517616990e1', '4f4fec96-cb25-4bd7-a199-aab77c926755'),
('ae888177-5755-4202-abf5-90bc9d542d31', 'Its available', '2026-02-13 13:27:48.444576+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '27caa732-2b69-49e6-a33a-e517616990e1', '4f4fec96-cb25-4bd7-a199-aab77c926755'),
('e4f58d31-7de3-400d-9305-8e5ccd956374', E'Yes it''s available', '2026-02-13 14:56:01.193614+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1'),
('64b7ffbe-e075-4865-9b6b-4770901a7c70', 'IMG-20260211-WA0068.jpg', '2026-02-13 14:56:11.867563+00', 'IMG-20260211-WA0068.jpg', 45937, 'https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/messages/27caa732-2b69-49e6-a33a-e517616990e1/1770994569871.jpg', true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'image', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1'),
('230c077a-d2c4-4716-91be-8e6fd092f90d', E'\\U0001F923', '2026-02-13 14:56:21.015045+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1'),
('ec29972e-6730-49a0-a50d-9bd3b2f2ef17', E'Hi, I''m interested in "Professional Website Design & Development Services in Nairobi". Is it still available?', '2026-02-15 16:23:56.829603+00', NULL, NULL, NULL, true, NULL, 'text', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'd88209d4-c49f-4542-a106-582c0fdd8d81')
ON CONFLICT DO NOTHING;

-- ===================== FAVORITES =====================
INSERT INTO public.favorites (id, user_id, listing_id, created_at) VALUES
('24e23ae1-0ccb-46e5-81f4-bccf504973dd', '4f4fec96-cb25-4bd7-a199-aab77c926755', '3f0f6430-edf2-46f3-a499-9c06984a48b9', '2026-02-11 20:43:43.255704+00'),
('e98a6047-5329-425c-a7c3-2e8d075b43ba', '4f4fec96-cb25-4bd7-a199-aab77c926755', '2cc951c6-a4b5-4607-8e29-f75e71b293b2', '2026-02-12 03:25:27.240896+00'),
('4e6f5731-98ed-4de5-934e-fac124e1d2e3', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '81a99c1d-440b-42f6-afc8-4cf963470fb5', '2026-02-12 05:14:40.298866+00'),
('6444a686-cc0a-4d2d-b0fe-0251e7bdf512', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '40d8100e-aa69-45b7-99bf-cf8d3c8c0620', '2026-02-12 05:14:44.294574+00')
ON CONFLICT DO NOTHING;

-- ===================== FOLLOWS =====================
INSERT INTO public.follows (id, follower_id, following_id, created_at) VALUES
('7a561b0a-5fb6-4f27-b791-08cb70bc41a5', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '4f4fec96-cb25-4bd7-a199-aab77c926755', '2026-02-13 17:59:19.426169+00'),
('26035a57-11a8-4062-8a5d-efb08c30a77b', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-23 21:42:50.112108+00')
ON CONFLICT DO NOTHING;

-- ===================== NOTIFICATIONS =====================
INSERT INTO public.notifications (id, user_id, title, message, type, is_read, related_id, related_type, created_at) VALUES
('2039c0cf-22e8-48f2-9b45-ba20a2cdacb9', '4f4fec96-cb25-4bd7-a199-aab77c926755', E'Verification Approved \\u2705', 'Your seller verification has been approved! You can now post listings.', 'verification_update', true, 'a8a0177d-f120-4105-aa3e-967aeef8b3f3', 'verification', '2026-02-11 20:30:18.33541+00'),
('3d122baf-232e-4d45-bdeb-4464fc8f00fb', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'Verification Rejected', 'Your verification was rejected. Please resubmit with valid documents.', 'verification_update', true, 'd3c747e8-5a4f-41fc-b14a-e1e2f54a7f53', 'verification', '2026-02-12 01:34:33.385844+00'),
('7bd37a8a-fcdb-470f-ad31-f27f906025b9', 'd88209d4-c49f-4542-a106-582c0fdd8d81', E'Verification Approved \\u2705', 'Your seller verification has been approved! You can now post listings.', 'verification_update', true, 'd3c747e8-5a4f-41fc-b14a-e1e2f54a7f53', 'verification', '2026-02-12 04:38:15.855051+00'),
('7ec9210c-a6a1-47b7-ba61-206c4d75c724', 'cce1d02e-78c8-4874-999c-bad0978da227', 'New listing for review', E'"HP Elite Dragonfly G2 - Intel Core i7, 16GB RAM, 512GB SSD, " needs approval', 'listing', false, '59e5d70f-e2f7-4b5c-9d19-0644d3ef2c65', 'listing', '2026-02-13 17:11:25.85578+00'),
('a1a16624-cbc3-40a1-acde-6749ba60fd70', '27caa732-2b69-49e6-a33a-e517616990e1', 'New listing for review', E'"HP Elite Dragonfly G2 - Intel Core i7, 16GB RAM, 512GB SSD, " needs approval', 'listing', false, '59e5d70f-e2f7-4b5c-9d19-0644d3ef2c65', 'listing', '2026-02-13 17:11:25.85578+00'),
('4b7d78b8-0fe1-4fd4-9467-7db909cfd048', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'New listing for review', E'"HP Elite Dragonfly G2 - Intel Core i7, 16GB RAM, 512GB SSD, " needs approval', 'listing', true, '59e5d70f-e2f7-4b5c-9d19-0644d3ef2c65', 'listing', '2026-02-13 17:11:25.85578+00'),
('2471d3a9-b04a-411a-a217-c6a41538eb22', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'Listing approved', E'Your listing "HP Elite Dragonfly G2 - Intel Core i7, 16GB RAM, 512GB SSD, " has been approved', 'listing', true, '59e5d70f-e2f7-4b5c-9d19-0644d3ef2c65', 'listing', '2026-02-13 17:13:30.350388+00'),
('b67b26f9-909d-41a9-a15d-20dc4723f040', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'New follower', 'Peter Njuguna started following you', 'follower', true, 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'follower', '2026-02-13 17:59:19.426169+00'),
('da9655b6-1779-49c8-843d-d91812b41573', '27caa732-2b69-49e6-a33a-e517616990e1', 'New review received', 'Waynekim left a 5-star review', 'review', false, 'd9af9858-4f90-42f2-b3ba-31de070c9fa4', 'review', '2026-02-23 21:33:17.527593+00'),
('6cf6071f-65a3-4796-bf93-4f5024c6d0e0', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'New follower', 'Waynekim started following you', 'follower', false, '4f4fec96-cb25-4bd7-a199-aab77c926755', 'follower', '2026-02-23 21:42:50.112108+00'),
('93d176c7-7fe7-40a8-ba3c-164cfe4f37f6', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'New message from Peter Njuguna', E'Hi, I''m interested in "Professional Website Design & Development Services in Nairobi". Is it still a', 'message', true, 'ec29972e-6730-49a0-a50d-9bd3b2f2ef17', 'message', '2026-02-15 16:23:56.829603+00')
ON CONFLICT DO NOTHING;

-- ===================== REVIEWS =====================
INSERT INTO public.reviews (id, reviewer_id, seller_id, rating, comment, status, admin_notes, created_at, updated_at) VALUES
('d9af9858-4f90-42f2-b3ba-31de070c9fa4', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1', 5, 'The best seller very professional and price is as advertised', 'approved', NULL, '2026-02-23 21:33:17.527593+00', '2026-02-23 21:41:50.213292+00')
ON CONFLICT DO NOTHING;

-- ===================== SELLER_SUBSCRIPTIONS =====================
INSERT INTO public.seller_subscriptions (id, user_id, package_id, starts_at, expires_at, status, ads_used, payment_status, payment_reference, mpesa_receipt, created_at, updated_at) VALUES
('395aa4de-113f-442a-b218-d612539f0fcf', '27caa732-2b69-49e6-a33a-e517616990e1', '78e8f9f8-6a79-4328-9ba8-06178fc693ee', '2026-02-06 11:23:52.603831+00', '2026-03-08 11:23:52.603831+00', 'cancelled', 0, 'completed', NULL, NULL, '2026-02-06 11:23:52.603831+00', '2026-02-11 22:41:12.487634+00'),
('84c0a172-593f-4f96-8719-21e443039ce3', '27caa732-2b69-49e6-a33a-e517616990e1', 'fc0dafcc-b3ae-4dcd-9eee-f806dbb41f1c', '2026-02-11 22:41:07.755+00', '2026-08-10 22:41:07.755+00', 'cancelled', 0, 'completed', 'admin_assigned', NULL, '2026-02-11 22:41:12.858096+00', '2026-02-12 00:22:11.057384+00'),
('7e295598-9e06-47c9-ac51-b9d9fb27b506', '27caa732-2b69-49e6-a33a-e517616990e1', 'fc0dafcc-b3ae-4dcd-9eee-f806dbb41f1c', '2026-02-12 00:22:06.237+00', '2026-08-11 00:22:06.237+00', 'active', 0, 'completed', 'admin_assigned', NULL, '2026-02-12 00:22:11.43051+00', '2026-02-12 00:22:11.43051+00'),
('cf25d088-ee9c-48d5-9902-8d85178fbe30', '27caa732-2b69-49e6-a33a-e517616990e1', '80417afb-8f38-4cc1-ab05-c073d0ebd921', '2026-02-12 00:48:36.027133+00', '2026-03-14 00:48:36.027133+00', 'active', 2, 'completed', NULL, NULL, '2026-02-12 00:48:36.027133+00', '2026-02-12 00:48:36.027133+00'),
('198988d0-ec32-4ff9-a17f-e4c4fbeb60cc', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '78e8f9f8-6a79-4328-9ba8-06178fc693ee', '2026-02-12 01:29:11.559+00', '2026-03-14 01:29:11.559+00', 'active', 2, 'completed', NULL, NULL, '2026-02-12 01:29:16.800113+00', '2026-02-13 17:11:32.754563+00')
ON CONFLICT DO NOTHING;

-- ===================== SELLER_ADDONS =====================
INSERT INTO public.seller_addons (id, user_id, addon_id, tier_id, quantity_purchased, quantity_used, status, payment_status, payment_reference, mpesa_receipt, expires_at, created_at, updated_at) VALUES
('47b5aa13-c7e1-4142-96a5-7fdafe41edc1', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'bf44cfa5-9df1-4a2b-9d51-fa573a7a9446', '62f10606-b315-4bcd-96e2-6787f0f0d7d0', 10, 0, 'pending', 'pending', NULL, NULL, NULL, '2026-02-11 20:20:45.209442+00', '2026-02-11 20:20:45.209442+00')
ON CONFLICT DO NOTHING;

-- ===================== SELLER_VERIFICATIONS =====================
INSERT INTO public.seller_verifications (id, user_id, id_front_url, id_back_url, passport_photo_url, status, admin_notes, reviewed_by, reviewed_at, created_at, updated_at) VALUES
('a8a0177d-f120-4105-aa3e-967aeef8b3f3', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/verifications/4f4fec96-cb25-4bd7-a199-aab77c926755/id-front-1770841313035.png', 'https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/verifications/4f4fec96-cb25-4bd7-a199-aab77c926755/id-back-1770841313039.png', 'https://pookcecmoirdsavrgcmb.supabase.co/storage/v1/object/public/verifications/4f4fec96-cb25-4bd7-a199-aab77c926755/passport-1770841313040.png', 'approved', '', NULL, '2026-02-11 20:30:12.371+00', '2026-02-11 20:22:00.123725+00', '2026-02-11 20:30:17.458468+00'),
('d3c747e8-5a4f-41fc-b14a-e1e2f54a7f53', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'd88209d4-c49f-4542-a106-582c0fdd8d81/id-front-1770870918952.png', 'd88209d4-c49f-4542-a106-582c0fdd8d81/id-back-1770870918953.png', 'd88209d4-c49f-4542-a106-582c0fdd8d81/passport-1770870918953.png', 'approved', '', NULL, '2026-02-12 04:38:09.328+00', '2026-02-12 01:33:27.724434+00', '2026-02-12 04:38:14.76806+00')
ON CONFLICT DO NOTHING;

-- ===================== AFFILIATES =====================
INSERT INTO public.affiliates (id, user_id, referral_code, status, commission_rate_registration, commission_rate_subscription, total_earnings, total_paid, pending_balance, mpesa_phone, created_at, updated_at) VALUES
('678df4ba-c3fe-492d-b98f-b45697bdc176', '27caa732-2b69-49e6-a33a-e517616990e1', 'APA27CAA7PM50', 'approved', 10, 10, 0, 0, 0, '254798435087', '2026-02-11 21:32:23.186016+00', '2026-02-11 23:10:25.417228+00')
ON CONFLICT DO NOTHING;

-- ===================== AFFILIATE_CLICKS =====================
INSERT INTO public.affiliate_clicks (id, affiliate_id, referral_code, browser_name, device_type, os_name, page_url, user_agent, converted, converted_user_id, country, ip_address, created_at) VALUES
('227df146-7fa5-45a2-8848-082c8facd8b8', '678df4ba-c3fe-492d-b98f-b45697bdc176', 'APA27CAA7PM50', 'Chrome', 'desktop', 'Linux', '/', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', false, NULL, NULL, NULL, '2026-02-11 23:52:16.984487+00')
ON CONFLICT DO NOTHING;

-- ===================== BUMP_TRANSACTIONS =====================
INSERT INTO public.bump_transactions (id, user_id, listing_id, credits, package_id, type, created_at) VALUES
('73cdca7d-796e-43b3-bff2-40e1987c1c58', 'd88209d4-c49f-4542-a106-582c0fdd8d81', NULL, 15, '9d299977-afd6-411d-9154-f817d0ef0476', 'purchase', '2026-02-12 03:56:17.053552+00'),
('c9a1564b-546c-426b-bf83-590548de425f', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '81a99c1d-440b-42f6-afc8-4cf963470fb5', -1, NULL, 'use', '2026-02-12 04:47:21.475979+00')
ON CONFLICT DO NOTHING;

-- ===================== LISTING_PROMOTIONS =====================
INSERT INTO public.listing_promotions (id, listing_id, promotion_type_id, user_id, purchased_at, expires_at, status, payment_status, payment_reference, created_at) VALUES
('57ebdce8-5797-4578-a4f8-d60ab97f3e82', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'ffcee6f0-1b3a-4332-95f0-7bcb69bbe715', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-12 04:47:03.769681+00', '2026-02-19 04:46:58.302+00', 'expired', 'completed', 'admin_assigned', '2026-02-12 04:47:03.769681+00'),
('c16a0d58-b87b-447d-a9a5-f65a6cfc3917', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'ffcee6f0-1b3a-4332-95f0-7bcb69bbe715', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-13 17:48:13.279057+00', '2026-02-20 17:48:12.164+00', 'expired', 'completed', 'admin_assigned', '2026-02-13 17:48:13.279057+00')
ON CONFLICT DO NOTHING;

-- ===================== LISTING_TIER_PURCHASES =====================
INSERT INTO public.listing_tier_purchases (id, listing_id, tier_id, user_id, purchased_at, expires_at, status, payment_status, payment_reference, created_at) VALUES
('ea0b6629-fdc2-42e3-af6b-0a666ce5d200', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'a1af2958-d47a-450c-ade2-86ae0a1269ec', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-12 04:46:50.861472+00', '2026-03-14 04:46:45.44+00', 'active', 'completed', 'admin_assigned', '2026-02-12 04:46:50.861472+00'),
('2f990bfa-99b4-42d4-a8c9-ff36c2a03fa1', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'a1af2958-d47a-450c-ade2-86ae0a1269ec', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-13 17:47:55.411342+00', '2026-03-15 17:47:54.033+00', 'active', 'completed', 'admin_assigned', '2026-02-13 17:47:55.411342+00'),
('6e281877-d968-469a-84bf-d8a2d19d4f80', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'a1af2958-d47a-450c-ade2-86ae0a1269ec', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-13 18:46:13.528344+00', '2026-03-15 18:46:12.42+00', 'active', 'completed', 'admin_assigned', '2026-02-13 18:46:13.528344+00')
ON CONFLICT DO NOTHING;

-- ===================== AI_USAGE_LOGS =====================
INSERT INTO public.ai_usage_logs (id, user_id, action_type, prompt_summary, provider, model, success, tokens_used, error_message, created_at) VALUES
('901b8e92-d772-496b-aabb-f66ec6cdd563', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'generate_title', 'generate_title: Iphone', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 11:30:43.566978+00'),
('768f0b3f-bd5c-432a-bb78-f24ebd811997', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'generate_title', 'generate_title: Apple iPhone - Excellent Condition - Factory Unlocked - Nairobi', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 11:34:17.04957+00'),
('212dd9bc-89d7-4a89-92b8-2cbd78af28c7', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'generate_title', 'generate_title: Iphone 14 Plus', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 11:34:55.970222+00'),
('8f396959-e538-4e42-bfac-2c2a62bd25c7', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'full_optimize', 'full_optimize: Website Design', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 11:39:46.056688+00'),
('0c2be8ab-fce4-4f91-96ae-a130496aef52', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'full_optimize', 'full_optimize: Website Design', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 12:21:12.033064+00'),
('fb6305aa-8a53-4333-834a-3ae8131c634e', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'full_optimize', 'full_optimize: Professional Website Design & Development Services in Nairobi', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 12:23:15.444515+00'),
('25a42e15-e694-49d8-bbb0-d7b1c73bd2a6', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'search', 'toyota under 1 million', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 12:46:55.709001+00'),
('889cb754-ca00-4eca-86d1-eb95f6d97497', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'search', 'Toyota filder', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 12:47:39.20355+00'),
('28859389-12b2-4db5-b564-9ba4680101f4', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'search', 'toyota under 1 million', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 15:05:17.673393+00'),
('821afead-fe01-42d7-9e70-d9e9ba324fff', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'full_optimize', 'full_optimize: Hp Laptop Dragonfly', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-13 17:06:36.715733+00'),
('1cb10af8-55c7-42b4-817d-d7f761450983', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'search', 'toyota fielder', 'gemini', 'google/gemini-3-flash-preview', true, 0, NULL, '2026-02-15 15:44:12.208216+00')
ON CONFLICT DO NOTHING;

-- ===================== CONTACT_SUBMISSIONS =====================
INSERT INTO public.contact_submissions (id, name, email, subject, message, status, created_at) VALUES
('d5f936d4-7dfe-41a8-8407-0ea0d9bf220d', 'Sapphire Building', 'waynegraphicsdesigns@gmail.com', 'test', 'test', 'read', '2026-02-13 15:53:42.698846+00')
ON CONFLICT DO NOTHING;

-- ===================== SUPPORT_TICKETS =====================
INSERT INTO public.support_tickets (id, user_id, subject, description, category, priority, status, assigned_to, listing_id, attachments, resolved_at, closed_at, created_at, updated_at) VALUES
('bd85021a-e994-482f-a403-677186d196d9', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'test ticket', 'test', 'listing', 'medium', 'resolved', '4f4fec96-cb25-4bd7-a199-aab77c926755', NULL, NULL, '2026-02-23 22:21:23.879+00', NULL, '2026-02-13 15:55:53.884871+00', '2026-02-23 22:21:16.210418+00')
ON CONFLICT DO NOTHING;

-- Re-enable triggers and RLS
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL;';
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

COMMIT;

-- Verify counts
SELECT 'profiles' as tbl, count(*) FROM profiles
UNION ALL SELECT 'user_roles', count(*) FROM user_roles
UNION ALL SELECT 'team_members', count(*) FROM team_members
UNION ALL SELECT 'messages', count(*) FROM messages
UNION ALL SELECT 'favorites', count(*) FROM favorites
UNION ALL SELECT 'follows', count(*) FROM follows
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'reviews', count(*) FROM reviews
UNION ALL SELECT 'seller_subscriptions', count(*) FROM seller_subscriptions
UNION ALL SELECT 'seller_addons', count(*) FROM seller_addons
UNION ALL SELECT 'seller_verifications', count(*) FROM seller_verifications
UNION ALL SELECT 'affiliates', count(*) FROM affiliates
UNION ALL SELECT 'affiliate_clicks', count(*) FROM affiliate_clicks
UNION ALL SELECT 'bump_transactions', count(*) FROM bump_transactions
UNION ALL SELECT 'listing_promotions', count(*) FROM listing_promotions
UNION ALL SELECT 'listing_tier_purchases', count(*) FROM listing_tier_purchases
UNION ALL SELECT 'ai_usage_logs', count(*) FROM ai_usage_logs
UNION ALL SELECT 'contact_submissions', count(*) FROM contact_submissions
UNION ALL SELECT 'support_tickets', count(*) FROM support_tickets
ORDER BY tbl;
