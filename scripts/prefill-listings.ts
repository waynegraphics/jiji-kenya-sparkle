/**
 * Script to prefill listings for ahem58@gmail.com with images and details
 * Run with: npx tsx scripts/prefill-listings.ts
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Image URLs from Unsplash and Pixabay (free stock images)
const getCategoryImages = (categorySlug: string): string[] => {
  const imageMap: Record<string, string[]> = {
    'vehicles': [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    ],
    'electronics': [
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    ],
    'fashion': [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    ],
    'furniture': [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551292831-023188e78222?w=800&h=600&fit=crop',
    ],
    'property': [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    ],
    'phones': [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    ],
  };

  // Default images if category not found
  return imageMap[categorySlug] || [
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop',
  ];
};

const generateDescription = (title: string, category: string): string => {
  const descriptions: Record<string, string> = {
    'vehicles': `Excellent condition ${title.toLowerCase()}. Well maintained and ready for use. Contact for more details and viewing arrangements.`,
    'electronics': `High-quality ${title.toLowerCase()} in perfect working condition. Original packaging and accessories included. Great value for money.`,
    'fashion': `Stylish ${title.toLowerCase()} in excellent condition. Perfect fit and quality material. Must see!`,
    'furniture': `Beautiful ${title.toLowerCase()} in great condition. Comfortable and well-maintained. Perfect for your home or office.`,
    'property': `Prime location ${title.toLowerCase()}. Well-maintained property with modern amenities. Ideal for families or professionals.`,
    'phones': `Latest model ${title.toLowerCase()} in excellent condition. All accessories included. Original box and warranty available.`,
  };

  return descriptions[category] || `${title} in excellent condition. Well-maintained and ready for use. Contact for more details.`;
};

async function prefillListings() {
  try {
    console.log('Fetching user profile...');
    
    // Get user ID from email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'ahem58@gmail.com')
      .single();

    if (profileError || !profile) {
      console.error('User not found:', profileError);
      return;
    }

    const userId = profile.user_id;
    console.log(`Found user: ${userId}`);

    // Fetch all listings for this user
    console.log('Fetching listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('base_listings')
      .select(`
        *,
        main_categories(slug, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return;
    }

    if (!listings || listings.length === 0) {
      console.log('No listings found for this user');
      return;
    }

    console.log(`Found ${listings.length} listings to update`);

    // Update each listing
    for (const listing of listings) {
      const categorySlug = listing.main_categories?.slug || 'default';
      const needsUpdate: any = {};

      // Add images if missing or empty
      if (!listing.images || listing.images.length === 0) {
        needsUpdate.images = getCategoryImages(categorySlug);
        console.log(`  - Adding images to: ${listing.title}`);
      }

      // Add description if missing
      if (!listing.description || listing.description.trim() === '') {
        needsUpdate.description = generateDescription(listing.title, categorySlug);
        console.log(`  - Adding description to: ${listing.title}`);
      }

      // Ensure location is set
      if (!listing.location || listing.location.trim() === '') {
        needsUpdate.location = 'Nairobi, Kenya';
        console.log(`  - Adding location to: ${listing.title}`);
      }

      // Ensure currency is set
      if (!listing.currency) {
        needsUpdate.currency = 'KES';
        console.log(`  - Adding currency to: ${listing.title}`);
      }

      // Update if there are changes
      if (Object.keys(needsUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('base_listings')
          .update(needsUpdate)
          .eq('id', listing.id);

        if (updateError) {
          console.error(`  - Error updating ${listing.title}:`, updateError);
        } else {
          console.log(`  ✓ Updated: ${listing.title}`);
        }
      } else {
        console.log(`  - No updates needed for: ${listing.title}`);
      }
    }

    console.log('\n✅ Prefill complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
prefillListings();
