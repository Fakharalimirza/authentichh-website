const pool = require('../config/db');

exports.getPublic = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT slug, title, title_ar, subtitle, subtitle_ar, highlights, highlights_ar, ideal_for, ideal_for_ar, why_in_demand, why_in_demand_ar, image_url FROM area_articles WHERE published = 1 ORDER BY id'
    );
    rows.forEach(r => {
      if (typeof r.highlights === 'string') { try { r.highlights = JSON.parse(r.highlights); } catch { r.highlights = []; } }
      if (typeof r.highlights_ar === 'string') { try { r.highlights_ar = JSON.parse(r.highlights_ar); } catch { r.highlights_ar = []; } }
    });
    res.json(rows);
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM area_articles WHERE slug = ? AND published = 1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ message: 'Article not found' });
    const article = rows[0];
    if (typeof article.highlights === 'string') { try { article.highlights = JSON.parse(article.highlights); } catch { article.highlights = []; } }
    if (typeof article.highlights_ar === 'string') { try { article.highlights_ar = JSON.parse(article.highlights_ar); } catch { article.highlights_ar = []; } }
    res.json(article);
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { search, published, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 25;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(title LIKE ? OR title_ar LIKE ? OR slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (published !== undefined && published !== '') {
      conditions.push('published = ?');
      params.push(parseInt(published));
    }
    if (conditions.length > 0) {
      where = ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM area_articles${where}`, params);
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM area_articles${where} ORDER BY id LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    rows.forEach(r => {
      if (typeof r.highlights === 'string') { try { r.highlights = JSON.parse(r.highlights); } catch { r.highlights = []; } }
      if (typeof r.highlights_ar === 'string') { try { r.highlights_ar = JSON.parse(r.highlights_ar); } catch { r.highlights_ar = []; } }
    });
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { slug, title, title_ar, subtitle, subtitle_ar, content, content_ar, highlights, highlights_ar, ideal_for, ideal_for_ar, why_in_demand, why_in_demand_ar, image_url, keywords, keywords_ar, published } = req.body;
    if (!slug || !title) return res.status(400).json({ message: 'Slug and title are required' });
    const h = highlights ? (typeof highlights === 'string' ? highlights : JSON.stringify(highlights)) : '[]';
    const h_ar = highlights_ar ? (typeof highlights_ar === 'string' ? highlights_ar : JSON.stringify(highlights_ar)) : '[]';
    await pool.query(
      'INSERT INTO area_articles (slug, title, title_ar, subtitle, subtitle_ar, content, content_ar, highlights, highlights_ar, ideal_for, ideal_for_ar, why_in_demand, why_in_demand_ar, image_url, keywords, keywords_ar, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, title, title_ar || '', subtitle || '', subtitle_ar || '', content || '', content_ar || '', h, h_ar, ideal_for || '', ideal_for_ar || '', why_in_demand || '', why_in_demand_ar || '', image_url || '', keywords || '', keywords_ar || '', published ?? 1]
    );
    res.status(201).json({ message: 'Article created' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slug, title, title_ar, subtitle, subtitle_ar, content, content_ar, highlights, highlights_ar, ideal_for, ideal_for_ar, why_in_demand, why_in_demand_ar, image_url, keywords, keywords_ar, published } = req.body;
    const h = highlights ? (typeof highlights === 'string' ? highlights : JSON.stringify(highlights)) : undefined;
    const h_ar = highlights_ar ? (typeof highlights_ar === 'string' ? highlights_ar : JSON.stringify(highlights_ar)) : undefined;
    await pool.query(
      `UPDATE area_articles SET
        slug = COALESCE(?, slug), title = COALESCE(?, title), title_ar = COALESCE(?, title_ar),
        subtitle = COALESCE(?, subtitle), subtitle_ar = COALESCE(?, subtitle_ar),
        content = COALESCE(?, content), content_ar = COALESCE(?, content_ar),
        highlights = COALESCE(?, highlights), highlights_ar = COALESCE(?, highlights_ar),
        ideal_for = COALESCE(?, ideal_for), ideal_for_ar = COALESCE(?, ideal_for_ar),
        why_in_demand = COALESCE(?, why_in_demand), why_in_demand_ar = COALESCE(?, why_in_demand_ar),
        image_url = COALESCE(?, image_url), keywords = COALESCE(?, keywords), keywords_ar = COALESCE(?, keywords_ar),
        published = COALESCE(?, published)
      WHERE id = ?`,
      [slug, title, title_ar, subtitle, subtitle_ar, content, content_ar, h, h_ar, ideal_for, ideal_for_ar, why_in_demand, why_in_demand_ar, image_url, keywords, keywords_ar, published, id]
    );
    res.json({ message: 'Article updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM area_articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted' });
  } catch (err) { next(err); }
};
