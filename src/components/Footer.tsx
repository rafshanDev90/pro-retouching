import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, MessageSquare, ArrowUpRight, ShieldCheck, Facebook, Instagram, Linkedin } from 'lucide-react';
import { COMPANY_INFO } from '../data/constants';
import { useServices, useSettings } from '../hooks/usePublic';

const WHATSAPP_URL = 'https://wa.me/8801577726116';
const WHATSAPP_DISPLAY = '+880 1577-726116';

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pro-retouching-550693215', icon: 'linkedin' as const },
  { label: 'Instagram', href: 'https://www.instagram.com/pro__retouching', icon: 'instagram' as const },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61590308913780', icon: 'facebook' as const },
  { label: 'WhatsApp', href: WHATSAPP_URL, icon: 'whatsapp' as const },
];

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { services } = useServices();
  const { settings } = useSettings();
  return (
    <footer className="bg-[#0F2A55] text-slate-300 pt-16 pb-10 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-blue-900/80">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo/Pro__Retouching.jpg"
                alt="Pro Retouching logo"
                className="w-10 h-10 rounded-full object-cover bg-white shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight text-xl font-heading font-extrabold text-white">
                  <span>PRO</span>
                  <span className="text-amber-400 ml-1.5">RETOUCHING</span>
                </div>
                <span className="text-xs text-blue-200/70">Bangladesh Studio</span>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed">
              {settings.tagline}. High-volume, hand-crafted image and video post-production for global e-commerce sellers, Amazon merchants, and fashion houses.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% NDA Protected & Data Secure</span>
            </div>
          </div>

          {/* Column 2: Stay Connected */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Stay Connected</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Skype: {settings.skype}</span>
                </div>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, icon }) => {
                const isWhatsApp = icon === 'whatsapp';
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-8 h-8 rounded-lg bg-blue-900/60 flex items-center justify-center text-slate-300 transition-colors ${
                      isWhatsApp ? 'hover:bg-emerald-500 hover:text-white' : 'hover:bg-amber-500 hover:text-white'
                    }`}
                    aria-label={label}
                  >
                    {icon === 'linkedin' && <Linkedin className="w-4 h-4" />}
                    {icon === 'instagram' && <Instagram className="w-4 h-4" />}
                    {icon === 'facebook' && <Facebook className="w-4 h-4" />}
                    {icon === 'whatsapp' && <WhatsAppIcon className="w-4 h-4" />}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>About Our Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>All Post-Production Services</span>
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Transparent Pricing & Bulk Rates</span>
                </Link>
              </li>
              <li>
                <Link to="/our-works" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Portfolio & Before / After</span>
                </Link>
              </li>
              <li>
                <Link to="/free-test" className="text-amber-400 font-semibold hover:underline flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Free Test (2–3 Images)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Head Office */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Head Office</h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <p className="leading-relaxed">{settings.address}</p>
              </div>
              <div className="pt-1 text-xs text-blue-200/80">
                <p className="font-semibold text-white">Operating Hours:</p>
                <p className="mt-0.5">{COMPANY_INFO.workingHours}</p>
                <p className="mt-1 text-emerald-300 font-medium">3 shifts daily · 24-hour turnaround guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            {settings.footerText || '© 2026 All Rights Reserved by Pro Retouching.'}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/free-test" className="hover:text-amber-400 transition-colors">SLA & Guarantee</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
