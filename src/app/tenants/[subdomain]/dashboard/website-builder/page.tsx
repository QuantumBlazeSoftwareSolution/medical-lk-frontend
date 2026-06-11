'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Settings, Loader2, Sparkles, Layout, Eye, 
  MapPin, Phone, Mail, Globe, Check, Smartphone, 
  Laptop, ChevronDown, Plus, Trash2, HelpCircle, 
  User, CheckCircle, AlertTriangle, Rocket, Lock, 
  Image as ImageIcon, HelpCircle as HelpIcon, ArrowLeft,
  Calendar, RotateCcw, ShieldCheck, Heart, Activity,
  MessageSquare, Menu, Search, ChevronRight, Clock
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function WebsiteBuilder() {
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

  // Statistics States
  const [statExperience, setStatExperience] = useState('15+');
  const [statPatients, setStatPatients] = useState('5,000+');
  const [statProducts, setStatProducts] = useState('2,000+');
  const [statWaitTime, setStatWaitTime] = useState('15 Min');

  // Services States
  const [services, setServices] = useState<Array<{ title: string; description: string; icon: string }>>([
    { title: 'Prescription Fulfillment', description: 'Fast, accurate dispensing of medications with thorough interaction checks by our licensed pharmacists.', icon: 'Check' },
    { title: 'Home Delivery', description: 'Convenient doorstep delivery across Colombo within 24 hours. Cold chain maintained for sensitive drugs.', icon: 'Clock' },
    { title: 'Health Consultations', description: 'Private consultations to discuss medication management, side effects, and general wellness plans.', icon: 'Heart' },
    { title: 'Cosmetics & Derma', description: 'Curated selection of dermatologically tested skincare and personal care products.', icon: 'Sparkles' },
    { title: 'Health Monitoring', description: 'In-store blood pressure checking, blood sugar testing, and BMI calculation services.', icon: 'Activity' },
    { title: 'Baby & Mother Care', description: 'Everything you need for maternal health and infant care, from nutrition to hygiene essentials.', icon: 'ShieldCheck' }
  ]);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('Check');

  const getIconComponent = (iconName: string, size = 12) => {
    switch (iconName) {
      case 'Check': return <Check size={size} />;
      case 'Clock': return <Clock size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Activity': return <Activity size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Mail': return <Mail size={size} />;
      case 'Phone': return <Phone size={size} />;
      case 'MapPin': return <MapPin size={size} />;
      case 'Globe': return <Globe size={size} />;
      case 'Calendar': return <Calendar size={size} />;
      case 'CheckCircle': return <CheckCircle size={size} />;
      default: return <CheckCircle size={size} />;
    }
  };

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

  // Display credentials & certificates
  const [displayNmraNumber, setDisplayNmraNumber] = useState('');
  const [displayBrNumber, setDisplayBrNumber] = useState('');
  const [displaySlmcNumber, setDisplaySlmcNumber] = useState('');
  const [certificates, setCertificates] = useState<{ name: string; url: string }[]>([]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

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

      // Load DB values first
      if (config.headings_font) setHeadingsFont(config.headings_font);
      if (config.body_font) setBodyFont(config.body_font);
      if (config.logo_height !== undefined && config.logo_height !== null) setLogoHeight(config.logo_height);
      if (config.sticky_header !== undefined && config.sticky_header !== null) setStickyHeader(config.sticky_header);
      if (config.hero_headline) setHeroHeadline(config.hero_headline);
      if (config.hero_subheadline) setHeroSubheadline(config.hero_subheadline);
      if (config.hero_button_text) setHeroButtonText(config.hero_button_text);
      if (config.hero_bg_image) setHeroBgImage(config.hero_bg_image);
      if (config.auto_close_holidays !== undefined && config.auto_close_holidays !== null) setAutoCloseHolidays(config.auto_close_holidays);
      if (config.seo_keywords) setSeoKeywords(config.seo_keywords);
      
      if (config.display_nmra_number) setDisplayNmraNumber(config.display_nmra_number);
      if (config.display_br_number) setDisplayBrNumber(config.display_br_number);
      if (config.display_slmc_number) setDisplaySlmcNumber(config.display_slmc_number);
      if (config.certificates_json) {
        try {
          const parsedCerts = JSON.parse(config.certificates_json);
          if (Array.isArray(parsedCerts)) setCertificates(parsedCerts);
        } catch (e) {
          console.error("Error parsing certificates_json", e);
        }
      }

      if (config.stats_json) {
        try {
          const parsedStats = JSON.parse(config.stats_json);
          if (parsedStats.experience) setStatExperience(parsedStats.experience);
          if (parsedStats.patients) setStatPatients(parsedStats.patients);
          if (parsedStats.products) setStatProducts(parsedStats.products);
          if (parsedStats.wait_time) setStatWaitTime(parsedStats.wait_time);
        } catch (e) {
          console.error("Error parsing stats_json", e);
        }
      }

      if (config.services_json) {
        try {
          const parsedServices = JSON.parse(config.services_json);
          if (Array.isArray(parsedServices) && parsedServices.length > 0) setServices(parsedServices);
        } catch (e) {
          console.error("Error parsing services_json", e);
        }
      }

      if (config.opening_hours) {
        try {
          const parsedHours = JSON.parse(config.opening_hours);
          if (parsedHours.MondayOpen) setMondayOpen(parsedHours.MondayOpen);
          if (parsedHours.MondayClose) setMondayClose(parsedHours.MondayClose);
          if (parsedHours.TuesdayOpen) setTuesdayOpen(parsedHours.TuesdayOpen);
          if (parsedHours.TuesdayClose) setTuesdayClose(parsedHours.TuesdayClose);
          if (parsedHours.WednesdayOpen) setWednesdayOpen(parsedHours.WednesdayOpen);
          if (parsedHours.WednesdayClose) setWednesdayClose(parsedHours.WednesdayClose);
          if (parsedHours.ThursdayOpen) setThursdayOpen(parsedHours.ThursdayOpen);
          if (parsedHours.ThursdayClose) setThursdayClose(parsedHours.ThursdayClose);
          if (parsedHours.FridayOpen) setFridayOpen(parsedHours.FridayOpen);
          if (parsedHours.FridayClose) setFridayClose(parsedHours.FridayClose);
          if (parsedHours.SaturdayOpen) setSaturdayOpen(parsedHours.SaturdayOpen);
          if (parsedHours.SaturdayClose) setSaturdayClose(parsedHours.SaturdayClose);
          if (parsedHours.SundayOpen) setSundayOpen(parsedHours.SundayOpen);
        } catch (e) {
          console.error("Error parsing opening_hours", e);
        }
      }

      if (config.holiday_exceptions) {
        try {
          const parsedEx = JSON.parse(config.holiday_exceptions);
          if (Array.isArray(parsedEx)) setExceptions(parsedEx);
        } catch (e) {
          console.error("Error parsing holiday_exceptions", e);
        }
      }

      // Check if there are serialized configurations inside local storage (active drafts)
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
          if (parsed.seoKeywords) setSeoKeywords(parsed.seoKeywords);
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
      // Clear localStorage builder-state since it has been successfully published to the server
      if (config?.subdomain) {
        localStorage.removeItem(`builder-state-${config.subdomain}`);
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
      logo_url: logoUrl.trim() || null,
      headings_font: headingsFont,
      body_font: bodyFont,
      logo_height: Number(logoHeight) || 40,
      sticky_header: stickyHeader,
      hero_headline: heroHeadline,
      hero_subheadline: heroSubheadline,
      hero_button_text: heroButtonText,
      hero_bg_image: heroBgImage,
      opening_hours: JSON.stringify({
        MondayOpen: mondayOpen, MondayClose: mondayClose,
        TuesdayOpen: tuesdayOpen, TuesdayClose: tuesdayClose,
        WednesdayOpen: wednesdayOpen, WednesdayClose: wednesdayClose,
        ThursdayOpen: thursdayOpen, ThursdayClose: thursdayClose,
        FridayOpen: fridayOpen, FridayClose: fridayClose,
        SaturdayOpen: saturdayOpen, SaturdayClose: saturdayClose,
        SundayOpen: sundayOpen
      }),
      holiday_exceptions: JSON.stringify(exceptions),
      auto_close_holidays: autoCloseHolidays,
      seo_keywords: seoKeywords,
      display_nmra_number: displayNmraNumber.trim() || null,
      display_br_number: displayBrNumber.trim() || null,
      display_slmc_number: displaySlmcNumber.trim() || null,
      certificates_json: JSON.stringify(certificates),
      stats_json: JSON.stringify({
        experience: statExperience,
        patients: statPatients,
        products: statProducts,
        wait_time: statWaitTime
      }),
      services_json: JSON.stringify(services)
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
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-140px)] -mx-8 -my-8 overflow-hidden bg-[#f7f9fc] font-sans text-xs text-on-surface select-none">
      
      {/* LEFT SIDEBAR: Inspector Settings Controls */}
      <section className="w-full md:w-[480px] bg-white border-r border-outline-variant/50 flex flex-col shrink-0 z-10 shadow-[2px_0_12px_rgba(0,0,0,0.02)] h-full">
        
        {/* Builder Panel Tab Header */}
        <div className="px-6 pt-5 pb-4 border-b border-outline-variant/40 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-base font-bold text-[#00273b] font-display">Website Builder</h1>
            
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
                      value={heroHeadline}
                      onChange={(e) => { setHeroHeadline(e.target.value); setTitle(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Website Intro Summary *</label>
                    <textarea
                      required
                      value={heroSubheadline}
                      onChange={(e) => { setHeroSubheadline(e.target.value); setDesc(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none font-sans"
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

              {/* Statistics & Highlights */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Statistics & Highlights</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Years Experience</label>
                    <input
                      type="text"
                      value={statExperience}
                      onChange={(e) => { setStatExperience(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Happy Patients</label>
                    <input
                      type="text"
                      value={statPatients}
                      onChange={(e) => { setStatPatients(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Products Catalog</label>
                    <input
                      type="text"
                      value={statProducts}
                      onChange={(e) => { setStatProducts(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Avg Wait Time</label>
                    <input
                      type="text"
                      value={statWaitTime}
                      onChange={(e) => { setStatWaitTime(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Services Offered</h3>
                
                <div className="space-y-3">
                  {services.map((svc, idx) => (
                    <div key={idx} className="flex justify-between items-start p-2.5 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2 max-w-[85%] text-left">
                        <div className="w-6 h-6 rounded bg-[#2ecc71]/20 text-[#006d37] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}>
                          {getIconComponent(svc.icon)}
                        </div>
                        <div>
                          <div className="font-bold text-[#00273b]">{svc.title}</div>
                          <div className="text-[10px] text-outline mt-0.5 leading-relaxed">{svc.description}</div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setServices(prev => prev.filter((_, i) => i !== idx)); registerChange(); }} 
                        className="text-outline hover:text-error transition-colors cursor-pointer shrink-0 mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add service form */}
                  <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline">Add Custom Service</div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Service Title"
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                      />
                      <textarea
                        placeholder="Service Description"
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-16 resize-none font-sans"
                      />
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-outline font-bold uppercase shrink-0">Icon:</div>
                        <select
                          value={newServiceIcon}
                          onChange={(e) => setNewServiceIcon(e.target.value)}
                          className="flex-grow px-2 py-1.5 border border-outline-variant rounded bg-white text-xs cursor-pointer"
                        >
                          <option value="Check">Checkmark</option>
                          <option value="Clock">Clock</option>
                          <option value="Heart">Heart</option>
                          <option value="Sparkles">Sparkles</option>
                          <option value="Activity">Pulse / Activity</option>
                          <option value="ShieldCheck">Shield Check</option>
                          <option value="Mail">Mail</option>
                          <option value="Phone">Phone</option>
                          <option value="MapPin">Location / Pin</option>
                          <option value="Globe">Globe</option>
                          <option value="Calendar">Calendar</option>
                          <option value="CheckCircle">Check Circle</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newServiceTitle.trim() || !newServiceDesc.trim()) return;
                            setServices(prev => [...prev, { title: newServiceTitle.trim(), description: newServiceDesc.trim(), icon: newServiceIcon }]);
                            setNewServiceTitle('');
                            setNewServiceDesc('');
                            setNewServiceIcon('Check');
                            registerChange();
                          }}
                          className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs cursor-pointer flex items-center gap-1 hover:bg-primary/95 shadow-sm"
                        >
                          <Plus size={14} /> Add Service
                        </button>
                      </div>
                    </div>
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

              {/* Trust Credentials & Licensing */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#17a589] opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">Trust Credentials & Licensing</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Display NMRA Registration No.</label>
                    <input
                      type="text"
                      placeholder="e.g. NMRA/PH/COL/9821"
                      value={displayNmraNumber}
                      onChange={(e) => { setDisplayNmraNumber(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Display Business Registration (BR) No.</label>
                    <input
                      type="text"
                      placeholder="e.g. PV-108291"
                      value={displayBrNumber}
                      onChange={(e) => { setDisplayBrNumber(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Display SLMC Pharmacist License No.</label>
                    <input
                      type="text"
                      placeholder="e.g. SLMC-PH-8921"
                      value={displaySlmcNumber}
                      onChange={(e) => { setDisplaySlmcNumber(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  {/* Certificates List */}
                  <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Uploaded Certificates & Licenses</div>
                    
                    {certificates.map((cert, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg">
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#00273b] text-xs truncate">{cert.name}</div>
                          <div className="text-[9px] text-outline truncate font-mono">{cert.url}</div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setCertificates(prev => prev.filter((_, i) => i !== idx)); registerChange(); }} 
                          className="text-outline hover:text-error transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add Certificate inline form */}
                    <div className="bg-[#f8f9ff] p-3 rounded-lg border border-dashed border-outline-variant/60 space-y-2 mt-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Certificate Name (e.g. NMRA License)"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Certificate Image URL (or PDF link)"
                          value={newCertUrl}
                          onChange={(e) => setNewCertUrl(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-outline-variant rounded text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCertName.trim() || !newCertUrl.trim()) return;
                            setCertificates(prev => [...prev, { name: newCertName.trim(), url: newCertUrl.trim() }]);
                            setNewCertName('');
                            setNewCertUrl('');
                            registerChange();
                          }}
                          className="px-3 py-1.5 bg-secondary hover:bg-secondary/95 text-white font-semibold rounded text-xs cursor-pointer flex items-center justify-center shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
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
                      onChange={(e) => { setHeroHeadline(e.target.value); setTitle(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Sub-headline Description</label>
                    <textarea
                      value={heroSubheadline}
                      onChange={(e) => { setHeroSubheadline(e.target.value); setDesc(e.target.value); registerChange(); }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none font-sans"
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
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-24 resize-none text-on-surface-variant font-sans"
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
      <section className="flex-grow flex flex-col bg-[#f0f2f5] overflow-hidden relative h-full select-text">
        
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
            <div className="w-full max-w-[1024px] bg-white rounded-xl shadow-2xl overflow-hidden border border-outline-variant/60 flex flex-col min-h-[600px] h-[75vh] self-start transition-all duration-300 relative">
              
              {/* Desktop address bar chrome */}
              <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2.5 shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 bg-white rounded-md h-7 border border-outline-variant/50 flex items-center justify-center text-[10px] text-outline font-mono">
                  <Lock size={10} className="mr-1 text-secondary" style={{ color: secondaryColor }} />
                  <span>https://{config?.subdomain || 'test'}.pharmacyhub.lk</span>
                </div>
              </div>

              {/* Simulated Website Body Container */}
              <div 
                className="flex-1 overflow-y-auto text-[#0b1c30] bg-[#f8f9ff] font-sans text-xs select-text relative flex flex-col"
                style={{ fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}
              >
                
                {/* Announcement Banner */}
                <div className="bg-[#ffb961] text-[#533200] py-2 px-4 text-center font-bold text-[10px] tracking-wide shadow-sm shrink-0">
                  10% off vitamins this week. <a className="underline hover:text-[#2b1700] ml-1 transition-colors" href="#">Learn More</a>
                </div>

                {/* Header (Sticky binding) */}
                <header className={`border-b border-[#c2c7cd]/40 bg-white/95 backdrop-blur-md z-40 px-6 py-3 flex justify-between items-center shrink-0 ${
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
                    <span 
                      className="font-bold text-sm tracking-tight text-primary-navy font-display" 
                      style={{ 
                        fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
                        color: primaryColor
                      }}
                    >
                      {name || 'Pharmacy Name'}
                    </span>
                  </div>

                  <nav className="flex gap-5 text-[10px] font-semibold text-[#42474d]">
                    <a className="transition-colors" href="#" style={{ color: secondaryColor }}>Home</a>
                    <a className="hover:text-[#0b1c30] transition-colors" href="#">About Us</a>
                    <a className="hover:text-[#0b1c30] transition-colors" href="#">Services</a>
                    <a className="hover:text-[#0b1c30] transition-colors" href="#">Hours &amp; Location</a>
                  </nav>

                  <div className="flex gap-2">
                    {phone && (
                      <a 
                        href={`tel:${phone}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                      >
                        <Phone size={10} />
                        Call Now
                      </a>
                    )}
                    {phone && (
                      <a 
                        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white transition-colors text-[9px] font-bold uppercase tracking-wider shadow-sm"
                      >
                        <MessageSquare size={10} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </header>

                {/* Hero Section */}
                <section className="relative min-h-[280px] flex items-center bg-[#00273b] overflow-hidden shrink-0">
                  <div className="absolute inset-0 z-0">
                    <div 
                      className="absolute inset-0 opacity-80 mix-blend-multiply z-10"
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                    <img 
                      src={heroBgImage} 
                      alt="Pharmacy showroom" 
                      className="object-cover w-full h-full" 
                    />
                  </div>

                  <div className="relative z-20 w-full px-6 py-10 text-left">
                    <div className="max-w-md text-white space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[9px] font-bold tracking-wide text-[#a3cbeb]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c]"></span>
                        Licensed Pharmacy &bull; Est. 2010
                      </div>
                      <h1 
                        className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white"
                        style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}
                      >
                        {heroHeadline}
                      </h1>
                      <p className="text-[10px] md:text-xs opacity-90 leading-relaxed max-w-sm text-[#eaf1ff]">
                        {heroSubheadline}
                      </p>
                      <div className="flex gap-2.5 pt-1">
                        <button 
                          className="px-4 py-2 rounded bg-[#006d37] text-white font-bold text-[9px] uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          <MapPin size={10} />
                          {heroButtonText}
                        </button>
                        {phone && (
                          <a 
                            href={`tel:${phone}`}
                            className="px-4 py-2 rounded bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer text-center"
                          >
                            <Phone size={10} />
                            Call Us
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Stats Strip */}
                <section className="bg-[#eff4ff] border-b border-[#c2c7cd]/30 relative z-30 px-6 shrink-0">
                  <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-4 gap-2 py-3 bg-white rounded-lg shadow border border-[#c2c7cd]/20 -translate-y-4">
                      <div className="text-center px-2 border-r border-[#c2c7cd]/20 last:border-0">
                        <div className="text-sm font-bold" style={{ color: primaryColor }}>{statExperience}</div>
                        <div className="text-[8px] font-bold text-[#42474d] uppercase tracking-wider">Experience</div>
                      </div>
                      <div className="text-center px-2 border-r border-[#c2c7cd]/20 last:border-0">
                        <div className="text-sm font-bold" style={{ color: primaryColor }}>{statPatients}</div>
                        <div className="text-[8px] font-bold text-[#42474d] uppercase tracking-wider">Patients</div>
                      </div>
                      <div className="text-center px-2 border-r border-[#c2c7cd]/20 last:border-0">
                        <div className="text-sm font-bold" style={{ color: primaryColor }}>{statProducts}</div>
                        <div className="text-[8px] font-bold text-[#42474d] uppercase tracking-wider">Products</div>
                      </div>
                      <div className="text-center px-2">
                        <div className="text-sm font-bold" style={{ color: primaryColor }}>{statWaitTime}</div>
                        <div className="text-[8px] font-bold text-[#42474d] uppercase tracking-wider">Wait Time</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* About Us */}
                <section className="py-8 bg-white px-6 shrink-0">
                  <div className="grid grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
                    <div className="relative">
                      <img 
                        alt="Pharmacist Assisting Customer" 
                        className="rounded-lg shadow w-full object-cover aspect-square max-h-[180px]" 
                        src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80" 
                      />
                      <div className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-lg shadow-md border border-[#c2c7cd]/20 max-w-[110px] text-left">
                        <div className="flex items-center gap-1 mb-0.5 text-secondary" style={{ color: secondaryColor }}>
                          <ShieldCheck size={14} />
                          <span className="font-bold text-[8px] uppercase tracking-wider">Verified</span>
                        </div>
                        <div className="font-bold text-[9px] text-[#0b1c30] leading-tight font-display">Licensed Care</div>
                        <div className="text-[7px] text-[#42474d] mt-0.5 font-mono">SLMC-PH-8921</div>
                      </div>
                    </div>
 
                    <div className="text-left space-y-2.5">
                      <div>
                        <div className="text-[8px] font-bold uppercase tracking-widest mb-1.5" style={{ color: secondaryColor }}>About Us</div>
                        <h2 
                          className="text-base font-bold leading-tight"
                          style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', color: primaryColor }}
                        >
                          Committed to Your Health and Wellness
                        </h2>
                      </div>
                      <p className="text-[10px] text-[#42474d] leading-relaxed">
                        We combine clinical expertise with personalized care to provide you with the safest, most efficient pharmacy experience.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={10} className="text-secondary mt-0.5" style={{ color: secondaryColor }} />
                          <span className="text-[9px] text-[#0b1c30] font-bold">100% Authentic Medicines</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle size={10} className="text-secondary mt-0.5" style={{ color: secondaryColor }} />
                          <span className="text-[9px] text-[#0b1c30] font-bold">Expert Pharmacist Advice</span>
                        </div>
                      </div>
                      {certificates.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setShowCertificatesModal(true)}
                          className="mt-2 px-3 py-1 bg-white hover:bg-surface-container-low border rounded-md text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                          style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                          <ShieldCheck size={11} />
                          View Licenses &amp; Certificates
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Services Section */}
                <section className="py-8 bg-[#eff4ff] px-6 border-t border-b border-[#c2c7cd]/20 shrink-0">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-4 text-center">
                      <div className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: secondaryColor }}>Our Services</div>
                      <h2 
                        className="text-base font-bold"
                        style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', color: primaryColor }}
                      >
                        Comprehensive Pharmacy Care
                      </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {services.map((svc, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-[#c2c7cd]/30 shadow-sm flex flex-col justify-between text-left">
                          <div>
                            <div className="w-6 h-6 rounded flex items-center justify-center mb-2 text-white font-bold" style={{ backgroundColor: secondaryColor }}>
                              {getIconComponent(svc.icon)}
                            </div>
                            <h3 className="font-bold text-[10px] text-[#0b1c30] mb-0.5 font-display">{svc.title}</h3>
                            <p className="text-[8px] text-[#42474d]">{svc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Hours & Location Section */}
                <section className="py-8 bg-white px-6 shrink-0">
                  <div className="max-w-3xl mx-auto space-y-4">
                    <div className="text-left">
                      <div className="text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: secondaryColor }}>Visit Us</div>
                      <h2 
                        className="text-base font-bold"
                        style={{ fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', color: primaryColor }}
                      >
                        Hours &amp; Location
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Hours card */}
                      <div className="bg-white border border-[#c2c7cd]/40 rounded-lg p-4 shadow-sm text-[9px] space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-[#c2c7cd]/20">
                          <span className="font-bold text-[#0b1c30]">Monday - Friday</span>
                          <span className="font-mono text-[#42474d]">{mondayOpen} - {mondayClose}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-[#c2c7cd]/20 bg-[#eff4ff]/60 -mx-4 px-4">
                          <span className="font-bold text-[#0b1c30]">Saturday</span>
                          <span className="font-mono text-[#42474d]">09:00 AM - 07:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="font-bold text-[#0b1c30]">Sunday</span>
                          <span className="font-mono text-[#42474d] italic">{sundayOpen}</span>
                        </div>

                        {autoCloseHolidays && (
                          <div className="pt-2 border-t border-[#c2c7cd]/20 text-[7px] text-[#42474d] flex gap-1 items-start">
                            <CheckCircle size={8} className="shrink-0 mt-0.5 text-secondary" style={{ color: secondaryColor }} />
                            <span>Closed on public holidays.</span>
                          </div>
                        )}
                      </div>

                      {/* Map card */}
                      <div className="bg-[#f8f9ff] border border-outline-variant/40 rounded-lg p-4 shadow-sm flex flex-col justify-between text-[9px]">
                        <div className="text-left">
                          <p className="font-bold text-[#0b1c30]">{address || 'No address configured yet.'}</p>
                          {phone && <p className="font-mono text-[8px] mt-1 text-[#42474d]">📞 {phone}</p>}
                        </div>
                        
                        {mapLink ? (
                          <div className="h-10 mt-2 bg-white rounded border border-[#c2c7cd]/30 flex items-center justify-center text-[7px] text-[#42474d] uppercase font-bold gap-1">
                            <Globe size={8} className="text-secondary animate-pulse" /> Map Loaded
                          </div>
                        ) : (
                          <div className="h-10 mt-2 rounded border border-dashed border-[#c2c7cd] flex items-center justify-center text-[7px] text-[#72787e] uppercase">
                            No Map Added
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <footer className="mt-auto border-t border-[#c2c7cd]/30 px-6 py-6 bg-white shrink-0 text-left">
                  <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto text-[9px] text-[#42474d]">
                    <div>
                      <h4 className="font-bold mb-1" style={{ color: primaryColor }}>{name || 'Pharmacy'}</h4>
                      <p className="text-[8px]">Your trusted community healthcare partner.</p>
                      
                      {/* Compliance Credentials Row */}
                      {(displayNmraNumber || displayBrNumber || displaySlmcNumber) && (
                        <div className="text-[7px] text-[#72787e] mt-1.5 space-x-2 font-mono">
                          {displayNmraNumber && <span>NMRA: {displayNmraNumber}</span>}
                          {displayBrNumber && <span>BR: {displayBrNumber}</span>}
                          {displaySlmcNumber && <span>SLMC: {displaySlmcNumber}</span>}
                        </div>
                      )}
                      
                      <p className="text-[7px] text-[#72787e] mt-2">&copy; {new Date().getFullYear()} {name}. Powered by medical.lk</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold mb-1 text-[#0b1c30]">Contact</h4>
                      <p>{address}</p>
                      <p>{phone}</p>
                    </div>
                  </div>
                </footer>

                {/* Certificates Lightbox Modal Overlay (Simulated Preview) */}
                {showCertificatesModal && (
                  <div className="absolute inset-0 bg-primary-navy/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-[#c2c7cd]/50 rounded-xl p-5 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
                      <div className="flex justify-between items-center mb-3 border-b border-[#c2c7cd]/20 pb-2">
                        <div className="flex items-center gap-1 text-[#006d37]" style={{ color: secondaryColor }}>
                          <ShieldCheck size={16} />
                          <span className="font-bold text-xs uppercase tracking-wider font-display">Verified Credentials</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowCertificatesModal(false)}
                          className="text-outline hover:text-[#0b1c30] text-sm font-bold p-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {/* Credential items list */}
                        <div className="space-y-1 text-[9px] font-mono border-b border-[#c2c7cd]/10 pb-2 bg-[#f8f9ff] p-2 rounded">
                          {displayNmraNumber && <p><strong>NMRA Registration:</strong> {displayNmraNumber}</p>}
                          {displaySlmcNumber && <p><strong>SLMC Pharmacist Reg:</strong> {displaySlmcNumber}</p>}
                          {displayBrNumber && <p><strong>Business Registration:</strong> {displayBrNumber}</p>}
                        </div>

                        {/* Certificate images */}
                        {certificates.map((cert, idx) => (
                          <div key={idx} className="border border-[#c2c7cd]/35 rounded-lg p-2 bg-white flex flex-col items-center">
                            <span className="text-[9px] font-bold text-primary-navy self-start mb-1">{cert.name}</span>
                            <img src={cert.url} alt={cert.name} className="max-h-36 object-contain rounded border border-[#c2c7cd]/20" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=300&q=80'; }} />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCertificatesModal(false)}
                        className="mt-4 w-full py-1.5 bg-primary-navy text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Close Gallery
                      </button>
                    </div>
                  </div>
                )}

                {/* Floating WhatsApp FAB inside desktop browser body */}
                {phone && (
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center z-50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
                    </svg>
                  </div>
                )}

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
              <div 
                className="flex-grow overflow-y-auto w-full pt-6 select-text text-left relative flex flex-col bg-[#f8f9ff]"
                style={{ fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)' }}
              >
                
                {/* Announcement Banner */}
                <div className="bg-[#ffb961] text-[#533200] py-1 px-3 text-center font-bold text-[8px] tracking-wide shadow-sm shrink-0">
                  10% off vitamins this week.
                </div>

                {/* Mobile simulated header */}
                <header className="flex justify-between items-center px-4 py-2.5 border-b border-[#c2c7cd]/30 bg-white/95 sticky top-0 z-40 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {logoUrl ? (
                      <img src={logoUrl} alt="logo" style={{ height: '20px' }} className="object-contain" />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px]"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {name ? name.substring(0, 2).toUpperCase() : 'PH'}
                      </div>
                    )}
                    <span 
                      className="font-bold text-xs tracking-tight" 
                      style={{ 
                        fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
                        color: primaryColor
                      }}
                    >
                      {name || 'Pharmacy'}
                    </span>
                  </div>
                  
                  {/* Hamburger icon */}
                  <div className="w-6 h-6 rounded flex flex-col justify-center gap-0.5 items-end p-1 cursor-pointer">
                    <span className="w-4 h-0.5 bg-[#00273b]"></span>
                    <span className="w-3 h-0.5 bg-[#00273b]"></span>
                    <span className="w-4 h-0.5 bg-[#00273b]"></span>
                  </div>
                </header>

                {/* Mobile Hero section (Stacked Layout) */}
                <section className="bg-[#f7f9fc] flex flex-col relative shrink-0">
                  <div className="h-32 w-full relative">
                    <img src={heroBgImage} alt="store showcase" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 opacity-80 mix-blend-multiply" style={{ backgroundColor: primaryColor }}></div>
                  </div>
                  <div className="p-4 -mt-4 bg-white mx-3 rounded-lg border border-[#c2c7cd]/20 shadow-md text-center relative z-10 mb-4">
                    <div className="inline-block px-2.5 py-0.5 bg-secondary-container/30 text-[#00743a] text-[8px] font-bold uppercase tracking-wider rounded-full mb-1.5">
                      Open Today &bull; Reg: SLMC-8921
                    </div>
                    <h2 
                      className="text-base font-bold mb-1.5 leading-tight" 
                      style={{ 
                        fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)', 
                        color: primaryColor 
                      }}
                    >
                      {heroHeadline}
                    </h2>
                    <p className="text-[#42474d] text-[9px] leading-relaxed mb-3">
                      {heroSubheadline}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <button 
                        type="button" 
                        className="w-full py-1.5 text-white rounded font-bold text-[9px] uppercase tracking-wider shadow cursor-pointer animate-none" 
                        style={{ backgroundColor: secondaryColor }}
                      >
                        {heroButtonText}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Mobile Stats Strip */}
                <section className="px-3 pb-4 shrink-0">
                  <div className="grid grid-cols-2 gap-2 bg-white rounded-lg border border-[#c2c7cd]/20 p-2.5 shadow-sm text-center">
                    <div>
                      <div className="text-xs font-bold" style={{ color: primaryColor }}>{statExperience}</div>
                      <div className="text-[7px] text-[#42474d] uppercase font-bold">Experience</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: primaryColor }}>{statPatients}</div>
                      <div className="text-[7px] text-[#42474d] uppercase font-bold">Patients</div>
                    </div>
                  </div>
                </section>

                 {/* Mobile About Us */}
                <section className="px-3 pb-4 shrink-0">
                  <div className="bg-white rounded-lg border border-[#c2c7cd]/20 p-3 shadow-sm space-y-2.5">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-secondary" style={{ color: secondaryColor }}>About Us</span>
                      <h3 className="text-xs font-bold leading-tight" style={{ color: primaryColor }}>Committed to Your Health</h3>
                    </div>
                    <p className="text-[9px] text-[#42474d] leading-relaxed">
                      We combine clinical expertise with personalized care to provide you with the safest pharmacy experience.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-secondary" style={{ color: secondaryColor }} />
                      <span className="text-[8px] font-bold text-[#0b1c30]">SLMC Verified Registered Care</span>
                    </div>
                    {certificates.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setShowCertificatesModal(true)}
                        className="mt-2 w-full py-1 border rounded text-[8px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                      >
                        <ShieldCheck size={10} />
                        View Licenses &amp; Certificates
                      </button>
                    )}
                  </div>
                </section>

                {/* Mobile Services */}
                <section className="px-3 pb-4 shrink-0">
                  <div className="bg-[#eff4ff] rounded-lg border border-[#c2c7cd]/20 p-3 shadow-sm space-y-2">
                    <h3 className="text-xs font-bold text-center" style={{ color: primaryColor }}>Our Services</h3>
                    <div className="space-y-1.5">
                      {services.map((svc, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-[#c2c7cd]/20 flex items-center gap-2">
                          <span style={{ color: secondaryColor }} className="shrink-0 flex items-center justify-center">
                            {getIconComponent(svc.icon, 10)}
                          </span>
                          <span className="text-[8px] font-bold text-[#0b1c30] truncate">{svc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Mobile opening hours stacked */}
                <section className="px-3 pb-6 space-y-3 shrink-0">
                  
                  {/* Hours */}
                  <div className="bg-white border border-[#c2c7cd]/40 rounded-lg p-3 shadow-sm text-[9px]">
                    <div className="flex items-center gap-1.5 mb-2" style={{ color: primaryColor }}>
                      <Calendar size={12} />
                      <span className="font-bold font-display uppercase tracking-wider">Opening Hours</span>
                    </div>
                    <div className="space-y-1 font-mono">
                      <div className="flex justify-between border-b border-[#c2c7cd]/15 py-0.5">
                        <span>Mon - Sat</span>
                        <span>{mondayOpen} - {mondayClose}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span>Sunday</span>
                        <span className="italic">{sundayOpen}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visit Us */}
                  <div className="bg-white border border-[#c2c7cd]/40 rounded-lg p-3 shadow-sm text-[9px] flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: primaryColor }}>
                      <MapPin size={12} />
                      <span className="font-bold font-display uppercase tracking-wider">Visit Us</span>
                    </div>
                    <address className="not-italic text-[#42474d] space-y-0.5 leading-relaxed">
                      <p className="font-bold" style={{ color: primaryColor }}>{name || 'Pharmacy Name'}</p>
                      <p>{address || 'No address configured yet.'}</p>
                    </address>
                  </div>

                </section>

                {/* Footer */}
                <footer className="mt-auto border-t border-[#c2c7cd]/30 p-4 bg-white shrink-0 text-center text-[8px] text-[#42474d]">
                  <p className="font-bold" style={{ color: primaryColor }}>{name}</p>
                  
                  {/* Compliance strip */}
                  {(displayNmraNumber || displayBrNumber || displaySlmcNumber) && (
                    <div className="text-[6px] text-[#72787e] mt-1 font-mono space-y-0.5">
                      {displayNmraNumber && <div>NMRA Reg: {displayNmraNumber}</div>}
                      {displayBrNumber && <div>BR Reg: {displayBrNumber}</div>}
                      {displaySlmcNumber && <div>SLMC Reg: {displaySlmcNumber}</div>}
                    </div>
                  )}

                  <p className="text-[7px] text-[#72787e] mt-1">&copy; {new Date().getFullYear()} {name}. Powered by medical.lk</p>
                </footer>

                {/* Mobile Floating Action Button (WhatsApp green) inside phone screen */}
                {phone && (
                  <div className="absolute bottom-4 right-4 w-9 h-9 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center z-50">
                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
                    </svg>
                  </div>
                )}

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
            <div className="flex gap-3 pt-4 border-t border-outline-warm/30">
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
