const pool = require('../config/db');
const { plusCodeToLatLng } = require('../utils/plusCode');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Base select for a listing joined with its unit, building and landlord.
const LISTING_SELECT = `
  SELECT l.*,
    u.apartment_number,
    u.building_id,
    u.landlord_id,
    b.name AS unit_building_name,
    ld.name AS landlord_name,
    (SELECT image_url FROM property_images WHERE property_id = l.id AND is_cover = 1 LIMIT 1) AS cover_image
  FROM listings l
  LEFT JOIN units u ON l.unit_id = u.id
  LEFT JOIN buildings b ON u.building_id = b.id
  LEFT JOIN landlords ld ON u.landlord_id = ld.id
`;

async function attachImagesAndAmenities(listing) {
  const [images] = await pool.query(
    'SELECT id, image_url, is_cover, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
    [listing.id]
  );
  listing.images = images;

  const [amenities] = await pool.query(
    `SELECT a.id, a.name, a.icon, a.category, a.sort_order FROM amenities a
     INNER JOIN property_amenities pa ON a.id = pa.amenity_id
     WHERE pa.property_id = ?
     ORDER BY a.sort_order ASC, a.name ASC`,
    [listing.id]
  );
  listing.amenities = amenities;
}

exports.getAll = async (req, res, next) => {
  try {
    const { search, status, is_featured, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 20;
    const offset = (page - 1) * limit;

    const whereParts = [];
    const params = [];

    if (search) {
      whereParts.push('(l.title LIKE ? OR l.building_name LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s);
    }
    if (status) {
      whereParts.push('l.status = ?');
      params.push(status);
    }
    if (is_featured !== undefined && is_featured !== '') {
      whereParts.push('l.is_featured = ?');
      params.push(parseInt(is_featured) || 0);
    }

    const whereClause = whereParts.length ? ' WHERE ' + whereParts.join(' AND ') : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM listings l${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [listings] = await pool.query(
      LISTING_SELECT + whereClause + ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?',
      [...params, limit, offset]
    );

    for (const listing of listings) {
      await attachImagesAndAmenities(listing);
    }

    res.json({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      LISTING_SELECT + ' WHERE l.id = ?',
      [req.params.id]
    );
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    await attachImagesAndAmenities(listing);

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, title_ar, property_type,
      building_name, building_name_ar, location, location_ar, address, address_ar,
      bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
      short_description, short_description_ar, description, description_ar,
      map_url, plus_code, latitude, longitude,
      status, is_featured,
      meta_title, meta_title_ar, meta_description, meta_description_ar,
    } = req.body;

    // Auto-generate slug from title when the title is provided.
    let slug = null;
    if (title) {
      slug = slugify(title);
      const [existing] = await pool.query(
        'SELECT id FROM listings WHERE slug = ? AND id != ?',
        [slug, id]
      );
      if (existing.length > 0) {
        slug = slug + '-' + Date.now();
      }
    }

    // Decode plus code into lat/lng when coords are missing.
    let lat = latitude || null;
    let lng = longitude || null;
    if ((!lat || !lng) && plus_code) {
      const coords = plusCodeToLatLng(plus_code);
      if (coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      }
    }

    await pool.query(
      `UPDATE listings SET
        title = COALESCE(?, title), slug = COALESCE(?, slug),
        title_ar = COALESCE(?, title_ar),
        property_type = COALESCE(?, property_type),
        building_name = COALESCE(?, building_name), building_name_ar = COALESCE(?, building_name_ar),
        location = COALESCE(?, location), location_ar = COALESCE(?, location_ar),
        address = COALESCE(?, address), address_ar = COALESCE(?, address_ar),
        bedrooms = COALESCE(?, bedrooms), bathrooms = COALESCE(?, bathrooms),
        max_guests = COALESCE(?, max_guests), parking_spots = COALESCE(?, parking_spots),
        size_sqft = COALESCE(?, size_sqft), price_per_night = COALESCE(?, price_per_night),
        short_description = COALESCE(?, short_description), short_description_ar = COALESCE(?, short_description_ar),
        description = COALESCE(?, description), description_ar = COALESCE(?, description_ar),
        map_url = COALESCE(?, map_url), plus_code = COALESCE(?, plus_code),
        latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude),
        status = COALESCE(?, status), is_featured = COALESCE(?, is_featured),
        meta_title = COALESCE(?, meta_title), meta_title_ar = COALESCE(?, meta_title_ar),
        meta_description = COALESCE(?, meta_description), meta_description_ar = COALESCE(?, meta_description_ar),
        updated_at = NOW()
       WHERE id = ?`,
      [title, slug, title_ar,
        property_type,
        building_name, building_name_ar,
        location, location_ar, address, address_ar,
        bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
        short_description, short_description_ar, description, description_ar,
        map_url, plus_code, lat, lng,
        status, is_featured,
        meta_title, meta_title_ar, meta_description, meta_description_ar, id]
    );

    const [listings] = await pool.query(
      LISTING_SELECT + ' WHERE l.id = ?',
      [id]
    );
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    await attachImagesAndAmenities(listing);

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Related rows in property_images/property_amenities are cascade-deleted by FK.
    await pool.query('DELETE FROM listings WHERE id = ?', [id]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getPublished = async (req, res, next) => {
  try {
    const { location, bedrooms, property_type, guests, min_price, max_price, sort } = req.query;

    const whereParts = ["l.status = 'published'"];
    const params = [];

    if (location) {
      whereParts.push('l.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (bedrooms) {
      whereParts.push('l.bedrooms = ?');
      params.push(parseInt(bedrooms));
    }
    if (property_type) {
      whereParts.push('l.property_type = ?');
      params.push(property_type);
    }
    if (min_price) {
      whereParts.push('l.price_per_night >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      whereParts.push('l.price_per_night <= ?');
      params.push(parseFloat(max_price));
    }
    if (guests) {
      whereParts.push('l.max_guests >= ?');
      params.push(parseInt(guests));
    }

    const whereClause = ' WHERE ' + whereParts.join(' AND ');

    let orderBy;
    switch (sort) {
      case 'price_asc': orderBy = 'l.price_per_night ASC'; break;
      case 'price_desc': orderBy = 'l.price_per_night DESC'; break;
      case 'featured': orderBy = 'l.is_featured DESC, l.created_at DESC'; break;
      case 'newest':
      default: orderBy = 'l.created_at DESC';
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM listings l${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [listings] = await pool.query(
      LISTING_SELECT + whereClause + ' ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?',
      [...params, limit, offset]
    );

    for (const listing of listings) {
      await attachImagesAndAmenities(listing);
    }

    res.json({
      listings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      LISTING_SELECT + ` WHERE l.status = 'published' AND l.is_featured = 1 ORDER BY l.updated_at DESC LIMIT 6`
    );

    for (const listing of listings) {
      await attachImagesAndAmenities(listing);
    }

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      LISTING_SELECT + ` WHERE l.status = 'published' AND l.slug = ?`,
      [req.params.slug]
    );
    if (listings.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listings[0];
    await attachImagesAndAmenities(listing);

    res.json(listing);
  } catch (error) {
    next(error);
  }
};