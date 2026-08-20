const pool = require('../config/db');
const { slugify } = require('../utils/slugify');
const { plusCodeToLatLng } = require('../utils/plusCode');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { getVariantPath, SIZES, deleteImageVariants } = require('../utils/imageUtils');

exports.getAll = async (req, res) => {
  try {
    const { status, search, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 10;
    const offset = (page - 1) * limit;

    let where = ' WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND p.status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND (p.title LIKE ? OR p.title_ar LIKE ? OR p.location LIKE ? OR p.location_ar LIKE ? OR p.building_name LIKE ? OR p.building_name_ar LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM listings p${where}`,
      params
    );
    const total = countResult[0].total;

    let query = `
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
      FROM listings p${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `;
    const [properties] = await pool.query(query, [...params, limit, offset]);

    for (let prop of properties) {
      const [images] = await pool.query(
        'SELECT id, image_url, is_cover, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
        [prop.id]
      );
      prop.images = images;
      const [amenities] = await pool.query(
        `SELECT a.id, a.name, a.icon, a.category, a.sort_order FROM amenities a 
         INNER JOIN property_amenities pa ON a.id = pa.amenity_id 
         WHERE pa.property_id = ?
         ORDER BY a.sort_order ASC, a.name ASC`,
        [prop.id]
      );
      prop.amenities = amenities;
    }

    res.json({
      properties,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*,
        COALESCE(p.latitude, b.latitude, c.latitude) AS latitude,
        COALESCE(p.longitude, b.longitude, c.longitude) AS longitude,
        NULLIF(COALESCE(NULLIF(p.plus_code, ''), NULLIF(b.plus_code, ''), NULLIF(c.plus_code, '')), '') AS plus_code,
        NULLIF(COALESCE(NULLIF(p.address, ''), b.address, c.address, ''), '') AS address,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM listings p
       LEFT JOIN units u ON p.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN communities c ON b.id IS NULL AND (u.community_id = c.code OR u.community_id = c.name)
       WHERE p.slug = ?`,
      [req.params.slug]
    );

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = properties[0];

    const [images] = await pool.query(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
      [property.id]
    );
    property.images = images;

    const [amenities] = await pool.query(
      `SELECT a.id, a.name, a.icon, a.category, a.sort_order FROM amenities a 
       INNER JOIN property_amenities pa ON a.id = pa.amenity_id 
       WHERE pa.property_id = ?
       ORDER BY a.sort_order ASC, a.name ASC`,
      [property.id]
    );
    property.amenities = amenities;

    res.json(property);
  } catch (error) {
    console.error('Get property by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, p.unit_id,
        u.building_id AS unit_building_id, u.community_id AS unit_community_id,
        u.landlord_id AS unit_landlord_id, u.apartment_number AS unit_apartment_number,
        u.house_type AS unit_house_type, u.internet_provider AS unit_internet_provider,
        u.internet_account_number AS unit_internet_account_number,
        u.dewa_premises_number AS unit_dewa_premises_number,
        u.commission_percent AS unit_commission_percent,
        u.bedrooms AS unit_bedrooms, u.bathrooms AS unit_bathrooms,
        u.parking_spots AS unit_parking_spots,
        b.name AS unit_building_name, b.name_ar AS unit_building_name_ar,
        l.full_name AS unit_landlord_name,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM listings p
       LEFT JOIN units u ON p.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN landlords l ON u.landlord_id = l.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = properties[0];

    // Flatten unit data into top-level fields for the wizard
    if (property.unit_id) {
      property.building_id = property.unit_building_id;
      property.community_id = property.unit_community_id;
      property.landlord_id = property.unit_landlord_id;
      property.apartment_number = property.unit_apartment_number;
      property.house_type = property.unit_house_type;
      property.internet_provider = property.unit_internet_provider;
      property.internet_account_number = property.unit_internet_account_number;
      property.dewa_premises_number = property.unit_dewa_premises_number;
      property.commission_percent = property.unit_commission_percent;
      // Note: bedrooms, bathrooms, parking_spots are marketing fields that live on
      // the listings table — NOT overwritten from the unit here (see Units & Listings.md).
    }

    const [images] = await pool.query(
      'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
      [property.id]
    );
    property.images = images;

    const [amenities] = await pool.query(
      `SELECT a.id, a.name, a.icon, a.category, a.sort_order FROM amenities a 
       INNER JOIN property_amenities pa ON a.id = pa.amenity_id 
       WHERE pa.property_id = ?
       ORDER BY a.sort_order ASC, a.name ASC`,
      [property.id]
    );
    property.amenities = amenities;

    res.json(property);
  } catch (error) {
    console.error('Get property by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM listings p 
       WHERE p.status = 'published' AND p.is_featured = 1 
       ORDER BY p.updated_at DESC LIMIT 6`
    );

    for (let prop of properties) {
      const [images] = await pool.query(
        'SELECT id, image_url, is_cover, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
        [prop.id]
      );
      prop.images = images;
    }

    res.json(properties);
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublished = async (req, res) => {
  try {
    let query = `
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
      FROM listings p WHERE p.status = 'published'
    `;
    const params = [];
    const conditions = [];

    if (req.query.location) {
      conditions.push('p.location LIKE ?');
      params.push(`%${req.query.location}%`);
    }
    if (req.query.bedrooms) {
      conditions.push('p.bedrooms = ?');
      params.push(parseInt(req.query.bedrooms));
    }
    if (req.query.property_type) {
      conditions.push('p.property_type = ?');
      params.push(req.query.property_type);
    }
    if (req.query.min_price) {
      conditions.push('p.price_per_night >= ?');
      params.push(parseFloat(req.query.min_price));
    }
    if (req.query.max_price) {
      conditions.push('p.price_per_night <= ?');
      params.push(parseFloat(req.query.max_price));
    }
    if (req.query.guests) {
      conditions.push('p.max_guests >= ?');
      params.push(parseInt(req.query.guests));
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const sort = req.query.sort;
    switch (sort) {
      case 'price_asc': query += ' ORDER BY p.price_per_night ASC'; break;
      case 'price_desc': query += ' ORDER BY p.price_per_night DESC'; break;
      case 'newest': query += ' ORDER BY p.created_at DESC'; break;
      case 'featured': query += ' ORDER BY p.is_featured DESC, p.created_at DESC'; break;
      default: query += ' ORDER BY p.created_at DESC';
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM listings p WHERE p.status = 'published'` + (conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '');
    const [countResult] = await pool.query(countQuery, params);

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [properties] = await pool.query(query, params);

    for (let prop of properties) {
      const [images] = await pool.query(
        'SELECT id, image_url, is_cover, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
        [prop.id]
      );
      prop.images = images;
    }

    res.json({
      properties,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get published properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Auto-fill location fields from the linked building or community.
 * Only fills fields that are currently empty — explicit values always win.
 */
async function fillLocationFromBuilding({ building_id, community_id, latitude, longitude, plus_code, address, address_ar }) {
  const filled = { latitude, longitude, plus_code, address, address_ar };

  if (building_id) {
    const [rows] = await pool.query(
      'SELECT latitude, longitude, plus_code, address FROM buildings WHERE id = ?', [building_id]
    );
    if (rows.length > 0) {
      const b = rows[0];
      if (!filled.latitude && b.latitude) filled.latitude = b.latitude;
      if (!filled.longitude && b.longitude) filled.longitude = b.longitude;
      if (!filled.plus_code && b.plus_code) filled.plus_code = b.plus_code;
      if (!filled.address && b.address) filled.address = b.address;
    }
  } else if (community_id) {
    const [rows] = await pool.query(
      'SELECT latitude, longitude, plus_code, address FROM communities WHERE code = ? OR name = ?', [community_id, community_id]
    );
    if (rows.length > 0) {
      const c = rows[0];
      if (!filled.latitude && c.latitude) filled.latitude = c.latitude;
      if (!filled.longitude && c.longitude) filled.longitude = c.longitude;
      if (!filled.plus_code && c.plus_code) filled.plus_code = c.plus_code;
      if (!filled.address && c.address) filled.address = c.address;
    }
  }

  return filled;
}

exports.create = async (req, res) => {
  try {
    const {
      unit_id, title, property_type, building_name, location, address,
      title_ar, building_name_ar, location_ar, address_ar,
      bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
      short_description, description, short_description_ar, description_ar,
      map_url, plus_code, latitude, longitude,
      status, is_featured, meta_title, meta_description, meta_title_ar, meta_description_ar, amenities,
      building_id, community_id,
    } = req.body;

    // Auto-fill location from building/community if fields are empty
    const loc = await fillLocationFromBuilding({
      building_id, community_id, latitude, longitude, plus_code, address, address_ar,
    });

    let lat = loc.latitude || null;
    let lng = loc.longitude || null;
    if ((!lat || !lng) && loc.plus_code) {
      const coords = plusCodeToLatLng(loc.plus_code);
      if (coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      }
    }

    let slug = slugify(title);
    const [existing] = await pool.query('SELECT id FROM listings WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = slug + '-' + Date.now();
    }

    const [result] = await pool.query(
      `INSERT INTO listings (unit_id, title, title_ar, slug, property_type, building_name, building_name_ar,
        location, location_ar, address, address_ar,
        bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
        short_description, short_description_ar, description, description_ar,
        map_url, plus_code, latitude, longitude, status, is_featured,
        meta_title, meta_title_ar, meta_description, meta_description_ar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [unit_id || null, title, title_ar || '', slug, property_type, building_name, building_name_ar || '',
        location, location_ar || '', loc.address || address || '', loc.address_ar || address_ar || '',
        bedrooms || 0, bathrooms || 0, max_guests || 0, parking_spots || 0, size_sqft || null, price_per_night || 0,
        short_description || '', short_description_ar || '', description || '', description_ar || '',
        map_url || '', loc.plus_code || plus_code || '', lat, lng,
        status || 'draft', is_featured || 0,
        meta_title || title, meta_title_ar || '', meta_description || short_description || '', meta_description_ar || '']
    );

    if (amenities && Array.isArray(amenities)) {
      for (let amenityId of amenities) {
        await pool.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)', [result.insertId, amenityId]);
      }
    }

    const [property] = await pool.query('SELECT * FROM listings WHERE id = ?', [result.insertId]);
    res.status(201).json(property[0]);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, slug: customSlug, property_type, building_name, location, address,
      title_ar, building_name_ar, location_ar, address_ar,
      bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
      short_description, description, short_description_ar, description_ar,
      map_url, plus_code, latitude, longitude,
      status, is_featured, meta_title, meta_description, meta_title_ar, meta_description_ar, amenities,
      building_id, community_id,
      // Unit-operational fields (persisted back to units table when unit_id exists)
      landlord_id, apartment_number, house_type,
      internet_provider, internet_account_number,
      dewa_premises_number, commission_percent,
    } = req.body;

    // Auto-fill location from building/community if fields are empty
    const loc = await fillLocationFromBuilding({
      building_id, community_id, latitude, longitude, plus_code, address, address_ar,
    });

    let slug = customSlug;
    if (!slug && title) {
      slug = slugify(title);
      const [existing] = await pool.query('SELECT id FROM listings WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = slug + '-' + Date.now();
      }
    }

    let lat = loc.latitude || null;
    let lng = loc.longitude || null;
    if ((!lat || !lng) && loc.plus_code) {
      const coords = plusCodeToLatLng(loc.plus_code);
      if (coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      }
    }

    await pool.query(
      `UPDATE listings SET 
        title = COALESCE(?, title), slug = COALESCE(?, slug),
        title_ar = COALESCE(?, title_ar),
        property_type = COALESCE(?, property_type), building_name = COALESCE(?, building_name),
        building_name_ar = COALESCE(?, building_name_ar),
        location = COALESCE(?, location), location_ar = COALESCE(?, location_ar),
        address = COALESCE(?, address), address_ar = COALESCE(?, address_ar),
        bedrooms = COALESCE(?, bedrooms), bathrooms = COALESCE(?, bathrooms),
        max_guests = COALESCE(?, max_guests), parking_spots = COALESCE(?, parking_spots),
        size_sqft = COALESCE(?, size_sqft),
        price_per_night = COALESCE(?, price_per_night),
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
        property_type, building_name, building_name_ar,
        location, location_ar, loc.address || address, loc.address_ar || address_ar,
        bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
        short_description, short_description_ar, description, description_ar,
        map_url, loc.plus_code || plus_code, lat, lng,
        status, is_featured, meta_title, meta_title_ar, meta_description, meta_description_ar, id]
    );

    if (amenities && Array.isArray(amenities)) {
      await pool.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      for (let amenityId of amenities) {
        await pool.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)', [id, amenityId]);
      }
    }

    // Persist unit-operational fields back to the linked units table.
    // The wizard shows unit fields (building/landlord/apartment/etc.) so edits must be saved back.
    const [currentListing] = await pool.query('SELECT unit_id FROM listings WHERE id = ?', [id]);
    if (currentListing.length > 0 && currentListing[0].unit_id) {
      // Coerce empty strings to null for integer FKs (COALESCE with '' fails FK constraints)
      const toIntOrNull = (v) => (v === '' || v === null || v === undefined) ? null : parseInt(v);

      await pool.query(
        `UPDATE units SET
          building_id = COALESCE(?, building_id),
          community_id = COALESCE(?, community_id),
          landlord_id = COALESCE(?, landlord_id),
          apartment_number = COALESCE(?, apartment_number),
          house_type = COALESCE(?, house_type),
          internet_provider = COALESCE(?, internet_provider),
          internet_account_number = COALESCE(?, internet_account_number),
          dewa_premises_number = COALESCE(?, dewa_premises_number),
          commission_percent = COALESCE(?, commission_percent),
          bedrooms = COALESCE(?, bedrooms),
          bathrooms = COALESCE(?, bathrooms),
          parking_spots = COALESCE(?, parking_spots),
          max_guests = COALESCE(?, max_guests),
          size_sqft = COALESCE(?, size_sqft)
         WHERE id = ?`,
        [
          toIntOrNull(building_id), toIntOrNull(community_id),
          toIntOrNull(landlord_id), apartment_number || null,
          house_type || null, internet_provider || null,
          internet_account_number || null, dewa_premises_number || null,
          commission_percent != null ? parseFloat(commission_percent) : null,
          bedrooms != null ? parseInt(bedrooms) : null,
          bathrooms != null ? parseInt(bathrooms) : null,
          parking_spots != null ? parseInt(parking_spots) : null,
          max_guests != null ? parseInt(max_guests) : null,
          size_sqft != null ? parseInt(size_sqft) : null,
          currentListing[0].unit_id,
        ]
      );
    }

    const [property] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    res.json(property[0]);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [images] = await pool.query('SELECT image_url FROM property_images WHERE property_id = ?', [id]);
    for (let img of images) {
      const absPath = path.join(__dirname, '..', img.image_url);
      deleteImageVariants(absPath);
    }

    // Delete the property image folder (extract folder name from image_url)
    if (images.length > 0) {
      // image_url looks like: uploads/properties/{folder_name}/{baseName}
      // Get the directory of the first image
      const firstImageDir = path.dirname(path.join(__dirname, '..', images[0].image_url));
      if (fs.existsSync(firstImageDir)) {
        fs.rmSync(firstImageDir, { recursive: true, force: true });
      }
    }

    await pool.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM property_images WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM property_enquiries WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM listings WHERE id = ?', [id]);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Build a sanitized folder name from the form field (matches multer destination)
    const rawFolder = (req.body.folder_name || String(id)).replace(/[<>:"/\\|?*#@!$%^&()+=\[\]{};']+/g, '').replace(/\s+/g, ' ').trim() || 'listing';

    const uploaded = [];
    for (let file of req.files) {
      const baseName = path.parse(file.filename).name;
      const baseRelPath = 'uploads/properties/' + rawFolder + '/' + baseName;
      const absDir = path.join(__dirname, '..', 'uploads', 'properties', rawFolder);

      const resizeConfig = {
        thumb: { width: 150, height: 150, fit: 'cover' },
        small: { width: 400, height: 300, fit: 'cover' },
        medium: { width: 800, height: 600, fit: 'inside' },
        large: { width: 1920, height: 1080, fit: 'inside' },
      };

      for (const size of SIZES) {
        const cfg = resizeConfig[size];
        await sharp(file.path)
          .resize(cfg.width, cfg.height, { fit: cfg.fit })
          .webp({ quality: 80 })
          .toFile(getVariantPath(path.join(absDir, baseName), size));
      }

      fs.unlinkSync(file.path);

      const [existing] = await pool.query(
        'SELECT COUNT(*) as cnt FROM property_images WHERE property_id = ?', [id]
      );
      const isCover = existing[0].cnt === 0 ? 1 : 0;

      const [result] = await pool.query(
        'INSERT INTO property_images (property_id, image_url, is_cover, sort_order) VALUES (?, ?, ?, ?)',
        [id, baseRelPath, isCover, existing[0].cnt + 1]
      );

      uploaded.push({ id: result.insertId, image_url: baseRelPath, is_cover: isCover });
    }

    res.status(201).json(uploaded);
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const [images] = await pool.query('SELECT * FROM property_images WHERE id = ?', [imageId]);
    if (images.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const absPath = path.join(__dirname, '..', images[0].image_url);
    deleteImageVariants(absPath);

    await pool.query('DELETE FROM property_images WHERE id = ?', [imageId]);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setCoverImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    await pool.query('UPDATE property_images SET is_cover = 0 WHERE property_id = ?', [id]);
    await pool.query('UPDATE property_images SET is_cover = 1 WHERE id = ?', [imageId]);

    res.json({ message: 'Cover image updated' });
  } catch (error) {
    console.error('Set cover image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reorderImages = async (req, res) => {
  try {
    // Accept both { images: [{id, sort_order}] } and { image_ids: [id1, id2, ...] }
    const { images, image_ids } = req.body;
    if (images && Array.isArray(images)) {
      for (let item of images) {
        await pool.query('UPDATE property_images SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
    } else if (image_ids && Array.isArray(image_ids)) {
      for (let i = 0; i < image_ids.length; i++) {
        await pool.query('UPDATE property_images SET sort_order = ? WHERE id = ?', [i + 1, image_ids[i]]);
      }
    }
    res.json({ message: 'Images reordered' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportCsv = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT id, title, location, building_name, property_type,
              bedrooms, bathrooms, max_guests, price_per_night,
              status, is_featured, created_at
       FROM listings ORDER BY created_at DESC`
    );

    const headers = ['ID', 'Title', 'Location', 'Building', 'Type', 'Bedrooms', 'Bathrooms', 'Max Guests', 'Price/Night', 'Status', 'Featured', 'Created'];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    let csv = headers.join(',') + '\n';
    for (const p of properties) {
      csv += [
        p.id,
        escapeCsv(p.title),
        escapeCsv(p.location || ''),
        escapeCsv(p.building_name || ''),
        escapeCsv(p.property_type || ''),
        p.bedrooms ?? '',
        p.bathrooms ?? '',
        p.max_guests ?? '',
        p.price_per_night ?? '',
        escapeCsv(p.status || ''),
        p.is_featured ? 'Yes' : 'No',
        p.created_at ? p.created_at.toISOString?.()?.split('T')[0] || p.created_at : '',
      ].join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="properties.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.bulkPriceUpdate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return res.status(400).json({ message: 'CSV must have a header row and at least one data row' });
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const idIdx = header.indexOf('id');
    const priceIdx = header.indexOf('price_per_night');

    if (idIdx === -1 || priceIdx === -1) {
      return res.status(400).json({ message: 'CSV must have "id" and "price_per_night" columns' });
    }

    const updated = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const propertyId = cols[idIdx];
      const newPrice = parseFloat(cols[priceIdx]);

      if (!propertyId || isNaN(newPrice) || newPrice < 0) {
        errors.push({ row: i + 1, message: `Invalid data: id="${propertyId || ''}", price="${cols[priceIdx] || ''}"` });
        continue;
      }

      const [result] = await pool.query(
        'UPDATE listings SET price_per_night = ? WHERE id = ?',
        [newPrice, propertyId]
      );

      if (result.affectedRows === 0) {
        errors.push({ row: i + 1, message: `Property ID ${propertyId} not found` });
      } else {
        updated.push(propertyId);
      }
    }

    res.json({
      message: `Updated ${updated.length} properties` + (errors.length ? `, ${errors.length} errors` : ''),
      updated: updated.length,
      errors: errors.length,
      errorDetails: errors,
    });
  } catch (error) {
    console.error('Bulk price update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
