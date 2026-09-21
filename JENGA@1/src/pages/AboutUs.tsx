import React from 'react';
import { 
  Building2, 
  Hammer, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs: React.FC = () => {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=KCB+Bank+Gikomba+Nairobi";
  const embedMapsUrl = "https://www.google.com/maps?q=KCB+Bank+Gikomba+Nairobi&output=embed";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3">
            Fair Deal Hardware
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Wagenis Universe Hardware
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-amber-300 italic font-medium">
            "We draw dreams with steel and wood"
          </p>
          <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Dealers in general building materials and interior designing, delivering reliable structural products and refined finishes.
          </p>
        </div>
      </section>

      {/* Core Specialties */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Core Specialties</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Equipping contractors, artisans, and homeowners with proven building solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">General Building Materials</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Complete stock of primary structural materials including reinforcement steel, quality timber, cement, roofing, framework wood, and binding wire.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Construction & structural timber</li>
              <li>• High-tensile steel bars & binding wire</li>
              <li>• Cement, aggregate essentials & roofing sheets</li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Interior Designing & Finishes</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Premium interior architectural fixtures, decorative woodwork hardware, partitions, locks, handles, and custom styling supplies to bring living spaces to life.
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cabinetry, door fittings & security locks</li>
              <li>• Decorative wood panels & ceiling boards</li>
              <li>• Finishing supplies and specialized hardware</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-10 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 text-base">Verified Quality</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Authentic construction-grade steel and timber supplies.
              </p>
            </div>
            <div className="p-4">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 text-base">Convenient Market Access</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Centrally stationed in Gikomba for prompt loading and transport.
              </p>
            </div>
            <div className="p-4">
              <Phone className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 text-base">Personalized Estimates</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Tailored material lists and project measurements on demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Map Section */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Details */}
          <div className="p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm uppercase mb-2">
                <MapPin className="w-4 h-4" /> Physical Store
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Visit Us in Gikomba</h3>
              <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                We are located in Gikomba market, positioned right near <strong>KCB Bank Gikomba Branch</strong>. Visit our shop to review materials in person, confirm dimensions, or coordinate direct transport for site delivery.
              </p>

              <div className="mt-6 space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <span>Near KCB Bank, Gikomba Market, Nairobi, Kenya</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <span>Monday – Saturday: 7:30 AM – 5:30 PM</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Open in Google Maps
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="h-72 sm:h-96 lg:h-auto min-h-[320px] w-full bg-gray-100">
            <iframe
              title="Wagenis Universe Hardware Location"
              src={embedMapsUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};