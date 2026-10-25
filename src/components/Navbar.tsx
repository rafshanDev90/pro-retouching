import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight, Sliders, Image, Sparkles } from 'lucide-react';
import { useServices } from '../hooks/usePublic';

export const Navbar: React.FC = () => {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { services } = useServices();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsServicesOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Our Works', path: '/our-works' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          aria-label="Pro Retouching Home"
        >
          <img
            src="/images/logo/Pro__Retouching.jpg"
            alt="Pro Retouching logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center tracking-tight text-lg sm:text-xl font-heading font-extrabold leading-none">
              <span className="text-[#0F2A55]">PRO</span>
              <span className="text-amber-500 ml-1.5">RETOUCHING</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5 hidden sm:block">
              E-commerce Post-Production
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          <Link
            to="/"
            className={`transition-colors hover:text-amber-600 whitespace-nowrap ${
              location.pathname === '/' ? 'text-amber-600 font-semibold' : ''
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`transition-colors hover:text-amber-600 whitespace-nowrap ${
              location.pathname === '/about' ? 'text-amber-600 font-semibold' : ''
            }`}
          >
            About Us
          </Link>

          {/* Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              onMouseEnter={() => setIsServicesOpen(true)}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-600 whitespace-nowrap focus:outline-none ${
                location.pathname.startsWith('/services') ? 'text-amber-600 font-semibold' : ''
              }`}
              aria-expanded={isServicesOpen}
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isServicesOpen ? 'rotate-180 text-amber-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Panel */}
            {isServicesOpen && (
              <div
                onMouseLeave={() => setIsServicesOpen(false)}
                className="absolute top-full -left-28 mt-2 w-[580px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 grid grid-cols-2 gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="col-span-2 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    All Post-Production Capabilities
                  </span>
                  <Link
                    to="/services"
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    View All Services <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {services.map((service) => (
                  <Link
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className="p-2.5 rounded-xl hover:bg-amber-50/70 group transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0F2A55] group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                      <Image className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{service.shortDesc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/pricing"
            className={`transition-colors hover:text-amber-600 whitespace-nowrap ${
              location.pathname === '/pricing' ? 'text-amber-600 font-semibold' : ''
            }`}
          >
            Pricing
          </Link>

          <Link
            to="/our-works"
            className={`transition-colors hover:text-amber-600 whitespace-nowrap ${
              location.pathname === '/our-works' ? 'text-amber-600 font-semibold' : ''
            }`}
          >
            Our Works
          </Link>

          <Link
            to="/contact"
            className={`transition-colors hover:text-amber-600 whitespace-nowrap ${
              location.pathname === '/contact' ? 'text-amber-600 font-semibold' : ''
            }`}
          >
            Contact Us
          </Link>
        </nav>

        {/* Free Test Button (Right) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            to="/free-test"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:from-amber-600 hover:to-orange-700 shadow-md shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Free Test</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/free-test"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg sm:hidden"
          >
            Free Test
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-5 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2 text-base font-medium text-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === link.path ? 'bg-amber-50 text-amber-600 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs uppercase font-bold text-slate-400 px-3">Services</span>
              <div className="grid grid-cols-1 gap-1 mt-2 max-h-56 overflow-y-auto pr-1">
                {services.slice(0, 8).map((srv) => (
                  <Link
                    key={srv.slug}
                    to={`/services/${srv.slug}`}
                    className="py-1.5 px-3 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors"
                  >
                    {srv.title}
                  </Link>
                ))}
                <Link
                  to="/services"
                  className="py-1.5 px-3 text-sm font-semibold text-amber-600 hover:underline"
                >
                  View All {services.length} Services →
                </Link>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/free-test"
                className="w-full py-3 text-center text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get 2–3 Free Test Images</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
