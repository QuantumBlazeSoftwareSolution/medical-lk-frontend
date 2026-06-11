'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, Mail, Phone, Loader2, Activity, Heart, Clock, 
  Globe, Calendar, CheckCircle, ShieldCheck, Sparkles, 
  MessageSquare, Menu, Search, ChevronRight, Check
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

const LeafletMap = nextDynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f8f9ff] flex flex-col items-center justify-center text-[#a3aab0] text-xs gap-1.5 min-h-[192px]">
      <Loader2 className="h-5 w-5 animate-spin text-[#006d37]" />
      <span>Loading map...</span>
    </div>
  )
});

export default function TenantPublicPage({ params }: { params: Promise<{ subdomain: string }> }) {
  // Resolve params promise for NextJS 15 compatibility
  const resolvedParams = React.use(params);
  const subdomain = resolvedParams.subdomain;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant-public', subdomain],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  // Calculate if the pharmacy is open now (between 8:00 AM and 9:00 PM)
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Simple mock check: open between 8 AM and 9 PM (21:00)
      if (currentHour >= 8 && currentHour < 21 && now.getDay() !== 0) {
        setIsOpenNow(true);
      } else {
        setIsOpenNow(false);
      }
    };
    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#72787e] gap-2 font-sans text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-[#006d37]" />
        <span>Loading pharmacy details...</span>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center text-[#42474d] gap-4 font-sans p-6 text-center">
        <Activity className="h-10 w-10 text-red-500 animate-pulse" />
        <h2 className="text-lg font-bold text-red-600">Pharmacy Website Not Found</h2>
        <p className="text-xs max-w-sm">Please verify the URL or ensure the pharmacy trial is active.</p>
      </div>
    );
  }

  const primaryColor = tenant.brand_color_primary || '#00273b';
  const secondaryColor = tenant.brand_color_secondary || '#006d37';
  
  // Custom builder states
  const logoHeight = tenant.logo_height || 40;
  const stickyHeader = tenant.sticky_header !== false;
  const headingsFont = tenant.headings_font || 'poppins';
  const bodyFont = tenant.body_font || 'inter';
  
  const heroHeadline = tenant.hero_headline || `Welcome to ${tenant.name}`;
  const heroSubheadline = tenant.hero_subheadline || tenant.website_description || 'Your trusted community pharmacy. Providing expert care, authentic medicines, and reliable health services.';
  const heroButtonText = tenant.hero_button_text || 'Get Directions';
  const heroBgImage = tenant.hero_bg_image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80';
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

  // Resolve certificates
  let certificates: Array<{ name: string; url: string }> = [];
  if (tenant.certificates_json) {
    try {
      const parsedCerts = JSON.parse(tenant.certificates_json);
      if (Array.isArray(parsedCerts)) {
        certificates = parsedCerts;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Resolve statistics
  let statExperience = '15+';
  let statPatients = '5,000+';
  let statProducts = '2,000+';
  let statWaitTime = '15 Min';
  if (tenant.stats_json) {
    try {
      const parsedStats = JSON.parse(tenant.stats_json);
      if (parsedStats.experience) statExperience = parsedStats.experience;
      if (parsedStats.patients) statPatients = parsedStats.patients;
      if (parsedStats.products) statProducts = parsedStats.products;
      if (parsedStats.wait_time) statWaitTime = parsedStats.wait_time;
    } catch (e) {
      console.error(e);
    }
  }

  // Resolve services
  let services = [
    { title: 'Prescription Fulfillment', description: 'Fast, accurate dispensing of medications with thorough interaction checks by our licensed pharmacists.', icon: 'Check' },
    { title: 'Home Delivery', description: 'Convenient doorstep delivery across Colombo within 24 hours. Cold chain maintained for sensitive drugs.', icon: 'Clock' },
    { title: 'Health Consultations', description: 'Private consultations to discuss medication management, side effects, and general wellness plans.', icon: 'Heart' },
    { title: 'Cosmetics & Derma', description: 'Curated selection of dermatologically tested skincare and personal care products.', icon: 'Sparkles' },
    { title: 'Health Monitoring', description: 'In-store blood pressure checking, blood sugar testing, and BMI calculation services.', icon: 'Activity' },
    { title: 'Baby & Mother Care', description: 'Everything you need for maternal health and infant care, from nutrition to hygiene essentials.', icon: 'ShieldCheck' }
  ];
  if (tenant.services_json) {
    try {
      const parsedServices = JSON.parse(tenant.services_json);
      if (Array.isArray(parsedServices) && parsedServices.length > 0) {
        services = parsedServices;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Check': return <Check size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Heart': return <Heart size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Activity': return <Activity size={20} />;
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'Mail': return <Mail size={20} />;
      case 'Phone': return <Phone size={20} />;
      case 'MapPin': return <MapPin size={20} />;
      case 'Globe': return <Globe size={20} />;
      case 'Calendar': return <Calendar size={20} />;
      case 'CheckCircle': return <CheckCircle size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  // Dynamic Fonts mappings
  const headingStyle = {
    fontFamily: headingsFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
  };
  
  const bodyStyle = {
    fontFamily: bodyFont === 'poppins' ? 'var(--font-display)' : 'var(--font-sans)',
  };

  // Google Maps directions helper
  const handleGetDirections = () => {
    if (tenant.map_link) {
      window.open(tenant.map_link, '_blank');
    } else if (tenant.contact_address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.contact_address)}`, '_blank');
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-teal-50 selection:text-teal-900 font-sans"
      style={bodyStyle}
    >
      <title>{tenant.website_title || tenant.name}</title>
      
      {/* Announcement Banner */}
      <div className="bg-[#ffb961] text-[#533200] py-2 px-4 text-center font-bold text-xs tracking-wide shadow-sm">
        10% off vitamins this week. <a className="underline hover:text-[#2b1700] ml-1 transition-colors" href="#services">Learn More</a>
      </div>

      {/* Navigation Bar */}
      <nav className={`bg-white sticky top-0 w-full z-50 border-b border-[#c2c7cd]/40 shadow-sm transition-all duration-200`}>
        <div className="flex justify-between items-center w-full px-6 md:px-10 max-w-7xl mx-auto h-16">
          {/* Logo Brand Block */}
          <div className="flex items-center gap-2 max-w-[60%] md:max-w-none">
            {tenant.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant.name} 
                style={{ height: `${logoHeight}px` }} 
                className="object-contain" 
              />
            ) : (
              <div 
                className="rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: primaryColor, width: `${logoHeight + 4}px`, height: `${logoHeight + 4}px` }}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span 
              className="font-bold text-base md:text-lg tracking-tight truncate"
              style={{ ...headingStyle, color: primaryColor }}
            >
              {tenant.name}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#42474d]">
            <a className="hover:text-[#0b1c30] transition-colors" href="#">Home</a>
            <a className="hover:text-[#0b1c30] transition-colors" href="#about">About Us</a>
            <a className="hover:text-[#0b1c30] transition-colors" href="#services">Services</a>
            <a className="hover:text-[#0b1c30] transition-colors" href="#details">Hours &amp; Location</a>
          </div>

          {/* Nav Actions */}
          <div className="flex gap-2">
            {tenant.contact_phone && (
              <a 
                href={`tel:${tenant.contact_phone}`}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Phone size={14} />
                Call Now
              </a>
            )}
            {tenant.contact_phone && (
              <a 
                href={`https://wa.me/${tenant.contact_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba56] transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <MessageSquare size={14} />
                WhatsApp
              </a>
            )}
            
            {/* Mobile Hamburger menu */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle Menu" 
              className="p-2 md:hidden text-[#42474d] hover:text-[#0b1c30] focus:outline-none shrink-0"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#c2c7cd]/30 bg-white px-6 py-4 space-y-3 shadow-md">
            <a className="block text-sm font-semibold text-[#42474d] py-1" href="#" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a className="block text-sm font-semibold text-[#42474d] py-1" href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a className="block text-sm font-semibold text-[#42474d] py-1" href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a className="block text-sm font-semibold text-[#42474d] py-1" href="#details" onClick={() => setMobileMenuOpen(false)}>Hours &amp; Location</a>
            {tenant.contact_phone && (
              <div className="pt-2">
                <a 
                  href={`tel:${tenant.contact_phone}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <Phone size={14} />
                  Call Now
                </a>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        
        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center bg-[#00273b] overflow-hidden">
          {/* Background Image with Tint Overlay */}
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

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 py-16 text-left">
            <div className="max-w-2xl text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-wide text-[#a3cbeb]">
                <span className="w-2 h-2 rounded-full bg-[#6bfe9c]"></span>
                Licensed Pharmacy &bull; Est. 2010
              </div>
              <h1 
                className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-white"
                style={headingStyle}
              >
                {heroHeadline}
              </h1>
              <p className="text-sm md:text-lg opacity-90 leading-relaxed max-w-xl text-[#eaf1ff]">
                {heroSubheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={handleGetDirections}
                  className="px-8 py-4 rounded-lg bg-[#006d37] hover:bg-[#00743a] text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <MapPin size={16} />
                  {heroButtonText}
                </button>
                {tenant.contact_phone && (
                  <a 
                    href={`tel:${tenant.contact_phone}`}
                    className="px-8 py-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer text-center"
                  >
                    <Phone size={16} />
                    Call Us Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-[#eff4ff] border-b border-[#c2c7cd]/30 relative z-30 -mt-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 bg-white rounded-xl shadow-lg border border-[#c2c7cd]/20 -translate-y-6">
              <div className="text-center px-4 border-r border-[#c2c7cd]/20 last:border-0">
                <div 
                  className="text-xl md:text-2xl font-bold mb-0.5"
                  style={{ color: primaryColor }}
                >
                  {statExperience}
                </div>
                <div className="text-[10px] font-bold text-[#42474d] uppercase tracking-wider">Years Experience</div>
              </div>
              <div className="text-center px-4 border-r border-[#c2c7cd]/20 last:border-0">
                <div 
                  className="text-xl md:text-2xl font-bold mb-0.5"
                  style={{ color: primaryColor }}
                >
                  {statPatients}
                </div>
                <div className="text-[10px] font-bold text-[#42474d] uppercase tracking-wider">Happy Patients</div>
              </div>
              <div className="text-center px-4 border-r border-[#c2c7cd]/20 last:border-0">
                <div 
                  className="text-xl md:text-2xl font-bold mb-0.5"
                  style={{ color: primaryColor }}
                >
                  {statProducts}
                </div>
                <div className="text-[10px] font-bold text-[#42474d] uppercase tracking-wider">Products Catalog</div>
              </div>
              <div className="text-center px-4">
                <div 
                  className="text-xl md:text-2xl font-bold mb-0.5"
                  style={{ color: primaryColor }}
                >
                  {statWaitTime}
                </div>
                <div className="text-[10px] font-bold text-[#42474d] uppercase tracking-wider">Avg Wait Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="py-16 md:py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* About Image Showcase */}
            <div className="relative">
              <img 
                alt="Pharmacist Assisting Customer" 
                className="rounded-2xl shadow-xl w-full object-cover aspect-square max-h-[440px]" 
                src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80" 
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-5 rounded-xl shadow-xl border border-[#c2c7cd]/20 max-w-[210px] text-left">
                <div 
                  className="flex items-center gap-2 mb-1.5"
                  style={{ color: secondaryColor }}
                >
                  <ShieldCheck size={26} />
                  <span className="font-bold text-xs uppercase tracking-wider">Verified</span>
                </div>
                <div className="font-bold text-xs text-[#0b1c30] leading-tight font-display">Licensed Care Pharmacy</div>
                <div className="text-[10px] text-[#42474d] mt-1 font-mono">Reg: {tenant.display_slmc_number || 'SLMC-PH-8921'}</div>
              </div>
            </div>

            {/* About description */}
            <div className="text-left space-y-6">
              <div>
                <div 
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: secondaryColor }}
                >
                  About Us
                </div>
                <h2 
                  className="text-2xl md:text-4xl font-bold leading-tight"
                  style={{ ...headingStyle, color: primaryColor }}
                >
                  Committed to Your Health and Wellness
                </h2>
              </div>
              
              <p className="text-sm md:text-base text-[#42474d] leading-relaxed">
                At {tenant.name}, we combine clinical expertise with personalized care to provide you with the safest, most efficient pharmacy experience. We believe that access to authentic medication and professional advice is a fundamental right.
              </p>
              <p className="text-sm md:text-base text-[#42474d] leading-relaxed">
                Our team of certified pharmacists is dedicated to your health journey, ensuring you understand your prescriptions and empowering you to make informed wellness decisions.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                  >
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#0b1c30]">100% Authentic Medicines</h4>
                    <p className="text-[11px] text-[#42474d] mt-0.5">Sourced directly from authorized clinical distributors.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                  >
                    <Heart size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#0b1c30]">Expert Pharmacist Advice</h4>
                    <p className="text-[11px] text-[#42474d] mt-0.5">Free consultations for all prescriptions and wellness inquiries.</p>
                  </div>
                </div>
              </div>
              {certificates.length > 0 && (
                <div className="pt-4">
                  <button 
                    onClick={() => setShowCertificatesModal(true)}
                    className="px-5 py-2.5 bg-white border hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <ShieldCheck size={15} />
                    View Verified Certificates &amp; Licenses
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="py-16 md:py-24 bg-[#eff4ff] px-6 border-t border-b border-[#c2c7cd]/20">
          <div className="max-w-7xl mx-auto text-left">
            <div className="text-center md:text-left mb-12">
              <div 
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: secondaryColor }}
              >
                Our Services
              </div>
              <h2 
                className="text-2xl md:text-4xl font-bold"
                style={{ ...headingStyle, color: primaryColor }}
              >
                Comprehensive Pharmacy Care
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {services.map((svc, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 border border-[#c2c7cd]/30 hover:-translate-y-1 transition-transform duration-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-white font-bold"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      {getIconComponent(svc.icon)}
                    </div>
                    <h3 className="font-bold text-sm text-[#0b1c30] mb-2 font-display">{svc.title}</h3>
                    <p className="text-xs text-[#42474d] leading-relaxed">{svc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hours & Location Section */}
        <section id="details" className="py-16 md:py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto text-left space-y-12">
            <div>
              <div 
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: secondaryColor }}
              >
                Hours &amp; Location
              </div>
              <h2 
                className="text-2xl md:text-4xl font-bold"
                style={{ ...headingStyle, color: primaryColor }}
              >
                Visit Our Store
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Opening Hours list card */}
              <div className="md:col-span-5 bg-white border border-[#c2c7cd]/40 rounded-xl p-6 shadow-sm space-y-4">
                
                <div className="flex justify-between items-center py-2 border-b border-[#c2c7cd]/20">
                  <span className="font-bold text-xs text-[#0b1c30]">Monday - Friday</span>
                  <span className="text-xs text-[#42474d] font-mono">{mondayOpen} - {mondayClose}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-[#c2c7cd]/20 bg-[#eff4ff]/60 -mx-6 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0b1c30]">Today</span>
                    {isOpenNow ? (
                      <span className="bg-[#2ecc71]/20 text-[#006d37] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Open Now</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Closed</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0b1c30] font-mono">{mondayOpen} - {mondayClose}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-[#c2c7cd]/20">
                  <span className="font-bold text-xs text-[#0b1c30]">Saturday</span>
                  <span className="text-xs text-[#42474d] font-mono">09:00 AM - 07:00 PM</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-xs text-[#0b1c30]">Sunday</span>
                  <span className="text-xs text-[#42474d] font-mono italic">{sundayOpen}</span>
                </div>

                {autoCloseHolidays && (
                  <div className="pt-4 border-t border-[#c2c7cd]/20 text-[10px] text-[#42474d]/80 flex gap-1.5 items-start leading-relaxed">
                    <CheckCircle size={12} className="shrink-0 mt-0.5" style={{ color: secondaryColor }} />
                    <span>
                      Closed on Christmas Day (Dec 25) and all Sri Lankan public holidays 
                      {exceptions.length > 0 && ` (${exceptions.map(e => e.name).join(', ')})`}.
                    </span>
                  </div>
                )}
              </div>

              {/* Maps Location card */}
              <div className="md:col-span-7 bg-white border border-[#c2c7cd]/40 rounded-xl overflow-hidden shadow-sm">
                <div className="w-full h-48 border-b border-[#c2c7cd]/30">
                  <LeafletMap address={tenant.contact_address || 'Colombo, Sri Lanka'} mapLink={tenant.map_link} />
                </div>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-left">
                    <p className="font-bold text-xs text-[#0b1c30]">{tenant.contact_address || 'No address configured yet.'}</p>
                    <p className="text-[10px] text-[#42474d] mt-1">Colombo, Sri Lanka</p>
                  </div>
                  <button 
                    onClick={handleGetDirections}
                    className="px-5 py-2.5 bg-[#eff4ff] hover:bg-[#c9e6ff] text-[#00273b] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                  >
                    <Globe size={13} />
                    Get Directions
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer 
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-10 py-12 text-left max-w-7xl mx-auto border-t border-[#c2c7cd]/30"
      >
        <div className="space-y-3">
          <h2 
            className="text-base font-bold font-display"
            style={{ color: primaryColor }}
          >
            {tenant.name}
          </h2>
          <p className="text-xs text-[#42474d] max-w-xs leading-relaxed">Your trusted neighborhood community healthcare partner.</p>
          
          {/* Compliance Credentials Row */}
          {(tenant.display_nmra_number || tenant.display_br_number || tenant.display_slmc_number) && (
            <div className="text-[10px] text-[#72787e] space-y-1 font-mono pt-1 leading-relaxed">
              {tenant.display_nmra_number && <div>NMRA Reg: {tenant.display_nmra_number}</div>}
              {tenant.display_br_number && <div>BR Number: {tenant.display_br_number}</div>}
              {tenant.display_slmc_number && <div>SLMC Reg: {tenant.display_slmc_number}</div>}
            </div>
          )}

          <div className="text-[10px] text-[#72787e] pt-2">
            &copy; {new Date().getFullYear()} {tenant.name}. Powered by <a href="https://quantumblaze.lk" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#00273b] hover:underline">Quantum Blaze</a>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-[#42474d]">
          <h4 className="font-bold text-[#0b1c30] mb-1">Services</h4>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Prescription Upload</a>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Drug Interaction Checker</a>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Health Blog</a>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-[#42474d]">
          <h4 className="font-bold text-[#0b1c30] mb-1">Legal</h4>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Privacy Policy</a>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Terms of Service</a>
          <a className="hover:text-[#0b1c30] hover:underline" href="#">Location Finder</a>
        </div>
      </footer>

      {/* Floating Action Button (WhatsApp green) */}
      {tenant.contact_phone && (
        <a 
          href={`https://wa.me/${tenant.contact_phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp Us"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
          </svg>
        </a>
      )}

      {/* Certificates Lightbox Modal Overlay (Public Page) */}
      {showCertificatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#c2c7cd]/40 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4 border-b border-[#c2c7cd]/20 pb-3">
              <div className="flex items-center gap-2 text-[#006d37]" style={{ color: secondaryColor }}>
                <ShieldCheck size={22} />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-wider font-display">Verified Credentials</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCertificatesModal(false)}
                className="text-outline hover:text-[#0b1c30] text-2xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Credential items list */}
              <div className="space-y-1.5 text-xs font-mono border-b border-[#c2c7cd]/10 pb-3 bg-[#eff4ff]/40 p-3 rounded-lg">
                {tenant.display_nmra_number && <p><strong>NMRA Pharmacy Registration:</strong> {tenant.display_nmra_number}</p>}
                {tenant.display_slmc_number && <p><strong>SLMC Certified Pharmacist Reg:</strong> {tenant.display_slmc_number}</p>}
                {tenant.display_br_number && <p><strong>Business Registration No:</strong> {tenant.display_br_number}</p>}
              </div>

              {/* Certificate images */}
              {certificates.map((cert, idx) => (
                <div key={idx} className="border border-[#c2c7cd]/35 rounded-xl p-3 bg-[#f8f9ff] flex flex-col items-center">
                  <span className="text-xs font-bold text-primary-navy self-start mb-2">{cert.name}</span>
                  <img src={cert.url} alt={cert.name} className="max-h-64 object-contain rounded-lg border border-[#c2c7cd]/20 shadow-sm" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80'; }} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCertificatesModal(false)}
              className="mt-6 w-full py-3 bg-[#00273b] hover:bg-[#00273b]/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Close Gallery
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
