'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Mail, Phone, Loader2, Activity, Heart, Clock, Globe } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] flex flex-col selection:bg-teal-50 selection:text-teal-900 font-sans">
      
      {/* Header */}
      <header className="border-b border-[#eceef1] bg-white/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 object-contain rounded-lg" />
            ) : (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-display font-bold text-base tracking-tight text-[#00273b]">{tenant.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#006d37] uppercase tracking-wider">Trusted Care Partner</span>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-20 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        
        {/* Left Column: Website content and descriptions */}
        <div className="md:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#eceef1] rounded-full shadow-sm text-[10px] font-bold uppercase tracking-wider text-outline">
              <Heart size={12} style={{ color: secondaryColor }} /> 
              Your Neighborhood Pharmacy
            </div>
            <h1 
              className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: primaryColor }}
            >
              {tenant.website_title || 'Your Health. Our Priority.'}
            </h1>
            <p className="text-[#42474d] text-sm md:text-base leading-relaxed max-w-xl">
              {tenant.website_description || 'Providing expert clinical services, prescriptions, and healthcare essentials right in your community.'}
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenant.contact_address && (
              <div className="bg-white p-5 rounded-xl border border-[#eceef1] shadow-sm flex gap-3.5">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-teal-50 text-teal-700">
                  <MapPin size={16} style={{ color: secondaryColor }} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Our Location</h4>
                  <p className="text-xs text-[#191c1e] font-semibold leading-relaxed">{tenant.contact_address}</p>
                </div>
              </div>
            )}

            {(tenant.contact_phone || tenant.contact_email) && (
              <div className="bg-white p-5 rounded-xl border border-[#eceef1] shadow-sm flex gap-3.5">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-teal-50 text-teal-700">
                  <Phone size={16} style={{ color: secondaryColor }} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">Get in touch</h4>
                  {tenant.contact_phone && (
                    <p className="text-xs text-[#191c1e] font-semibold font-mono leading-none">📞 {tenant.contact_phone}</p>
                  )}
                  {tenant.contact_email && (
                    <p className="text-xs text-[#191c1e] font-semibold break-all leading-none">✉️ {tenant.contact_email}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map Section */}
        <div className="md:col-span-5 flex flex-col gap-6 w-full">
          {tenant.map_link ? (
            <div className="rounded-2xl overflow-hidden border border-[#eceef1] bg-white p-2 shadow-lg h-80 sm:h-96">
              <iframe
                src={tenant.map_link}
                width="100%"
                height="100%"
                className="rounded-xl border border-[#eceef1]"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#eceef1] bg-white h-80 flex flex-col items-center justify-center text-[#72787e] gap-3">
              <MapPin className="h-8 w-8 text-[#a3aab0] animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a3aab0]">Location Map Not Configured</span>
            </div>
          )}
        </div>
      </main>

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
