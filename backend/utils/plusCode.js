const { OpenLocationCode } = require('open-location-code');

// Reference point used to expand short (local) plus codes into full ones.
// Dubai city centre.
const DUBAI_REFERENCE = { latitude: 25.2048, longitude: 55.2708 };

/**
 * Convert a Google plus code to latitude/longitude.
 * Handles both full codes (8+ digits) and short codes (needs reference area).
 * Accepts an optional locality suffix, e.g. "6CC5+R6 Dubai".
 *
 * @param {string} plusCode
 * @param {number} [refLat] reference latitude for short codes
 * @param {number} [refLng] reference longitude for short codes
 * @returns {{ latitude: number, longitude: number } | null}
 */
function plusCodeToLatLng(plusCode, refLat = DUBAI_REFERENCE.latitude, refLng = DUBAI_REFERENCE.longitude) {
  if (!plusCode || typeof plusCode !== 'string') return null;

  const code = plusCode.trim().split(/\s+/)[0];
  if (!code) return null;

  try {
    const olc = new OpenLocationCode();
    let fullCode = code;

    if (olc.isShort(code)) {
      fullCode = olc.recoverNearest(code, refLat, refLng);
    } else if (!olc.isValid(code)) {
      return null;
    }

    const decoded = olc.decode(fullCode);
    return {
      latitude: decoded.latitudeCenter,
      longitude: decoded.longitudeCenter,
    };
  } catch (err) {
    return null;
  }
}

module.exports = { plusCodeToLatLng };
