import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, Clock } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { SkeletonGrid } from '../components/Skeleton';
import { useServices } from '../hooks/usePublic';

export const Services: React.FC = () => {
  const { services, loading } = useServices();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-amber-50/70 via-rose-50/30 to-white py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider block mb-2">
            Comprehensive Post-Production Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-[#0F2A55] tracking-tight">
            Our Services & Capabilities
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From basic 100% hand-drawn vector clipping paths to intricate ghost mannequin neck joints, luxury jewelry polishing, and 3D product rendering.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && services.length === 0 ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group"
              >
                {/* Image Preview */}
                <div className="relative aspect-[16/10] bg-slate-100">
                  <SafeImage
                    src={service.image || service.afterImage}
                    alt={service.title}
                    fallbackLabel={service.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 bg-[#0F2A55]/85 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {service.category}
                  </div>
                  {service.startingPrice && (
                    <div className="absolute bottom-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                      Starts {service.startingPrice}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* Features list */}
                    <div className="mt-4 space-y-1.5 pt-4 border-t border-slate-100">
                      {service.bullets.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.turnaround}</span>
                    </div>

                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2A55] group-hover:text-amber-600 transition-colors"
                    >
                      <span>Explore Service</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Free Test Banner */}
          <div className="mt-16 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Not sure which service you need?
              </h3>
              <p className="text-amber-100 text-sm max-w-xl">
                Upload 2–3 sample product photos. Our senior production lead will evaluate them and send back a customized test edit and price quote.
              </p>
            </div>
            <Link
              to="/free-test"
              className="px-8 py-3.5 bg-white text-[#0F2A55] hover:bg-slate-50 font-bold text-sm rounded-xl shadow-lg whitespace-nowrap transition-transform hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Get Free Test Images</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
