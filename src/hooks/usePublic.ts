import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
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
} from '../lib/publicApi';
import { heroSlides } from '../data/heroSlides';
import {
  COMPANY_INFO,
  SERVICES_LIST,
  PORTFOLIO_WORKS,
  PRICING_PLANS,
  SNEAK_PEEK_COUNTERS,
  MARKETPLACE_LOGOS,
  FAQ_ITEMS,
  WHY_CHOOSE_ITEMS,
  PRICE_STATS_STRIP,
} from '../data/constants';

/**
 * Public content hooks.
 *
 * Every hook returns { data, loading, error } and ALWAYS resolves to usable
 * content: if the API is down, times out, or returns an empty list, the
 * static data from src/data keeps the site fully rendered (Phase 5 rule:
 * backend-down must never blank a page).
 */

export interface HeroSlide {
  image: string;
  alt: string;
}

export interface PublicService {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: string;
  startingPrice: string;
  turnaround: string;
  bullets: string[];
  image: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export interface PublicWork {
  id: string;
  title: string;
  category: string;
  service: string;
  description: string;
  image: string;
  beforeImage: string;
  afterImage: string;
  turnaround: string;
  clientType: string;
}

export interface PublicPlan {
  id: string;
  title: string;
  price: string;
  unit: string;
  popular: boolean;
  description: string;
  features: string[];
  bestFor: string;
}

export interface PublicStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export interface PublicLogo {
  id: string;
  name: string;
  label: string;
  image: string;
}

export interface PublicFaq {
  question: string;
  answer: string;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
}

export interface PublicSettings {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  skype: string;
  facebook: string;
  linkedin: string;
  footerText: string;
  aboutText: string;
  whyChoose: { title: string; desc: string }[];
  priceHighlights: { title: string; subtitle: string }[];
}

const QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
};

/** Fetch `fetcher`, falling back when it errors or yields an empty list. */
function useContentQuery<T>(key: readonly unknown[], fetcher: () => Promise<unknown>, fallback: T) {
  const query = useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      try {
        const result = await fetcher();
        if (Array.isArray(result) && result.length === 0) return fallback;
        if (result == null) return fallback;
        return result as T;
      } catch {
        return fallback;
      }
    },
    // React Query v5 cannot express `() => T` for an unresolved generic — cast once here.
    placeholderData: (() => fallback) as any,
    ...QUERY_OPTIONS,
  });
  return { data: (query.data ?? fallback) as T, loading: query.isLoading, error: query.error ?? null };
}

/* ------------------------------ mappers -------------------------------- */

const staticServiceBySlug = new Map<string, PublicService>(
  (SERVICES_LIST as unknown as PublicService[]).map((s) => [s.slug, s])
);
const staticWorkByTitle = new Map<string, PublicWork>(
  (PORTFOLIO_WORKS as unknown as PublicWork[]).map((w) => [w.title, w])
);
const staticPlanByTitle = new Map<string, PublicPlan>(
  (PRICING_PLANS as unknown as PublicPlan[]).map((p) => [p.title, p])
);
const staticStatByLabel = new Map<string, PublicStat>(
  (SNEAK_PEEK_COUNTERS as unknown as PublicStat[]).map((s) => [s.label, s])
);
const staticLogoByName = new Map<string, PublicLogo>(
  (MARKETPLACE_LOGOS as unknown as PublicLogo[]).map((l) => [l.name, l])
);

/** API Service doc → frontend ServiceItem (static fills display-only fields). */
function mapService(doc: any): PublicService {
  const base = staticServiceBySlug.get(doc.slug);
  return {
    id: doc.slug,
    slug: doc.slug,
    title: doc.title,
    shortDesc: doc.shortDesc || base?.shortDesc || '',
    fullDesc: doc.description || base?.fullDesc || '',
    category: base?.category || 'Post-Production',
    startingPrice: base?.startingPrice || '',
    turnaround: base?.turnaround || '12-24 Hours',
    bullets: doc.bullets?.length ? doc.bullets : base?.bullets || [],
    image: doc.image || base?.image || '',
    beforeImage: doc.beforeImage || doc.image || base?.beforeImage || '',
    afterImage: doc.afterImage || doc.image || base?.afterImage || '',
    beforeLabel: base?.beforeLabel,
    afterLabel: base?.afterLabel,
  };
}

