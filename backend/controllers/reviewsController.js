const db = require('../config/db');

const REFRESH_DAYS = 7;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = 'ChIJ5XUV4PtDXz4RRCLvZO620fo';

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

// ─── OAuth ─────────────────────────────────────

exports.auth = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

exports.authCallback = async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Google auth error: ${error}`);
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) throw new Error('No refresh_token in response');

    await db.query(
      `UPDATE reviews_cache SET refresh_token = ? WHERE cache_key = 'google'`,
      [tokens.refresh_token]
    );

    const accessToken = tokens.access_token;
    const accRes = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accData = await accRes.json();
    const accountName = accData.accounts?.[0]?.name;
    if (!accountName) throw new Error('No Business Profile account found');

    const locRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${accountName}/locations?pageSize=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const locData = await locRes.json();
    const locationName = locData.locations?.[0]?.name;
    if (!locationName) throw new Error('No Business Profile location found');

    await db.query(
      `UPDATE reviews_cache SET account_name = ?, location_name = ? WHERE cache_key = 'google'`,
      [accountName, locationName]
    );

    const fresh = await fetchFromBusinessProfile();
    await saveToDb(fresh);

    res.send(
      '<h2>Google Business Profile connected successfully!</h2>' +
      '<p>Reviews fetched and cached. You can close this tab.</p>' +
      '<p><a href="/api/reviews">View reviews API response</a></p>'
    );
  } catch (err) {
    res.status(500).send(`Setup failed: ${err.message}`);
  }
};

// ─── Business Profile API ──────────────────────

async function fetchFromBusinessProfile() {
  const [rows] = await db.query(
    "SELECT refresh_token, account_name, location_name FROM reviews_cache WHERE cache_key = 'google'"
  );
  if (!rows.length || !rows[0].refresh_token) throw new Error('Business Profile not connected');

  const { refresh_token, account_name, location_name } = rows[0];

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) throw new Error('Failed to refresh access token');

  let accName = account_name;
  let locName = location_name;

  if (!accName || !locName) {
    const accRes = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accData = await accRes.json();
    accName = accData.accounts?.[0]?.name;
    if (!accName) throw new Error('No Business Profile account found');

    const locRes = await fetch(
      `https://mybusiness.googleapis.com/v4/${accName}/locations?pageSize=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const locData = await locRes.json();
    locName = locData.locations?.[0]?.name;
    if (!locName) throw new Error('No Business Profile location found');

    await db.query(
      `UPDATE reviews_cache SET account_name = ?, location_name = ? WHERE cache_key = 'google'`,
      [accName, locName]
    );
  }

  const allReviews = [];
  let nextPageToken = null;

  do {
    let url = `https://mybusiness.googleapis.com/v4/${locName}/reviews?pageSize=50`;
    if (nextPageToken) url += `&pageToken=${encodeURIComponent(nextPageToken)}`;

    const revRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const revData = await revRes.json();

    if (revData.reviews) {
      allReviews.push(...revData.reviews);
    }
    nextPageToken = revData.nextPageToken || null;
  } while (nextPageToken && allReviews.length < 100);

  const fiveStar = allReviews
    .filter(r => r.starRating === 'FIVE')
    .map(r => ({
      author_name: r.reviewer?.displayName || 'Anonymous',
      profile_photo_url: null,
      rating: 5,
      text: r.comment || '',
      relative_time_description: relativeTime(r.createTime),
      original_time: r.createTime,
    }));

  return {
    rating: 5.0,
    total_ratings: fiveStar.length,
    reviews: fiveStar,
    source: 'business_profile',
  };
}

// ─── Places API (fallback) ─────────────────────

async function fetchFromPlaces() {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') throw new Error(`Google API error: ${data.status}`);

  const fiveStar = (data.result.reviews || [])
    .filter(r => r.rating === 5)
    .map(r => ({
      ...r,
      profile_photo_url: r.profile_photo_url
        ? `/api/reviews/avatar?url=${encodeURIComponent(r.profile_photo_url)}`
        : null,
    }));

  return {
    rating: data.result.rating,
    total_ratings: data.result.user_ratings_total,
    reviews: fiveStar,
    source: 'places',
  };
}

// ─── DB helpers ────────────────────────────────

async function saveToDb(result) {
  await db.query(
    `UPDATE reviews_cache SET data = ?, rating = ?, total_ratings = ?, fetched_at = NOW() WHERE cache_key = 'google'`,
    [JSON.stringify(result.reviews), result.rating, result.total_ratings]
  );
}

async function loadFromDb() {
  const [rows] = await db.query(
    "SELECT data, rating, total_ratings, fetched_at, refresh_token FROM reviews_cache WHERE cache_key = 'google'"
  );
  if (!rows.length) return null;
  return {
    rating: rows[0].rating,
    total_ratings: rows[0].total_ratings,
    reviews: JSON.parse(rows[0].data || '[]'),
    fetched_at: rows[0].fetched_at,
    has_token: !!rows[0].refresh_token,
  };
}

async function fetchBest() {
  const cached = await loadFromDb();
  if (!cached) {
    const fresh = await fetchFromPlaces();
    await saveToDb(fresh);
    return fresh;
  }

  const age = (Date.now() - new Date(cached.fetched_at).getTime()) / (1000 * 60 * 60 * 24);

  if (age < REFRESH_DAYS) {
    return { rating: cached.rating, total_ratings: cached.total_ratings, reviews: cached.reviews };
  }

  if (cached.has_token) {
    try {
      const fresh = await fetchFromBusinessProfile();
      await saveToDb(fresh);
      return fresh;
    } catch (bpErr) {
      console.warn('Business Profile API failed, falling back to Places:', bpErr.message);
    }
  }

  try {
    const fresh = await fetchFromPlaces();
    await saveToDb(fresh);
    return fresh;
  } catch (placesErr) {
    console.warn('Places API also failed, returning stale cache:', placesErr.message);
    return { rating: cached.rating, total_ratings: cached.total_ratings, reviews: cached.reviews };
  }
}

// ─── Exports ───────────────────────────────────

exports.getReviews = async (req, res) => {
  try {
    const result = await fetchBest();
    res.json(result);
  } catch (err) {
    res.status(502).json({ message: 'Failed to fetch reviews' });
  }
};

exports.refreshReviews = async (req, res) => {
  try {
    const cached = await loadFromDb();
    let fresh;

    if (cached?.has_token) {
      fresh = await fetchFromBusinessProfile();
    } else {
      fresh = await fetchFromPlaces();
    }

    await saveToDb(fresh);
    res.json({ refreshed: true, source: fresh.source, reviews: fresh.reviews.length });
  } catch (err) {
    res.status(502).json({ message: 'Refresh failed', error: err.message });
  }
};

exports.getAvatar = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).end();

  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.end(buffer);
  } catch {
    res.status(404).end();
  }
};
