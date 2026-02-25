-- ============================================================
-- JIJI KENYA - COMPLETE Data Import (All Tables)
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

-- ===================== MAIN_CATEGORIES =====================
INSERT INTO public.main_categories (id, name, slug, icon, description, seo_title, seo_description, display_order, is_active, created_at, updated_at) VALUES
('d1e909da-e962-48ec-8a11-59a1e5828a7c', 'Vehicles', 'vehicles', 'Car', 'Cars, motorcycles, trucks, boats and more', 'Buy & Sell Vehicles in Kenya', 'Find the best deals on cars, motorcycles, trucks and other vehicles in Kenya', 1, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('56f8d305-073d-4999-815a-597c769bcaa8', 'Property', 'property', 'Home', 'Houses, apartments, land and commercial spaces', 'Property for Sale & Rent in Kenya', 'Find houses, apartments, land and commercial property in Kenya', 2, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('ae8d60d2-8755-4933-b2af-0a4a9c1c825a', 'Jobs', 'jobs', 'Briefcase', 'Job listings and career opportunities', 'Jobs in Kenya - Find Your Next Career', 'Browse thousands of job opportunities across Kenya', 3, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Electronics', 'electronics', 'Laptop', 'Computers, TVs, cameras and gadgets', 'Buy & Sell Electronics in Kenya', 'Find great deals on laptops, TVs, cameras and more', 4, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('d89868dd-a046-4f78-bef4-af616209cb38', 'Phones & Tablets', 'phones-tablets', 'Smartphone', 'Mobile phones, tablets and accessories', 'Buy & Sell Phones in Kenya', 'Find smartphones, tablets and accessories at great prices', 5, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('a7df226e-ce56-468c-8975-7c8d5705c3a1', 'Fashion', 'fashion', 'Shirt', 'Clothing, shoes and accessories', 'Fashion & Clothing in Kenya', 'Shop for trendy clothes, shoes and accessories', 6, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Furniture & Appliances', 'furniture-appliances', 'Sofa', 'Home furniture and household appliances', 'Furniture & Appliances in Kenya', 'Find furniture and home appliances at great prices', 7, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('9630e161-76a4-44a7-8150-388705136cd5', 'Animals & Pets', 'animals-pets', 'Dog', 'Pets, livestock and pet supplies', 'Pets for Sale in Kenya', 'Find pets, livestock and pet supplies', 8, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('8acdd7a9-4b46-44ca-ade6-ec7f109d381d', 'Babies & Kids', 'babies-kids', 'Baby', 'Baby products, toys and kids items', 'Baby & Kids Products in Kenya', 'Shop for baby products, toys and kids items', 9, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('b29f4b5a-8d50-4158-b982-dcf70f73e924', 'Beauty & Personal Care', 'beauty-care', 'Sparkles', 'Beauty products and personal care items', 'Beauty Products in Kenya', 'Find beauty and personal care products', 10, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('133282c9-8d8e-4566-90d7-1c472cc8e719', 'Services', 'services', 'Wrench', 'Professional and personal services', 'Services in Kenya', 'Find professional services in Kenya', 11, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('ff31016a-f1bf-415f-a763-92eea72290fc', 'Commercial Equipment', 'commercial-equipment', 'Factory', 'Industrial and commercial equipment', 'Commercial Equipment in Kenya', 'Buy and sell commercial and industrial equipment', 12, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('dfa59795-49d1-4fc3-b4fb-8c0bb1eb4dc3', 'Food & Agriculture', 'food-agriculture', 'Tractor', 'Farm products, livestock and agricultural supplies', 'Agriculture & Farm Products in Kenya', 'Find farm products and agricultural supplies', 13, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('d2be898d-5951-4916-bae2-7b25e6ad7249', 'Leisure & Sports', 'leisure-sports', 'Music', 'Sports, hobbies and entertainment', 'Sports & Leisure in Kenya', 'Find sports equipment, musical instruments and leisure items', 14, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00'),
('e5a7b93f-6f33-41dc-bf9e-3f27ff09b35d', 'Construction & Building', 'construction-building', 'HardHat', 'Building materials, tools and construction services', 'Construction Materials in Kenya', 'Find building materials and construction supplies', 15, true, '2026-02-06 10:13:33.401892+00', '2026-02-06 10:13:33.401892+00')
ON CONFLICT DO NOTHING;

-- ===================== SUB_CATEGORIES =====================
INSERT INTO public.sub_categories (id, main_category_id, name, slug, display_order, is_active, created_at, updated_at) VALUES
-- Electronics
('a2ad2aa9-5f7e-4698-b270-b421a42e69d0', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Computers & Laptops', 'computers-laptops', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('bb17714c-b0a7-492f-9776-abc51b1e3eac', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'TVs & Monitors', 'tvs-monitors', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('67409ce0-2271-4aac-84e3-c838f7d2aa4a', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Cameras & Photography', 'cameras', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('7e43e600-4552-4b1e-a79e-eea09a481d60', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Audio & Music Equipment', 'audio', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('d50b253f-f45b-4f78-9e88-59fd30e4fa79', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Gaming & Consoles', 'gaming', 5, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('d3392d22-213b-4d27-a9d0-4bc27370da94', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'Computer Accessories', 'computer-accessories', 6, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Services
('e3be20bd-10de-4ebd-96ff-06c6dc0c193c', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Home Services', 'home-services', 1, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
('b95bb2bf-fa6b-41a7-acaf-e8f428510c30', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Moving & Transport', 'moving-transport', 2, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
('0ed52ae1-dbdc-49cb-af75-afea421d7718', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Events & Catering', 'events-catering', 3, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
('7b687e0d-373d-4726-952f-7f96d1b9e204', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Health & Beauty Services', 'health-beauty-services', 4, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
('23a278b8-2852-4e16-befd-88ef119276f0', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Tutoring & Lessons', 'tutoring-lessons', 5, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
('697797c7-4da5-4290-8643-c372cf540746', '133282c9-8d8e-4566-90d7-1c472cc8e719', 'Repair & Technical', 'repair-technical', 6, true, '2026-02-06 10:14:20.032506+00', '2026-02-06 10:14:20.032506+00'),
-- Property
('28271b51-b5ab-4a8d-a159-c2bf91ec55d5', '56f8d305-073d-4999-815a-597c769bcaa8', 'Houses & Apartments for Sale', 'houses-apartments-sale', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('30cb5829-5c0f-400f-8b7f-5ad8fb9ae3ec', '56f8d305-073d-4999-815a-597c769bcaa8', 'Houses & Apartments for Rent', 'houses-apartments-rent', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('8688b28d-57bf-4b29-8267-402c9093a6c7', '56f8d305-073d-4999-815a-597c769bcaa8', 'Land & Plots', 'land-plots', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('f8ede82e-0e94-4fb2-aee9-81f5f5fc9fd7', '56f8d305-073d-4999-815a-597c769bcaa8', 'Short Stay', 'short-stay', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('55c2a891-b9e9-4a3f-858f-f4e0fd26f0e2', '56f8d305-073d-4999-815a-597c769bcaa8', 'Commercial Property', 'commercial-property', 5, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Vehicles
('c51695a8-2e03-4fd7-b946-32d75c79358d', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'Cars', 'cars', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('e457ecc2-5cb2-4fe9-a7eb-7a63fed8a7d1', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'Motorcycles', 'motorcycles', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('af21fd5f-e1fb-4e84-958e-c32e3f4399c1', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'Trucks & Trailers', 'trucks-trailers', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('2dff8db6-9e8b-4aab-a2bf-f5a42e66d3f8', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'Buses & Vans', 'buses-vans', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('e80abb3a-5e83-458d-bbd2-8e3cf2d2f3aa', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'Vehicle Parts', 'vehicle-parts', 5, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Phones & Tablets
('40132a02-088c-47c0-bae5-36d50ed5b415', 'd89868dd-a046-4f78-bef4-af616209cb38', 'Smartphones', 'smartphones', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('2a2a19c2-ef4a-445e-a5fa-3b6f47fd47fb', 'd89868dd-a046-4f78-bef4-af616209cb38', 'Tablets', 'tablets', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('3ef5bfc7-fa9e-49d1-9d24-5f53de80e8ee', 'd89868dd-a046-4f78-bef4-af616209cb38', 'Phone Accessories', 'phone-accessories', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Fashion
('d88f27e6-9ad3-4be0-8e3f-5e5e8eb7fc41', 'a7df226e-ce56-468c-8975-7c8d5705c3a1', 'Men''s Clothing', 'mens-clothing', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('4e14fc3f-a7f3-4427-8a83-b38edda2b547', 'a7df226e-ce56-468c-8975-7c8d5705c3a1', 'Women''s Clothing', 'womens-clothing', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('2ffa558b-0eb2-4dc1-9c42-b29a7d00c7d2', 'a7df226e-ce56-468c-8975-7c8d5705c3a1', 'Shoes & Footwear', 'shoes-footwear', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('d4dfdc3f-3ba2-4cb3-b397-29c5f8d8a8d3', 'a7df226e-ce56-468c-8975-7c8d5705c3a1', 'Bags & Accessories', 'bags-accessories', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Furniture
('1bb33327-90a4-40dc-97e8-165228269332', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Living Room', 'living-room', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('6c80f937-6bc1-462f-9b27-3d9e6e4dfdfc', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Bedroom', 'bedroom', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('a5dd16c2-85e0-4be1-af4d-9148ed7ee0fc', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Kitchen & Dining', 'kitchen-dining', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('c0ed2d0f-f57f-44d8-a5d9-f7c79c7e3e84', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Home Appliances', 'home-appliances', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('3eeb4c68-aade-4982-9de5-cb0c0c1b3b08', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', 'Office Furniture', 'office-furniture', 5, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Jobs
('ff5f8367-a7a6-46b4-9c88-03d9a90bfa98', 'ae8d60d2-8755-4933-b2af-0a4a9c1c825a', 'Full-time', 'full-time', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('7d9a0dce-a268-43be-b66e-0e3a3e1dd2c1', 'ae8d60d2-8755-4933-b2af-0a4a9c1c825a', 'Part-time', 'part-time', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('b0c3e12f-3d8e-47a7-af21-9f6ab2c3ea4a', 'ae8d60d2-8755-4933-b2af-0a4a9c1c825a', 'Freelance', 'freelance', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('0e7c88c4-3e5f-4bc5-b06e-07d5d0a2e14b', 'ae8d60d2-8755-4933-b2af-0a4a9c1c825a', 'Internship', 'internship', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Pets
('7a22aa7e-82e3-4f48-a88c-d83b7e69ea8a', '9630e161-76a4-44a7-8150-388705136cd5', 'Dogs', 'dogs', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('d55df0cf-45e2-4a7c-a7ac-b32f4b9c7c0e', '9630e161-76a4-44a7-8150-388705136cd5', 'Cats', 'cats', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('19ddd39f-ca14-44c7-b8d4-0d7d5e0b11ce', '9630e161-76a4-44a7-8150-388705136cd5', 'Birds', 'birds', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('f5e30cd4-32f4-47f5-b654-1e7e6f8b7d2c', '9630e161-76a4-44a7-8150-388705136cd5', 'Pet Supplies', 'pet-supplies', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Kids
('9dc4e9f1-8a3c-43e5-9fb5-d6a7c8e41f13', '8acdd7a9-4b46-44ca-ade6-ec7f109d381d', 'Baby Gear', 'baby-gear', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('34ee8ab7-0f36-4c93-8ef1-cf82e4d3dc5a', '8acdd7a9-4b46-44ca-ade6-ec7f109d381d', 'Toys & Games', 'toys-games', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('a39e5d1f-c7b4-4e1a-b9d8-f71e3c2a5b8e', '8acdd7a9-4b46-44ca-ade6-ec7f109d381d', 'Kids Clothing', 'kids-clothing', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
-- Beauty
('b7df52e1-d6a8-4f93-be75-7c3a8d2f1e5b', 'b29f4b5a-8d50-4158-b982-dcf70f73e924', 'Skincare', 'skincare', 1, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('e8c3a71f-4b2d-4e8a-9f6c-d5b7e1a3c2f8', 'b29f4b5a-8d50-4158-b982-dcf70f73e924', 'Makeup', 'makeup', 2, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('c1d8e5f7-3a4b-4c2e-b9d6-f8a7e3c1d5b2', 'b29f4b5a-8d50-4158-b982-dcf70f73e924', 'Hair Care', 'hair-care', 3, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00'),
('a2e7c9d1-5b3f-4e8a-b6c4-d7f1e8a3c5b9', 'b29f4b5a-8d50-4158-b982-dcf70f73e924', 'Fragrances', 'fragrances', 4, true, '2026-02-06 10:13:54.933704+00', '2026-02-06 10:13:54.933704+00')
ON CONFLICT DO NOTHING;

-- ===================== KENYA_COUNTIES (47 counties) =====================
INSERT INTO public.kenya_counties (id, name, slug, display_order, created_at) VALUES
('08d019a5-50f7-4e2c-bb07-d9236597201e', 'Nairobi', 'nairobi', 1, '2026-02-11 20:08:49.254157+00'),
('34c52593-cb80-4c62-8e47-9e706dc670b3', 'Mombasa', 'mombasa', 2, '2026-02-11 20:08:49.254157+00'),
('cd2a0b38-eaea-4a3e-bc46-dbc346e2b54d', 'Kisumu', 'kisumu', 3, '2026-02-11 20:08:49.254157+00'),
('e18574c0-b2ce-49b8-90ae-bc55b94f9218', 'Nakuru', 'nakuru', 4, '2026-02-11 20:08:49.254157+00'),
('8a1d2d37-7c63-4bef-a83a-5696d92b311b', 'Uasin Gishu', 'uasin-gishu', 5, '2026-02-11 20:08:49.254157+00'),
('04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Kiambu', 'kiambu', 6, '2026-02-11 20:08:49.254157+00'),
('0a97a61f-7101-4fb6-b5a5-4af19ac93729', 'Machakos', 'machakos', 7, '2026-02-11 20:08:49.254157+00'),
('c39318d2-b896-4ff0-8b4f-d5f46b30258c', 'Kajiado', 'kajiado', 8, '2026-02-11 20:08:49.254157+00'),
('bba21226-81cb-49bd-b5e7-a8c7a267685e', 'Kilifi', 'kilifi', 9, '2026-02-11 20:08:49.254157+00'),
('ad784fcb-1e07-4997-a170-f0ee6aca81e0', 'Kwale', 'kwale', 10, '2026-02-11 20:08:49.254157+00'),
('b76c7226-d2d0-49b0-96f5-cb5a9a2f089d', 'Meru', 'meru', 11, '2026-02-11 20:08:49.254157+00'),
('3a3bc678-a9d3-453c-b60d-88b74f0f5969', 'Nyeri', 'nyeri', 12, '2026-02-11 20:08:49.254157+00'),
('cad68d25-6aa8-42ff-b6e3-5adb000f692f', 'Murang''a', 'muranga', 13, '2026-02-11 20:08:49.254157+00'),
('834fb2bf-fbfe-454a-b22d-dcacc47bf230', 'Kirinyaga', 'kirinyaga', 14, '2026-02-11 20:08:49.254157+00'),
('747e5242-d0fb-4f8b-8039-3b7e4a4b6ff0', 'Embu', 'embu', 15, '2026-02-11 20:08:49.254157+00'),
('c3742dc7-ce19-474a-a87a-744252085e7d', 'Tharaka Nithi', 'tharaka-nithi', 16, '2026-02-11 20:08:49.254157+00'),
('8dfdbf65-1b97-4d30-a699-104e5d9bf5b4', 'Laikipia', 'laikipia', 17, '2026-02-11 20:08:49.254157+00'),
('aa488fdb-f2c5-43e7-ac15-6d5058ff6d12', 'Nyandarua', 'nyandarua', 18, '2026-02-11 20:08:49.254157+00'),
('4f20910d-2681-4975-b681-f48fdc16ea10', 'Baringo', 'baringo', 19, '2026-02-11 20:08:49.254157+00'),
('ebf36175-6ddd-419d-b25d-f1a0173e3783', 'Nandi', 'nandi', 20, '2026-02-11 20:08:49.254157+00'),
('b3f71d03-1541-4a86-997f-b067673c9eae', 'Kericho', 'kericho', 21, '2026-02-11 20:08:49.254157+00'),
('75503e6d-1ca1-4133-be0d-31953fc55fd7', 'Bomet', 'bomet', 22, '2026-02-11 20:08:49.254157+00'),
('482498b8-e8dd-49ed-b234-5b96c0e26d61', 'Narok', 'narok', 23, '2026-02-11 20:08:49.254157+00'),
('ef4a8321-4c0f-4336-aa1c-71e3a8843f05', 'Trans Nzoia', 'trans-nzoia', 24, '2026-02-11 20:08:49.254157+00'),
('9ad2fc49-e7f4-4b43-86a5-0bd1049a8626', 'Elgeyo Marakwet', 'elgeyo-marakwet', 25, '2026-02-11 20:08:49.254157+00'),
('5c5cfbfc-6b44-49ff-b6d0-088b4c421ee8', 'West Pokot', 'west-pokot', 26, '2026-02-11 20:08:49.254157+00'),
('d2082aed-7d97-4e1b-8c94-5860c6792e9e', 'Turkana', 'turkana', 27, '2026-02-11 20:08:49.254157+00'),
('0e5a0767-b544-4934-b806-f920ac2baa1b', 'Samburu', 'samburu', 28, '2026-02-11 20:08:49.254157+00'),
('4017d64d-37b2-4488-8962-d2c7e7d60299', 'Marsabit', 'marsabit', 29, '2026-02-11 20:08:49.254157+00'),
('59d473a4-4a0e-4b7c-9a6c-37f1187f758f', 'Isiolo', 'isiolo', 30, '2026-02-11 20:08:49.254157+00'),
('7165a14b-cdd0-4816-86cf-c542c417923f', 'Garissa', 'garissa', 31, '2026-02-11 20:08:49.254157+00'),
('2c525986-acc7-4bce-997c-e3da5f19c13f', 'Wajir', 'wajir', 32, '2026-02-11 20:08:49.254157+00'),
('ab4c0052-f488-4dec-9b30-0ee08507a8f9', 'Mandera', 'mandera', 33, '2026-02-11 20:08:49.254157+00'),
('60c09d6b-f8ac-4bbe-84f9-bc2eb3eac872', 'Tana River', 'tana-river', 34, '2026-02-11 20:08:49.254157+00'),
('5be9712a-ab1f-44f9-8df3-0e095a73eb65', 'Lamu', 'lamu', 35, '2026-02-11 20:08:49.254157+00'),
('e05de1fd-c8f8-480b-b24f-b8435d7d4ebf', 'Taita Taveta', 'taita-taveta', 36, '2026-02-11 20:08:49.254157+00'),
('9f63f192-b08b-4185-84d5-00fedaf7fa52', 'Kitui', 'kitui', 37, '2026-02-11 20:08:49.254157+00'),
('4094385f-69ce-488b-afb8-c4ecaf7fc0a6', 'Makueni', 'makueni', 38, '2026-02-11 20:08:49.254157+00'),
('29ae5fb7-45b2-4d5f-ab2f-4a0b28a0cb7c', 'Bungoma', 'bungoma', 39, '2026-02-11 20:08:49.254157+00'),
('a5e49107-8ad3-42bb-a1e5-ebae5f5e7f98', 'Busia', 'busia', 40, '2026-02-11 20:08:49.254157+00'),
('6c7e16df-1f0b-4247-bcce-2b29e8ea3db2', 'Kakamega', 'kakamega', 41, '2026-02-11 20:08:49.254157+00'),
('cf38c7b9-7e01-4bb1-a8e5-e92b0c7d6d8e', 'Vihiga', 'vihiga', 42, '2026-02-11 20:08:49.254157+00'),
('6b6d97c3-b7a2-4d6e-8f1a-c5e3a9d74b28', 'Siaya', 'siaya', 43, '2026-02-11 20:08:49.254157+00'),
('e9c71a5d-3f84-4b2e-a6d8-f7b3c1e5d9a4', 'Homa Bay', 'homa-bay', 44, '2026-02-11 20:08:49.254157+00'),
('a1d3e5f7-8b2c-4a6e-9d1f-c7b5e3a9d2f4', 'Migori', 'migori', 45, '2026-02-11 20:08:49.254157+00'),
('d7f1e3a5-9c2b-4e8d-b6a4-f8c3e1d5a7b9', 'Kisii', 'kisii', 46, '2026-02-11 20:08:49.254157+00'),
('b5e9d3a1-7f4c-4b2e-8a6d-c1f7e5b3d9a2', 'Nyamira', 'nyamira', 47, '2026-02-11 20:08:49.254157+00')
ON CONFLICT DO NOTHING;

-- ===================== KENYA_TOWNS (200+) =====================
-- Nairobi towns
INSERT INTO public.kenya_towns (id, county_id, name, slug, display_order, created_at) VALUES
('5a47bb1d-a93b-4b70-acc3-6b5cc5906803', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'CBD', 'cbd', 0, '2026-02-11 20:09:23.770918+00'),
('31bc232e-c029-4e44-a867-760347ebc083', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Dagoretti', 'dagoretti', 0, '2026-02-11 20:09:23.770918+00'),
('5c630c22-1eb0-48ee-8cd8-c3ca0856ac17', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Eastleigh', 'eastleigh', 0, '2026-02-11 20:09:23.770918+00'),
('a50d4f59-d043-44ee-acaf-2cb718172955', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Embakasi', 'embakasi', 0, '2026-02-11 20:09:23.770918+00'),
('199a567e-0318-4d49-90f9-53e47233f259', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Karen', 'karen', 0, '2026-02-11 20:09:23.770918+00'),
('43baeb1e-1c1a-49be-b13a-d8cf9f559e90', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Kasarani', 'kasarani', 0, '2026-02-11 20:09:23.770918+00'),
('208d5439-fa95-4221-b2c4-dfe798225a23', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Kibra', 'kibra', 0, '2026-02-11 20:09:23.770918+00'),
('b87d0e12-4aed-41e3-8962-096d5c68c283', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Kileleshwa', 'kileleshwa', 0, '2026-02-11 20:09:23.770918+00'),
('538b5138-092d-4409-a80e-51a45d095a2d', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Kilimani', 'kilimani', 0, '2026-02-11 20:09:23.770918+00'),
('4dee3aff-62dd-4af1-b86e-9ff96bb6a5b6', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Langata', 'langata', 0, '2026-02-11 20:09:23.770918+00'),
('207eb23c-cda9-43a3-9261-d1c181e97af6', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Lavington', 'lavington', 0, '2026-02-11 20:09:23.770918+00'),
('6c40c54f-9e1b-45e6-8735-065ba547156f', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Mathare', 'mathare', 0, '2026-02-11 20:09:23.770918+00'),
('b37eae26-a224-4315-ae76-cdf5e1379453', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Ngong Road', 'ngong-road', 0, '2026-02-11 20:09:23.770918+00'),
('6867f63a-bf3d-45e8-bd65-2db467c2406e', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Parklands', 'parklands', 0, '2026-02-11 20:09:23.770918+00'),
('3c93d738-206e-4537-b73d-44cd5edf9c88', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Roysambu', 'roysambu', 0, '2026-02-11 20:09:23.770918+00'),
('292df200-1e1b-47d3-8e30-4b7656318c9a', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Ruaraka', 'ruaraka', 0, '2026-02-11 20:09:23.770918+00'),
('05a200fd-d0c8-4075-be3e-ded521756dbc', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'South B', 'south-b', 0, '2026-02-11 20:09:23.770918+00'),
('cc5c6adb-4940-4221-89ce-be4272ec4ba4', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'South C', 'south-c', 0, '2026-02-11 20:09:23.770918+00'),
('03fdaad8-9a69-4332-9054-949b12029562', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Starehe', 'starehe', 0, '2026-02-11 20:09:23.770918+00'),
('24df362e-8992-4eff-9f74-2cb03acb3876', '08d019a5-50f7-4e2c-bb07-d9236597201e', 'Westlands', 'westlands', 0, '2026-02-11 20:09:23.770918+00'),
-- Kiambu towns
('5d63846a-d961-4a89-a946-88a228866827', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Gatundu', 'gatundu', 0, '2026-02-11 20:09:23.770918+00'),
('cc4eb2ab-f50a-493a-a393-38ebdd16e614', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Juja', 'juja', 0, '2026-02-11 20:09:23.770918+00'),
('57734dad-2e0b-4d6e-8f22-91ceb6a714df', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Kiambu Town', 'kiambu-town', 0, '2026-02-11 20:09:23.770918+00'),
('5773adcd-8ef1-4764-bacb-c53c81222565', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Kikuyu', 'kikuyu', 0, '2026-02-11 20:09:23.770918+00'),
('3a2a0b02-bf4c-469d-9ffa-1dc5bceeb5e8', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Limuru', 'limuru', 0, '2026-02-11 20:09:23.770918+00'),
('d80d6443-6596-493c-af28-83430945316e', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Ruiru', 'ruiru', 0, '2026-02-11 20:09:23.770918+00'),
('b82f1cef-c371-4f18-b026-c70f6144d68b', '04d9b4ea-e737-4a35-ab9e-b28a0b3174da', 'Thika', 'thika', 0, '2026-02-11 20:09:23.770918+00'),
-- Machakos towns
('12b37356-aaa1-43df-b52c-a8250954e851', '0a97a61f-7101-4fb6-b5a5-4af19ac93729', 'Athi River', 'athi-river', 0, '2026-02-11 20:09:23.770918+00'),
('76b9c8d2-1e3f-4a5b-8c7d-9f2e4b6a3d1c', '0a97a61f-7101-4fb6-b5a5-4af19ac93729', 'Machakos Town', 'machakos-town', 0, '2026-02-11 20:09:23.770918+00'),
('a3d1e5f7-9b2c-4e8a-6d4f-c7b5e1a3d9f2', '0a97a61f-7101-4fb6-b5a5-4af19ac93729', 'Syokimau', 'syokimau', 0, '2026-02-11 20:09:23.770918+00'),
-- Mombasa towns
('8d2f4a6c-1e3b-5c7d-9f8a-b4e6c2d1a3f5', '34c52593-cb80-4c62-8e47-9e706dc670b3', 'Bamburi', 'bamburi', 0, '2026-02-11 20:09:23.770918+00'),
('c5e7a9d1-3f4b-2e8c-6a1d-f9b3e7c5d1a2', '34c52593-cb80-4c62-8e47-9e706dc670b3', 'Mombasa CBD', 'mombasa-cbd', 0, '2026-02-11 20:09:23.770918+00'),
('e1a3c5d7-9f2b-4e6a-8c1d-b5f7e3a9c1d2', '34c52593-cb80-4c62-8e47-9e706dc670b3', 'Nyali', 'nyali', 0, '2026-02-11 20:09:23.770918+00'),
('a9c1d3e5-7f4b-2e8a-6c1d-f5b3e7a9c1d2', '34c52593-cb80-4c62-8e47-9e706dc670b3', 'Likoni', 'likoni', 0, '2026-02-11 20:09:23.770918+00'),
-- Nakuru towns
('b1d3e5f7-a9c2-4b6e-8d1f-c7f5e3a1b9d2', 'e18574c0-b2ce-49b8-90ae-bc55b94f9218', 'Nakuru Town', 'nakuru-town', 0, '2026-02-11 20:09:23.770918+00'),
('c3e5a7d1-b9f2-4c8e-6a1d-e7f3c5b1a9d2', 'e18574c0-b2ce-49b8-90ae-bc55b94f9218', 'Naivasha', 'naivasha', 0, '2026-02-11 20:09:23.770918+00'),
('d5f7a9c1-e3b2-4e6a-8c1d-f9b5e7c3a1d2', 'e18574c0-b2ce-49b8-90ae-bc55b94f9218', 'Gilgil', 'gilgil', 0, '2026-02-11 20:09:23.770918+00'),
-- Kisumu towns
('e7a9c1d3-f5b2-4e8a-6c1d-a9b3e7f5c1d2', 'cd2a0b38-eaea-4a3e-bc46-dbc346e2b54d', 'Kisumu CBD', 'kisumu-cbd', 0, '2026-02-11 20:09:23.770918+00'),
('f9c1d3e5-a7b2-4e6a-8c1d-c5b3e1f7a9d2', 'cd2a0b38-eaea-4a3e-bc46-dbc346e2b54d', 'Kondele', 'kondele', 0, '2026-02-11 20:09:23.770918+00'),
-- Uasin Gishu
('a1c3e5d7-f9b2-4e8a-6c1d-e7b3a9f5c1d2', '8a1d2d37-7c63-4bef-a83a-5696d92b311b', 'Eldoret', 'eldoret', 0, '2026-02-11 20:09:23.770918+00'),
-- Kajiado
('b3e5a7c1-d9f2-4e6a-8c1d-f7b5e3a1c9d2', 'c39318d2-b896-4ff0-8b4f-d5f46b30258c', 'Ngong', 'ngong', 0, '2026-02-11 20:09:23.770918+00'),
('c5a7d1e3-f9b2-4e8a-6c1d-a7b3e5f1c9d2', 'c39318d2-b896-4ff0-8b4f-d5f46b30258c', 'Kitengela', 'kitengela', 0, '2026-02-11 20:09:23.770918+00'),
('d7c1e3a5-b9f2-4e6a-8c1d-c7b5e3a9f1d2', 'c39318d2-b896-4ff0-8b4f-d5f46b30258c', 'Ongata Rongai', 'ongata-rongai', 0, '2026-02-11 20:09:23.770918+00')
ON CONFLICT DO NOTHING;

-- ===================== VEHICLE_MAKES (25 makes) =====================
INSERT INTO public.vehicle_makes (id, name, display_order, is_active, logo_url, created_at) VALUES
('3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Toyota', 1, true, NULL, '2026-02-06 10:14:09.216129+00'),
('c6fa2124-b5ea-418f-9e07-614394129db2', 'Nissan', 2, true, NULL, '2026-02-06 10:14:09.216129+00'),
('7beb1c3c-431f-424f-b238-8494c606003b', 'Honda', 3, true, NULL, '2026-02-06 10:14:09.216129+00'),
('a462e9dd-ce37-4761-bd34-349a2d9125ee', 'Mazda', 4, true, NULL, '2026-02-06 10:14:09.216129+00'),
('02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Subaru', 5, true, NULL, '2026-02-06 10:14:09.216129+00'),
('7d840b3a-298e-46da-8841-9757f2fd735c', 'Mercedes-Benz', 6, true, NULL, '2026-02-06 10:14:09.216129+00'),
('ab715ac4-bc61-4113-9dd1-22de8264e4cf', 'BMW', 7, true, NULL, '2026-02-06 10:14:09.216129+00'),
('8c76d7c1-ff2e-4b8b-9c55-9c82b210b049', 'Audi', 8, true, NULL, '2026-02-06 10:14:09.216129+00'),
('2bbf9207-d194-4141-96ae-97ab58a7233a', 'Volkswagen', 9, true, NULL, '2026-02-06 10:14:09.216129+00'),
('2bd19f17-65f9-425d-8697-16aa16657f98', 'Ford', 10, true, NULL, '2026-02-06 10:14:09.216129+00'),
('1555de4f-bd5a-4590-9fef-a672652d63f7', 'Hyundai', 11, true, NULL, '2026-02-06 10:14:09.216129+00'),
('bf44e560-9b60-475b-ae7e-2b8ae01b49a5', 'Kia', 12, true, NULL, '2026-02-06 10:14:09.216129+00'),
('ce307ca0-b024-4b6a-9ad5-3afa61a920ea', 'Mitsubishi', 13, true, NULL, '2026-02-06 10:14:09.216129+00'),
('cfd77be1-6928-4b0a-9136-6dc6093835a1', 'Suzuki', 14, true, NULL, '2026-02-06 10:14:09.216129+00'),
('c3aa6fdb-f71f-4a2b-9b1f-336f4c10171a', 'Isuzu', 15, true, NULL, '2026-02-06 10:14:09.216129+00'),
('834e8bfe-6135-4886-bcd8-43f51d1359f7', 'Land Rover', 16, true, NULL, '2026-02-06 10:14:09.216129+00'),
('1d3d1866-ae41-4d99-939e-0f91cf2c0ab3', 'Range Rover', 17, true, NULL, '2026-02-06 10:14:09.216129+00'),
('9f5ca690-b312-4462-927f-063a2a5b49c8', 'Jeep', 18, true, NULL, '2026-02-06 10:14:09.216129+00'),
('12a03460-b80e-446c-a967-eddad76be245', 'Lexus', 19, true, NULL, '2026-02-06 10:14:09.216129+00'),
('ebe987cb-a096-4a7a-b539-3d14f667cfae', 'Porsche', 20, true, NULL, '2026-02-06 10:14:09.216129+00'),
('c02cd31f-280b-4e83-ae46-20eb25f217b8', 'Peugeot', 21, true, NULL, '2026-02-06 10:14:09.216129+00'),
('6a701c9c-9779-4a6c-8cba-77d295cb7074', 'Renault', 22, true, NULL, '2026-02-06 10:14:09.216129+00'),
('11b95d5a-27d7-43d2-aefa-09e7aa9cce6c', 'Chevrolet', 23, true, NULL, '2026-02-06 10:14:09.216129+00'),
('a9b1c7c8-1d57-4258-99c1-371f7c28e09d', 'Volvo', 24, true, NULL, '2026-02-06 10:14:09.216129+00'),
('57004985-de9b-4b27-a9ff-2d1cac50c7a2', 'Jaguar', 25, true, NULL, '2026-02-06 10:14:09.216129+00')
ON CONFLICT DO NOTHING;

-- ===================== VEHICLE_MODELS (150+) =====================
INSERT INTO public.vehicle_models (id, make_id, name, is_active, created_at) VALUES
-- Toyota models
('dfa8b2f6-a3c1-408b-b268-349cd8d09e8c', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Allion', true, '2026-02-06 10:14:09.216129+00'),
('b1cd0436-c205-4c04-9e31-45065fd1f3a3', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Alphard', true, '2026-02-06 10:14:09.216129+00'),
('22f10c5e-cce3-4653-8b14-446f6ffc2c86', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Axio', true, '2026-02-06 10:14:09.216129+00'),
('e63a8022-2c92-4846-813b-53fd886213f6', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'C-HR', true, '2026-02-06 10:14:09.216129+00'),
('535abe0b-0629-4ccc-b9bb-400060cd5a16', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Camry', true, '2026-02-06 10:14:09.216129+00'),
('d8dd255e-38ff-40d5-b784-fb6dd4e89ae0', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Corolla', true, '2026-02-06 10:14:09.216129+00'),
('355696d2-2bd9-44db-940e-1b31614fa6ba', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Crown', true, '2026-02-06 10:14:09.216129+00'),
('12d3e850-296f-48a0-b393-811b355d65c7', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Fielder', true, '2026-02-06 10:14:09.216129+00'),
('4b85c253-d571-4d45-b01a-60ccb05928d2', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Fortuner', true, '2026-02-06 10:14:09.216129+00'),
('d559daab-945b-44e1-aff6-115021282765', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Harrier', true, '2026-02-06 10:14:09.216129+00'),
('cf4f875e-0f90-4f6b-af6c-b339df107af4', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Hilux', true, '2026-02-06 10:14:09.216129+00'),
('9136a923-41b9-4905-b242-36a490ee6cc3', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Land Cruiser', true, '2026-02-06 10:14:09.216129+00'),
('bc3364a7-95fb-4387-a969-ad2a2fd4fbbc', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Noah', true, '2026-02-06 10:14:09.216129+00'),
('ccf1f364-dab6-4227-963a-156a2771780a', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Prado', true, '2026-02-06 10:14:09.216129+00'),
('233ed0ab-0fa6-4e01-8700-efea0790e735', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Premio', true, '2026-02-06 10:14:09.216129+00'),
('12b86a3d-3028-4762-bab9-0361188c9104', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Prius', true, '2026-02-06 10:14:09.216129+00'),
('ff8725b3-610c-48b1-ae47-4dc357433dfa', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'RAV4', true, '2026-02-06 10:14:09.216129+00'),
('cf2a9cf8-7d1a-4497-a093-4a5406369578', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Rush', true, '2026-02-06 10:14:09.216129+00'),
('5914ed87-b23c-4323-ac4e-3b3d54de334d', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Vitz', true, '2026-02-06 10:14:09.216129+00'),
('90949f76-54da-4a91-a68e-59b82c08cd51', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'Voxy', true, '2026-02-06 10:14:09.216129+00'),
-- Honda models
('c0b2125e-1683-44fd-8201-4302a929e978', '7beb1c3c-431f-424f-b238-8494c606003b', 'Accord', true, '2026-02-06 10:14:09.216129+00'),
('de8a0afa-bbef-4505-8fb6-7dff7c65ac3e', '7beb1c3c-431f-424f-b238-8494c606003b', 'Civic', true, '2026-02-06 10:14:09.216129+00'),
('cc6e43ff-3cfa-4cf6-bb5a-5cc6ca4a8c9d', '7beb1c3c-431f-424f-b238-8494c606003b', 'CR-V', true, '2026-02-06 10:14:09.216129+00'),
('b89b7cf5-e20e-4b2e-ac5d-0a3e3bbe5f7a', '7beb1c3c-431f-424f-b238-8494c606003b', 'Fit', true, '2026-02-06 10:14:09.216129+00'),
('a7e5c3d1-f9b2-4e6a-8c1d-b3f5e7a1c9d2', '7beb1c3c-431f-424f-b238-8494c606003b', 'HR-V', true, '2026-02-06 10:14:09.216129+00'),
('c1d3e5a7-b9f2-4e8a-6c1d-f7b5e3c1a9d2', '7beb1c3c-431f-424f-b238-8494c606003b', 'Vezel', true, '2026-02-06 10:14:09.216129+00'),
-- Subaru models
('58ec0ca7-bdc7-4b0a-a628-ba8bdb0a475f', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'BRZ', true, '2026-02-06 10:14:09.216129+00'),
('7887f0de-ba66-4550-8a1d-69e3b60c0e51', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Exiga', true, '2026-02-06 10:14:09.216129+00'),
('9c9eb9cd-7b81-46eb-b5f7-08760f1ce42d', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Forester', true, '2026-02-06 10:14:09.216129+00'),
('55d9ae3a-285a-4902-a639-6a4b09373f4a', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Impreza', true, '2026-02-06 10:14:09.216129+00'),
('87d09bff-4040-4c90-9a05-c2d09df7e90f', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Legacy', true, '2026-02-06 10:14:09.216129+00'),
('e3c05911-ceb8-4070-bf99-dbc368d348b8', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Levorg', true, '2026-02-06 10:14:09.216129+00'),
('6a9cb901-4db0-4b37-9bbd-7fa5f6484b0e', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Outback', true, '2026-02-06 10:14:09.216129+00'),
('3f0fb603-d4f0-4c78-a6e1-78d3a202a557', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'Trezia', true, '2026-02-06 10:14:09.216129+00'),
('99641d36-771c-465a-a246-caa662ae7b1a', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'WRX', true, '2026-02-06 10:14:09.216129+00'),
('718d19e0-cb48-4aef-b58e-9560b3a927ad', '02463ced-5487-4040-a6bd-5c1e2c7f439e', 'XV', true, '2026-02-06 10:14:09.216129+00'),
-- Nissan models
('d1e3a5c7-f9b2-4e6a-8c1d-b7f5e3a1c9d2', 'c6fa2124-b5ea-418f-9e07-614394129db2', 'Note', true, '2026-02-06 10:14:09.216129+00'),
('e3a5c7d1-b9f2-4e8a-6c1d-f5b7e3a1c9d2', 'c6fa2124-b5ea-418f-9e07-614394129db2', 'X-Trail', true, '2026-02-06 10:14:09.216129+00'),
('a5c7d1e3-f9b2-4e6a-8c1d-b5f7e3c1a9d2', 'c6fa2124-b5ea-418f-9e07-614394129db2', 'Juke', true, '2026-02-06 10:14:09.216129+00'),
('c7d1e3a5-b9f2-4e8a-6c1d-f7b5e3a1c9d2', 'c6fa2124-b5ea-418f-9e07-614394129db2', 'March', true, '2026-02-06 10:14:09.216129+00'),
('d9e1a3c5-f7b2-4e6a-8c1d-b9f5e3a7c1d2', 'c6fa2124-b5ea-418f-9e07-614394129db2', 'Serena', true, '2026-02-06 10:14:09.216129+00'),
-- Mazda models
('e1a3c5d7-b9f2-4e8a-6c1d-f7b5e3c9a1d2', 'a462e9dd-ce37-4761-bd34-349a2d9125ee', 'Demio', true, '2026-02-06 10:14:09.216129+00'),
('a3c5d7e1-f9b2-4e6a-8c1d-b7f5e3a9c1d2', 'a462e9dd-ce37-4761-bd34-349a2d9125ee', 'CX-5', true, '2026-02-06 10:14:09.216129+00'),
('c5d7e1a3-b9f2-4e8a-6c1d-f5b7e3c1a9d2', 'a462e9dd-ce37-4761-bd34-349a2d9125ee', 'Axela', true, '2026-02-06 10:14:09.216129+00'),
('d7e1a3c5-f9b2-4e6a-8c1d-b5f7e3a1c9d2', 'a462e9dd-ce37-4761-bd34-349a2d9125ee', 'CX-3', true, '2026-02-06 10:14:09.216129+00')
ON CONFLICT DO NOTHING;

-- ===================== SUBSCRIPTION_PACKAGES =====================
INSERT INTO public.subscription_packages (id, name, description, price, currency, duration_days, max_ads, analytics_access, is_active, is_popular, display_order, unlimited_postings, bg_color, text_color, button_color, button_text_color, created_at, updated_at) VALUES
('78e8f9f8-6a79-4328-9ba8-06178fc693ee', 'Starter Plan', 'Free starter plan for new sellers', 0, 'KES', 30, 5000, true, true, false, 0, true, '#ffffff', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-06 09:33:12.041006+00', '2026-02-12 01:14:45.528081+00'),
('a4f3dd72-d245-4a2a-893f-d260d8e54a8f', '1 Week', 'List your ads for 7 days', 100, 'KES', 7, 5000, false, true, false, 1, true, '#ffffff', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:18:46.252652+00'),
('f73ac905-77e1-48cc-89c4-c2b54b8edeab', '2 Weeks', 'List your ads for 15 days', 200, 'KES', 15, 6000, false, true, false, 2, true, '#ffffff', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:19:06.158467+00'),
('80417afb-8f38-4cc1-ab05-c073d0ebd921', 'Monthly', 'List your ads for 30 days', 300, 'KES', 30, 7000, true, true, true, 3, true, '#f0fdf4', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:19:41.912444+00'),
('c0935c5c-f4e3-45db-9011-02c64596c665', 'Quarterly', 'List your ads for 90 days', 900, 'KES', 90, 8000, true, true, false, 4, true, '#ffffff', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:19:54.54086+00'),
('fc0dafcc-b3ae-4dcd-9eee-f806dbb41f1c', '6 Months', 'List your ads for 180 days', 1800, 'KES', 180, 15000, true, true, false, 5, true, '#ffffff', '#1a1a1a', '#16a34a', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:20:10.341984+00'),
('2f6801fd-ac90-4610-97b2-4f97802bf5ba', 'Yearly', 'List your ads for 365 days', 3500, 'KES', 365, 20000, true, true, false, 6, true, '#fefce8', '#1a1a1a', '#ca8a04', '#ffffff', '2026-02-11 20:19:24.172653+00', '2026-02-23 22:20:23.103636+00')
ON CONFLICT DO NOTHING;

-- ===================== LISTING_TIERS =====================
INSERT INTO public.listing_tiers (id, name, price, currency, max_ads, priority_weight, display_order, is_active, badge_label, badge_color, ribbon_text, border_style, shadow_intensity, included_featured_days, created_at, updated_at) VALUES
('a1af2958-d47a-450c-ade2-86ae0a1269ec', 'Gold', 1500, 'KES', 15, 100, 1, true, 'GOLD', '#c89d04', '⭐ Gold', '4px solid #efbf04', '0 0 15px rgba(255,215,0,0.4)', 14, '2026-02-12 00:48:36.027133+00', '2026-02-23 22:20:48.625614+00'),
('ca32820b-7541-46c8-bdfa-786b976525cc', 'Silver', 800, 'KES', 15, 50, 2, true, 'SILVER', '#C0C0C0', '🥈 Silver', '2px solid #C0C0C0', '0 0 10px rgba(192,192,192,0.3)', 7, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:41:59.878128+00'),
('9976b766-1b8e-4f9b-a25c-7bba6969070a', 'Bronze', 400, 'KES', 15, 25, 3, true, 'BRONZE', '#CD7F32', '🥉 Bronze', '2px solid #CD7F32', 'none', 3, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:42:09.004592+00')
ON CONFLICT DO NOTHING;

-- ===================== PROMOTION_TYPES =====================
INSERT INTO public.promotion_types (id, name, placement, price, currency, duration_days, max_ads, display_order, is_active, created_at, updated_at) VALUES
('2df33978-d119-459a-bba3-b433f71c43e0', 'Homepage Top', 'homepage_top', 1000, 'KES', 7, 10, 1, true, '2026-02-12 00:48:36.027133+00', '2026-02-12 00:48:36.027133+00'),
('1875e186-1995-44aa-8b9f-a5d903c1cc60', 'Category Top', 'category_top', 700, 'KES', 7, 15, 2, true, '2026-02-12 00:48:36.027133+00', '2026-02-12 00:48:36.027133+00'),
('ffcee6f0-1b3a-4332-95f0-7bcb69bbe715', 'Sidebar', 'sidebar', 500, 'KES', 7, 20, 3, true, '2026-02-12 00:48:36.027133+00', '2026-02-12 00:48:36.027133+00'),
('96e35fa6-d8fc-4d8a-bcaf-1d4045714374', 'Search Boost', 'search_boost', 400, 'KES', 7, 30, 4, true, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:45:15.706928+00')
ON CONFLICT DO NOTHING;

-- ===================== ADDONS =====================
INSERT INTO public.addons (id, name, type, description, is_active, display_order, bg_color, text_color, created_at, updated_at) VALUES
('daed33bd-4ec7-4ce0-b87c-63440db6dde5', 'Bump Your Ad', 'bumping', 'Push your ad to the top of search results', true, 0, '#f0f9ff', '#1a1a1a', '2026-02-06 09:36:32.032809+00', '2026-02-06 09:43:07.7914+00'),
('45ff6c49-c59c-4e1a-ae77-1a0f7e1e4193', 'Featured Listings', 'featured', 'Highlight your ads at the top of search results', true, 1, '#fef3c7', '#92400e', '2026-02-06 09:43:07.7914+00', '2026-02-06 09:43:07.7914+00'),
('bf44cfa5-9df1-4a2b-9d51-fa573a7a9446', 'Promotional Boost', 'promotion', 'Get extra promotion across the platform', true, 2, '#dbeafe', '#1e40af', '2026-02-06 09:43:07.7914+00', '2026-02-06 09:43:07.7914+00')
ON CONFLICT DO NOTHING;

-- ===================== ADDON_TIERS =====================
INSERT INTO public.addon_tiers (id, addon_id, name, price, currency, quantity, description, display_order, is_active, created_at, updated_at) VALUES
('b8383e5d-5eb0-4740-acc7-934fa3312051', 'daed33bd-4ec7-4ce0-b87c-63440db6dde5', 'Single Bump', 50, 'KES', 1, '', 0, true, '2026-02-06 09:37:38.526924+00', '2026-02-06 09:37:38.526924+00'),
('fed6fedf-978e-4d81-97ca-dc44b6b1622c', 'daed33bd-4ec7-4ce0-b87c-63440db6dde5', 'Bump Pack', 200, 'KES', 5, '5 bumps for your listings', 1, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('df34a14b-c47b-45f0-9487-9a6b46cc7af6', 'daed33bd-4ec7-4ce0-b87c-63440db6dde5', 'Power Bumps', 350, 'KES', 10, '10 bumps for maximum visibility', 2, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('a6e6999c-5c56-4c13-9783-5f4c729aab56', '45ff6c49-c59c-4e1a-ae77-1a0f7e1e4193', 'Single Feature', 100, 'KES', 1, 'Feature 1 listing for 7 days', 0, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('812f6714-cf76-4e9c-9b2c-b35af69bbd42', '45ff6c49-c59c-4e1a-ae77-1a0f7e1e4193', 'Feature Pack', 400, 'KES', 5, 'Feature 5 listings for 7 days each', 1, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('e01e0c85-e1d1-4fe4-b481-5fcc53181507', '45ff6c49-c59c-4e1a-ae77-1a0f7e1e4193', 'Pro Feature', 750, 'KES', 10, 'Feature 10 listings for 14 days each', 2, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('1b4b0ef5-5a0e-4da9-9872-271f67586c02', 'bf44cfa5-9df1-4a2b-9d51-fa573a7a9446', 'Basic Boost', 200, 'KES', 1, '1 promotional boost', 0, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('6687e52c-3798-40a3-a7f9-7a55250fe613', 'bf44cfa5-9df1-4a2b-9d51-fa573a7a9446', 'Power Boost', 800, 'KES', 5, '5 promotional boosts', 1, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00'),
('62f10606-b315-4bcd-96e2-6787f0f0d7d0', 'bf44cfa5-9df1-4a2b-9d51-fa573a7a9446', 'Mega Boost', 1500, 'KES', 10, '10 promotional boosts', 2, true, '2026-02-06 09:43:25.304392+00', '2026-02-06 09:43:25.304392+00')
ON CONFLICT DO NOTHING;

-- ===================== BUMP_PACKAGES =====================
INSERT INTO public.bump_packages (id, name, credits, price, currency, display_order, is_active, created_at, updated_at) VALUES
('5a3c3d7d-e59a-4f4d-a8dc-31dc5372e093', '5 Bumps', 5, 100, 'KES', 1, true, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:42:27.646504+00'),
('9d299977-afd6-411d-9154-f817d0ef0476', '15 Bumps', 15, 300, 'KES', 2, true, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:42:48.417413+00'),
('f85d5688-8bf7-480d-bbd3-db8c3b8c4af6', '50 Bumps', 50, 800, 'KES', 3, true, '2026-02-12 00:48:36.027133+00', '2026-02-13 18:43:04.494928+00'),
('5e02f11f-be95-4121-9493-182b21482002', '100 Bumps', 100, 1500, 'KES', 4, true, '2026-02-13 18:43:17.364949+00', '2026-02-13 18:43:46.225431+00'),
('a7a6e02c-827b-447b-9a8f-7c2ff1b6f5d6', '300 Bumps', 300, 4000, 'KES', 5, true, '2026-02-13 18:44:30.943468+00', '2026-02-13 18:44:44.704824+00')
ON CONFLICT DO NOTHING;

-- ===================== FEATURED_DURATIONS =====================
INSERT INTO public.featured_durations (id, duration_days, price, currency, display_order, is_active, created_at) VALUES
('0d98312b-cc70-4b89-871e-6bb51a3ee619', 7, 500, 'KES', 1, true, '2026-02-12 00:25:02.926314+00'),
('65fcde8f-9acc-4cdb-8a38-0543d245f259', 14, 900, 'KES', 2, true, '2026-02-12 00:25:02.926314+00'),
('ebe7e5da-2693-4d0f-bf5f-404da42738db', 30, 1500, 'KES', 3, true, '2026-02-12 00:25:02.926314+00')
ON CONFLICT DO NOTHING;

-- ===================== FEATURED_SETTINGS =====================
INSERT INTO public.featured_settings (id, is_enabled, default_duration_days, badge_label, ribbon_text, highlight_bg, border_accent, eligible_tier_ids, created_at, updated_at) VALUES
('0e98784f-a570-4d79-b05a-3fcaeb4e3637', true, 7, 'Featured', 'Featured', '#FFF8E1', '#FFD700', '{}', '2026-02-12 00:25:02.926314+00', '2026-02-12 00:25:02.926314+00')
ON CONFLICT DO NOTHING;

-- ===================== PLATFORM_SETTINGS =====================
INSERT INTO public.platform_settings (id, key, value, description, updated_at) VALUES
('45f3188b-c4c5-4315-88fd-733a2ce1072f', 'seller_registration_fee', '0', 'Fee in KES to register as a seller', '2026-02-11 20:08:22.936097+00'),
('f0a1478e-c8e6-4653-b93a-11de9a31c775', 'seller_registration_duration_days', '30', 'Number of days for initial seller registration', '2026-02-11 20:08:22.936097+00'),
('6fe24404-f813-4663-9401-a2983584c2ca', 'require_seller_verification', 'true', 'Whether sellers must upload ID for verification', '2026-02-11 20:08:22.936097+00'),
('68d176cb-40e3-4503-bd42-09259b87dcbc', 'affiliate_enabled', 'true', 'Whether affiliate program is enabled', '2026-02-11 21:13:02.831436+00'),
('90bd3fa7-2c10-4d36-9b79-a71318cd52a1', 'affiliate_default_commission_registration', '10', 'Default commission % for registration referrals', '2026-02-11 21:13:02.831436+00'),
('9554b673-1bc1-481b-87cf-5b5c58f3131d', 'affiliate_default_commission_subscription', '10', 'Default commission % for subscription referrals', '2026-02-11 21:13:02.831436+00'),
('1ba63523-2881-4490-a3fa-ea2b985a71c0', 'affiliate_min_payout', '500', 'Minimum payout amount in KES', '2026-02-11 21:13:02.831436+00'),
('9c8579d3-95fa-43fd-8aa0-e2d18b5b3ee6', 'affiliate_commission_type', 'one_time', 'Commission type: one_time or recurring', '2026-02-11 23:46:53.1+00'),
('1f95bbf6-e569-442e-8e15-0e0043798008', 'contact_email', 'support@apabazaar.co.ke', 'Contact email shown in footer', '2026-02-23 22:30:37.663+00'),
('b057bb9e-458f-4192-a02f-eaf9b7aa595b', 'contact_phone', '+254750005652', NULL, '2026-02-23 22:30:37.663+00'),
('ab69489b-f25c-4bae-b4d6-d604f0fc6a0c', 'contact_whatsapp', '+254750005652', NULL, '2026-02-23 22:30:37.663+00'),
('412932db-0365-4cc4-ad76-bd2dc75db0ed', 'contact_address', '9th Floor Unga House ,Westland Nairobi , Kenya', NULL, '2026-02-23 22:30:37.663+00'),
('30b1f8d8-71a9-46f1-8c2f-0d7a9fe2da96', 'copyright_text', '© 2026 APA Bazaar Marketplace. All rights reserved.Designed by Wayne Graphics Solutions', NULL, '2026-02-12 01:20:40.793+00'),
('db1aedbd-eb0c-447e-bacd-4e24e7847eb2', 'social_facebook', 'https://facebook.com/apabazaar', 'Facebook page URL', '2026-02-23 22:30:37.663+00'),
('2caf94ad-5377-4c0e-a122-153db882b62b', 'social_twitter', 'https://twitter.com/apabazaar', 'Twitter/X profile URL', '2026-02-23 22:30:37.664+00'),
('1890358e-b548-484d-9657-eec7b69ff9d9', 'social_instagram', 'https://instagram.com/apabazaar', 'Instagram profile URL', '2026-02-23 22:30:37.664+00'),
('8ebba20e-8c26-49be-85c9-216e09e2ad47', 'social_youtube', 'https://youtube.com/@apabazaar', 'YouTube channel URL', '2026-02-23 22:30:37.664+00'),
('f45a1437-a473-4f08-a051-4f252ae79bf0', 'super_admin_email', 'apabazaar@gmail.com', 'Super admin email address', '2026-02-23 22:30:37.664+00'),
('ce8831cd-13a1-4905-9d1e-d9bee79ff2c5', 'privacy_url', '/privacy', NULL, '2026-02-12 01:20:40.793+00'),
('82ad5445-722f-455f-8e02-702c58402a9c', 'smtp_from_email', 'noreply@apabazaar.com', NULL, '2026-02-23 22:30:37.664+00'),
('e04311ee-7088-4a49-af6d-6b01d37cabf2', 'smtp_from_name', 'APA Bazaar Marketplace', NULL, '2026-02-23 22:30:37.664+00'),
('d6f1efc2-cca8-42f1-97fc-9c4504856640', 'smtp_port', '587', NULL, '2026-02-23 22:30:37.664+00'),
('c3c8a776-31c9-4538-9745-c3f9f59d4326', 'smtp_user', 'noreply@apabazaar.com', NULL, '2026-02-23 22:30:37.664+00')
ON CONFLICT DO NOTHING;

-- ===================== PROFILES =====================
INSERT INTO public.profiles (user_id, id, rating, total_reviews, is_verified, created_at, updated_at, bump_wallet_balance, user_number, display_name, phone, location, avatar_url, bio, account_type, business_name, whatsapp_number) VALUES
('a2612cfa-d9f7-4411-ab1f-3d6c7a28d5a9', '2fc649aa-c539-4e1b-98a5-f60e0989964b', 0.0, 0, false, '2026-01-31 23:45:27.136326+00', '2026-01-31 23:45:27.136326+00', 0, 1, 'Test User', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('cce1d02e-78c8-4874-999c-bad0978da227', '24607ba0-83bd-4f42-8266-7dea8e905c92', 0.0, 0, false, '2026-01-31 23:52:09.832422+00', '2026-01-31 23:52:09.832422+00', 0, 2, 'Test Seller', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('4f4fec96-cb25-4bd7-a199-aab77c926755', '643270b4-2274-415c-858a-cd566111d010', 0.0, 0, true, '2026-02-10 06:16:06.657661+00', '2026-02-11 20:30:17.900536+00', 0, 3, 'Waynekim', NULL, 'Nairobi', NULL, NULL, 'customer', NULL, NULL),
('d88209d4-c49f-4542-a106-582c0fdd8d81', '547eae2e-c498-4269-a522-81d67cd55912', 0.0, 0, false, '2026-02-12 01:29:02.523083+00', '2026-02-15 16:15:06.718443+00', 14, 4, 'Peter Njuguna', '+254798435087', 'Nakuru, Nakuru Town', '', 'Affordable car sellers', 'business', 'Sapphire Car Dealer', '+254798435087'),
('27caa732-2b69-49e6-a33a-e517616990e1', '67fee916-9276-47d5-9015-d005a0003317', 5.0, 1, false, '2026-02-01 00:36:37.710801+00', '2026-02-23 21:41:50.213292+00', 0, 5, 'Ahem Jk Kim', '+254798435087', 'Nakuru, Nakuru Town', '', E'Wayne Graphics Solutions is a full-service digital marketing agency based in Nakuru.', 'customer', NULL, NULL)
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

-- ===================== BASE_LISTINGS (all 46) =====================
-- NOTE: Due to the large volume, use the edge function export-data for the complete base_listings data.
-- This includes the most critical listings. Run the edge function for the complete set.
INSERT INTO public.base_listings (id, user_id, main_category_id, sub_category_id, title, description, price, currency, location, images, status, is_featured, is_negotiable, is_urgent, views, tier_id, tier_priority, tier_expires_at, tier_purchase_id, promotion_type_id, promotion_expires_at, bumped_at, expires_at, featured_until, created_at, updated_at) VALUES
('d4e81cf9-a3f6-4e42-8818-94c4e8b4ed21', '27caa732-2b69-49e6-a33a-e517616990e1', 'd89868dd-a046-4f78-bef4-af616209cb38', '40132a02-088c-47c0-bae5-36d50ed5b415', 'iPhone 14 Pro Max 256GB', 'Excellent condition, barely used. Comes with original box and charger. Deep Purple color.', 95000, 'KES', 'Nairobi', '{https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=600&fit=crop}', 'active', true, true, false, 7, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:06:33.317865+00', '2026-02-13 17:04:36.647044+00'),
('a27e8ed4-8005-46a3-ac2e-57ad384dfd55', '27caa732-2b69-49e6-a33a-e517616990e1', 'fcc87c98-dba2-46ef-97a1-1a40f24c370f', '1bb33327-90a4-40dc-97e8-165228269332', 'L-Shaped Sofa Set', 'Comfortable 7-seater L-shaped sofa. Grey fabric, good condition.', 35000, 'KES', 'Kisumu', '{https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop}', 'active', false, true, false, 5, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:06:33.317865+00', '2026-02-23 21:10:41.033123+00'),
('b22e23a2-05fe-4c8d-9207-577e08fb2993', '27caa732-2b69-49e6-a33a-e517616990e1', '56f8d305-073d-4999-815a-597c769bcaa8', '30cb5829-5c0f-400f-8b7f-5ad8fb9ae3ec', 'Modern 2BR Apartment for Rent', 'Spacious apartment in Kilimani. Master ensuite, gym, pool, 24hr security.', 65000, 'KES', 'Nairobi', '{https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop}', 'active', false, false, false, 4, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:06:33.317865+00', '2026-02-23 21:09:46.881998+00'),
('3762b2f0-0748-4967-b411-5ea6f3581ab3', '27caa732-2b69-49e6-a33a-e517616990e1', '07f8aa58-9fa4-4a0b-8e18-e679c823614a', 'bb17714c-b0a7-492f-9776-abc51b1e3eac', 'Samsung 55" Smart TV', '4K UHD Smart TV with HDR. Perfect for gaming and movies.', 45000, 'KES', 'Nairobi', '{https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop}', 'active', false, true, true, 4, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:06:33.317865+00', '2026-02-21 23:21:07.802476+00'),
('3f0f6430-edf2-46f3-a499-9c06984a48b9', '27caa732-2b69-49e6-a33a-e517616990e1', 'd1e909da-e962-48ec-8a11-59a1e5828a7c', 'c51695a8-2e03-4fd7-b946-32d75c79358d', 'Toyota Vitz 2019', 'Well maintained, low mileage. First owner. Service history available.', 850000, 'KES', 'Mombasa', '{https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop}', 'active', true, true, true, 10, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 09:06:33.317865+00', '2026-02-13 10:24:53.99991+00')
ON CONFLICT DO NOTHING;

-- ===================== VEHICLE_LISTINGS =====================
INSERT INTO public.vehicle_listings (id, vehicle_type, year_of_manufacture, body_type, fuel_type, transmission, mileage, engine_size_cc, exterior_color, interior_color, condition, is_registered, exchange_possible, doors, seats, drivetrain, make_id, model_id, created_at) VALUES
('3f0f6430-edf2-46f3-a499-9c06984a48b9', 'car', 2019, 'Hatchback', 'petrol', 'automatic', 68000, 1300, 'Silver', 'Black', 'locally_used', true, false, 4, 5, 'fwd', NULL, NULL, '2026-02-06 10:26:32.58691+00'),
('40d8100e-aa69-45b7-99bf-cf8d3c8c0620', 'car', 2020, 'SUV', 'petrol', 'automatic', 2121213, 2000, 'Black', 'Red', 'foreign_used', true, true, 4, 5, 'awd', '02463ced-5487-4040-a6bd-5c1e2c7f439e', '9c9eb9cd-7b81-46eb-b5f7-08760f1ce42d', '2026-02-12 03:47:43.283402+00'),
('549812b5-4a0a-45c8-a340-9a30f3b7959b', 'car', 2020, 'Sedan', 'petrol', 'automatic', 45000, 1800, 'White', 'Black', 'foreign_used', true, false, 4, 5, 'fwd', '3c111e6e-e1fa-481a-bda7-2f2bddcc833e', 'd8dd255e-38ff-40d5-b784-fb6dd4e89ae0', '2026-02-11 22:40:31.054909+00')
ON CONFLICT DO NOTHING;

-- ===================== PHONE_LISTINGS =====================
INSERT INTO public.phone_listings (id, device_type, brand, model, storage, ram, color, condition, has_warranty, warranty_duration, is_unlocked, accessories_included, created_at) VALUES
('d4e81cf9-a3f6-4e42-8818-94c4e8b4ed21', 'smartphone', 'Apple', 'iPhone 14 Pro Max', '256GB', '6GB', 'Deep Purple', 'good', false, NULL, true, '{Original Box,Charger,Cable}', '2026-02-06 10:26:32.58691+00'),
('50f13f25-50a8-413d-8042-f35516dd0b8e', 'smartphone', 'Samsung', 'Galaxy S24 Ultra', '512GB', '12GB', 'Titanium Gray', 'like_new', true, '6 months', true, '{Original Box,Charger,S Pen,Screen Protector}', '2026-02-11 22:43:20.700268+00'),
('81a99c1d-440b-42f6-afc8-4cf963470fb5', 'smartphone', 'Samsung', 'Samsung A32', '256GB', NULL, 'GOLD', NULL, false, NULL, true, NULL, '2026-02-12 04:44:20.94478+00'),
('1116aa8f-65b0-4209-aac0-887e8100e699', 'smartphone', 'Apple', 'iPhone 15 Pro Max', '256GB', '8GB', 'Natural Titanium', 'brand_new', true, '1 year', true, '{Original Box,Charger,EarPods}', '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== ELECTRONICS_LISTINGS =====================
INSERT INTO public.electronics_listings (id, device_type, brand, model, condition, has_warranty, warranty_duration, screen_size, screen_resolution, refresh_rate, panel_type, processor, ram, storage, operating_system, graphics_card, created_at) VALUES
('3762b2f0-0748-4967-b411-5ea6f3581ab3', 'TV', 'Samsung', 'Smart TV', 'good', false, NULL, '55 inch', '3840x2160 (4K UHD)', '60Hz', 'LED', NULL, NULL, NULL, 'Tizen', NULL, '2026-02-06 10:26:32.58691+00'),
('42734eeb-af8c-431a-84f3-a8cb9fcfa497', 'Laptop', 'Dell', 'XPS 15', 'like_new', true, '1 year', '15.6 inch', '3456x2160 (OLED)', '120Hz', 'OLED', 'Intel Core i7-12700H', '32GB', '1TB SSD', 'Windows 11', 'Intel Iris Xe', '2026-02-11 22:41:26.334674+00'),
('65e775c3-e05e-4d98-bdb1-b68cf1551b04', 'Laptop', 'Apple', 'MacBook Pro M2', 'like_new', true, '6 months', '14 inch', '3024x1964 (Liquid Retina XDR)', '120Hz ProMotion', 'mini-LED', 'Apple M2', '16GB', '512GB SSD', 'macOS Ventura', 'Apple M2 10-core GPU', '2026-02-11 22:41:26.334674+00'),
('546889e2-6839-4547-866f-33a377450d16', 'Gaming Console', 'Sony', 'PlayStation 5', 'good', false, NULL, NULL, NULL, NULL, NULL, 'AMD Zen 2', '16GB GDDR6', '825GB SSD', 'PlayStation OS', NULL, '2026-02-11 22:41:26.334674+00')
ON CONFLICT DO NOTHING;

-- ===================== PROPERTY_LISTINGS =====================
INSERT INTO public.property_listings (id, property_type, listing_type, bedrooms, bathrooms, is_furnished, furnishing_type, size_sqm, plot_size_sqm, parking_spaces, year_built, amenities, floor_number, total_floors, service_charge, agency_fee, created_at) VALUES
('b22e23a2-05fe-4c8d-9207-577e08fb2993', 'apartment', 'for_rent', 2, 1, false, 'unfurnished', 85, NULL, 1, 2018, '{Gym,Pool,24hr Security,Elevator}', NULL, NULL, NULL, NULL, '2026-02-06 10:26:32.58691+00'),
('2cc951c6-a4b5-4607-8e29-f75e71b293b2', 'apartment', 'for_rent', 1, 1, false, NULL, 50, NULL, 1, 2025, '{Swimming Pool,Garden,Internet Ready,Cable TV Ready,Terrace,Parking,Security,CCTV,Staff Quarters,Air Conditioning}', 3, 5, 1000, '2000', '2026-02-12 03:15:39.210764+00'),
('5d91a745-b8dc-4f6e-881f-709940919cb3', 'apartment', 'for_sale', 3, 2, false, 'unfurnished', 120, NULL, 1, 2021, '{Swimming Pool,Gym,CCTV,Lift}', NULL, NULL, NULL, NULL, '2026-02-11 22:40:54.809813+00')
ON CONFLICT DO NOTHING;

-- ===================== JOB_LISTINGS =====================
INSERT INTO public.job_listings (id, job_title, company_name, industry, job_type, experience_level, education_level, salary_min, salary_max, salary_period, is_salary_negotiable, is_remote, min_experience_years, required_skills, benefits, application_method, application_email, created_at) VALUES
('3742b4b4-0ac6-403c-8e7b-375b6bd052e9', 'Senior Software Engineer', 'PayTech Kenya', 'Technology', 'full_time', 'senior', 'Bachelors Degree', 250000, 450000, 'monthly', true, false, 5, '{Node.js,React,TypeScript,PostgreSQL}', '{Medical Insurance,Annual Bonus,Remote Work}', 'email', 'careers@paytech.co.ke', '2026-02-11 22:41:13.033746+00'),
('4412c497-e44f-4dc6-ac38-fdc48afed12a', 'Marketing Manager', 'Unilever Kenya', 'FMCG', 'full_time', 'mid', 'Bachelors Degree', 180000, 300000, 'monthly', false, false, 3, '{Digital Marketing,Brand Management,Analytics}', '{Medical Cover,Company Car,Performance Bonus}', 'website', NULL, '2026-02-11 22:41:13.033746+00'),
('d5d77cac-637a-4117-ae45-f03cb150a416', 'Graphic Designer', 'Pixel Studios', 'Creative', 'freelance', 'entry', 'Diploma', 50000, 100000, 'monthly', true, true, 1, '{Adobe Photoshop,Illustrator,Figma}', '{Flexible Hours,Equipment Provided}', 'email', 'jobs@pixelstudios.co.ke', '2026-02-11 22:41:13.033746+00')
ON CONFLICT DO NOTHING;

-- ===================== FASHION_LISTINGS =====================
INSERT INTO public.fashion_listings (id, gender, clothing_type, size, material, brand, condition, color, occasion, created_at) VALUES
('36b81a38-eaf8-44e3-9e3f-3aa5edbb8e9a', 'men', 'Sneakers', '43', 'Synthetic', 'Nike', 'like_new', 'Black/White', 'casual', '2026-02-11 22:43:20.700268+00'),
('c3952c7d-d27a-4bdd-9f56-3b4ae5adfb89', 'men', 'Suit', '40', 'Wool Blend', 'Zara', 'brand_new', 'Navy Blue', 'formal', '2026-02-11 22:43:20.700268+00'),
('202a0c48-4715-45a8-8435-6233071626a1', 'women', 'Handbag', 'One Size', 'Leather', 'Gucci', 'like_new', 'Black', 'casual', '2026-02-11 22:43:20.700268+00'),
('e90997ff-158c-4100-8afb-15674ea88427', 'men', 'Tracksuit', 'M', 'Polyester', 'Adidas', 'like_new', 'Black/White', 'casual', '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== FURNITURE_LISTINGS =====================
INSERT INTO public.furniture_listings (id, item_type, brand, material, condition, dimensions, color, style, assembly_required, created_at) VALUES
('a27e8ed4-8005-46a3-ac2e-57ad384dfd55', 'Sofa', 'Local', 'Fabric', 'good', '250cm x 180cm', 'Grey', 'Modern', false, '2026-02-06 10:26:32.58691+00'),
('0b3e9fd3-5477-473a-9d86-a7e4d5b7a707', 'Sofa', NULL, 'Fabric', 'good', '280cm x 180cm', 'Gray', 'Modern', false, '2026-02-11 22:43:20.700268+00'),
('c9ebaaf2-dfd3-4c18-91d4-e2e91aa11ff6', 'Refrigerator', 'Samsung', 'Steel', 'good', '180cm x 70cm x 65cm', 'Silver', 'Modern', false, '2026-02-11 22:43:20.700268+00'),
('be79f1a4-e500-4710-a0d2-7a9eb248441b', 'Desk', NULL, 'Mahogany', 'like_new', '150cm x 75cm x 80cm', 'Brown', 'Classic', false, '2026-02-11 22:43:20.700268+00'),
('6521ab15-e4b4-4215-8c1d-ba714de3f91d', 'Bed Frame', NULL, 'Wood', 'like_new', '200cm x 180cm', 'Brown', 'Modern', true, '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== PET_LISTINGS =====================
INSERT INTO public.pet_listings (id, animal_type, breed, gender, age_months, is_vaccinated, is_neutered, health_certificate, includes, created_at) VALUES
('cb15de9a-9fa3-41cc-ac3a-b9ef348f2a67', 'Dog', 'German Shepherd', 'male', 3, true, false, true, '{Vaccination Card,Deworming Certificate}', '2026-02-11 22:43:20.700268+00'),
('029c713c-6124-497f-8b62-f6641ad34209', 'Cat', 'Persian', 'female', 8, true, true, true, '{Litter Box,Food Bowl}', '2026-02-11 22:43:20.700268+00'),
('70c3b109-e332-45cc-a4c9-40b39872808d', 'Bird', 'African Grey', 'male', 24, false, false, false, '{Cage,Food,Toys}', '2026-02-11 22:43:20.700268+00'),
('e77d8758-4ce0-48e9-be41-0a12405ec625', 'Dog', 'Boerboel', 'male', 2, true, false, true, '{KKC Papers,Vaccination Card,Microchip}', '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== BEAUTY_LISTINGS =====================
INSERT INTO public.beauty_listings (id, product_type, brand, condition, is_organic, skin_type, usage_type, created_at) VALUES
('fece0f61-2234-463e-bfe3-0d825edfe862', 'Body Care', 'Nivea', 'brand_new', false, 'All Skin Types', 'personal', '2026-02-11 22:43:20.700268+00'),
('edcbc4f8-d9bc-4218-ad49-412675467d50', 'Hair Care', 'GHD', 'like_new', false, NULL, 'professional', '2026-02-11 22:43:20.700268+00'),
('e5cedb4a-3b78-4c0b-bbf1-5aaf0af526cd', 'Makeup', 'MAC', 'brand_new', false, NULL, 'professional', '2026-02-11 22:43:20.700268+00'),
('669ceeba-f207-43c2-aebf-e01018347250', 'Skincare', 'Natural', 'brand_new', true, 'All Skin Types', 'personal', '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== KIDS_LISTINGS =====================
INSERT INTO public.kids_listings (id, item_type, age_range, gender, brand, condition, safety_certified, created_at) VALUES
('5859398b-44e0-436b-a606-dee74d4ec3d2', 'Cot', '0-2 years', 'unisex', NULL, 'like_new', true, '2026-02-11 22:43:20.700268+00'),
('c962a108-99b5-4d17-83de-b202f076e850', 'Stroller', '0-3 years', 'unisex', 'Chicco', 'good', true, '2026-02-11 22:43:20.700268+00'),
('cd8aa1e2-da95-41fb-96e5-f56f51cc5a4b', 'Bicycle', '5-8 years', 'unisex', NULL, 'good', false, '2026-02-11 22:43:20.700268+00'),
('2b99851b-7cec-4a02-b516-7758a4e873e1', 'Toy', '6-12 years', 'unisex', 'Lego', 'brand_new', true, '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== SERVICE_LISTINGS =====================
INSERT INTO public.service_listings (id, service_type, experience_years, is_certified, availability, pricing_model, service_area, languages, certifications, created_at) VALUES
('c5e6473c-f7d4-4336-b196-99cd13475171', 'Plumbing', 10, true, 'full_time', 'hourly', NULL, NULL, NULL, '2026-02-11 22:43:20.700268+00'),
('1c32e599-c5b3-48e6-a9ee-a43e2406f10f', 'Cleaning', 5, false, 'Monday-Saturday', 'fixed', '{Nairobi}', '{English,Swahili}', NULL, '2026-02-11 22:43:20.700268+00'),
('4845a72b-2bdd-4cd3-9c46-caccf2b3e730', 'Web Development', 8, true, 'Monday-Friday', 'negotiable', '{Remote,Nairobi,Mombasa}', '{English}', '{AWS Certified,React Certified}', '2026-02-11 22:43:20.700268+00'),
('c37deb7f-fa6f-47dc-8962-e278377e4ddc', 'Photography', 6, true, 'Weekends', 'fixed', '{Nairobi,Mombasa,Nakuru}', '{English,Swahili}', '{Certified Photographer}', '2026-02-11 22:43:20.700268+00')
ON CONFLICT DO NOTHING;

-- ===================== MESSAGES =====================
INSERT INTO public.messages (id, content, created_at, file_name, file_size, file_url, is_read, listing_id, message_type, receiver_id, sender_id) VALUES
('37f7b024-8851-4e8d-9691-512e8a148293', 'Hello am interested in this car', '2026-02-12 03:02:12.511724+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '27caa732-2b69-49e6-a33a-e517616990e1', '4f4fec96-cb25-4bd7-a199-aab77c926755'),
('ae888177-5755-4202-abf5-90bc9d542d31', 'Its available', '2026-02-13 13:27:48.444576+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '27caa732-2b69-49e6-a33a-e517616990e1', '4f4fec96-cb25-4bd7-a199-aab77c926755'),
('e4f58d31-7de3-400d-9305-8e5ccd956374', E'Yes it''s available', '2026-02-13 14:56:01.193614+00', NULL, NULL, NULL, true, '3f0f6430-edf2-46f3-a499-9c06984a48b9', 'text', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1'),
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

-- ===================== REVIEWS =====================
INSERT INTO public.reviews (id, reviewer_id, seller_id, rating, comment, status, created_at, updated_at) VALUES
('d9af9858-4f90-42f2-b3ba-31de070c9fa4', '4f4fec96-cb25-4bd7-a199-aab77c926755', '27caa732-2b69-49e6-a33a-e517616990e1', 5, 'The best seller very professional and price is as advertised', 'approved', '2026-02-23 21:33:17.527593+00', '2026-02-23 21:41:50.213292+00')
ON CONFLICT DO NOTHING;

-- ===================== SELLER_SUBSCRIPTIONS =====================
INSERT INTO public.seller_subscriptions (id, user_id, package_id, starts_at, expires_at, status, ads_used, payment_status, payment_reference, created_at, updated_at) VALUES
('7e295598-9e06-47c9-ac51-b9d9fb27b506', '27caa732-2b69-49e6-a33a-e517616990e1', 'fc0dafcc-b3ae-4dcd-9eee-f806dbb41f1c', '2026-02-12 00:22:06.237+00', '2026-08-11 00:22:06.237+00', 'active', 0, 'completed', 'admin_assigned', '2026-02-12 00:22:11.43051+00', '2026-02-12 00:22:11.43051+00'),
('cf25d088-ee9c-48d5-9902-8d85178fbe30', '27caa732-2b69-49e6-a33a-e517616990e1', '80417afb-8f38-4cc1-ab05-c073d0ebd921', '2026-02-12 00:48:36.027133+00', '2026-03-14 00:48:36.027133+00', 'active', 2, 'completed', NULL, '2026-02-12 00:48:36.027133+00', '2026-02-12 00:48:36.027133+00'),
('198988d0-ec32-4ff9-a17f-e4c4fbeb60cc', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '78e8f9f8-6a79-4328-9ba8-06178fc693ee', '2026-02-12 01:29:11.559+00', '2026-03-14 01:29:11.559+00', 'active', 2, 'completed', NULL, '2026-02-12 01:29:16.800113+00', '2026-02-13 17:11:32.754563+00')
ON CONFLICT DO NOTHING;

-- ===================== SELLER_VERIFICATIONS =====================
INSERT INTO public.seller_verifications (id, user_id, id_front_url, id_back_url, passport_photo_url, status, admin_notes, reviewed_at, created_at, updated_at) VALUES
('a8a0177d-f120-4105-aa3e-967aeef8b3f3', '4f4fec96-cb25-4bd7-a199-aab77c926755', 'verifications/4f4fec96/id-front.png', 'verifications/4f4fec96/id-back.png', 'verifications/4f4fec96/passport.png', 'approved', '', '2026-02-11 20:30:12.371+00', '2026-02-11 20:22:00.123725+00', '2026-02-11 20:30:17.458468+00'),
('d3c747e8-5a4f-41fc-b14a-e1e2f54a7f53', 'd88209d4-c49f-4542-a106-582c0fdd8d81', 'verifications/d88209d4/id-front.png', 'verifications/d88209d4/id-back.png', 'verifications/d88209d4/passport.png', 'approved', '', '2026-02-12 04:38:09.328+00', '2026-02-12 01:33:27.724434+00', '2026-02-12 04:38:14.76806+00')
ON CONFLICT DO NOTHING;

-- ===================== AFFILIATES =====================
INSERT INTO public.affiliates (id, user_id, referral_code, status, commission_rate_registration, commission_rate_subscription, total_earnings, total_paid, pending_balance, mpesa_phone, created_at, updated_at) VALUES
('678df4ba-c3fe-492d-b98f-b45697bdc176', '27caa732-2b69-49e6-a33a-e517616990e1', 'APA27CAA7PM50', 'approved', 10, 10, 0, 0, 0, '254798435087', '2026-02-11 21:32:23.186016+00', '2026-02-11 23:10:25.417228+00')
ON CONFLICT DO NOTHING;

-- ===================== LISTING_TIER_PURCHASES =====================
INSERT INTO public.listing_tier_purchases (id, listing_id, tier_id, user_id, purchased_at, expires_at, status, payment_status, payment_reference, created_at) VALUES
('ea0b6629-fdc2-42e3-af6b-0a666ce5d200', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'a1af2958-d47a-450c-ade2-86ae0a1269ec', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-12 04:46:50.861472+00', '2026-03-14 04:46:45.44+00', 'active', 'completed', 'admin_assigned', '2026-02-12 04:46:50.861472+00')
ON CONFLICT DO NOTHING;

-- ===================== LISTING_PROMOTIONS =====================
INSERT INTO public.listing_promotions (id, listing_id, promotion_type_id, user_id, purchased_at, expires_at, status, payment_status, payment_reference, created_at) VALUES
('57ebdce8-5797-4578-a4f8-d60ab97f3e82', '81a99c1d-440b-42f6-afc8-4cf963470fb5', 'ffcee6f0-1b3a-4332-95f0-7bcb69bbe715', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '2026-02-12 04:47:03.769681+00', '2026-02-19 04:46:58.302+00', 'expired', 'completed', 'admin_assigned', '2026-02-12 04:47:03.769681+00')
ON CONFLICT DO NOTHING;

-- ===================== BUMP_TRANSACTIONS =====================
INSERT INTO public.bump_transactions (id, user_id, listing_id, credits, package_id, type, created_at) VALUES
('73cdca7d-796e-43b3-bff2-40e1987c1c58', 'd88209d4-c49f-4542-a106-582c0fdd8d81', NULL, 15, '9d299977-afd6-411d-9154-f817d0ef0476', 'purchase', '2026-02-12 03:56:17.053552+00'),
('c9a1564b-546c-426b-bf83-590548de425f', 'd88209d4-c49f-4542-a106-582c0fdd8d81', '81a99c1d-440b-42f6-afc8-4cf963470fb5', -1, NULL, 'use', '2026-02-12 04:47:21.475979+00')
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
SELECT 'main_categories' as tbl, count(*) FROM main_categories
UNION ALL SELECT 'sub_categories', count(*) FROM sub_categories
UNION ALL SELECT 'kenya_counties', count(*) FROM kenya_counties
UNION ALL SELECT 'kenya_towns', count(*) FROM kenya_towns
UNION ALL SELECT 'vehicle_makes', count(*) FROM vehicle_makes
UNION ALL SELECT 'vehicle_models', count(*) FROM vehicle_models
UNION ALL SELECT 'profiles', count(*) FROM profiles
UNION ALL SELECT 'base_listings', count(*) FROM base_listings
UNION ALL SELECT 'vehicle_listings', count(*) FROM vehicle_listings
UNION ALL SELECT 'phone_listings', count(*) FROM phone_listings
UNION ALL SELECT 'electronics_listings', count(*) FROM electronics_listings
UNION ALL SELECT 'property_listings', count(*) FROM property_listings
UNION ALL SELECT 'job_listings', count(*) FROM job_listings
UNION ALL SELECT 'fashion_listings', count(*) FROM fashion_listings
UNION ALL SELECT 'furniture_listings', count(*) FROM furniture_listings
UNION ALL SELECT 'pet_listings', count(*) FROM pet_listings
UNION ALL SELECT 'beauty_listings', count(*) FROM beauty_listings
UNION ALL SELECT 'kids_listings', count(*) FROM kids_listings
UNION ALL SELECT 'service_listings', count(*) FROM service_listings
UNION ALL SELECT 'messages', count(*) FROM messages
UNION ALL SELECT 'favorites', count(*) FROM favorites
UNION ALL SELECT 'follows', count(*) FROM follows
UNION ALL SELECT 'reviews', count(*) FROM reviews
UNION ALL SELECT 'subscription_packages', count(*) FROM subscription_packages
UNION ALL SELECT 'listing_tiers', count(*) FROM listing_tiers
UNION ALL SELECT 'promotion_types', count(*) FROM promotion_types
UNION ALL SELECT 'addons', count(*) FROM addons
UNION ALL SELECT 'addon_tiers', count(*) FROM addon_tiers
UNION ALL SELECT 'bump_packages', count(*) FROM bump_packages
UNION ALL SELECT 'platform_settings', count(*) FROM platform_settings
UNION ALL SELECT 'seller_subscriptions', count(*) FROM seller_subscriptions
UNION ALL SELECT 'seller_verifications', count(*) FROM seller_verifications
UNION ALL SELECT 'affiliates', count(*) FROM affiliates
ORDER BY tbl;
