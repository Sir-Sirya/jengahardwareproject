import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Video, 
  ExternalLink, 
  Headphones, 
  MapPin, 
  Store, 
  Clock 
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-16">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3">
            Customer Care
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Contact Fair Deal Hardware
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-300">
            Reach out directly for hardware quotations, inventory inquiries, or website technical support.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Direct Phone Call Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Customer Support</h3>
              <p className="text-sm text-gray-600 mt-1">
                Speak directly with the hardware sales desk for immediate stock inquiries and pricing.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <a
                href="tel:0796598260"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition"
              >
                <span>0796 598 260</span>
                <Phone className="w-4 h-4 opacity-70" />
              </a>
              <a
                href="tel:0746757168"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition"
              >
                <span>0746 757 168</span>
                <Phone className="w-4 h-4 opacity-70" />
              </a>
            </div>
          </div>

          {/* 2. WhatsApp & Catalog Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">WhatsApp & Live Catalog</h3>
              <p className="text-sm text-gray-600 mt-1">
                Chat with sales reps or browse the full digital product catalog with updated prices.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <a
                href="https://wa.me/254796598260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition"
              >
                <span>Chat on WhatsApp</span>
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/c/254796598260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-emerald-600 text-emerald-700 font-medium text-sm hover:bg-emerald-50 transition"
              >
                <span>Browse WhatsApp Catalog</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. Social Channels */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Social Showcase</h3>
              <p className="text-sm text-gray-600 mt-1">
                Follow store arrivals, construction materials, and interior finish showcases.
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <a
                href="https://www.instagram.com/wagenis.universe.hardware?igsi=MXR6aThwcWN4NnhycA=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm hover:opacity-95 transition"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@alvin_wageni?_r=1&_t=ZS-99OQl5mGfeU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-black text-white font-medium text-sm hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>TikToK Feed</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 4. Physical Branch Presence */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Store Walk-In</h3>
              <p className="text-sm text-gray-600 mt-1">
                Visit the hardware shop in Gikomba for physical material inspection and order collection.
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Gikomba Market, near KCB Bank, Nairobi, Kenya</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Monday – Saturday: 7:30 AM – 5:30 PM</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="https://www.google.com/maps/search/?api=1&query=KCB+Bank+Gikomba+Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition"
              >
                Get Directions on Google Maps
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 5. Website IT & Support Department */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">IT & Platform Support</h3>
              <p className="text-sm text-gray-300 mt-1">
                Encountering login issues, account bugs, or order glitches on Jenga Marketplace? Contact IT engineering:
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <a
                href="tel:0791850472"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-800 text-gray-100 font-medium text-sm hover:bg-slate-700 transition"
              >
                <span>0791 850 472</span>
                <Phone className="w-4 h-4 text-amber-400" />
              </a>
              <a
                href="tel:0724653303"
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-800 text-gray-100 font-medium text-sm hover:bg-slate-700 transition"
              >
                <span>0724 653 303</span>
                <Phone className="w-4 h-4 text-amber-400" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};