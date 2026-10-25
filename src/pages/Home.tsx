import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Tag,
  Percent,
  Zap,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Sliders,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';
import {
  ASSET_HERO,
  ASSET_STUDIO,
  ASSET_SWEATER,
  ASSET_SNEAKER,
  ASSET_BOTTLE,
} from '../data/constants';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { SafeImage } from '../components/SafeImage';
import { HeroSlider } from '../components/HeroSlider';
import { WorkCard } from '../components/WorkCard';
import { useToast } from '../components/Toast';
import { SkeletonGrid } from '../components/Skeleton';
import { useSlides, useServices, useLogos, useStats, useSettings, useWorks } from '../hooks/usePublic';
import { postQuote } from '../lib/publicApi';
import { getApiErrorMessage } from '../lib/api';

export const Home: React.FC = () => {
  const { showToast } = useToast();

  // Live content (static fallbacks are baked into the hooks)
  const { slides } = useSlides();
  const { services } = useServices();
  const { logos } = useLogos();
  const { stats } = useStats();
  const { settings } = useSettings();
  const { works: worksData, loading: loadingWorks } = useWorks();

  // Quote Form State
  const [quoteService, setQuoteService] = useState('clipping-path');
  const [quoteQuantity, setQuoteQuantity] = useState('50');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quoteHoneypot, setQuoteHoneypot] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteEmail) {
      showToast({ title: 'Please enter your email', type: 'error' });
      return;
    }
    // Honeypot: bots fill hidden fields — pretend success and bail.
    if (quoteHoneypot) {
      showToast({ title: 'Quote Request Sent!', type: 'success' });
      setQuoteEmail('');
      return;
    }
    setIsSubmittingQuote(true);
    try {
      await postQuote({
        service: quoteService,
        quantity: quoteQuantity,
        email: quoteEmail,
      });
      showToast({
        title: 'Quote Request Sent!',
        message: `We received your request for ${quoteQuantity} images. Our project team will email your custom rate within 30 minutes.`,
        type: 'success',
      });
      setQuoteEmail('');
    } catch (error) {
      showToast({
        title: 'Could not send quote request',
        message: getApiErrorMessage(error, 'Please try again in a moment.'),
        type: 'error',
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Primary 7 showcase services as required by section 6
  const showcaseServices = services.slice(0, 7);

  // First 6 portfolio works for the Home preview section
  const previewWorks = worksData.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* =========================================================================
          SECTION 1: HERO (full-width background image slider)
          ========================================================================= */}
      <section className="relative overflow-hidden">
        {/* Full-bleed crossfading image slider with static content centered above it */}
        <HeroSlider slides={slides} className="min-h-[70vh] lg:min-h-[max(80vh,520px)]">
          <div className="w-full max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Premier Image Post-Production Studio</span>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.12] text-white drop-shadow-[0_2px_16px_rgba(15,42,85,0.45)]">
              <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 bg-clip-text text-transparent font-light">
                Effortless
              </span>{' '}
              Image Editing
            </h1>

            <div className="mt-4 flex flex-col items-center">
              <p className="text-base sm:text-lg lg:text-xl font-medium text-white">
                The <strong className="font-extrabold">Matchless</strong> Image Post-production Service for E-commerce Sellers
              </p>
              {/* Hand-drawn curved underline */}
              <svg
                className="mt-1.5 w-44 text-orange-400 sm:w-60"
                viewBox="0 0 240 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 12C52 4 110 2 160 5c26 1.6 50 4.6 74 9"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M18 16c48-5 100-6.5 144-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </div>

            <p className="mt-5 mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-white/85">
              Outsource your high-volume e-commerce catalogs to dedicated Photoshop specialists in Bangladesh. Hand-drawn clipping paths, ghost mannequins, skin retouching, and shadow creation with guaranteed 24-hour turnaround.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/free-test"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white font-semibold text-base rounded-full shadow-lg shadow-orange-600/40 hover:shadow-orange-500/60 hover:scale-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Free Trial (2–3 Images)</span>
              </Link>

              <Link
                to="/services"
                className="w-full sm:w-auto px-7 py-4 bg-white/10 backdrop-blur-md text-white font-semibold text-base rounded-full border border-white/40 hover:bg-white/20 hover:border-white/60 transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
            </div>

            {/* Trust markers */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/85 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Hand-Drawn Paths</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Fast 12–24h Turnaround</span>
              </div>
            </div>
          </div>
        </HeroSlider>

        {/* Existing hero supporting content kept below the slider */}
        <div className="bg-gradient-to-b from-white via-amber-50/40 to-white border-b border-slate-100 py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto relative flex justify-center items-center py-6">
              <div className="relative w-full max-w-lg aspect-square">
                {/* Background glow card */}
                <div className="absolute inset-4 bg-gradient-to-tr from-amber-400/20 via-orange-400/20 to-red-400/10 rounded-3xl transform rotate-3 filter blur-xl" />

                {/* Central main hero card: luxury bag & shoes collage */}
                <div className="absolute top-4 left-4 right-4 bottom-16 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 z-10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50">
                    <SafeImage
                      src={ASSET_HERO}
                      alt="Commercial e-commerce products before and after post production"
                      fallbackLabel="E-Commerce Hero Products"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Commercial Ready</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase">
                      Studio Edit
                    </div>
                  </div>
                </div>

                {/* Tilted Floating Card 1 (Top Right): Ghost Mannequin Sweater */}
                <div className="absolute -top-4 -right-4 w-40 sm:w-44 bg-white p-2.5 rounded-xl shadow-xl border border-slate-100 z-20 transform rotate-6 hover:rotate-3 transition-transform duration-300">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-50">
                    <SafeImage
                      src={ASSET_SWEATER}
                      alt="Ghost Mannequin apparel item"
                      fallbackLabel="Ghost Mannequin Sweater"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0F2A55] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Neck Joint
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      After
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 mt-1.5 text-center truncate">
                    Ghost Mannequin
                  </p>
                </div>

                {/* Tilted Floating Card 2 (Bottom Left): Footwear Sneaker */}
                <div className="absolute -bottom-6 -left-4 w-44 sm:w-48 bg-white p-2.5 rounded-xl shadow-xl border border-slate-100 z-20 transform -rotate-6 hover:-rotate-2 transition-transform duration-300">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-50">
                    <SafeImage
                      src={ASSET_SNEAKER}
                      alt="Retouched footwear sneaker"
                      fallbackLabel="Sneaker Retouch"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Clipping Path
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      After
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 mt-1.5 text-center truncate">
                    Sneaker Isolation
                  </p>
                </div>

                {/* Floating Badge (Bottom Right): Bottle Reflection */}
                <div className="absolute bottom-2 -right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 z-20 flex items-center gap-2.5 transform rotate-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <SafeImage
                      src={ASSET_BOTTLE}
                      alt="Cosmetic bottle"
                      fallbackLabel="Cosmetic Bottle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Mirror Reflection</p>
                    <p className="text-[10px] text-amber-600 font-semibold">$0.40 / image</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client / Marketplace Logo Placeholders */}
            <div className="mt-16 pt-8 border-t border-slate-200/80">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-600 mb-6">
                Tailored for Top Marketplace Standards & Sellers Worldwide
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
                {logos.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="px-5 py-2.5 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-amber-300 transition-all text-slate-600 hover:text-[#0F2A55] text-center w-full max-w-[160px]"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-8 mx-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-heading font-extrabold text-sm tracking-tight block">
                        {item.name}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600 font-medium block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ABOUT US
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Image with rounded frame and floating experience badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 h-[420px]">
                <SafeImage
                  src={ASSET_STUDIO}
                  alt="Pro Retouching digital studio workspace in Bangladesh"
                  fallbackLabel="Dhaka Studio Workspace"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Experience Badge */}
              <div className="absolute -bottom-6 -right-4 sm:bottom-6 sm:-right-6 bg-gradient-to-br from-[#0F2A55] to-[#1A3E75] text-white p-5 rounded-2xl shadow-2xl border-2 border-white max-w-[210px] text-center">
                <div className="text-3xl font-heading font-extrabold text-amber-400">10+ Years</div>
                <p className="text-xs font-semibold text-slate-100 mt-1">
                  Dedicated Commercial Post-Production Studio
                </p>
                <div className="mt-2 pt-2 border-t border-blue-800/80 text-[10px] text-blue-200">
                  100,000+ images delivered
                </div>
              </div>
            </div>

            {/* Right: Heading, original paragraph, and Read More button */}
            <div className="lg:col-span-7 space-y-6 lg:pl-6">
              <div className="inline-flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-6 h-0.5 bg-amber-500" />
                <span>Who We Are</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
                About Pro Retouching
              </h2>

              <p className="text-slate-600 text-base leading-relaxed">
                {settings.aboutText ||
                  'Pro Retouching is a premier offshore e-commerce photo editing and post-production studio operating from Dhaka, Bangladesh. We empower fast-growing online brands, digital retailers, photo studios, and advertising agencies across the United States, Europe, and Australia with high-volume, pixel-perfect image solutions.'}
              </p>

              <p className="text-slate-600 text-base leading-relaxed">
                Our in-house team of 50+ seasoned Photoshop craftsmen specializes in hand-drawn clipping paths, alpha masking, jewelry and apparel retouching, 3D ghost mannequin neck joints, natural shadow recreation, color correction, and 360-degree product image enhancement. By combining meticulous human artistic judgment with strict three-tier quality control and 24/5 multi-shift production, we turn raw studio files into conversion-boosting catalog imagery faster and more economically than any internal team.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">3 Shifts Daily</h4>
                  <p className="text-xs text-slate-500 mt-1">Continuous editing 24 hours round the clock</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-sm">Strict NDA Protected</h4>
                  <p className="text-xs text-slate-500 mt-1">Zero leak guarantee for unreleased lines</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2A55] text-white font-semibold text-sm rounded-xl hover:bg-[#1A3E75] transition-colors shadow-md"
                >
                  <span>Read More About Our Studio</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: WHY CHOOSE PRO RETOUCHING
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block mb-2">
              Our Value Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
              Why Choose Pro Retouching?
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              The unmatched production backbone built specifically for high-velocity e-commerce brands and commercial photo studios.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left side image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-3">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                  <SafeImage
                    src={ASSET_SNEAKER}
                    alt="Why choose Pro Retouching production showcase"
                    fallbackLabel="Sneaker Retouching"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl mt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Pixel-Perfect Guaranteed</h4>
                    <p className="text-xs text-slate-500">Every bezier curve drawn manually</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    100%
                  </div>
                </div>
              </div>
            </div>

            {/* Right side 2-column checklist with orange check icons */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.whyChoose.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-xl border border-slate-200/70 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-3.5 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PRICE STATS STRIP
          ========================================================================= */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.priceHighlights.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all text-center sm:text-left flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto sm:mx-0 mb-4 text-white">
                  {idx === 0 && <Tag className="w-6 h-6" />}
                  {idx === 1 && <Percent className="w-6 h-6" />}
                  {idx === 2 && <Zap className="w-6 h-6" />}
                  {idx === 3 && <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl lg:text-2xl tracking-tight text-white">
                    {stat.title}
                  </h3>
                  <p className="mt-1 text-xs text-amber-100 font-medium leading-relaxed">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: GET YOUR FREE QUOTE
          ========================================================================= */}
      <section className="py-20 bg-[#0F2A55] text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-2">
            Fast Response Guaranteed
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Get Your Free Quote Now
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Tell us your requirements to receive a price quotation. We review image complexity and reply within 30 minutes.
          </p>

          <form
            onSubmit={handleQuoteSubmit}
            className="mt-10 bg-[#143464] border border-blue-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-left"
          >
            {/* Honeypot: hidden from humans, bots tend to fill it */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={quoteHoneypot}
              onChange={(e) => setQuoteHoneypot(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Service Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select a Service
                </label>
                <select
                  value={quoteService}
                  onChange={(e) => setQuoteService(e.target.value)}
                  className="w-full bg-[#0A1E3D] border border-blue-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                >
                  {services.map((srv) => (
                    <option key={srv.slug} value={srv.slug}>
                      {srv.title}
                      {srv.startingPrice ? ` (from ${srv.startingPrice})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Image Quantity
                </label>
                <select
                  value={quoteQuantity}
                  onChange={(e) => setQuoteQuantity(e.target.value)}
                  className="w-full bg-[#0A1E3D] border border-blue-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                >
                  <option value="1-20">1 – 20 images</option>
                  <option value="50">50 – 100 images</option>
                  <option value="250">100 – 500 images</option>
                  <option value="1000">500 – 1,000 images</option>
                  <option value="2000+">2,000+ images (Bulk)</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Your Business Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@brand.com"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  className="w-full bg-[#0A1E3D] border border-blue-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="mt-6 pt-5 border-t border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NDA protected · Zero obligation · Instant confirmation</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingQuote}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmittingQuote ? (
                  <span>Calculating quote...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Get Free Instant Quote</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: SERVICES SHOWCASE (Alternating Left/Right with Before/After Slider)
          ========================================================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block mb-2">
              Capabilities Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
              Pro Retouching Offers Post-production for E-commerce
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Explore our core post-production disciplines with real-time before and after comparisons. Drag the slider to evaluate our manual craftsmanship.
            </p>
          </div>

          <div className="space-y-24">
            {showcaseServices.map((service, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image Column */}
                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100">
                      <SafeImage
                        src={service.image || service.afterImage}
                        alt={service.title}
                        fallbackLabel={service.title}
                        className="block w-full h-auto object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
                      <span>Interactive Comparison</span>
                      <span className="font-semibold text-amber-600">
                        Starts {service.startingPrice} / image
                      </span>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-6 space-y-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
                      <span>{service.category}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
                      {service.title}
                    </h3>

                    <p className="text-slate-600 text-base leading-relaxed">
                      {service.fullDesc}
                    </p>

                    {/* 3-4 bullet points with orange icons */}
                    <div className="space-y-2.5 pt-2">
                      {service.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <Link
                        to={`/services/${service.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2A55] text-white font-semibold text-sm rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        <span>View More Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to="/free-test"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        <span>Try Sample Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              SECTION 7: "MORE SERVICES" BUTTON
              ========================================================================= */}
          <div className="mt-20 pt-12 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-base mb-5">
              Looking for Vector Conversion, E-commerce Video Editing, 3D Product Modeling, or Amazon A+ Graphic Design?
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Explore All 14 Services</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7B: OUR WORKS PREVIEW
          ========================================================================= */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block mb-2">
              Selected Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
              Our Recent Works
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              A snapshot of real commercial post-production delivered for global footwear brands, fashion labels, and high-volume Amazon sellers.
            </p>
          </div>

          {loadingWorks && previewWorks.length === 0 ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previewWorks.map((work) => (
                <WorkCard key={work.id} item={work} />
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link
              to="/our-works"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
            >
              <span>View All Works</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: OUR SNEAK PEEK (Animated Counters)
          ========================================================================= */}
      <section className="py-20 bg-[#F8FAFC] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block mb-2">
              By The Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
              Our Sneak Peek
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              A decade of relentless focus on e-commerce image quality, strict turnaround times, and global client satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {stats.map((item, idx) => (
              <AnimatedCounter
                key={item.id || idx}
                value={item.value}
                suffix={item.suffix}
                label={item.label}
                description={item.description}
              />
            ))}
          </div>

          {/* Banner bottom CTA */}
          <div className="mt-14 p-8 bg-[#0F2A55] rounded-3xl text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold font-heading">
                Ready to accelerate your product photography workflow?
              </h3>
              <p className="text-slate-300 text-sm">
                Send 2–3 sample images today. We return them professionally retouched in under 12 hours.
              </p>
            </div>
            <Link
              to="/free-test"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl shadow-md whitespace-nowrap transition-transform hover:scale-105"
            >
              Start Free Trial Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
