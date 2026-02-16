// Cherokee Bank - Geo-Blocking Middleware (OFAC Sanctioned Countries)

// ISO 3166-1 alpha-2 country codes for sanctioned regions
const SANCTIONED_COUNTRIES = new Set([
  'CU', // Cuba
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'RU', // Russia (partial)
]);

/**
 * Check if a country is sanctioned/blocked
 */
export function isBlockedCountry(countryCode: string): boolean {
  return SANCTIONED_COUNTRIES.has(countryCode.toUpperCase());
}

/**
 * Extract country from Cloudflare/Vercel headers
 */
export function getCountryFromHeaders(headers: Headers): string | null {
  return (
    headers.get('cf-ipcountry') ||
    headers.get('x-vercel-ip-country') ||
    null
  );
}

/**
 * Check if request should be geo-blocked
 */
export function shouldGeoBlock(headers: Headers): boolean {
  const country = getCountryFromHeaders(headers);
  if (!country) return false; // Allow if country cannot be determined
  return isBlockedCountry(country);
}
