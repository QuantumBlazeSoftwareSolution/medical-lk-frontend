'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Settings,
  Loader2,
  Sparkles,
  Layout,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  Smartphone,
  Laptop,
  ChevronDown,
  Plus,
  Trash2,
  HelpCircle,
  User,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Lock,
  Image as ImageIcon,
  HelpCircle as HelpIcon,
  ArrowLeft,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Heart,
  Activity,
  MessageSquare,
  Menu,
  Search,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';
import {
  FONT_OPTIONS,
  getFontFamily,
  getFontsByCategory,
} from '@/utils/fontConfig';
import { WEBSITE_TEMPLATES } from '../../templates';

export default function WebsiteBuilder() {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'content' | 'navigation' | 'seo'
  >('appearance');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );

  // Official configuration states (bound to backend API)
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
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
  const [services, setServices] = useState<
    Array<{ title: string; description: string; icon: string }>
  >([
    {
      title: 'Prescription Fulfillment',
      description:
        'Fast, accurate dispensing of medications with thorough interaction checks by our licensed pharmacists.',
      icon: 'Check',
    },
    {
      title: 'Home Delivery',
      description:
        'Convenient doorstep delivery across Colombo within 24 hours. Cold chain maintained for sensitive drugs.',
      icon: 'Clock',
    },
    {
      title: 'Health Consultations',
      description:
        'Private consultations to discuss medication management, side effects, and general wellness plans.',
      icon: 'Heart',
    },
    {
      title: 'Cosmetics & Derma',
      description:
        'Curated selection of dermatologically tested skincare and personal care products.',
      icon: 'Sparkles',
    },
    {
      title: 'Health Monitoring',
      description:
        'In-store blood pressure checking, blood sugar testing, and BMI calculation services.',
      icon: 'Activity',
    },
    {
      title: 'Baby & Mother Care',
      description:
        'Everything you need for maternal health and infant care, from nutrition to hygiene essentials.',
      icon: 'ShieldCheck',
    },
  ]);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('Check');

  const getIconComponent = (iconName: string, size = 12) => {
    switch (iconName) {
      case 'Check':
        return <Check size={size} />;
      case 'Clock':
        return <Clock size={size} />;
      case 'Heart':
        return <Heart size={size} />;
      case 'Sparkles':
        return <Sparkles size={size} />;
      case 'Activity':
        return <Activity size={size} />;
      case 'ShieldCheck':
        return <ShieldCheck size={size} />;
      case 'Mail':
        return <Mail size={size} />;
      case 'Phone':
        return <Phone size={size} />;
      case 'MapPin':
        return <MapPin size={size} />;
      case 'Globe':
        return <Globe size={size} />;
      case 'Calendar':
        return <Calendar size={size} />;
      case 'CheckCircle':
        return <CheckCircle size={size} />;
      default:
        return <CheckCircle size={size} />;
    }
  };

  // Builder-only interactive states (stored locally / mocked to sync with preview)
  const [headingsFont, setHeadingsFont] = useState('poppins');
  const [bodyFont, setBodyFont] = useState('inter');

  const [logoHeight, setLogoHeight] = useState(40);
  const [stickyHeader, setStickyHeader] = useState(true);
  const [heroHeadline, setHeroHeadline] = useState('Your Neighborhood Care.');
  const [heroSubheadline, setHeroSubheadline] = useState(
    'Providing expert clinical services and prescriptions right in your community.'
  );
  const [heroButtonText, setHeroButtonText] = useState('Refill Now');
  const [heroBgImage, setHeroBgImage] = useState(
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
  );

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
    { name: 'Christmas Day', date: 'Dec 25, 2026', status: 'Closed' },
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExDate, setNewExDate] = useState('');
  const [newExStatus, setNewExStatus] = useState('Closed');

  const [autoCloseHolidays, setAutoCloseHolidays] = useState(true);

  // SEO States
  const [seoKeywords, setSeoKeywords] = useState(
    'pharmacy, prescriptions, colombo healthcare, online medicine'
  );
  const [seoDescription, setSeoDescription] = useState(
    'Order prescription medicines online, consult with certified pharmacists, and get fast delivery.'
  );

  // Display credentials & certificates
  const [displayNmraNumber, setDisplayNmraNumber] = useState('');
  const [displayBrNumber, setDisplayBrNumber] = useState('');
  const [displaySlmcNumber, setDisplaySlmcNumber] = useState('');
  const [certificates, setCertificates] = useState<
    { name: string; url: string }[]
  >([]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

  // System states
  const [activeTemplate, setActiveTemplate] = useState('template-001');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Fetch current settings
  const {
    data: config,
    isLoading,
    refetch,
  } = useQuery<any>({
    queryKey: ['tenant-config'],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  // Load configuration into state on mount / fetch success
  useEffect(() => {
    if (config) {
      setName(config.name || '');
      setTitle(config.website_title || 'Our Pharmacy');
      setDesc(
        config.website_description || 'Your trusted local healthcare partner.'
      );
      setPrimaryColor(config.brand_color_primary || '#0f3d57');
      setSecondaryColor(config.brand_color_secondary || '#2ecc71');
      setMapLink(config.map_link || '');
      setEmail(config.contact_email || '');
      setPhone(config.contact_phone || '');
      setAddress(config.contact_address || '');
      setLogoUrl(config.logo_url || '');
      setFaviconUrl(config.favicon_url || '');
      if (config.template_id) setActiveTemplate(config.template_id);

      // Load DB values first
      if (config.headings_font) setHeadingsFont(config.headings_font);
      if (config.body_font) setBodyFont(config.body_font);
      if (config.logo_height !== undefined && config.logo_height !== null)
        setLogoHeight(config.logo_height);
      if (config.sticky_header !== undefined && config.sticky_header !== null)
        setStickyHeader(config.sticky_header);
      if (config.hero_headline) setHeroHeadline(config.hero_headline);
      if (config.hero_subheadline) setHeroSubheadline(config.hero_subheadline);
      if (config.hero_button_text) setHeroButtonText(config.hero_button_text);
      if (config.hero_bg_image) setHeroBgImage(config.hero_bg_image);
      if (
        config.auto_close_holidays !== undefined &&
        config.auto_close_holidays !== null
      )
        setAutoCloseHolidays(config.auto_close_holidays);
      if (config.seo_keywords) setSeoKeywords(config.seo_keywords);

      if (config.display_nmra_number)
        setDisplayNmraNumber(config.display_nmra_number);
      if (config.display_br_number)
        setDisplayBrNumber(config.display_br_number);
      if (config.display_slmc_number)
        setDisplaySlmcNumber(config.display_slmc_number);
      if (config.certificates_json) {
        try {
          const parsedCerts = JSON.parse(config.certificates_json);
          if (Array.isArray(parsedCerts)) setCertificates(parsedCerts);
        } catch (e) {
          console.error('Error parsing certificates_json', e);
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
          console.error('Error parsing stats_json', e);
        }
      }

      if (config.services_json) {
        try {
          const parsedServices = JSON.parse(config.services_json);
          if (Array.isArray(parsedServices) && parsedServices.length > 0)
            setServices(parsedServices);
        } catch (e) {
          console.error('Error parsing services_json', e);
        }
      }

      if (config.opening_hours) {
        try {
          const parsedHours = JSON.parse(config.opening_hours);
          if (parsedHours.MondayOpen) setMondayOpen(parsedHours.MondayOpen);
          if (parsedHours.MondayClose) setMondayClose(parsedHours.MondayClose);
          if (parsedHours.TuesdayOpen) setTuesdayOpen(parsedHours.TuesdayOpen);
          if (parsedHours.TuesdayClose)
            setTuesdayClose(parsedHours.TuesdayClose);
          if (parsedHours.WednesdayOpen)
            setWednesdayOpen(parsedHours.WednesdayOpen);
          if (parsedHours.WednesdayClose)
            setWednesdayClose(parsedHours.WednesdayClose);
          if (parsedHours.ThursdayOpen)
            setThursdayOpen(parsedHours.ThursdayOpen);
          if (parsedHours.ThursdayClose)
            setThursdayClose(parsedHours.ThursdayClose);
          if (parsedHours.FridayOpen) setFridayOpen(parsedHours.FridayOpen);
          if (parsedHours.FridayClose) setFridayClose(parsedHours.FridayClose);
          if (parsedHours.SaturdayOpen)
            setSaturdayOpen(parsedHours.SaturdayOpen);
          if (parsedHours.SaturdayClose)
            setSaturdayClose(parsedHours.SaturdayClose);
          if (parsedHours.SundayOpen) setSundayOpen(parsedHours.SundayOpen);
        } catch (e) {
          console.error('Error parsing opening_hours', e);
        }
      }

      if (config.holiday_exceptions) {
        try {
          const parsedEx = JSON.parse(config.holiday_exceptions);
          if (Array.isArray(parsedEx)) setExceptions(parsedEx);
        } catch (e) {
          console.error('Error parsing holiday_exceptions', e);
        }
      }

      // Check if there are serialized configurations inside local storage (active drafts)
      const builderState = localStorage.getItem(
        `builder-state-${config.subdomain}`
      );
      if (builderState) {
        try {
          const parsed = JSON.parse(builderState);
          if (parsed.headingsFont) setHeadingsFont(parsed.headingsFont);
          if (parsed.bodyFont) setBodyFont(parsed.bodyFont);
          if (parsed.logoHeight) setLogoHeight(parsed.logoHeight);
          if (parsed.stickyHeader !== undefined)
            setStickyHeader(parsed.stickyHeader);
          if (parsed.heroHeadline) setHeroHeadline(parsed.heroHeadline);
          if (parsed.heroSubheadline)
            setHeroSubheadline(parsed.heroSubheadline);
          if (parsed.heroButtonText) setHeroButtonText(parsed.heroButtonText);
          if (parsed.heroBgImage) setHeroBgImage(parsed.heroBgImage);
          if (parsed.seoKeywords) setSeoKeywords(parsed.seoKeywords);
          if (parsed.hours) {
            if (parsed.hours.MondayOpen) setMondayOpen(parsed.hours.MondayOpen);
            if (parsed.hours.MondayClose)
              setMondayClose(parsed.hours.MondayClose);
            if (parsed.hours.TuesdayOpen)
              setTuesdayOpen(parsed.hours.TuesdayOpen);
            if (parsed.hours.TuesdayClose)
              setTuesdayClose(parsed.hours.TuesdayClose);
            if (parsed.hours.WednesdayOpen)
              setWednesdayOpen(parsed.hours.WednesdayOpen);
            if (parsed.hours.WednesdayClose)
              setWednesdayClose(parsed.hours.WednesdayClose);
            if (parsed.hours.ThursdayOpen)
              setThursdayOpen(parsed.hours.ThursdayOpen);
            if (parsed.hours.ThursdayClose)
              setThursdayClose(parsed.hours.ThursdayClose);
            if (parsed.hours.FridayOpen) setFridayOpen(parsed.hours.FridayOpen);
            if (parsed.hours.FridayClose)
              setFridayClose(parsed.hours.FridayClose);
            if (parsed.hours.SaturdayOpen)
              setSaturdayOpen(parsed.hours.SaturdayOpen);
            if (parsed.hours.SaturdayClose)
              setSaturdayClose(parsed.hours.SaturdayClose);
            if (parsed.hours.SundayOpen) setSundayOpen(parsed.hours.SundayOpen);
          }
          if (parsed.exceptions) setExceptions(parsed.exceptions);
          if (parsed.autoCloseHolidays !== undefined)
            setAutoCloseHolidays(parsed.autoCloseHolidays);
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

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'favicon' | 'hero'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be smaller than 2MB to keep page performance high.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoUrl(reader.result as string);
        } else if (type === 'favicon') {
          setFaviconUrl(reader.result as string);
        } else if (type === 'hero') {
          setHeroBgImage(reader.result as string);
        }
        registerChange();
      };
      reader.readAsDataURL(file);
    }
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
    setExceptions((prev) => [
      ...prev,
      { name: newExName.trim(), date: newExDate, status: newExStatus },
    ]);
    setNewExName('');
    setNewExDate('');
    registerChange();
  };

  // Remove holiday exception
  const handleRemoveException = (idx: number) => {
    setExceptions((prev) => prev.filter((_, i) => i !== idx));
    registerChange();
  };

  // 2. Update settings mutation
  const updateConfigMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/tenant/config', {
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
    },
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
      favicon_url: faviconUrl.trim() || null,
      headings_font: headingsFont,
      body_font: bodyFont,
      template_id: activeTemplate,
      logo_height: Number(logoHeight) || 40,
      sticky_header: stickyHeader,
      hero_headline: heroHeadline,
      hero_subheadline: heroSubheadline,
      hero_button_text: heroButtonText,
      hero_bg_image: heroBgImage,
      opening_hours: JSON.stringify({
        MondayOpen: mondayOpen,
        MondayClose: mondayClose,
        TuesdayOpen: tuesdayOpen,
        TuesdayClose: tuesdayClose,
        WednesdayOpen: wednesdayOpen,
        WednesdayClose: wednesdayClose,
        ThursdayOpen: thursdayOpen,
        ThursdayClose: thursdayClose,
        FridayOpen: fridayOpen,
        FridayClose: fridayClose,
        SaturdayOpen: saturdayOpen,
        SaturdayClose: saturdayClose,
        SundayOpen: sundayOpen,
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
        wait_time: statWaitTime,
      }),
      services_json: JSON.stringify(services),
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
            <h1 className="text-base font-bold text-[#00273b] font-display">
              Website Builder
            </h1>

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
              <CheckCircle className="h-4 w-4 shrink-0" /> Customizations
              published successfully!
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
                <div className="space-y-5">
                  {/* Primary Logo Upload */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                      Primary Logo
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload Box */}
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="border border-dashed border-outline-variant/80 hover:border-highlight-teal rounded-xl p-4 flex flex-col items-center justify-center bg-[#f8f9fc] hover:bg-teal-50/10 transition-all cursor-pointer group/upload"
                      >
                        <ImageIcon className="h-6 w-6 text-outline group-hover/upload:text-highlight-teal transition-colors mb-2" />
                        <span className="text-[11px] font-bold text-[#00273b]">
                          Upload Logo Image
                        </span>
                        <span className="text-[9px] text-outline mt-0.5">
                          PNG, JPG, SVG up to 2MB
                        </span>
                      </button>

                      {/* Preview Box */}
                      <div className="border border-outline-variant/60 rounded-xl p-3 flex flex-col items-center justify-center bg-white relative min-h-[96px]">
                        {logoUrl ? (
                          <>
                            <img
                              src={logoUrl}
                              alt="Branding logo preview"
                              className="max-h-12 max-w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoUrl('');
                                registerChange();
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-200 transition-colors cursor-pointer animate-fade-in"
                              title="Remove logo"
                            >
                              <Trash2 size={12} />
                            </button>
                            <span className="text-[9px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                              <CheckCircle size={10} /> Logo Active
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-outline text-center">
                            No logo uploaded. System fallback text will be
                            displayed.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1">
                        Or Paste Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl.startsWith('data:') ? '' : logoUrl}
                        onChange={(e) => {
                          setLogoUrl(e.target.value);
                          registerChange();
                        }}
                        className="w-full px-3 py-1.5 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="pt-3 border-t border-outline-variant/40">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                      Favicon Shortcut Icon
                    </label>
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={(e) => handleImageUpload(e, 'favicon')}
                      accept="image/png, image/x-icon, image/jpeg"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload Box */}
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="border border-dashed border-outline-variant/80 hover:border-highlight-teal rounded-xl p-4 flex flex-col items-center justify-center bg-[#f8f9fc] hover:bg-teal-50/10 transition-all cursor-pointer group/upload"
                      >
                        <Globe className="h-6 w-6 text-outline group-hover/upload:text-highlight-teal transition-colors mb-2" />
                        <span className="text-[11px] font-bold text-[#00273b]">
                          Upload Browser Icon
                        </span>
                        <span className="text-[9px] text-outline mt-0.5">
                          ICO or PNG up to 500KB
                        </span>
                      </button>

                      {/* Preview Box */}
                      <div className="border border-outline-variant/60 rounded-xl p-3 flex flex-col items-center justify-center bg-white relative min-h-[96px]">
                        {faviconUrl ? (
                          <>
                            <div className="p-2 border border-outline-variant/60 rounded bg-[#f7f9fc]">
                              <img
                                src={faviconUrl}
                                alt="Favicon preview"
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFaviconUrl('');
                                registerChange();
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-200 transition-colors cursor-pointer animate-fade-in"
                              title="Remove favicon"
                            >
                              <Trash2 size={12} />
                            </button>
                            <span className="text-[9px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                              <CheckCircle size={10} /> Icon Active
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 border border-outline-variant/60 rounded bg-white flex items-center justify-center font-extrabold text-highlight-teal font-display text-sm mb-1.5 shadow-sm">
                              {name ? name.substring(0, 1).toUpperCase() : 'P'}
                            </div>
                            <span className="text-[9px] text-outline text-center">
                              Using fallback initial icon
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Color Palette
                </h3>

                <div className="space-y-4">
                  {/* Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-2">
                      Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => selectPreset('#0f3d57', '#2ecc71')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#0f3d57' &&
                          secondaryColor === '#2ecc71'
                            ? 'border-highlight-teal bg-[#f8f9ff]'
                            : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#0f3d57]"></div>
                          <div className="w-1/2 bg-[#2ecc71]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">
                          Professional
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectPreset('#2c3e50', '#3498db')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#2c3e50' &&
                          secondaryColor === '#3498db'
                            ? 'border-highlight-teal bg-[#f8f9ff]'
                            : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#2c3e50]"></div>
                          <div className="w-1/2 bg-[#3498db]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">
                          Clinical Blue
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectPreset('#1a5276', '#e67e22')}
                        className={`border rounded-lg p-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          primaryColor === '#1a5276' &&
                          secondaryColor === '#e67e22'
                            ? 'border-highlight-teal bg-[#f8f9ff]'
                            : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                        }`}
                      >
                        <div className="flex w-full h-3 rounded overflow-hidden">
                          <div className="w-1/2 bg-[#1a5276]"></div>
                          <div className="w-1/2 bg-[#e67e22]"></div>
                        </div>
                        <span className="text-[9px] font-bold tracking-tight">
                          Warm Care
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Hex values custom colors */}
                  <div className="border-t border-outline-variant/30 pt-3 space-y-3">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Custom Brand Hex
                    </label>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value);
                            registerChange();
                          }}
                          className="w-6 h-6 rounded border-0 outline-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-semibold">
                          Primary Brand
                        </span>
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          registerChange();
                        }}
                        className="w-20 px-2 py-1 text-center font-mono border border-outline-variant rounded bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value);
                            registerChange();
                          }}
                          className="w-6 h-6 rounded border-0 outline-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-semibold">
                          Accent Action
                        </span>
                      </div>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value);
                          registerChange();
                        }}
                        className="w-20 px-2 py-1 text-center font-mono border border-outline-variant rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography fonts */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Typography Fonts
                </h3>
                <div className="space-y-4">
                  {/* Headings Font */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Headings Font
                    </label>
                    <div className="relative">
                      <select
                        value={headingsFont}
                        onChange={(e) => {
                          setHeadingsFont(e.target.value);
                          registerChange();
                        }}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                        style={{ fontFamily: getFontFamily(headingsFont) }}
                      >
                        {(() => {
                          const { sansSerif, serif } = getFontsByCategory();
                          return (
                            <>
                              <optgroup label="Sans-Serif">
                                {sansSerif.map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label} — {f.description}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Serif">
                                {serif.map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label} — {f.description}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Body Font */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Body Font
                    </label>
                    <div className="relative">
                      <select
                        value={bodyFont}
                        onChange={(e) => {
                          setBodyFont(e.target.value);
                          registerChange();
                        }}
                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                        style={{ fontFamily: getFontFamily(bodyFont) }}
                      >
                        {(() => {
                          const { sansSerif, serif } = getFontsByCategory();
                          return (
                            <>
                              <optgroup label="Sans-Serif">
                                {sansSerif.map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label} — {f.description}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Serif">
                                {serif.map((f) => (
                                  <option key={f.key} value={f.key}>
                                    {f.label} — {f.description}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Live Typography Preview */}
                  <div className="p-4 bg-gradient-to-br from-[#f7f9fc] to-[#edf2f7] rounded-lg border border-outline-variant/50">
                    <p className="text-[10px] uppercase tracking-widest text-outline mb-2 font-bold">
                      Live Preview
                    </p>
                    <p
                      className="text-lg font-bold text-[#00273b] mb-1 leading-tight"
                      style={{ fontFamily: getFontFamily(headingsFont) }}
                    >
                      Premium Healthcare Experience
                    </p>
                    <p
                      className="text-xs text-on-surface-variant leading-relaxed"
                      style={{ fontFamily: getFontFamily(bodyFont) }}
                    >
                      Your pharmacy landing page will use this font combination
                      for a polished, professional look that builds trust with
                      customers.
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-outline-variant/30">
                      <span className="text-[10px] text-outline uppercase tracking-wide font-bold">
                        Heading:
                      </span>
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          fontFamily: getFontFamily(headingsFont),
                          color: primaryColor,
                        }}
                      >
                        {FONT_OPTIONS.find((f) => f.key === headingsFont)
                          ?.label || headingsFont}
                      </span>
                      <span className="text-[10px] text-outline">|</span>
                      <span className="text-[10px] text-outline uppercase tracking-wide font-bold">
                        Body:
                      </span>
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          fontFamily: getFontFamily(bodyFont),
                          color: primaryColor,
                        }}
                      >
                        {FONT_OPTIONS.find((f) => f.key === bodyFont)?.label ||
                          bodyFont}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Template Selector */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Select Theme Layout Template
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'template-001', name: 'Template 01', desc: 'Classic Corporate' },
                    { id: 'template-002', name: 'Template 02', desc: 'ProHealth Medical' },
                    { id: 'template-003', name: 'Template 03', desc: 'Genex Modern' },
                  ].map((temp) => (
                    <button
                      key={temp.id}
                      type="button"
                      onClick={() => {
                        setActiveTemplate(temp.id);
                        registerChange();
                      }}
                      className={`border rounded-lg p-2.5 flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                        activeTemplate === temp.id
                          ? 'border-highlight-teal bg-[#f8f9ff] ring-1 ring-highlight-teal/30'
                          : 'border-outline-variant/60 hover:bg-[#f7f9fc]'
                      }`}
                    >
                      <Layout className="h-5 w-5 text-outline group-hover:text-highlight-teal" />
                      <span className="text-[10px] font-bold block">{temp.name}</span>
                      <span className="text-[8px] text-outline block">{temp.desc}</span>
                    </button>
                  ))}
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
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Store Profile Content
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Public Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Website Main Heading *
                    </label>
                    <input
                      type="text"
                      required
                      value={heroHeadline}
                      onChange={(e) => {
                        setHeroHeadline(e.target.value);
                        setTitle(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Website Intro Summary *
                    </label>
                    <textarea
                      required
                      value={heroSubheadline}
                      onChange={(e) => {
                        setHeroSubheadline(e.target.value);
                        setDesc(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          registerChange();
                        }}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          registerChange();
                        }}
                        className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Physical Store Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Galle Road, Colombo"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Google Maps Embed Link / Iframe
                    </label>
                    <input
                      type="text"
                      placeholder="Paste iframe code src link directly"
                      value={mapLink}
                      onChange={(e) => {
                        setMapLink(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics & Highlights */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Statistics & Highlights
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Years Experience
                    </label>
                    <input
                      type="text"
                      value={statExperience}
                      onChange={(e) => {
                        setStatExperience(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Happy Patients
                    </label>
                    <input
                      type="text"
                      value={statPatients}
                      onChange={(e) => {
                        setStatPatients(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Products Catalog
                    </label>
                    <input
                      type="text"
                      value={statProducts}
                      onChange={(e) => {
                        setStatProducts(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Avg Wait Time
                    </label>
                    <input
                      type="text"
                      value={statWaitTime}
                      onChange={(e) => {
                        setStatWaitTime(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Services Offered
                </h3>

                <div className="space-y-3">
                  {services.map((svc, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start p-2.5 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg shadow-sm"
                    >
                      <div className="flex items-start gap-2 max-w-[85%] text-left">
                        <div
                          className="w-6 h-6 rounded bg-[#2ecc71]/20 text-[#006d37] flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${secondaryColor}20`,
                            color: secondaryColor,
                          }}
                        >
                          {getIconComponent(svc.icon)}
                        </div>
                        <div>
                          <div className="font-bold text-[#00273b]">
                            {svc.title}
                          </div>
                          <div className="text-[10px] text-outline mt-0.5 leading-relaxed">
                            {svc.description}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setServices((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          registerChange();
                        }}
                        className="text-outline hover:text-error transition-colors cursor-pointer shrink-0 mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add service form */}
                  <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      Add Custom Service
                    </div>
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
                        <div className="text-[10px] text-outline font-bold uppercase shrink-0">
                          Icon:
                        </div>
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
                            if (
                              !newServiceTitle.trim() ||
                              !newServiceDesc.trim()
                            )
                              return;
                            setServices((prev) => [
                              ...prev,
                              {
                                title: newServiceTitle.trim(),
                                description: newServiceDesc.trim(),
                                icon: newServiceIcon,
                              },
                            ]);
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
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Standard Hours
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {/* Monday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Monday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mondayOpen}
                        onChange={(e) => {
                          setMondayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={mondayClose}
                        onChange={(e) => {
                          setMondayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Tuesday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Tuesday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tuesdayOpen}
                        onChange={(e) => {
                          setTuesdayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={tuesdayClose}
                        onChange={(e) => {
                          setTuesdayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Wednesday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Wednesday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={wednesdayOpen}
                        onChange={(e) => {
                          setWednesdayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={wednesdayClose}
                        onChange={(e) => {
                          setWednesdayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Thursday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Thursday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={thursdayOpen}
                        onChange={(e) => {
                          setThursdayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={thursdayClose}
                        onChange={(e) => {
                          setThursdayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Friday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Friday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fridayOpen}
                        onChange={(e) => {
                          setFridayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={fridayClose}
                        onChange={(e) => {
                          setFridayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Saturday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Saturday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={saturdayOpen}
                        onChange={(e) => {
                          setSaturdayOpen(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        value={saturdayClose}
                        onChange={(e) => {
                          setSaturdayClose(e.target.value);
                          registerChange();
                        }}
                        className="w-20 h-7 text-center rounded border border-outline-variant/75 bg-white text-xs outline-none focus:border-highlight-teal"
                      />
                    </div>
                  </div>

                  {/* Sunday */}
                  <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                    <span className="w-20 font-bold text-on-surface-variant">
                      Sunday
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sundayOpen}
                        onChange={(e) => {
                          setSundayOpen(e.target.value);
                          registerChange();
                        }}
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
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b]">
                    Special Exceptions
                  </h3>
                </div>

                <div className="space-y-3">
                  {exceptions.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg shadow-sm"
                    >
                      <div>
                        <div className="font-semibold text-[#00273b]">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-outline mt-0.5">
                          {ex.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-[#42474d] text-[10px] font-bold">
                          {ex.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveException(idx)}
                          className="text-outline hover:text-error transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add exception inline form */}
                  <div className="border-t border-outline-variant/30 pt-3 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline">
                      Add Holiday Exception
                    </div>
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
                        <div className="font-bold text-on-surface">
                          Auto-close on Public Holidays
                        </div>
                        <div className="text-[10px] text-outline mt-0.5">
                          Automatically mark pharmacy as closed on national
                          calendar holidays.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoCloseHolidays(!autoCloseHolidays);
                          registerChange();
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                          autoCloseHolidays
                            ? 'bg-highlight-teal'
                            : 'bg-outline-variant'
                        }`}
                      >
                        <span
                          className={`absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                            autoCloseHolidays
                              ? 'translate-x-[22px]'
                              : 'translate-x-[4px]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Credentials & Licensing */}
              <div className="bg-white p-5 rounded-xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#17a589] opacity-100"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Trust Credentials & Licensing
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Display NMRA Registration No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NMRA/PH/COL/9821"
                      value={displayNmraNumber}
                      onChange={(e) => {
                        setDisplayNmraNumber(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Display Business Registration (BR) No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PV-108291"
                      value={displayBrNumber}
                      onChange={(e) => {
                        setDisplayBrNumber(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Display SLMC Pharmacist License No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SLMC-PH-8921"
                      value={displaySlmcNumber}
                      onChange={(e) => {
                        setDisplaySlmcNumber(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-mono"
                    />
                  </div>

                  {/* Certificates List */}
                  <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                      Uploaded Certificates & Licenses
                    </div>

                    {certificates.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-[#f7f9fc] border border-outline-variant/50 rounded-lg"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#00273b] text-xs truncate">
                            {cert.name}
                          </div>
                          <div className="text-[9px] text-outline truncate font-mono">
                            {cert.url}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCertificates((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            registerChange();
                          }}
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
                            if (!newCertName.trim() || !newCertUrl.trim())
                              return;
                            setCertificates((prev) => [
                              ...prev,
                              {
                                name: newCertName.trim(),
                                url: newCertUrl.trim(),
                              },
                            ]);
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
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Header Navigation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-on-surface">
                        Sticky Header Bar
                      </div>
                      <div className="text-[10px] text-outline mt-0.5">
                        Locks the header at the top of the browser while
                        scrolling.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStickyHeader(!stickyHeader);
                        registerChange();
                      }}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                        stickyHeader
                          ? 'bg-highlight-teal'
                          : 'bg-outline-variant'
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          stickyHeader
                            ? 'translate-x-[22px]'
                            : 'translate-x-[4px]'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Logo Height (px)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="100"
                      value={logoHeight}
                      onChange={(e) => {
                        setLogoHeight(Number(e.target.value) || 40);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section Page Elements */}
              <div className="bg-white p-5 rounded-xl border border-[#17a589] shadow-[0_4px_12px_rgba(23,165,137,0.1)] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-highlight-teal"></div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  Hero Section Text
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Primary Headline
                    </label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => {
                        setHeroHeadline(e.target.value);
                        setTitle(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Sub-headline Description
                    </label>
                    <textarea
                      value={heroSubheadline}
                      onChange={(e) => {
                        setHeroSubheadline(e.target.value);
                        setDesc(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-20 resize-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={heroButtonText}
                      onChange={(e) => {
                        setHeroButtonText(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div className="pt-3 border-t border-outline-variant/30">
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                      Hero Background Image
                    </label>
                    <input
                      type="file"
                      ref={heroInputRef}
                      onChange={(e) => handleImageUpload(e, 'hero')}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => heroInputRef.current?.click()}
                        className="border border-dashed border-outline-variant/80 hover:border-highlight-teal rounded-xl p-4 flex flex-col items-center justify-center bg-[#f8f9fc] hover:bg-teal-50/10 transition-all cursor-pointer group/upload"
                      >
                        <ImageIcon className="h-6 w-6 text-outline group-hover/upload:text-highlight-teal transition-colors mb-2" />
                        <span className="text-[11px] font-bold text-[#00273b]">
                          Upload Hero Image
                        </span>
                        <span className="text-[9px] text-outline mt-0.5">
                          Wide landscape image up to 2MB
                        </span>
                      </button>

                      {/* Preview Image */}
                      <div className="border border-outline-variant/60 rounded-xl overflow-hidden relative min-h-[96px] bg-slate-100 flex items-center justify-center">
                        {heroBgImage ? (
                          <>
                            <img
                              src={heroBgImage}
                              alt="Hero Background preview"
                              className="w-full h-full object-cover max-h-[96px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setHeroBgImage('');
                                registerChange();
                              }}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center border border-red-200 transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-outline p-4 text-center">
                            No background image selected.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <label className="block text-[9px] font-bold text-outline uppercase tracking-wider mb-1">
                        Or Paste Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={
                          heroBgImage.startsWith('data:') ? '' : heroBgImage
                        }
                        onChange={(e) => {
                          setHeroBgImage(e.target.value);
                          registerChange();
                        }}
                        className="w-full px-3 py-1.5 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-[11px]"
                      />
                    </div>
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
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#00273b] mb-4">
                  SEO Metadata
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Meta Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => {
                        setSeoKeywords(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
                      Meta Description *
                    </label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => {
                        setSeoDescription(e.target.value);
                        registerChange();
                      }}
                      className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-highlight-teal outline-none text-xs h-24 resize-none text-on-surface-variant font-sans"
                    />
                    <span className="text-[10px] text-outline block mt-1.5 leading-relaxed">
                      Write a description between 150-160 characters for optimal
                      Google and SEO indexing.
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
              if (
                unsavedChanges &&
                window.confirm('Discard unsaved changes?')
              ) {
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
            <span className="font-bold text-[10px] tracking-wider uppercase">
              LIVE PREVIEW
            </span>
          </div>

          {/* Desktop/Mobile Device Toggle Buttons */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/60">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                previewDevice === 'desktop'
                  ? 'bg-white text-primary-navy shadow-sm'
                  : 'text-outline hover:text-primary-navy'
              }`}
            >
              <Laptop size={14} />
              <span className="text-[10px] font-bold">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                previewDevice === 'mobile'
                  ? 'bg-white text-primary-navy shadow-sm'
                  : 'text-outline hover:text-primary-navy'
              }`}
            >
              <Smartphone size={14} />
              <span className="text-[10px] font-bold">Mobile</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                const origin = window.location.origin;
                const activeSub = config?.subdomain || 'test';
                let targetUrl = '';
                if (origin.includes('localhost')) {
                  targetUrl = `http://${activeSub}.localhost:3000`;
                } else {
                  const cleanDomain = origin.replace(/^https?:\/\//, '').replace(/^[a-z0-9-]+\./, '');
                  targetUrl = `https://${activeSub}.${cleanDomain}`;
                }
                window.open(targetUrl, '_blank', 'noreferrer');
              }
            }}
            className="text-primary-navy font-semibold flex items-center gap-1 hover:text-highlight-teal transition-colors text-xs cursor-pointer"
          >
            Open Live Subdomain
          </button>
        </div>

        {/* Simulated Browser Window wrapper */}
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center custom-scrollbar">
          {previewDevice === 'desktop' ? (
            /* DESKTOP VIEWPORT SCREEN - IFRAME INJECTION */
            <div className="w-full max-w-[1024px] bg-white rounded-xl shadow-2xl overflow-hidden border border-outline-variant/60 flex flex-col min-h-[600px] h-[75vh] self-start transition-all duration-300 relative">
              {/* Desktop address bar chrome */}
              <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2.5 shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 bg-white rounded-md h-7 border border-outline-variant/50 flex items-center justify-center text-[10px] text-outline font-mono">
                  <Lock
                    size={10}
                    className="mr-1 text-secondary"
                    style={{ color: secondaryColor }}
                  />
                  <span>
                    https://{config?.subdomain || 'test'}.{typeof window !== 'undefined' ? window.location.origin.replace(/^https?:\/\//, '').replace(/^[a-z0-9-]+\./, '') : 'medical.lk'}
                  </span>
                </div>
              </div>

              {/* Dynamic Live Site Direct Component Preview with real-time state synchronization */}
              <div className="flex-grow w-full overflow-y-auto bg-white select-text" style={{ height: 'calc(75vh - 40px)' }}>
                {(() => {
                  const SelectedTemplate = WEBSITE_TEMPLATES[activeTemplate] || WEBSITE_TEMPLATES['template-001'];
                  const previewTenant = {
                    ...config,
                    name: name,
                    logo_url: logoUrl,
                    favicon_url: faviconUrl,
                    brand_color_primary: primaryColor,
                    brand_color_secondary: secondaryColor,
                    website_title: title,
                    website_description: seoDescription,
                    contact_phone: phone,
                    contact_email: email,
                    contact_address: address,
                    map_link: mapLink,
                    headings_font: headingsFont,
                    body_font: bodyFont,
                    logo_height: logoHeight,
                    sticky_header: stickyHeader,
                    hero_headline: heroHeadline,
                    hero_subheadline: heroSubheadline,
                    hero_button_text: heroButtonText,
                    hero_bg_image: heroBgImage,
                    auto_close_holidays: autoCloseHolidays,
                    seo_keywords: seoKeywords,
                    display_nmra_number: displayNmraNumber,
                    display_br_number: displayBrNumber,
                    display_slmc_number: displaySlmcNumber,
                    certificates_json: JSON.stringify(certificates),
                    services_json: JSON.stringify(services),
                    opening_hours: JSON.stringify({
                      MondayOpen: mondayOpen,
                      MondayClose: mondayClose,
                      TuesdayOpen: tuesdayOpen,
                      TuesdayClose: tuesdayClose,
                      WednesdayOpen: wednesdayOpen,
                      WednesdayClose: wednesdayClose,
                      ThursdayOpen: thursdayOpen,
                      ThursdayClose: thursdayClose,
                      FridayOpen: fridayOpen,
                      FridayClose: fridayClose,
                      SaturdayOpen: saturdayOpen,
                      SaturdayClose: saturdayClose,
                      SundayOpen: sundayOpen,
                    })
                  };
                  return <SelectedTemplate tenant={previewTenant} subdomain={config?.subdomain || 'test'} />;
                })()}
              </div>
            </div>
          ) : (
            /* MOBILE NOTCH FRAME SCREEN */
            <div className="w-[360px] h-[720px] bg-white border-[10px] border-slate-900 rounded-[2rem] relative overflow-hidden flex flex-col shadow-2xl self-start transition-all duration-300 transform origin-top shrink-0">
              {/* Mobile top notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 border-b-xl rounded-b-xl z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Dynamic Live Site Mobile Direct Preview */}
              <div className="w-full h-full overflow-y-auto bg-white pt-6 custom-scrollbar">
                {(() => {
                  const SelectedTemplate = WEBSITE_TEMPLATES[activeTemplate] || WEBSITE_TEMPLATES['template-001'];
                  const previewTenant = {
                    ...config,
                    name: name,
                    logo_url: logoUrl,
                    favicon_url: faviconUrl,
                    brand_color_primary: primaryColor,
                    brand_color_secondary: secondaryColor,
                    website_title: title,
                    website_description: seoDescription,
                    contact_phone: phone,
                    contact_email: email,
                    contact_address: address,
                    map_link: mapLink,
                    headings_font: headingsFont,
                    body_font: bodyFont,
                    logo_height: logoHeight,
                    sticky_header: stickyHeader,
                    hero_headline: heroHeadline,
                    hero_subheadline: heroSubheadline,
                    hero_button_text: heroButtonText,
                    hero_bg_image: heroBgImage,
                    auto_close_holidays: autoCloseHolidays,
                    seo_keywords: seoKeywords,
                    display_nmra_number: displayNmraNumber,
                    display_br_number: displayBrNumber,
                    display_slmc_number: displaySlmcNumber,
                    certificates_json: JSON.stringify(certificates),
                    services_json: JSON.stringify(services),
                    opening_hours: JSON.stringify({
                      MondayOpen: mondayOpen,
                      MondayClose: mondayClose,
                      TuesdayOpen: tuesdayOpen,
                      TuesdayClose: tuesdayClose,
                      WednesdayOpen: wednesdayOpen,
                      WednesdayClose: wednesdayClose,
                      ThursdayOpen: thursdayOpen,
                      ThursdayClose: thursdayClose,
                      FridayOpen: fridayOpen,
                      FridayClose: fridayClose,
                      SaturdayOpen: saturdayOpen,
                      SaturdayClose: saturdayClose,
                      SundayOpen: sundayOpen,
                    })
                  };
                  return <SelectedTemplate tenant={previewTenant} subdomain={config?.subdomain || 'test'} />;
                })()}
              </div>
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
              <h2 className="text-base font-bold text-primary font-display">
                Ready to Publish?
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                Your public pharmacy website will go live instantly at:
              </p>
              <div className="mt-3 py-2 px-4 bg-white border border-outline-variant/75 rounded-lg font-mono font-bold text-primary-container text-xs w-full shadow-inner select-all text-center">
                {config?.subdomain || 'test'}.medical.lk
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                Publishing Checklist
              </h3>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-secondary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-on-surface">
                      Store Identity &amp; Branding
                    </p>
                    <p className="text-[10px] text-outline">
                      Logo, custom typography, and primary color preset applied.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-secondary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-on-surface">
                      Contact &amp; Location Details
                    </p>
                    <p className="text-[10px] text-outline">
                      Active phone, email, store location, and hours formatted.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-secondary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-on-surface">
                      SEO Configuration
                    </p>
                    <p className="text-[10px] text-outline">
                      Meta description and keywords ready for indexing.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-secondary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-bold text-on-surface">
                      Device Compatibility
                    </p>
                    <p className="text-[10px] text-outline">
                      Layout and hero banner reflow matches desktop and mobile.
                    </p>
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