/** API Work doc → portfolio card shape used by OurWorks. */
function mapWork(doc: any, index: number): PublicWork {
  const base = staticWorkByTitle.get(doc.title);
  return {
    id: doc._id || `work-${index}`,
    title: doc.title,
    category: doc.category || base?.category || 'Clipping Path',
    service: base?.service || '',
    description: base?.description || '',
    image: doc.beforeImage || doc.afterImage || base?.image || '',
    beforeImage: doc.beforeImage || doc.afterImage || base?.image || '',
    afterImage: doc.afterImage || doc.beforeImage || base?.image || '',
    turnaround: base?.turnaround || '12 Hours',
    clientType: base?.clientType || 'E-commerce Brand',
  };
}

/** API PricingPlan doc → pricing card shape used by Pricing. */
function mapPricingPlan(doc: any, index: number): PublicPlan {
  const base = staticPlanByTitle.get(doc.name);
  return {
    id: doc._id || `plan-${index}`,
    title: doc.name,
    price: doc.price,
    unit: doc.unit || 'per image',
    popular: Boolean(doc.isPopular),
    description: base?.description || '',
    features: doc.features?.length ? doc.features : base?.features || [],
    bestFor: base?.bestFor || '',
  };
}

/** API Stat doc → animated counter shape. */
function mapStat(doc: any, index: number): PublicStat {
  const base = staticStatByLabel.get(doc.label);
  return {
    id: doc._id || `stat-${index}`,
    value: doc.value,
    suffix: doc.suffix || '',
    label: doc.label,
    description: base?.description || '',
  };
}

/** API ClientLogo doc → logo strip shape (image optional; text card otherwise). */
function mapLogo(doc: any, index: number): PublicLogo {
  const base = staticLogoByName.get(doc.name);
  return {
    id: doc._id || `logo-${index}`,
    name: doc.name,
    label: base?.label || 'Trusted Partner',
    image: doc.image || '',
  };
}

/** API settings doc → settings object merged over COMPANY_INFO defaults. */
function mapSettings(doc: any): PublicSettings {
  const s = doc || {};
  const social = s.social || {};
  return {
    siteName: s.siteName || COMPANY_INFO.name,
    tagline: s.tagline || COMPANY_INFO.tagline,
    phone: s.phone || COMPANY_INFO.phone,
    whatsapp: s.whatsapp || COMPANY_INFO.whatsapp,
    email: s.email || COMPANY_INFO.email,
    address: s.address || COMPANY_INFO.address,
    skype: social.skype || COMPANY_INFO.skype,
    facebook: social.facebook || '',
    linkedin: social.linkedin || '',
    footerText: s.footerText || '',
    aboutText: s.aboutText || '',
    whyChoose:
      Array.isArray(s.whyChoose) && s.whyChoose.length > 0 ? s.whyChoose : WHY_CHOOSE_ITEMS,
    priceHighlights:
      Array.isArray(s.priceHighlights) && s.priceHighlights.length > 0
        ? s.priceHighlights.map((h: any) => ({
            title: h.value ? `${h.title}: ${h.value}` : h.title,
            subtitle: h.subtext || '',
          }))
        : PRICE_STATS_STRIP,
  };
}

/* -------------------------------- hooks -------------------------------- */

export function useSlides(): { slides: HeroSlide[]; loading: boolean; error: unknown } {
  const fallback = heroSlides as HeroSlide[];
  const { data, loading, error } = useContentQuery<HeroSlide[]>(
    ['public', 'slides'],
    fetchSlides,
    fallback
  );
  const slides = useMemo<HeroSlide[]>(
    () =>
      Array.isArray(data)
        ? data.map((doc) => ({ image: doc.image, alt: doc.alt || 'Pro Retouching' }))
        : fallback,
    [data, fallback]
  );
  return { slides, loading, error };
}

export function useServices(): { services: PublicService[]; loading: boolean; error: unknown } {
  const fallback = SERVICES_LIST as unknown as PublicService[];
  const { data, loading, error } = useContentQuery<PublicService[]>(
    ['public', 'services'],
    async () => {
      const docs = await fetchServices();
      return Array.isArray(docs) ? docs.map(mapService) : docs;
    },
    fallback
  );
  return { services: data, loading, error };
}

