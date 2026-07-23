const pool = require('../config/db');
const { slugify } = require('../utils/slugify');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { status, featured } = req.query;
    let query = `
      SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
      FROM properties p WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    if (featured === '1') {
      query += ' AND p.is_featured = 1';
    }

    query += ' ORDER BY p.created_at DESC';

    const [properties] = await pool.query(query, params);

    for (let prop of properties) {
      const [images] = await pool.query(
        'SELECT id, image_url, is_cover, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
        [prop.id]
      );
      prop.images = images;
      const [amenities] = await pool.query(
        `SELECT a.id, a.name FROM amenities a 
         INNER JOIN property_amenities pa ON a.id = pa.amenity_id 
         WHERE pa.property_id = ?`,
        [prop.id]
      );
      prop.amenities = amenities;
    }

    res.json(properties);
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM properties p WHERE p.slug = ?`,
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
      `SELECT a.id, a.name, a.icon FROM amenities a 
       INNER JOIN property_amenities pa ON a.id = pa.amenity_id 
       WHERE pa.property_id = ?`,
      [property.id]
    );
    property.amenities = amenities;

    res.json(property);
  } catch (error) {
    console.error('Get property by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT p.*, 
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
       FROM properties p 
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
      FROM properties p WHERE p.status = 'published'
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

    const countQuery = `SELECT COUNT(*) as total FROM properties p WHERE p.status = 'published'` + (conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '');
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

exports.create = async (req, res) => {
  try {
    const {
      title, property_type, building_name, location, address,
      bedrooms, bathrooms, max_guests, size_sqft, price_per_night,
      short_description, description, map_url, latitude, longitude,
      status, is_featured, meta_title, meta_description, amenities
    } = req.body;

    let slug = slugify(title);
    const [existing] = await pool.query('SELECT id FROM properties WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = slug + '-' + Date.now();
    }

    const [result] = await pool.query(
      `INSERT INTO properties (title, slug, property_type, building_name, location, address,
        bedrooms, bathrooms, max_guests, size_sqft, price_per_night, short_description, description,
        map_url, latitude, longitude, status, is_featured, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, property_type, building_name, location, address,
        bedrooms || 0, bathrooms || 0, max_guests || 0, size_sqft || null, price_per_night || 0,
        short_description || '', description || '', map_url || '', latitude || null, longitude || null,
        status || 'draft', is_featured || 0, meta_title || title, meta_description || short_description || '']
    );

    if (amenities && Array.isArray(amenities)) {
      for (let amenityId of amenities) {
        await pool.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)', [result.insertId, amenityId]);
      }
    }

    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [result.insertId]);
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
      bedrooms, bathrooms, max_guests, size_sqft, price_per_night,
      short_description, description, map_url, latitude, longitude,
      status, is_featured, meta_title, meta_description, amenities
    } = req.body;

    let slug = customSlug;
    if (!slug && title) {
      slug = slugify(title);
      const [existing] = await pool.query('SELECT id FROM properties WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = slug + '-' + Date.now();
      }
    }

    await pool.query(
      `UPDATE properties SET 
        title = COALESCE(?, title), slug = COALESCE(?, slug),
        property_type = COALESCE(?, property_type), building_name = COALESCE(?, building_name),
        location = COALESCE(?, location), address = COALESCE(?, address),
        bedrooms = COALESCE(?, bedrooms), bathrooms = COALESCE(?, bathrooms),
        max_guests = COALESCE(?, max_guests), size_sqft = COALESCE(?, size_sqft),
        price_per_night = COALESCE(?, price_per_night),
        short_description = COALESCE(?, short_description), description = COALESCE(?, description),
        map_url = COALESCE(?, map_url), latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude),
        status = COALESCE(?, status), is_featured = COALESCE(?, is_featured),
        meta_title = COALESCE(?, meta_title), meta_description = COALESCE(?, meta_description),
        updated_at = NOW()
       WHERE id = ?`,
      [title, slug, property_type, building_name, location, address,
        bedrooms, bathrooms, max_guests, size_sqft, price_per_night,
        short_description, description, map_url, latitude, longitude,
        status, is_featured, meta_title, meta_description, id]
    );

    if (amenities && Array.isArray(amenities)) {
      await pool.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
      for (let amenityId of amenities) {
        await pool.query('INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)', [id, amenityId]);
      }
    }

    const [property] = await pool.query('SELECT * FROM properties WHERE id = ?', [id]);
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
      const filePath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM property_images WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM property_enquiries WHERE property_id = ?', [id]);
    await pool.query('DELETE FROM properties WHERE id = ?', [id]);

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

    const uploaded = [];
    for (let file of req.files) {
      const imageUrl = 'uploads/properties/' + file.filename;

      const [existing] = await pool.query(
        'SELECT COUNT(*) as cnt FROM property_images WHERE property_id = ?', [id]
      );
      const isCover = existing[0].cnt === 0 ? 1 : 0;

      const [result] = await pool.query(
        'INSERT INTO property_images (property_id, image_url, is_cover, sort_order) VALUES (?, ?, ?, ?)',
        [id, imageUrl, isCover, existing[0].cnt + 1]
      );

      uploaded.push({ id: result.insertId, image_url: imageUrl, is_cover: isCover });
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

    const filePath = path.join(__dirname, '..', images[0].image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

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
    const { images } = req.body;
    for (let item of images) {
      await pool.query('UPDATE property_images SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }
    res.json({ message: 'Images reordered' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
