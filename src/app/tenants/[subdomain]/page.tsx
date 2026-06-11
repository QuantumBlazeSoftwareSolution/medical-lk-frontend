'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Mail, Phone, Loader2, Activity, Heart, Clock, Globe, Calendar, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function TenantPublicPage({ params }: { params: Promise<{ subdomain: string }> }) {
  // Resolve params promise for NextJS 15 compatibility
  const resolvedParams = React.use(params);
  const subdomain = resolvedParams.subdomain;

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant-public', subdomain],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center text-[#72787e] gap-2 font-sans text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        <span>Loading pharmacy details...</span>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center text-[#42474d] gap-4 font-sans p-6 text-center">
        <Activity className="h-10 w-10 text-red-500 animate-pulse" />
        <h2 className="text-lg font-bold text-red-600">Pharmacy Website Not Found</h2>
        <p className="text-xs max-w-sm">Please verify the URL or ensure the pharmacy trial is active.</p>
      </div>
    );
  }

  const primaryColor = tenant.brand_color_primary || '#0f3d57';
  const secondaryColor = tenant.brand_color_secondary || '#2ecc71';
  
  // Custom builder states
  const logoHeight = tenant.logo_height || 40;
  const stickyHeader = tenant.sticky_header !== false;
  const headingsFont = tenant.headings_font || 'poppins';
  const bodyFont = tenant.body_font || 'inter';
  
  const heroHeadline = tenant.hero_headline || 'Your Neighborhood Care.';
  const heroSubheadline = tenant.hero_subheadline || 'Providing expert clinical services and prescriptions right in your community.';
  const heroButtonText = tenant.hero_button_text || 'Refill Now';
  const heroBgImage = tenant.hero_bg_image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80';
  const autoCloseHolidays = tenant.auto_close_holidays !== false;

  // Resolve standard opening hours
  let mondayOpen = '08:00 AM';
  let mondayClose = '09:00 PM';
  let sundayOpen = 'Closed';
  if (tenant.opening_hours) {
    try {
      const parsedHours = JSON.parse(tenant.opening_hours);
      if (parsedHours.MondayOpen) mondayOpen = parsedHours.MondayOpen;
      if (parsedHours.MondayClose) mondayClose = parsedHours.MondayClose;
      if (parsedHours.SundayOpen) sundayOpen = parsedHours.SundayOpen;
    } catch (e) {
      console.error(e);
    }
  }

  // Resolve exceptions
  let exceptions: Array<{ name: string; date: string; status: string }> = [];
  if (tenant.holiday_exceptions) {
    try {
      const parsedEx = JSON.parse(tenant.holiday_exceptions);
      if (Array.isArray(parsedEx)) {
        exceptions = parsedEx;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Dynamic Fonts mappings
  const headingStyle = {
    fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
  };
  
  const bodyStyle = {
    fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
  };

  return (
    <div 
      className="min-h-screen bg-[#f7f9fc] text-[#191c1e] flex flex-col selection:bg-teal-50 selection:text-teal-900 font-sans"
      style={bodyStyle}
    >
      {/* Header */}
      <header className={`border-b border-[#eceef1] bg-white/95 backdrop-blur-md z-50 ${stickyHeader ? 'sticky top-0' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant.name} 
                style={{ height: `${logoHeight}px` }} 
                className="object-contain" 
              />
            ) : (
              <div 
                className="rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor, width: `${logoHeight + 4}px`, height: `${logoHeight + 4}px` }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span 
              className="font-bold text-base tracking-tight"
              style={{ ...headingStyle, color: primaryColor }}
            >
              {tenant.name}
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-xs font-semibold text-[#42474d]">
            <a className="hover:text-primary transition-colors" href="#" style={{ color: secondaryColor }}>Home</a>
            <a className="hover:text-primary transition-colors" href="#details">Opening Hours</a>
            <a className="hover:text-primary transition-colors" href="#details">Visit Us</a>
          </nav>
        </div>
      </header>

      {/* Main Public Hero Content */}
      <section className="bg-white border-b border-[#eceef1] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f7f9fc] border border-[#eceef1] rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-[#72787e]">
              <Heart size={12} style={{ color: secondaryColor }} /> 
              Trusted Healthcare Partner
            </div>
            <h1 
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ ...headingStyle, color: primaryColor }}
            >
              {heroHeadline}
            </h1>
            <p className="text-[#42474d] text-sm md:text-base leading-relaxed max-w-xl">
              {heroSubheadline}
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                className="px-6 py-3 text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer" 
                style={{ backgroundColor: secondaryColor }}
              >
                {heroButtonText}
              </button>
              <a 
                href="#details"
                className="border-2 px-6 py-3 rounded-lg font-bold text-xs transition-all active:scale-[0.98] hover:bg-slate-50 cursor-pointer text-center inline-block" 
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg border border-[#eceef1]">
            <img 
              src={heroBgImage} 
              alt="Pharmacy showroom" 
              className="object-cover w-full h-full" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Opening Hours & Contact Details Section */}
      <section id="details" className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 text-left">
        
        {/* Opening Hours Card */}
        <div className="bg-white border border-[#eceef1] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6" style={{ color: primaryColor }}>
              <Calendar size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider" style={headingStyle}>Opening Hours</h3>
            </div>
            <div className="space-y-3 text-xs text-[#42474d] font-mono">
              <div className="flex justify-between py-2 border-b border-[#eceef1]/60">
                <span className="font-sans font-semibold">Monday - Saturday</span>
                <span className="font-bold">{mondayOpen} - {mondayClose}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#eceef1]/60">
                <span className="font-sans font-semibold">Sunday</span>
                <span className="italic font-bold">{sundayOpen}</span>
              </div>
            </div>
          </div>

          {autoCloseHolidays && (
            <div className="mt-6 p-4 bg-teal-50/40 rounded-xl text-xs text-[#006d37] border border-teal-100 flex gap-2 items-start">
              <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: secondaryColor }} />
              <div className="space-y-1">
                <p className="font-bold">National Holiday Closures Active</p>
                <p className="text-[11px] text-[#42474d]/80 leading-relaxed">
                  Closed on national holidays and custom exceptions 
                  {exceptions.length > 0 && ` (${exceptions.map(e => e.name).join(', ')})`}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Address / Map Card */}
        <div className="bg-white border border-[#eceef1] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6" style={{ color: primaryColor }}>
              <MapPin size={20} />
              <h3 className="font-bold text-sm uppercase tracking-wider" style={headingStyle}>Visit Us</h3>
            </div>
            
            <address className="not-italic text-xs text-[#42474d] space-y-3">
              <p className="font-bold text-sm text-[#191c1e]">{tenant.name}</p>
              <p className="leading-relaxed">{tenant.contact_address || 'No address configured yet.'}</p>
              
              <div className="pt-2 space-y-1.5 font-mono text-[11px]">
                {tenant.contact_phone && <p>📞 {tenant.contact_phone}</p>}
                {tenant.contact_email && <p>✉️ {tenant.contact_email}</p>}
              </div>
            </address>
          </div>

          {tenant.map_link ? (
            <div className="h-32 mt-6 rounded-xl overflow-hidden border border-[#eceef1] relative group">
              <iframe
                src={tenant.map_link}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="h-32 mt-6 rounded-xl border border-dashed border-[#eceef1] bg-[#f7f9fc] flex flex-col items-center justify-center text-[#a3aab0] text-xs gap-1.5">
              <MapPin size={18} />
              <span>Location Map Not Added</span>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eceef1] bg-white py-8 text-center text-xs text-[#72787e]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} {tenant.name}.</span>
            <span>&bull;</span>
            <span>All Rights Reserved.</span>
          </p>
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-[#00273b]">medical.lk</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