/** Single service by slug. `service` is null only when the API definitively 404s. */
export function useService(slug: string | undefined): {
  service: PublicService | null;
  loading: boolean;
  error: unknown;
} {
  const fallback = useMemo<PublicService | null>(
    () => (slug ? staticServiceBySlug.get(slug) || null : null),
    [slug]
  );
  const query = useQuery<PublicService | null>({
    queryKey: ['public', 'service', slug],
    queryFn: async () => {
      try {
        const doc = await fetchServiceBySlug(slug as string);
        return doc ? mapService(doc) : null;
      } catch (error: any) {
        if (error?.response?.status === 404) return null;
        return fallback;
      }
    },
    enabled: Boolean(slug),
    placeholderData: () => fallback,
    ...QUERY_OPTIONS,
  });
  return { service: query.data ?? fallback, loading: query.isLoading, error: query.error ?? null };
}

export function useWorks(): { works: PublicWork[]; loading: boolean; error: unknown } {
  const fallback = PORTFOLIO_WORKS as unknown as PublicWork[];
  const { data, loading, error } = useContentQuery<PublicWork[]>(
    ['public', 'works'],
    async () => {
      const docs = await fetchWorks();
      return Array.isArray(docs) ? docs.map(mapWork) : docs;
    },
    fallback
  );
  return { works: data, loading, error };
}

export function usePricing(): { plans: PublicPlan[]; loading: boolean; error: unknown } {
  const fallback = PRICING_PLANS as unknown as PublicPlan[];
  const { data, loading, error } = useContentQuery<PublicPlan[]>(
    ['public', 'pricing'],
    async () => {
      const docs = await fetchPricing();
      return Array.isArray(docs) ? docs.map(mapPricingPlan) : docs;
    },
    fallback
  );
  return { plans: data, loading, error };
}

export function useStats(): { stats: PublicStat[]; loading: boolean; error: unknown } {
  const fallback = SNEAK_PEEK_COUNTERS as unknown as PublicStat[];
  const { data, loading, error } = useContentQuery<PublicStat[]>(
    ['public', 'stats'],
    async () => {
      const docs = await fetchStats();
      return Array.isArray(docs) ? docs.map(mapStat) : docs;
    },
    fallback
  );
  return { stats: data, loading, error };
}

export function useLogos(): { logos: PublicLogo[]; loading: boolean; error: unknown } {
  const fallback = MARKETPLACE_LOGOS as unknown as PublicLogo[];
  const { data, loading, error } = useContentQuery<PublicLogo[]>(
    ['public', 'logos'],
    async () => {
      const docs = await fetchLogos();
      return Array.isArray(docs) ? docs.map(mapLogo) : docs;
    },
    fallback
  );
  return { logos: data, loading, error };
}

export function useFaqs(): { faqs: PublicFaq[]; loading: boolean; error: unknown } {
  const fallback = FAQ_ITEMS as unknown as PublicFaq[];
  const { data, loading, error } = useContentQuery<PublicFaq[]>(
    ['public', 'faqs'],
    async () => {
      const docs = await fetchFaqs();
      return Array.isArray(docs)
        ? docs.map((doc: any) => ({ question: doc.question, answer: doc.answer }))
        : docs;
    },
    fallback
  );
  return { faqs: data, loading, error };
}

export function useTestimonials(): {
  testimonials: PublicTestimonial[];
  loading: boolean;
  error: unknown;
} {
  const fallback = useMemo<PublicTestimonial[]>(() => [], []);
  const { data, loading, error } = useContentQuery<PublicTestimonial[]>(
    ['public', 'testimonials'],
    async () => {
      const docs = await fetchTestimonials();
      return Array.isArray(docs)
        ? docs.map((doc: any) => ({
            id: doc._id,
            name: doc.name,
            role: doc.role || '',
            text: doc.text,
          }))
        : docs;
    },
    fallback
  );
  return { testimonials: data, loading, error };
}

export function useSettings(): { settings: PublicSettings; loading: boolean; error: unknown } {
  const fallback = useMemo<PublicSettings>(() => mapSettings(null), []);
  const { data, loading, error } = useContentQuery<PublicSettings>(
    ['public', 'settings'],
    fetchSettings,
    fallback
  );
  const settings = useMemo<PublicSettings>(() => mapSettings(data), [data]);
  return { settings, loading, error };
}
