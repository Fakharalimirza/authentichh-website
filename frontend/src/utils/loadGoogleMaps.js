/**
 * Load the Google Maps JavaScript API via a plain script tag.
 * Mirrors the proven-working test HTML exactly.
 *
 * @param {string} apiKey
 * @returns {Promise<google.maps.MapClass>} resolves with `window.google`
 */
let loadPromise = null;

export function loadGoogleMaps(apiKey) {
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key missing'));
  }

  // Already loaded?
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  // In-flight load? Return existing promise.
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__ahmMapCallback_' + Date.now();

    window[callbackName] = () => {
      // Google SDK is now available on window.google
      resolve(window.google);
      cleanup();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=marker&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('Failed to load Google Maps JavaScript API script'));
    };

    document.head.appendChild(script);

    function cleanup() {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
  });

  return loadPromise;
}