'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Mail, Phone, Loader2, Activity } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Activity className="h-10 w-10 text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold text-red-400">Pharmacy Website Not Found</h2>
        <p className="text-sm">Please verify the URL or ensure the pharmacy trial is still active.</p>
      </div>
    );
  }

  const primaryColor = tenant.brand_color_primary || '#0f766e';
  const secondaryColor = tenant.brand_color_secondary || '#14b8a6';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Dynamic Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="h-10 w-10 object-contain rounded-lg" />
            ) : (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-display font-bold text-lg tracking-tight">{tenant.name}</span>
          </div>
          <div>
            <a 
              href="/login"
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            >
              Employee Portal
            </a>
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 md:py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            {tenant.website_title}
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-10 leading-relaxed">
            {tenant.website_description}
          </p>

          <div className="space-y-5 text-sm text-slate-300">
            {tenant.contact_address && (
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: secondaryColor }} />
                <span className="leading-relaxed">{tenant.contact_address}</span>
              </div>
            )}
            {tenant.contact_phone && (
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 shrink-0" style={{ color: secondaryColor }} />
                <span>{tenant.contact_phone}</span>
              </div>
            )}
            {tenant.contact_email && (
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 shrink-0" style={{ color: secondaryColor }} />
                <span className="break-all">{tenant.contact_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Map / Visual Column */}
        <div className="flex flex-col gap-6">
          {tenant.map_link ? (
            <div className="rounded-2xl overflow-hidden border border-slate-900 bg-slate-900/40 h-80 shadow-2xl">
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
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/25 h-80 flex flex-col items-center justify-center text-slate-500 gap-3">
              <MapPin className="h-10 w-10 text-slate-700 animate-bounce" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Location Map Not Configured</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <p className="flex items-center justify-center gap-1.5">
          <span>&copy; 2026 {tenant.name}.</span>
          <span>&bull;</span>
          <span>Powered by <span className="font-semibold text-slate-500">medical.lk</span></span>
        </p>
      </footer>
    </div>
  );
}
