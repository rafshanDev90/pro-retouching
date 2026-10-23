import api from './api';

/**
 * Public site API access layer.
 * - Thin wrappers over the shared axios instance (VITE_API_URL only, no secrets).
 * - Every GET is memoized in a 60s in-memory session cache so the Navbar,
 *   Footer and page sections don't refetch the same content on navigation.
 * - All endpoints return the standard envelope { success, message, data };
 *   these helpers resolve to the `data` payload directly.
 * - Requests time out after 8s so a down backend can never hang a page.
 */

const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 8_000;

const cache = new Map();

async function cachedGet(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  const res = await api.get(path, { timeout: REQUEST_TIMEOUT_MS });
  const data = res.data?.data;
  cache.set(path, { ts: Date.now(), data });
  return data;
}

/** Drop all cached public content (used after admin edits in the same tab). */
export function clearPublicCache() {
  cache.clear();
}

/** Clear the public cache and refetch mounted public queries after an admin write. */
export function refreshPublicContent(queryClient) {
  clearPublicCache();
  if (queryClient && typeof queryClient.invalidateQueries === 'function') {
    void queryClient.invalidateQueries({ queryKey: ['public'] });
  }
}

/* ----------------------------- content GETs ----------------------------- */

export function fetchSlides() {
  return cachedGet('/public/slides');
}

export function fetchServices() {
  return cachedGet('/public/services');
}

export async function fetchServiceBySlug(slug) {
  const res = await api.get(`/public/services/${encodeURIComponent(slug)}`, {
    timeout: REQUEST_TIMEOUT_MS,
  });
  return res.data?.data ?? null;
}

export function fetchWorks() {
  return cachedGet('/public/works');
}

export function fetchPricing() {
  return cachedGet('/public/pricing');
}

export function fetchStats() {
  return cachedGet('/public/stats');
}

export function fetchLogos() {
  return cachedGet('/public/logos');
}

export function fetchFaqs() {
  return cachedGet('/public/faqs');
}

export function fetchTestimonials() {
  return cachedGet('/public/testimonials');
}

export function fetchSettings() {
  return cachedGet('/public/settings');
}

/* ------------------------------ lead POSTs ------------------------------ */

/** POST /public/quote — { service, quantity, email } */
export async function postQuote(payload) {
  const res = await api.post('/public/quote', payload, { timeout: REQUEST_TIMEOUT_MS });
  return res.data;
}

/** POST /public/contact — { name, email, phone, service, message } */
export async function postContact(payload) {
  const res = await api.post('/public/contact', payload, { timeout: REQUEST_TIMEOUT_MS });
  return res.data;
}

/** POST /public/free-test — multipart FormData (name, email, whatsapp, service, files[]). */
export async function postFreeTest(formData) {
  const res = await api.post('/public/free-test', formData, {
    timeout: 30_000,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export default {
  fetchSlides,
  fetchServices,
  fetchServiceBySlug,
  fetchWorks,
  fetchPricing,
  fetchStats,
  fetchLogos,
  fetchFaqs,
  fetchTestimonials,
  fetchSettings,
  postQuote,
  postContact,
  postFreeTest,
  clearPublicCache,
  refreshPublicContent,
};
