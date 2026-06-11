'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Settings, Loader2, Sparkles, Layout, Eye, 
  MapPin, Phone, Mail, Globe, Check, Smartphone, 
  Laptop, ChevronDown, Plus, Trash2, HelpCircle, 
  User, CheckCircle, AlertTriangle, Rocket, Lock, 
  Image as ImageIcon, HelpCircle as HelpIcon, ArrowLeft,
  Calendar, RotateCcw
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function WebsiteSettings() {
  const [activeTab, setActiveTab] = useState<'appearance' | 'content' | 'navigation' | 'seo'>('appearance');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Official configuration states (bound to backend API)
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0f3d57');
  const [secondaryColor, setSecondaryColor] = useState('#2ecc71');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Builder-only interactive states (stored locally / mocked to sync with preview)
  const [headingsFont, setHeadingsFont] = useState('poppins');
  const [bodyFont, setBodyFont] = useState('inter');
  
  const [logoHeight, setLogoHeight] = useState(40);
  const [stickyHeader, setStickyHeader] = useState(true);
  const [heroHeadline, setHeroHeadline] = useState('Your Neighborhood Care.');
  const [heroSubheadline, setHeroSubheadline] = useState('Providing expert clinical services and prescriptions right in your community.');
  const [heroButtonText, setHeroButtonText] = useState('Refill Now');
  const [heroBgImage, setHeroBgImage] = useState('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80');

  // Opening hours states
  const [mondayOpen, setMondayOpen] = useState('08:00 AM');
  const [mondayClose, setMondayClose] = useState('09:00 PM');
  const [tuesdayOpen, setTuesdayOpen] = useState('08:00 AM');
  const [tuesdayClose, setTuesdayClose] = useState('09:00 PM');
  const [wednesdayOpen, setWednesdayOpen] = useState('08:00 AM');
  const [wednesdayClose, setWednesdayClose] = useState('09:00 PM');
  const [thursdayOpen, setThursdayOpen] = useState('08:00 AM');
  const [thursdayClose, setThursdayClose] = useState('09:00 PM');
  const [fridayOpen, setFridayOpen] = useState('08:00 AM');
  const [fridayClose, setFridayClose] = useState('09:00 PM');
  const [saturdayOpen, setSaturdayOpen] = useState('08:00 AM');
  const [saturdayClose, setSaturdayClose] = useState('09:00 PM');
  const [sundayOpen, setSundayOpen] = useState('Closed');
  const [sundayClose, setSundayClose] = useState('');

  const [exceptions, setExceptions] = useState([
    { name: 'Christmas Day', date: 'Dec 25, 2026', status: 'Closed' }
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExDate, setNewExDate] = useState('');
  const [newExStatus, setNewExStatus] = useState('Closed');
  
  const [autoCloseHolidays, setAutoCloseHolidays] = useState(true);

  // SEO States
  const [seoKeywords, setSeoKeywords] = useState('pharmacy, prescriptions, colombo healthcare, online medicine');
  const [seoDescription, setSeoDescription] = useState('Order prescription medicines online, consult with certified pharmacists, and get fast delivery.');

  // System states
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Fetch current settings
  const { data: config, isLoading, refetch } = useQuery<any>({
    queryKey: ['tenant-config'],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  // Load configuration into state on mount / fetch success
  useEffect(() => {
    if (config) {
      setName(config.name || '');
      setTitle(config.website_title || 'Our Pharmacy');
      setDesc(config.website_description || 'Your trusted local healthcare partner.');
      setPrimaryColor(config.brand_color_primary || '#0f3d57');
      setSecondaryColor(config.brand_color_secondary || '#2ecc71');
      setMapLink(config.map_link || '');
      setEmail(config.contact_email || '');
      setPhone(config.contact_phone || '');
      setAddress(config.contact_address || '');
      setLogoUrl(config.logo_url || '');

      // Check if there are serialized configurations inside local storage
      const builderState = localStorage.getItem(`builder-state-${config.subdomain}`);
      if (builderState) {
        try {
          const parsed = JSON.parse(builderState);
          if (parsed.headingsFont) setHeadingsFont(parsed.headingsFont);
          if (parsed.bodyFont) setBodyFont(parsed.bodyFont);
          if (parsed.logoHeight) setLogoHeight(parsed.logoHeight);
          if (parsed.stickyHeader !== undefined) setStickyHeader(parsed.stickyHeader);
          if (parsed.heroHeadline) setHeroHeadline(parsed.heroHeadline);
          if (parsed.heroSubheadline) setHeroSubheadline(parsed.heroSubheadline);
          if (parsed.heroButtonText) setHeroButtonText(parsed.heroButtonText);
          if (parsed.heroBgImage) setHeroBgImage(parsed.heroBgImage);
          if (parsed.hours) {
            if (parsed.hours.MondayOpen) setMondayOpen(parsed.hours.MondayOpen);
            if (parsed.hours.MondayClose) setMondayClose(parsed.hours.MondayClose);
            if (parsed.hours.TuesdayOpen) setTuesdayOpen(parsed.hours.TuesdayOpen);
            if (parsed.hours.TuesdayClose) setTuesdayClose(parsed.hours.TuesdayClose);
            if (parsed.hours.WednesdayOpen) setWednesdayOpen(parsed.hours.WednesdayOpen);
            if (parsed.hours.WednesdayClose) setWednesdayClose(parsed.hours.WednesdayClose);
            if (parsed.hours.ThursdayOpen) setThursdayOpen(parsed.hours.ThursdayOpen);
            if (parsed.hours.ThursdayClose) setThursdayClose(parsed.hours.ThursdayClose);
            if (parsed.hours.FridayOpen) setFridayOpen(parsed.hours.FridayOpen);
            if (parsed.hours.FridayClose) setFridayClose(parsed.hours.FridayClose);
            if (parsed.hours.SaturdayOpen) setSaturdayOpen(parsed.hours.SaturdayOpen);
            if (parsed.hours.SaturdayClose) setSaturdayClose(parsed.hours.SaturdayClose);
            if (parsed.hours.SundayOpen) setSundayOpen(parsed.hours.SundayOpen);
          }
          if (parsed.exceptions) setExceptions(parsed.exceptions);
          if (parsed.autoCloseHolidays !== undefined) setAutoCloseHolidays(parsed.autoCloseHolidays);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [config]);

  // Set unsaved changes indicator
  const registerChange = () => {
    setUnsavedChanges(true);
  };

  // Preset theme selector
  const selectPreset = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    registerChange();
  };

  // Add holiday exception
  const handleAddException = () => {
    if (!newExName.trim() || !newExDate) return;
    setExceptions(prev => [...prev, { name: newExName.trim(), date: newExDate, status: newExStatus }]);
    setNewExName('');
    setNewExDate('');
    registerChange();
  };

  // Remove holiday exception
  const handleRemoveException = (idx: number) => {
    setExceptions(prev => prev.filter((_, i) => i !== idx));
    registerChange();
  };

  // 2. Update settings mutation
  const updateConfigMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/tenant/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetch();
      // Save builder-only states locally
      if (config?.subdomain) {
        localStorage.setItem(`builder-state-${config.subdomain}`, JSON.stringify({
          headingsFont,
          bodyFont,
          logoHeight,
          stickyHeader,
          heroHeadline,
          heroSubheadline,
          heroButtonText,
          heroBgImage,
          hours: {
            MondayOpen: mondayOpen, MondayClose: mondayClose,
            TuesdayOpen: tuesdayOpen, TuesdayClose: tuesdayClose,
            WednesdayOpen: wednesdayOpen, WednesdayClose: wednesdayClose,
            ThursdayOpen: thursdayOpen, ThursdayClose: thursdayClose,
            FridayOpen: fridayOpen, FridayClose: fridayClose,
            SaturdayOpen: saturdayOpen, SaturdayClose: saturdayClose,
            SundayOpen: sundayOpen
          },
          exceptions,
          autoCloseHolidays
        }));
      }
      setUnsavedChanges(false);
      setShowPublishModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
    onError: (err: any) => {
      setSaveError(err.message || 'Failed to save modifications.');
    }
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    // Extract src from iframe map link paste
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
      <div className="h-96 flex flex-col items-center justify-center text-[#72787e] gap-2 font-sans text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-primary-container" />
        <span>Loading website builder canvas...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] -mx-8 -my-8 overflow-hidden bg-[#f7f9fc] font-sans text-xs text-on-surface select-none">
      
      {/* LEFT SIDEBAR: Inspector Settings Controls */}
      <section className="w-full md:w-[480px] bg-white border-r border-outline-variant/50 flex flex-col shrink-0 z-10 shadow-[2px_0_12px_rgba(0,0,0,0.02)] h-full">
        
        {/* Builder Panel Tab Header */}
        <div className="px-6 pt-5 pb-4 border-b border-outline-variant/40 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-base font-bold text-[#00273b] font-display">Website Settings</h1>
            
            {unsavedChanges && (
              <span className="bg-amber-50 text-[#f57f17] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex gap-4 border-b border-outline-variant/30">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`pb-2 font-semibold tracking-wider text-[11px] uppercase border-b-2 cursor-pointer transition-all ${
                activeTab === 'appearance'
                  ? 'border-highlight-teal text-highlight-teal'
                  : 'border-transparent text-outline hover:text-on-surface-variant'
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-2 font-semibold tracking-wider text-[11px] uppercase border-b-2 cursor-pointer transition-all ${
                activeTab === 'content'
                  ? 'border-highlight-teal text-highlight-teal'
                  : 'border-transparent text-outline hover:text-on-surface-variant'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('navigation')}
              className={`pb-2 font-semibold tracking-wider text-[11px] uppercase border-b-2 cursor-pointer transition-all ${
                activeTab === 'navigation'
                  ? 'border-highlight-teal text-highlight-teal'
                  : 'border-transparent text-outline hover:text-on-surface-variant'
              }`}
            >
              Elements
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`pb-2 font-semibold tracking-wider text-[11px] uppercase border-b-2 cursor-pointer transition-all ${
                activeTab === 'seo'
                  ? 'border-highlight-teal text-highlight-teal'
                  : 'border-transparent text-outline hover:text-on-surface-variant'
              }`}
            >
              SEO
            </button>
          </div>
        </div>

        {/* Scrollable Settings Form */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-[#f8f9ff]">
          
          {saveSuccess && (
            <div className="p-3 bg-secondary-container/20 border border-secondary/20 text-[#00743a] rounded-lg flex items-center gap-2 font-semibold text-xs transition-all duration-200">
              <CheckCircle className="h-4 w-4 shrink-0" /> Customizations published successfully!
            </div>
          )}
          {saveError && (
            <div className="p-3 bg-error-container/30 border border-error/20 text-error rounded-lg flex items-center gap-2 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}

          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              
              {/* Branding Section */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4 flex items-center justify-between">
                  <span>Branding & Logo</span>
                  <Sparkles size={13} className="text-highlight-teal" />
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">Primary Logo URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://example.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => { setLogoUrl(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  
                  {logoUrl && (
                    <div className="border border-dashed border-outline-variant/60 rounded-lg p-3 flex flex-col items-center justify-center bg-[#f7f9fc]">
                      <img src={logoUrl} alt="Branding logo preview" className="h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-[10px] text-outline mt-1.5">Current Logo Graphic Active</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">Favicon Shortcut Mock</label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-outline-variant/60 rounded bg-white flex items-center justify-center font-extrabold text-highlight-teal font-display text-sm">
                        {name ? name.substring(0, 1).toUpperCase() : 'P'}
                      </div>
                      <button type="button" className="px-3 py-1.5 border border-outline-variant text-[#00273b] hover:bg-surface-container rounded font-semibold text-[11px] transition-colors cursor-pointer">
                        Upload .ico Icon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Color Palette</h3>
                
                <div className="space-y-4">
                  {/* Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-2">Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button" 
                        onClick={() => selectPreset('#0f3d57', '#2ecc71')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#0f3d57' && secondaryColor === '#2ecc71' ? 'border-highlight-teal bg-[#f8f9ff]' : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#0f3d57]"></div>
                          <div className="w-1/2 bg-[#2ecc71]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">Professional</span>
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={() => selectPreset('#2c3e50', '#3498db')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#2c3e50' && secondaryColor === '#3498db' ? 'border-highlight-teal bg-[#f8f9ff]' : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#2c3e50]"></div>
                          <div className="w-1/2 bg-[#3498db]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">Clinical Blue</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => selectPreset('#1a5276', '#e67e22')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#1a5276' && secondaryColor === '#e67e22' ? 'border-highlight-teal bg-[#f8f9ff]' : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#1a5276]"></div>
                          <div className="w-1/2 bg-[#e67e22]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">Warm Care</span>
                      </button>
                    </div>
                  </div>

                  {/* Hex values custom colors */}
                  <div className="border-t border-outline-variant/30 pt-3 space-y-3">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Custom Brand Hex</label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => { setPrimaryColor(e.target.value); registerChange(); }}
                          className="w-6 h-6 rounded border-0 outline-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-semibold">Primary Brand</span>
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => { setPrimaryColor(e.target.value); registerChange(); }}
                        className="w-20 px-2 py-1 text-center font-mono border border-outline-variant rounded bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => { setSecondaryColor(e.target.value); registerChange(); }}
                          className="w-6 h-6 rounded border-0 outline-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-semibold">Accent Action</span>
                      </div>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => { setSecondaryColor(e.target.value); registerChange(); }}
                        className="w-20 px-2 py-1 text-center font-mono border border-outline-variant rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography fonts */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Typography Fonts</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Headings Font</label>
                    <div className="relative">
                      <select
                        value={headingsFont}
                        onChange={(e) => { setHeadingsFont(e.target.value); registerChange(); }}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                      >
                        <option value="poppins">Poppins</option>
                        <option value="inter">Inter</option>
                        <option value="sans">System Sans</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Body Font</label>
                    <div className="relative">
                      <select
                        value={bodyFont}
                        onChange={(e) => { setBodyFont(e.target.value); registerChange(); }}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                      >
                        <option value="inter">Inter</option>
                        <option value="poppins">Poppins</option>
                        <option value="sans">System Sans</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#f7f9fc] rounded border border-outline-variant/50">
                    <p className="text-sm font-bold text-primary mb-1" style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      Interactive Typography
                    </p>
                    <p className="text-xs text-on-surface-variant" style={{ fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      This preview content updates automatically to demonstrate font weight scales.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              
              {/* Public Business Details */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Store Profile Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Public Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => { setName(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Website Main Heading *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Website Intro Summary *</label>
                    <textarea
                      required
                      value={desc}
                      onChange={(e) => { setDesc(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); registerChange(); }}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); registerChange(); }}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Physical Store Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Galle Road, Colombo"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Google Maps Embed Link / Iframe</label>
                    <input
                      type="text"
                      placeholder="Paste iframe code src link directly"
                      value={mapLink}
                      onChange={(e) => { setMapLink(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Standard Hours Settings */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Standard Hours</h3>
                
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  
                  {/* Monday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Monday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mondayOpen}
                        onChange={(e) => { setMondayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={mondayClose}
                        onChange={(e) => { setMondayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Tuesday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Tuesday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tuesdayOpen}
                        onChange={(e) => { setTuesdayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={tuesdayClose}
                        onChange={(e) => { setTuesdayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Wednesday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Wednesday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={wednesdayOpen}
                        onChange={(e) => { setWednesdayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={wednesdayClose}
                        onChange={(e) => { setWednesdayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Thursday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Thursday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={thursdayOpen}
                        onChange={(e) => { setThursdayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={thursdayClose}
                        onChange={(e) => { setThursdayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Friday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Friday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fridayOpen}
                        onChange={(e) => { setFridayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={fridayClose}
                        onChange={(e) => { setFridayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Saturday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Saturday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={saturdayOpen}
                        onChange={(e) => { setSaturdayOpen(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={saturdayClose}
                        onChange={(e) => { setSaturdayClose(e.target.value); registerChange(); }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Sunday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">Sunday</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sundayOpen}
                        onChange={(e) => { setSundayOpen(e.target.value); registerChange(); }}
                        className="w-44 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Special Exceptions */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b]">Special Exceptions</h3>
                </div>
                
                <div className="space-y-3">
                  {exceptions.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg shadow-sm">
                      <div>
                        <div className="font-semibold text-[#00273b]">{ex.name}</div>
                        <div className="text-[10px] text-outline mt-0.5">{ex.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-[#42474d] text-[10px] font-bold">{ex.status}</span>
                        <button type="button" onClick={() => handleRemoveException(idx)} className="text-outline hover:text-error transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add exception inline form */}
                  <div className="border-t border-outline-variant/30 pt-3 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline">Add Holiday Exception</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Exception Name"
                        value={newExName}
                        onChange={(e) => setNewExName(e.target.value)}
                        className="px-2.5 py-1.5 bg-background border border-outline-variant rounded text-xs"
                      />
                      <input
                        type="text"
                        placeholder="e.g. Dec 25, 2026"
                        value={newExDate}
                        onChange={(e) => setNewExDate(e.target.value)}
                        className="px-2.5 py-1.5 bg-background border border-outline-variant rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <select
                        value={newExStatus}
                        onChange={(e) => setNewExStatus(e.target.value)}
                        className="px-2 py-1.5 border border-outline-variant rounded text-xs w-28 bg-white cursor-pointer"
                      >
                        <option value="Closed">Closed</option>
                        <option value="Half Day">Half Day</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddException}
                        className="px-3 py-1.5 bg-primary text-white font-semibold rounded text-xs cursor-pointer flex items-center gap-1 hover:bg-primary/95 shadow-sm"
                      >
                        <Plus size={13} /> Add Date
                      </button>
                    </div>
                  </div>

                  {/* Auto-close on Public Holidays Toggle */}
                  <div className="border-t border-outline-variant/30 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-on-surface">Auto-close on Public Holidays</div>
                        <div className="text-[10px] text-outline mt-0.5">Automatically mark pharmacy as closed on national calendar holidays.</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAutoCloseHolidays(!autoCloseHolidays); registerChange(); }}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                          autoCloseHolidays ? 'bg-highlight-teal' : 'bg-outline-variant'
                        }`}
                      >
                        <span className={`absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          autoCloseHolidays ? 'translate-x-[22px]' : 'translate-x-[4px]'
                        }`} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: NAVIGATION & ELEMENTS */}
          {activeTab === 'navigation' && (
            <div className="space-y-5">
              
              {/* Header Navigation Options */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Header Navigation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">Sticky Header Bar</div>
                      <div className="text-[10px] text-outline mt-0.5">Locks the header at the top of the browser while scrolling.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStickyHeader(!stickyHeader); registerChange(); }}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                        stickyHeader ? 'bg-highlight-teal' : 'bg-outline-variant'
                      }`}
                    >
                      <span className={`absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                        stickyHeader ? 'translate-x-[22px]' : 'translate-x-[4px]'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Logo Height (px)</label>
                    <input
                      type="number"
                      min="20"
                      max="100"
                      value={logoHeight}
                      onChange={(e) => { setLogoHeight(Number(e.target.value) || 40); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section Page Elements */}
              <div className="bg-white p-5 rounded-xl border border-[#17a589] shadow-[0_4px_12px_rgba(23,165,137,0.1)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Hero Section Text</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Primary Headline</label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => { setHeroHeadline(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Sub-headline Description</label>
                    <textarea
                      value={heroSubheadline}
                      onChange={(e) => { setHeroSubheadline(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Primary CTA Button Label</label>
                    <input
                      type="text"
                      value={heroButtonText}
                      onChange={(e) => { setHeroButtonText(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-outline-variant/30">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">Hero Background Image</label>
                    <input
                      type="text"
                      value={heroBgImage}
                      onChange={(e) => { setHeroBgImage(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              
              {/* Search Engine Optimization */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">SEO Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Meta Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => { setSeoKeywords(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Meta Description *</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => { setSeoDescription(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-24 resize-none text-on-surface-variant"
                    />
                    <span className="text-[10px] text-outline block mt-1.5 leading-relaxed">
                      Write a description between 150-160 characters for optimal Google and SEO indexing.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Builder Footer Actions */}
        <div className="p-4 border-t border-outline-variant/40 bg-white flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (unsavedChanges && window.confirm('Discard unsaved changes?')) {
                refetch();
                setUnsavedChanges(false);
              }
            }}
            disabled={!unsavedChanges}
            className="px-4 py-2 border border-outline-variant text-[#00273b] hover:bg-surface-container rounded font-semibold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={updateConfigMutation.isPending || !unsavedChanges}
            className="px-4 py-2 border border-primary-navy text-primary-navy font-semibold hover:bg-surface-container-low rounded text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2 bg-secondary hover:bg-secondary/95 text-white font-semibold rounded text-xs transition-colors cursor-pointer shadow-sm"
          >
            Publish Now
          </button>
        </div>

      </section>

      {/* RIGHT PREVIEW CANVAS: Live Mockup Viewport */}
      <section className="flex-1 flex flex-col bg-[#f0f2f5] overflow-hidden relative h-full select-text">
        
        {/* Preview Toolbar header */}
        <div className="h-12 border-b border-outline-variant bg-white flex justify-between items-center px-6 z-10 shrink-0">
          <div className="flex items-center gap-2 bg-red-50 text-red-800 px-3 py-1 rounded-full border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-bold text-[10px] tracking-wider uppercase">LIVE PREVIEW</span>
          </div>

          {/* Desktop/Mobile Device Toggle Buttons */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/60">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                previewDevice === 'desktop' ? 'bg-white text-primary-navy shadow-sm' : 'text-outline hover:text-primary-navy'
              }`}
            >
              <Laptop size={14} />
              <span className="text-[10px] font-bold">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                previewDevice === 'mobile' ? 'bg-white text-primary-navy shadow-sm' : 'text-outline hover:text-primary-navy'
              }`}
            >
              <Smartphone size={14} />
              <span className="text-[10px] font-bold">Mobile</span>
            </button>
          </div>

          <a 
            href={`http://${config?.subdomain || 'test'}.localhost:3000`} 
            target="_blank"
            rel="noreferrer"
            className="text-primary-navy font-semibold flex items-center gap-1 hover:text-highlight-teal transition-colors text-xs"
          >
            Open Live Subdomain
          </a>
        </div>

        {/* Simulated Browser Window wrapper */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center custom-scrollbar">
          
          {previewDevice === 'desktop' ? (
            /* DESKTOP VIEWPORT SCREEN */
            <div className="w-full max-w-[1024px] bg-white rounded-xl shadow-2xl overflow-hidden border border-outline-variant/60 flex flex-col min-h-[560px] self-start transition-all duration-300">
              
              {/* Desktop address bar chrome */}
              <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2.5 shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 bg-white rounded-md h-7 border border-outline-variant/50 flex items-center justify-center text-[10px] text-outline font-mono">
                  <Lock size={10} className="mr-1 text-secondary" />
                  <span>https://{config?.subdomain || 'test'}.pharmacyhub.lk</span>
                </div>
              </div>

              {/* Simulated Website Body Container */}
              <div className="flex-1 overflow-y-auto text-on-surface bg-white font-sans text-xs select-text">
                
                {/* Header (Sticky binding) */}
                <header className={`border-b border-outline-variant/30 bg-white/95 backdrop-blur-md z-40 px-6 py-3 flex justify-between items-center ${
                  stickyHeader ? 'sticky top-0' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="logo" style={{ height: `${logoHeight}px` }} className="object-contain" />
                    ) : (
                      <div 
                        className="rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: primaryColor, width: `${logoHeight + 4}px`, height: `${logoHeight + 4}px` }}
                      >
                        {name ? name.substring(0, 2).toUpperCase() : 'PH'}
                      </div>
                    )}
                    <span className="font-bold text-sm tracking-tight text-primary-navy" style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      {name || 'Pharmacy Name'}
                    </span>
                  </div>

                  <nav className="flex gap-5 text-[11px] font-semibold text-outline">
                    <a className="text-[#2ecc71] border-b-2 border-[#2ecc71] pb-0.5" href="#" style={{ color: secondaryColor, borderBottomColor: secondaryColor }}>Home</a>
                    <a className="hover:text-primary-navy" href="#">Medicines</a>
                    <a className="hover:text-primary-navy" href="#">Upload Prescription</a>
                    <a className="hover:text-primary-navy" href="#">Contact</a>
                  </nav>

                  <button type="button" className="px-4 py-1.5 text-white font-semibold rounded text-[11px] shadow-sm cursor-pointer" style={{ backgroundColor: secondaryColor }}>
                    Login / Register
                  </button>
                </header>

                {/* Hero Section */}
                <section className="relative px-12 py-16 flex items-center bg-[#f7f9fc] border-b border-outline-variant/20">
                  <div className="w-1/2 pr-6 z-10 text-left">
                    <span className="font-bold text-[10px] uppercase tracking-widest mb-1.5 block" style={{ color: secondaryColor }}>
                      Trusted Healthcare Partner
                    </span>
                    <h2 className="text-3xl font-extrabold text-primary mb-3 leading-tight" style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', color: primaryColor }}>
                      {heroHeadline || 'Your Neighborhood Care.'}
                    </h2>
                    <p className="text-on-surface-variant mb-6 text-xs leading-relaxed max-w-sm" style={{ fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      {heroSubheadline || 'Providing expert clinical services and prescriptions right in your community.'}
                    </p>
                    <div className="flex gap-3">
                      <button type="button" className="px-5 py-2.5 text-white rounded font-bold text-[11px] shadow-md flex items-center gap-1.5 cursor-pointer" style={{ backgroundColor: secondaryColor }}>
                        {heroButtonText || 'Refill Now'}
                      </button>
                      <button type="button" className="border-2 px-5 py-2.5 rounded font-bold text-[11px] hover:bg-primary hover:text-white transition-all cursor-pointer" style={{ borderColor: primaryColor, color: primaryColor }}>
                        Shop Essentials
                      </button>
                    </div>
                  </div>
                  <div className="w-1/2 relative h-48 rounded-xl overflow-hidden shadow-lg border border-white">
                    <img src={heroBgImage} alt="Pharmacy interior showcase" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </div>
                </section>

                {/* Simulated Opening Hours & Location cards */}
                <section className="p-8 bg-white grid grid-cols-2 gap-6 text-left">
                  {/* Hours Card */}
                  <div className="bg-[#f8f9ff] border border-outline-variant/40 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-primary" style={{ color: primaryColor }}>
                      <Calendar size={18} />
                      <h3 className="font-bold text-xs uppercase tracking-wider font-display">Opening Hours</h3>
                    </div>
                    <div className="space-y-1.5 text-xs text-on-surface-variant font-mono">
                      <div className="flex justify-between py-1 border-b border-outline-variant/20">
                        <span>Mon - Sat</span>
                        <span>{mondayOpen} - {mondayClose}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Sunday</span>
                        <span className="italic">{sundayOpen}</span>
                      </div>
                    </div>
                    
                    {autoCloseHolidays && (
                      <div className="mt-4 p-2.5 bg-secondary-container/20 rounded text-[10px] text-on-secondary-container border border-secondary/15 flex gap-1.5 items-start">
                        <CheckCircle size={12} className="shrink-0 mt-0.5 text-secondary" />
                        <span>Closed on Christmas Day (Dec 25) and all Sri Lankan public holidays.</span>
                      </div>
                    )}
                  </div>

                  {/* Address Card */}
                  <div className="bg-[#f8f9ff] border border-outline-variant/40 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-3 text-primary" style={{ color: primaryColor }}>
                      <MapPin size={18} />
                      <h3 className="font-bold text-xs uppercase tracking-wider font-display">Visit Us</h3>
                    </div>
                    <address className="not-italic text-xs text-on-surface-variant space-y-0.5">
                      <p className="font-bold text-primary">{name || 'Pharmacy Name'}</p>
                      <p>{address || 'No address configured yet.'}</p>
                      {phone && <p className="font-mono text-[10px] mt-1.5">📞 {phone}</p>}
                      {email && <p className="text-[10px]">✉️ {email}</p>}
                    </address>
                    
                    {mapLink ? (
                      <div className="h-16 mt-3 bg-white rounded-lg border border-outline-variant/40 flex items-center justify-center text-[10px] text-outline uppercase tracking-wider font-bold gap-1">
                        <Globe size={12} className="text-secondary animate-pulse" /> Map Location Loaded
                      </div>
                    ) : (
                      <div className="h-16 mt-3 rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-[10px] text-outline uppercase">
                        Location Map Not Added
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          ) : (
            /* MOBILE NOTCH FRAME SCREEN */
            <div className="w-[360px] h-[720px] bg-white border-[10px] border-slate-900 rounded-[2rem] relative overflow-hidden flex flex-col shadow-2xl self-start transition-all duration-300 transform origin-top shrink-0">
              
              {/* Mobile top notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 border-b-xl rounded-b-xl z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* simulated phone content container */}
              <div className="flex-grow overflow-y-auto w-full pt-6 select-text text-left">
                
                {/* Mobile simulated header */}
                <header className="flex justify-between items-center px-4 py-3 border-b border-outline-variant/20 bg-white/95 sticky top-0 z-40">
                  <div className="flex items-center gap-1.5">
                    {logoUrl ? (
                      <img src={logoUrl} alt="logo" style={{ height: '24px' }} className="object-contain" />
                    ) : (
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px]"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {name ? name.substring(0, 2).toUpperCase() : 'PH'}
                      </div>
                    )}
                    <span className="font-bold text-xs tracking-tight text-primary-navy" style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      {name || 'Pharmacy'}
                    </span>
                  </div>
                  
                  {/* Hamburger icon */}
                  <div className="w-6 h-6 rounded flex flex-col justify-center gap-1 items-end p-1 cursor-pointer">
                    <span className="w-4 h-0.5 bg-[#00273b]"></span>
                    <span className="w-3.5 h-0.5 bg-[#00273b]"></span>
                    <span className="w-4 h-0.5 bg-[#00273b]"></span>
                  </div>
                </header>

                {/* Mobile Hero section (Stacked Layout) */}
                <section className="bg-[#f7f9fc] flex flex-col">
                  <div className="h-40 w-full relative shrink-0">
                    <img src={heroBgImage} alt="store showcase" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent mix-blend-multiply"></div>
                  </div>
                  <div className="p-5 -mt-6 bg-white mx-3 rounded-xl border border-outline-variant/20 shadow-md text-center relative z-10 mb-4">
                    <div className="inline-block px-2.5 py-0.5 bg-secondary-container/30 text-[#00743a] text-[9px] font-bold uppercase tracking-wider rounded-full mb-2">
                      Open Today until 9PM
                    </div>
                    <h2 className="text-xl font-bold text-primary mb-2 leading-tight" style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', color: primaryColor }}>
                      {heroHeadline || 'Your Neighborhood Care.'}
                    </h2>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed mb-4" style={{ fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}>
                      {heroSubheadline || 'Providing expert clinical services and prescriptions right in your community.'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <button type="button" className="w-full py-2 bg-[#2ecc71] text-white rounded font-bold text-xs shadow cursor-pointer" style={{ backgroundColor: secondaryColor }}>
                        {heroButtonText || 'Refill Now'}
                      </button>
                      <button type="button" className="w-full py-2 bg-white text-primary border border-outline-variant rounded font-bold text-xs cursor-pointer" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Shop Essentials
                      </button>
                    </div>
                  </div>
                </section>

                {/* Mobile opening hours stacked */}
                <section className="px-4 pb-6 space-y-4">
                  
                  {/* Hours */}
                  <div className="bg-[#f8f9ff] border border-outline-variant/40 rounded-xl p-4 shadow-sm text-xs">
                    <div className="flex items-center gap-2 mb-3 text-primary" style={{ color: primaryColor }}>
                      <Calendar size={16} />
                      <span className="font-bold font-display uppercase tracking-wider">Opening Hours</span>
                    </div>
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between border-b border-outline-variant/15 py-1">
                        <span>Mon - Sat</span>
                        <span>{mondayOpen} - {mondayClose}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Sunday</span>
                        <span className="italic">{sundayOpen}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visit Us */}
                  <div className="bg-[#f8f9ff] border border-outline-variant/40 rounded-xl p-4 shadow-sm text-xs">
                    <div className="flex items-center gap-2 mb-2 text-primary" style={{ color: primaryColor }}>
                      <MapPin size={16} />
                      <span className="font-bold font-display uppercase tracking-wider">Visit Us</span>
                    </div>
                    <address className="not-italic text-on-surface-variant space-y-0.5 leading-relaxed">
                      <p className="font-bold text-primary">{name || 'Pharmacy Name'}</p>
                      <p>{address || 'No address configured yet.'}</p>
                    </address>
                  </div>

                </section>

              </div>

              {/* Mobile home indicator bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-900 rounded-full z-50"></div>

            </div>
          )}

        </div>

      </section>

      {/* PUBLISH CHECKLIST OVERLAY MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-primary/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-outline-variant rounded-xl max-w-md w-full p-6 md:p-8 shadow-[0_24px_64px_rgba(15,61,87,0.18)] text-left animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/30 flex flex-col items-center text-center bg-[#f8f9ff] rounded-t-xl -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-[#00743a] flex items-center justify-center mb-3 shadow-[0_4px_12px_rgba(107,254,156,0.2)]">
                <Globe className="h-6 w-6 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-primary font-display">Ready to Publish?</h2>
              <p className="text-[11px] text-on-surface-variant mt-1.5">Your public pharmacy website will go live instantly at:</p>
              <div className="mt-3 py-2 px-4 bg-white border border-outline-variant/75 rounded-lg font-mono font-bold text-primary-container text-xs w-full shadow-inner select-all text-center">
                {config?.subdomain || 'test'}.medical.lk
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Publishing Checklist</h3>
              <ul className="space-y-3 text-xs">
                
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">Store Identity &amp; Branding</p>
                    <p className="text-[10px] text-outline">Logo, custom typography, and primary color preset applied.</p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">Contact &amp; Location Details</p>
                    <p className="text-[10px] text-outline">Active phone, email, store location, and hours formatted.</p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">SEO Configuration</p>
                    <p className="text-[10px] text-outline">Meta description and keywords ready for indexing.</p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-on-surface">Device Compatibility</p>
                    <p className="text-[10px] text-outline">Layout and hero banner reflow matches desktop and mobile.</p>
                  </div>
                </li>

              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={updateConfigMutation.isPending}
                className="flex-1 py-2 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {updateConfigMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                  </>
                ) : (
                  <>
                    <Rocket size={14} /> Yes, Publish Now
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
