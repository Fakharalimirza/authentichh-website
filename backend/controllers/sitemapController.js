const pool = require('../config/db');

// Public site base URL — override via SITE_URL in backend/.env if the domain changes.
const BASE_URL = (process.env.SITE_URL || 'https://authenticholidayhomes.ae').replace(/\/+$/, '');

// Static public pages only — never add admin/private routes here.
const STATIC_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/apartments', priority: '0.9' },
  { path: '/contact', priority: '0.8' },
  { path: '/about', priority: '0.7' },
  { path: '/list-your-property', priority: '0.7' },
  { path: '/facilities', priority: '0.6' },
  { path: '/terms', priority: '0.4' },
  { path: '/privacy', priority: '0.4' },
];

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDateOnly = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

exports.generate = async (req, res, next) => {
  try {
    const [listings] = await pool.query(
      'SELECT slug, updated_at FROM listings WHERE status = ? ORDER BY id',
      ['published']
    );
    const [articles] = await pool.query(
      'SELECT slug, updated_at FROM area_articles WHERE published = 1 ORDER BY id'
    );

    const urls = [];

    for (const page of STATIC_PAGES) {
      urls.push({ loc: BASE_URL + page.path, priority: page.priority });
    }

    for (const prop of listings) {
      urls.push({
        loc: `${BASE_URL}/apartments/${encodeURIComponent(prop.slug)}`,
        priority: '0.8',
        lastmod: toDateOnly(prop.updated_at),
      });
    }

    for (const art of articles) {
      urls.push({
        loc: `${BASE_URL}/areas/${encodeURIComponent(art.slug)}`,
        priority: '0.8',
        lastmod: toDateOnly(art.updated_at),
      });
    }

    const entries = urls
      .map((u) => {
        let entry = `  <url><loc>${escapeXml(u.loc)}</loc>`;
        if (u.lastmod) entry += `<lastmod>${u.lastmod}</lastmod>`;
        entry += `<priority>${u.priority}</priority></url>`;
        return entry;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};