const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const properties = [
  {
    title: 'Luxury Marina View Apartment',
    slug: 'luxury-marina-view-apartment',
    property_type: 'Apartment',
    building_name: 'Marina Heights Tower',
    location: 'Dubai Marina',
    address: 'Marina Heights Tower, Dubai Marina, Dubai',
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 6,
    size_sqft: 1450,
    price_per_night: 850,
    short_description: 'Stunning 2BR apartment with panoramic marina views, premium finishes, and private balcony.',
    description: 'Experience luxury living in this beautifully appointed 2-bedroom apartment in the heart of Dubai Marina. Floor-to-ceiling windows offer breathtaking views of the marina and Dubai skyline.\n\nThe apartment features a spacious open-plan living area with modern furnishings, a fully equipped kitchen with premium appliances, and a private balcony perfect for relaxing.\n\nBoth bedrooms feature en-suite bathrooms with rain showers and premium fixtures. The master suite includes a walk-in closet and direct balcony access.\n\nBuilding amenities include a state-of-the-art gym, temperature-controlled swimming pool, sauna, and 24-hour security.',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3612.315!2d55.1405!3d25.0898',
    latitude: 25.0898,
    longitude: 55.1405,
    status: 'published',
    is_featured: 1,
    meta_title: 'Luxury Marina View Apartment | Authentic Holiday Homes',
    meta_description: 'Stunning 2BR apartment in Dubai Marina with panoramic views. Premium finishes, private balcony, and world-class amenities.',
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', is_cover: 1 },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600607687644-c94bf5a3e9e6?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', is_cover: 0 },
    ],
    amenities: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11],
  },
  {
    title: 'Modern Studio in Downtown Dubai',
    slug: 'modern-studio-downtown-dubai',
    property_type: 'Studio',
    building_name: 'Burj Vista Tower',
    location: 'Downtown Dubai',
    address: 'Burj Vista Tower, Downtown Dubai, Dubai',
    bedrooms: 0,
    bathrooms: 1,
    max_guests: 2,
    size_sqft: 480,
    price_per_night: 450,
    short_description: 'Sleek studio steps from Burj Khalifa with stunning city views and smart home features.',
    description: 'Welcome to your home away from home in the heart of Downtown Dubai. This contemporary studio apartment offers everything you need for a memorable stay.\n\nLocated in the prestigious Burj Vista Tower, you are just steps away from the Dubai Mall, Burj Khalifa, and Dubai Fountain.\n\nThe open-plan studio features a comfortable king-size bed, a fully equipped kitchenette, and a modern bathroom with premium fixtures.\n\nEnjoy spectacular views of the Dubai skyline from the floor-to-ceiling windows. The building offers a rooftop pool, gym, and concierge service.',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3611.123!2d55.2749!3d25.1972',
    latitude: 25.1972,
    longitude: 55.2749,
    status: 'published',
    is_featured: 1,
    meta_title: 'Modern Studio Downtown Dubai | Authentic Holiday Homes',
    meta_description: 'Sleek studio apartment in Downtown Dubai near Burj Khalifa. Smart home features, stunning city views, rooftop pool.',
    images: [
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', is_cover: 1 },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', is_cover: 0 },
    ],
    amenities: [1, 4, 6, 7, 9, 11, 14],
  },
  {
    title: 'Palm Jumeirah Penthouse Suite',
    slug: 'palm-jumeirah-penthouse-suite',
    property_type: 'Penthouse',
    building_name: 'One Palm Tower',
    location: 'Palm Jumeirah',
    address: 'One Palm Tower, Palm Jumeirah, Dubai',
    bedrooms: 3,
    bathrooms: 3,
    max_guests: 8,
    size_sqft: 3200,
    price_per_night: 2500,
    short_description: 'Ultra-luxury 3BR penthouse on Palm Jumeirah with private pool, panoramic sea views, and butler service.',
    description: 'Indulge in the ultimate luxury experience at this magnificent penthouse suite on Palm Jumeirah. Perched high above the iconic palm-shaped island, this residence offers unparalleled views of the Arabian Gulf and Dubai skyline.\n\nThe expansive living area features Italian marble flooring, floor-to-ceiling windows, and a grand piano. The gourmet kitchen is equipped with Miele appliances and a wine cooler.\n\nThree generously sized bedrooms each feature en-suite marble bathrooms with soaking tubs and rain showers. The master suite includes a private study and a spacious dressing room.\n\nStep onto the private terrace to discover your own infinity pool, outdoor lounge area, and alfresco dining for eight guests.\n\nExclusive building amenities include a private beach club, spa, Michelin-starred restaurant, and butler service.',
    map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.987!2d55.1367!3d25.1124',
    latitude: 25.1124,
    longitude: 55.1367,
    status: 'published',
    is_featured: 1,
    meta_title: 'Palm Jumeirah Penthouse Suite | Authentic Holiday Homes',
    meta_description: 'Ultra-luxury 3BR penthouse on Palm Jumeirah with private infinity pool, panoramic sea views, and butler service.',
    images: [
      { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80', is_cover: 1 },
      { url: 'https://images.unsplash.com/photo-1600566753086-00f18fb4b3f2?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&q=80', is_cover: 0 },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', is_cover: 0 },
    ],
    amenities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
];

async function seedProperties() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'authentic_holiday_homes',
  });

  for (const prop of properties) {
    const [result] = await connection.query(
      `INSERT INTO properties (title, slug, property_type, building_name, location, address,
        bedrooms, bathrooms, max_guests, size_sqft, price_per_night, short_description, description,
        map_url, latitude, longitude, status, is_featured, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [prop.title, prop.slug, prop.property_type, prop.building_name, prop.location, prop.address,
        prop.bedrooms, prop.bathrooms, prop.max_guests, prop.size_sqft, prop.price_per_night,
        prop.short_description, prop.description, prop.map_url, prop.latitude, prop.longitude,
        prop.status, prop.is_featured, prop.meta_title, prop.meta_description]
    );

    const propertyId = result.insertId;

    for (let i = 0; i < prop.images.length; i++) {
      const img = prop.images[i];
      await connection.query(
        'INSERT INTO property_images (property_id, image_url, is_cover, sort_order) VALUES (?, ?, ?, ?)',
        [propertyId, img.url, img.is_cover, i + 1]
      );
    }

    for (const amenityId of prop.amenities) {
      await connection.query(
        'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
        [propertyId, amenityId]
      );
    }

    console.log(`Created: ${prop.title} (ID: ${propertyId})`);
  }

  console.log('\n3 dummy properties created successfully!');
  await connection.end();
  process.exit(0);
}

seedProperties().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
