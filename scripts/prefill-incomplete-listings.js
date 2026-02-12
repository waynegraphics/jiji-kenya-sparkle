/**
 * Node.js script to prefill incomplete listings for ahem58@gmail.com
 * Run with: node scripts/prefill-incomplete-listings.js
 * 
 * Make sure to set environment variables:
 * VITE_SUPABASE_URL=your_supabase_url
 * VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Image URLs by category
const getCategoryImages = (categorySlug) => {
  const imageMap = {
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
    'jobs': [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    ],
  };

  return imageMap[categorySlug] || [
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop',
  ];
};

const generateDescription = (title, categorySlug) => {
  const descriptions = {
    'vehicles': `Excellent condition ${title.toLowerCase()}. Well maintained and ready for use. This vehicle has been regularly serviced and is in perfect working order. Contact for more details and viewing arrangements.`,
    'electronics': `High-quality ${title.toLowerCase()} in perfect working condition. Original packaging and accessories included. Great value for money. Tested and verified to be in excellent working order.`,
    'fashion': `Stylish ${title.toLowerCase()} in excellent condition. Perfect fit and quality material. Must see! Authentic and well-maintained item.`,
    'furniture': `Beautiful ${title.toLowerCase()} in great condition. Comfortable and well-maintained. Perfect for your home or office. Quality furniture at an affordable price.`,
    'property': `Prime location ${title.toLowerCase()}. Well-maintained property with modern amenities. Ideal for families or professionals. Great investment opportunity.`,
    'phones': `Latest model ${title.toLowerCase()} in excellent condition. All accessories included. Original box and warranty available. Fully functional and tested.`,
    'jobs': `Great opportunity: ${title}. Competitive package and excellent working environment. Apply now for this exciting position.`,
  };

  return descriptions[categorySlug] || `${title} in excellent condition. Well-maintained and ready for use. Contact for more details and viewing arrangements.`;
};

async function prefillListings() {
  try {
    console.log('🔍 Fetching user profile...');
    
    // Get user ID from email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'ahem58@gmail.com')
      .single();

    if (profileError || !profile) {
      console.error('❌ User not found:', profileError);
      return;
    }

    const userId = profile.user_id;
    console.log(`✅ Found user: ${userId}\n`);

    // Fetch all listings for this user
    console.log('📋 Fetching all listings...');
    const { data: listings, error: listingsError } = await supabase
      .from('base_listings')
      .select(`
        *,
        main_categories(slug, name),
        sub_categories(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('❌ Error fetching listings:', listingsError);
      return;
    }

    if (!listings || listings.length === 0) {
      console.log('ℹ️  No listings found for this user');
      return;
    }

    console.log(`📊 Found ${listings.length} total listings\n`);
    console.log('🔄 Processing listings...\n');

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each listing
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const categorySlug = listing.main_categories?.slug || 'default';
      const needsUpdate = {};

      // Check if images are missing
      const hasImages = listing.images && listing.images.length > 0;
      if (!hasImages) {
        needsUpdate.images = getCategoryImages(categorySlug);
        console.log(`  [${i + 1}/${listings.length}] 📸 Adding images to: ${listing.title}`);
      }

      // Check if description is missing or too short
      const hasDescription = listing.description && listing.description.trim().length >= 10;
      if (!hasDescription) {
        needsUpdate.description = generateDescription(listing.title, categorySlug);
        console.log(`  [${i + 1}/${listings.length}] 📝 Adding description to: ${listing.title}`);
      }

      // Check if location is missing
      if (!listing.location || listing.location.trim() === '') {
        needsUpdate.location = 'Nairobi, Kenya';
        console.log(`  [${i + 1}/${listings.length}] 📍 Adding location to: ${listing.title}`);
      }

      // Check if currency is missing
      if (!listing.currency || listing.currency === '') {
        needsUpdate.currency = 'KES';
        console.log(`  [${i + 1}/${listings.length}] 💰 Adding currency to: ${listing.title}`);
      }

      // Update if there are changes
      if (Object.keys(needsUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('base_listings')
          .update(needsUpdate)
          .eq('id', listing.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${listing.title}:`, updateError.message);
        } else {
          updatedCount++;
          console.log(`  ✅ Updated: ${listing.title}\n`);
        }
      } else {
        skippedCount++;
        console.log(`  ⏭️  Skipped (complete): ${listing.title}\n`);
      }

      // Small delay to avoid rate limiting
      if (i < listings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Prefill Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Total listings processed: ${listings.length}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already complete): ${skippedCount}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
prefillListings();
