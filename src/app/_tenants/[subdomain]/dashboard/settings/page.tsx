'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Settings, Loader2, Sparkles, Layout, Eye, 
  MapPin, Phone, Mail, Globe, Check 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function WebsiteSettings() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f766e');
  const [secondaryColor, setSecondaryColor] = useState('#14b8a6');
  const [mapLink, setMapLink] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Fetch current settings
  const { data: config, isLoading, refetch } = useQuery<any>({
    queryKey: ['tenant-config'],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  // Load configuration into state
  useEffect(() => {
    if (config) {
      setName(config.name || '');
      setTitle(config.website_title || '');
      setDesc(config.website_description || '');
      setPrimaryColor(config.brand_color_primary || '#0f766e');
      setSecondaryColor(config.brand_color_secondary || '#14b8a6');
      setMapLink(config.map_link || '');
      setEmail(config.contact_email || '');
      setPhone(config.contact_phone || '');
      setAddress(config.contact_address || '');
      setLogoUrl(config.logo_url || '');
    }
  }, [config]);

  // 2. Update settings mutation
  const updateConfigMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/tenant/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetch();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err: any) => {
      setSaveError(err.message || 'Failed to save modifications.');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    // Extract src from full iframe if user pasted the entire HTML code
    let parsedMapLink = mapLink.trim();
    if (parsedMapLink.startsWith('<iframe')) {
      const match = parsedMapLink.match(/src="([^"]+)"/);
      if (match && match[1]) {
        parsedMapLink = match[1];
      }
    }

    updateConfigMutation.mutate({
      name: name.trim(),
      website_title: title.trim(),
      website_description: desc.trim(),
      brand_color_primary: primaryColor,
      brand_color_secondary: secondaryColor,
      map_link: parsedMapLink || null,
      contact_email: email.trim() || null,
      contact_phone: phone.trim() || null,
      contact_address: address.trim() || null,
      logo_url: logoUrl.trim() || null
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span>Loading configurator canvas...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Left Column: Form Editor */}
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white flex items-center gap-3">
            Website Customizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build and style your public pharmacy homepage subdomain dynamically.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 text-sm text-teal-400 bg-teal-950/20 border border-teal-500/20 rounded-xl flex items-center gap-2">
            <Check className="h-4 w-4" /> Customizations published successfully!
          </div>
        )}

        {saveError && (
          <div className="p-4 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-5">
          {/* Pharmacy Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Public Business Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Logo Image URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
            />
          </div>

          {/* Brand Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 bg-transparent border-0 outline-none cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg outline-none font-mono text-xs text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Secondary Brand Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 bg-transparent border-0 outline-none cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg outline-none font-mono text-xs text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Title and Descriptions */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Website Main Heading (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Website Description / Intro Summary
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm h-24 resize-none"
            />
          </div>

          {/* Google Maps Link */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Google Maps Embed Code / Link
            </label>
            <input
              type="text"
              placeholder='Paste Google Maps <iframe> code or raw src link'
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
            />
            <span className="text-[10px] text-slate-600 block mt-1.5 leading-relaxed">
              Find your location on Google Maps &rarr; Share &rarr; Embed map &rarr; Copy the HTML code and paste it above directly.
            </span>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+94 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="info@..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Pharmacy Store Address
            </label>
            <input
              type="text"
              placeholder="e.g. 123 Galle Road, Colombo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={updateConfigMutation.isPending}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            {updateConfigMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                Save & Publish Customizations <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Live Mockup Website Preview */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Eye className="h-4.5 w-4.5" />
          <span className="text-xs uppercase font-bold tracking-wider">Live Mockup Preview</span>
        </div>

        {/* Browser Mockup */}
        <div className="border border-slate-900 rounded-3xl bg-slate-950 overflow-hidden shadow-2xl flex flex-col h-[700px]">
          {/* Browser Address Bar */}
          <div className="bg-slate-900/50 px-6 py-3 border-b border-slate-900 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="flex-1 bg-slate-950 rounded-lg py-1 px-4 text-center text-[10px] text-slate-500 font-mono truncate select-none border border-slate-900/50">
              http://{config?.subdomain || 'test'}.medical.lk
            </div>
          </div>

          {/* Render Mockup Web Page */}
          <div className="flex-1 flex flex-col overflow-y-auto text-slate-300 font-sans selection:bg-slate-900">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain rounded-md" />
                ) : (
                  <div 
                    className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {name ? name.substring(0, 2).toUpperCase() : 'PH'}
                  </div>
                )}
                <span className="font-bold text-xs text-white">{name || 'Pharmacy Name'}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-0.5 rounded">
                Menu
              </span>
            </div>

            {/* Hero Main Body */}
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-extrabold text-white leading-tight font-display">
                {title || 'Website Main Heading'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {desc || 'Pasted description content will appear here.'}
              </p>

              {/* Contact icons preview */}
              <div className="space-y-3 pt-4 text-[11px]">
                {address && (
                  <div className="flex items-start gap-3 text-slate-300">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: secondaryColor }} />
                    <span>{address}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Phone className="h-4 w-4 shrink-0" style={{ color: secondaryColor }} />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Mail className="h-4 w-4 shrink-0" style={{ color: secondaryColor }} />
                    <span className="break-all">{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mock Map / Graphic box */}
            <div className="p-6 bg-slate-900/10 border-t border-slate-900/50 flex flex-col justify-end">
              {mapLink ? (
                <div className="h-32 bg-slate-950 rounded-xl border border-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-semibold gap-1.5 uppercase tracking-wide">
                  <Globe className="h-4 w-4 text-teal-500 animate-spin" /> Map Loaded Successfully
                </div>
              ) : (
                <div className="h-32 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 text-[10px] gap-1.5 uppercase tracking-wide">
                  <MapPin className="h-6 w-6" /> Location Map Not Configured
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
