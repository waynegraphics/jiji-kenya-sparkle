-- Migration to prefill listings for ahem58@gmail.com with images and details
-- This will add images from Unsplash/Pixabay and fill in missing descriptions

DO $$
DECLARE
  user_record RECORD;
  listing_record RECORD;
  category_slug TEXT;
  image_urls TEXT[];
  listing_description TEXT;
BEGIN
  -- Get user ID
  SELECT user_id INTO user_record
  FROM profiles
  WHERE email = 'ahem58@gmail.com'
  LIMIT 1;

  IF user_record IS NULL THEN
    RAISE NOTICE 'User ahem58@gmail.com not found';
    RETURN;
  END IF;

  RAISE NOTICE 'Found user: %', user_record.user_id;

  -- Loop through all listings for this user
  FOR listing_record IN
    SELECT 
      bl.id,
      bl.title,
      bl.description,
      bl.images,
      bl.location,
      bl.currency,
      mc.slug as category_slug,
      mc.name as category_name
    FROM base_listings bl
    LEFT JOIN main_categories mc ON bl.main_category_id = mc.id
    WHERE bl.user_id = user_record.user_id
  LOOP
    category_slug := COALESCE(listing_record.category_slug, 'default');
    image_urls := ARRAY[]::TEXT[];
    listing_description := NULL;

    -- Assign images based on category
    CASE category_slug
      WHEN 'vehicles' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
        ];
        listing_description := 'Excellent condition ' || LOWER(listing_record.title) || '. Well maintained and ready for use. Contact for more details and viewing arrangements.';
      
      WHEN 'electronics' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop'
        ];
        listing_description := 'High-quality ' || LOWER(listing_record.title) || ' in perfect working condition. Original packaging and accessories included. Great value for money.';
      
      WHEN 'fashion' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop'
        ];
        listing_description := 'Stylish ' || LOWER(listing_record.title) || ' in excellent condition. Perfect fit and quality material. Must see!';
      
      WHEN 'furniture' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1551292831-023188e78222?w=800&h=600&fit=crop'
        ];
        listing_description := 'Beautiful ' || LOWER(listing_record.title) || ' in great condition. Comfortable and well-maintained. Perfect for your home or office.';
      
      WHEN 'property' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ];
        listing_description := 'Prime location ' || LOWER(listing_record.title) || '. Well-maintained property with modern amenities. Ideal for families or professionals.';
      
      WHEN 'phones' THEN
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'
        ];
        listing_description := 'Latest model ' || LOWER(listing_record.title) || ' in excellent condition. All accessories included. Original box and warranty available.';
      
      ELSE
        image_urls := ARRAY[
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop'
        ];
        listing_description := listing_record.title || ' in excellent condition. Well-maintained and ready for use. Contact for more details.';
    END CASE;

    -- Update listing with images if missing
    IF listing_record.images IS NULL OR array_length(listing_record.images, 1) IS NULL OR array_length(listing_record.images, 1) = 0 THEN
      UPDATE base_listings
      SET images = image_urls,
          updated_at = NOW()
      WHERE id = listing_record.id;
      RAISE NOTICE 'Added images to listing: %', listing_record.title;
    END IF;

    -- Update description if missing
    IF listing_record.description IS NULL OR TRIM(listing_record.description) = '' THEN
      UPDATE base_listings
      SET description = listing_description,
          updated_at = NOW()
      WHERE id = listing_record.id;
      RAISE NOTICE 'Added description to listing: %', listing_record.title;
    END IF;

    -- Ensure location is set
    IF listing_record.location IS NULL OR TRIM(listing_record.location) = '' THEN
      UPDATE base_listings
      SET location = 'Nairobi, Kenya',
          updated_at = NOW()
      WHERE id = listing_record.id;
      RAISE NOTICE 'Added location to listing: %', listing_record.title;
    END IF;

    -- Ensure currency is set
    IF listing_record.currency IS NULL OR listing_record.currency = '' THEN
      UPDATE base_listings
      SET currency = 'KES',
          updated_at = NOW()
      WHERE id = listing_record.id;
      RAISE NOTICE 'Added currency to listing: %', listing_record.title;
    END IF;

  END LOOP;

  RAISE NOTICE 'Prefill complete for user: %', user_record.user_id;
END $$;
