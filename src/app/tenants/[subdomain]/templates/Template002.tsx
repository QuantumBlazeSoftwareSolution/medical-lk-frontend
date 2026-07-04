'use client';

import React, { useState, useEffect, useMemo } from 'react';
import nextDynamic from 'next/dynamic';
import {
  MapPin,
  Mail,
  Phone,
  Loader2,
  Activity,
  Heart,
  Clock,
  Globe,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Menu,
  Search,
  ChevronRight,
  Check,
  Info,
} from 'lucide-react';
import { getFontFamily } from '@/utils/fontConfig';

const LeafletMap = nextDynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f8f9ff] flex flex-col items-center justify-center text-[#a3aab0] text-xs gap-1.5 min-h-[192px]">
      <Loader2 className="h-5 w-5 animate-spin text-[#008080]" />
      <span>Loading map...</span>
    </div>
  ),
});

interface Template002Props {
  tenant: any;
  subdomain: string;
}

export default function Template002({ tenant, subdomain }: Template002Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

  // Inventory state
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Apply dynamic favicon if configured
  useEffect(() => {
    if (tenant?.favicon_url) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = tenant.favicon_url;
      if (tenant.favicon_url.startsWith('data:')) {
        const typeMatch = tenant.favicon_url.match(/data:([^;]+);/);
        if (typeMatch) link.type = typeMatch[1];
      }
    }
  }, [tenant?.favicon_url]);

  // Fetch public inventory
  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInventory(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/inventory/public/batches`,
          {
            headers: {
              'X-Tenant-Subdomain': subdomain,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        }
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, [subdomain]);

  // Calculate if the pharmacy is open now (between 8:00 AM and 9:00 PM)
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
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

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center text-[#334155] gap-4 font-sans p-6 text-center">
        <Activity className="h-10 w-10 text-teal-600 animate-pulse" />
        <h2 className="text-lg font-bold text-teal-700">
          Pharmacy Website Not Found
        </h2>
        <p className="text-xs max-w-sm">
          Please verify the URL or ensure the pharmacy trial is active.
        </p>
      </div>
    );
  }

  // Resolve branding colors (default to solid medical teal/emerald palette)
  const primaryColor = tenant.brand_color_primary || '#0f766e'; // Teal 700
  const secondaryColor = tenant.brand_color_secondary || '#0d9488'; // Teal 600

  const logoHeight = tenant.logo_height || 40;
  const headingsFont = tenant.headings_font || 'poppins';
  const bodyFont = tenant.body_font || 'inter';

  const heroHeadline = tenant.hero_headline || `Your Health, Our Priority`;
  const heroSubheadline =
    tenant.hero_subheadline ||
    tenant.website_description ||
    'Get professional pharmaceutical care, prescription fulfillment, and authentic medicines from our experienced staff.';
  const heroButtonText = tenant.hero_button_text || 'Find Our Store';
  const heroBgImage =
    !tenant.hero_bg_image || tenant.hero_bg_image.includes('unsplash.com')
      ? '/templates/hero-002.png'
      : tenant.hero_bg_image;
  const autoCloseHolidays = tenant.auto_close_holidays !== false;

  // Resolve opening hours
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

  // Resolve statistics for ProHealth Theme
  let statExperience = '15+';
  let statPatients = '99%';
  let statProducts = '15,000+';
  let statHealthcareStaff = '6+';
  if (tenant.stats_json) {
    try {
      const parsedStats = JSON.parse(tenant.stats_json);
      if (parsedStats.experience) statExperience = parsedStats.experience;
      if (parsedStats.patients) statPatients = parsedStats.patients;
      if (parsedStats.products) statProducts = parsedStats.products;
      if (parsedStats.staff) statHealthcareStaff = parsedStats.staff;
    } catch (e) {
      console.error(e);
    }
  }

  // Resolve services
  let services = [
    {
      title: 'Prescription Dispensing',
      description:
        'Accurate dispensing of medicines with standard safety verification by clinical pharmacists.',
      icon: 'Check',
    },
    {
      title: 'Pediatric Care Solutions',
      description:
        'Child-safe dosages, flavoring alternatives, and specialist infant wellness products.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Over-the-Counter (OTC)',
      description:
        'Wide range of quality OTC health supplements, skincare, and daily hygiene necessities.',
      icon: 'Sparkles',
    },
    {
      title: 'Immunization & Vaccines',
      description:
        'Authorized standard seasonal flu vaccines and clinical travel vaccinations in-store.',
      icon: 'Activity',
    },
    {
      title: 'Cardiovascular Support',
      description:
        'Blood pressure tracking devices, heart health guidance, and cholesterol management aid.',
      icon: 'Heart',
    },
    {
      title: 'General Wellness',
      description:
        'Nutrition consultations, dietary planning, and custom vitamin subscription suggestions.',
      icon: 'Clock',
    },
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
      case 'Check':
        return <Check size={20} />;
      case 'Clock':
        return <Clock size={20} />;
      case 'Heart':
        return <Heart size={20} />;
      case 'Sparkles':
        return <Sparkles size={20} />;
      case 'Activity':
        return <Activity size={20} />;
      case 'ShieldCheck':
        return <ShieldCheck size={20} />;
      case 'Mail':
        return <Mail size={20} />;
      case 'Phone':
        return <Phone size={20} />;
      case 'MapPin':
        return <MapPin size={20} />;
      case 'Globe':
        return <Globe size={20} />;
      case 'Calendar':
        return <Calendar size={20} />;
      case 'CheckCircle':
        return <CheckCircle size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  // Group batches by unique medicine name
  const uniqueMedicines = useMemo(() => {
    const map = new Map<string, any>();
    batches.forEach((b) => {
      const key = b.medicine_name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: b.id,
          name: b.medicine_name,
          generic_name: b.generic_name,
          category: b.category || 'General',
          unit: b.unit || 'Tablet',
          price: b.selling_price,
          quantity: b.quantity_remaining,
        });
      } else {
        const existing = map.get(key);
        existing.quantity += b.quantity_remaining;
        if (b.selling_price < existing.price) {
          existing.price = b.selling_price;
        }
      }
    });
    return Array.from(map.values());
  }, [batches]);

  const filteredMedicines = useMemo(() => {
    return uniqueMedicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.generic_name &&
          m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [uniqueMedicines, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    uniqueMedicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set)];
  }, [uniqueMedicines]);

  // Dynamic Fonts mappings
  const headingStyle = {
    fontFamily: getFontFamily(headingsFont),
  };

  const bodyStyle = {
    fontFamily: getFontFamily(bodyFont),
  };

  const handleGetDirections = () => {
    if (tenant.map_link) {
      window.open(tenant.map_link, '_blank');
    } else if (tenant.contact_address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.contact_address)}`,
        '_blank'
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white"
      style={bodyStyle}
    >
      <title>{tenant.website_title || tenant.name}</title>

      {/* Top Banner (Solid primary brand color) */}
      <div
        className="text-white py-2 px-6 text-xs text-center font-semibold tracking-wide flex flex-wrap justify-center items-center gap-4 border-b border-white/10"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>
            Hours: Mon - Fri {mondayOpen} - {mondayClose}
          </span>
        </div>
        <span className="hidden sm:inline opacity-60">|</span>
        {tenant.contact_phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={13} />
            <span>Emergency Line: {tenant.contact_phone}</span>
          </div>
        )}
      </div>

      {/* ProHealth Clean Header Navigation */}
      <header className="bg-white sticky top-0 w-full z-50 border-b border-slate-200/80 shadow-sm transition-all duration-200">
        <div className="flex justify-between items-center w-full px-6 md:px-10 max-w-7xl mx-auto h-20">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 max-w-[65%] md:max-w-none">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                style={{ height: `${logoHeight}px` }}
                className="object-contain"
              />
            ) : (
              <div
                className="rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm"
                style={{
                  backgroundColor: primaryColor,
                  width: `${logoHeight + 6}px`,
                  height: `${logoHeight + 6}px`,
                }}
              >
                PH
              </div>
            )}
            <span
              className="font-bold text-lg md:text-xl tracking-tight truncate font-display"
              style={{ ...headingStyle, color: primaryColor }}
            >
              {tenant.name}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a className="hover:text-teal-700 transition-colors" href="#">
              Home
            </a>
            <a className="hover:text-teal-700 transition-colors" href="#about">
              About Us
            </a>
            <a
              className="hover:text-teal-700 transition-colors"
              href="#services"
            >
              Services
            </a>
            <a className="hover:text-teal-700 transition-colors" href="#stock">
              Stock Search
            </a>
            <a
              className="hover:text-teal-700 transition-colors"
              href="#details"
            >
              Location
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {tenant.contact_phone && (
              <a
                href={`tel:${tenant.contact_phone}`}
                className="hidden md:flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Phone size={14} />
                Contact
              </a>
            )}
            {tenant.contact_phone && (
              <a
                href={`https://wa.me/${tenant.contact_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <MessageSquare size={14} />
                WhatsApp
              </a>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 md:hidden text-slate-600 hover:text-slate-900 focus:outline-none shrink-0"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3 shadow-md">
            <a
              className="block text-sm font-semibold text-slate-600 py-1"
              href="#"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              className="block text-sm font-semibold text-slate-600 py-1"
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              className="block text-sm font-semibold text-slate-600 py-1"
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a
              className="block text-sm font-semibold text-slate-600 py-1"
              href="#stock"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stock Search
            </a>
            <a
              className="block text-sm font-semibold text-slate-600 py-1"
              href="#details"
              onClick={() => setMobileMenuOpen(false)}
            >
              Location
            </a>
          </div>
        )}
      </header>

      <main>
        {/* ProHealth Clean Teal Hero Banner */}
        <section
          className="relative min-h-[70vh] flex items-center bg-teal-800 text-white overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Subtle Background Art Overlay */}
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src={heroBgImage}
              alt="Pharmacy Backdrop"
              className="object-cover w-full h-full filter grayscale"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/templates/hero-002.png';
              }}
            />
          </div>

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 py-20 text-left">
            <div className="grid md:grid-cols-12 gap-12 items-center">
              {/* Left text column */}
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-semibold tracking-wide text-teal-200">
                  <Activity size={14} className="animate-pulse" />
                  <span>Licensed Healthcare Pharmacy Partner</span>
                </div>

                <h1
                  className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white"
                  style={headingStyle}
                >
                  {heroHeadline}
                </h1>

                <p className="text-sm md:text-base opacity-90 leading-relaxed max-w-xl text-teal-50">
                  {heroSubheadline}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handleGetDirections}
                    className="px-6 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all text-white flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <MapPin size={16} />
                    {heroButtonText}
                  </button>
                  <a
                    href="#stock"
                    className="px-6 py-3.5 rounded-lg bg-white text-teal-800 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-slate-50 active:scale-95 transition-all text-center"
                  >
                    Check Stock Online
                  </a>
                </div>
              </div>

              {/* Right clean vector card */}
              <div className="hidden md:col-span-5 md:flex justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-slate-800 max-w-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 rounded-lg text-teal-700">
                      <Heart size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        Professional Pharmacy Care
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Expert care you can count on.
                      </p>
                    </div>
                  </div>
                  <hr className="border-slate-100" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload your prescriptions directly, query stock
                    availability, and receive licensed counselor guidance.
                  </p>
                  <div className="flex justify-between items-center text-xs font-semibold text-teal-700 bg-teal-50/50 p-2.5 rounded-lg">
                    <span>Emergency Hotline:</span>
                    <span className="font-bold">
                      {tenant.contact_phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Key Stats Grid Strip (ProHealth Style) */}
        <section className="relative z-30 -mt-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 px-6 bg-white rounded-xl shadow-md border border-slate-200/60">
              <div className="text-center px-4 border-r border-slate-100 last:border-0">
                <div
                  className="text-3xl font-extrabold text-teal-700 mb-1"
                  style={{ color: primaryColor }}
                >
                  {statExperience}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Years Experience
                </div>
              </div>

              <div className="text-center px-4 lg:border-r border-slate-100 last:border-0">
                <div
                  className="text-3xl font-extrabold text-teal-700 mb-1"
                  style={{ color: primaryColor }}
                >
                  {statPatients}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Satisfaction Rate
                </div>
              </div>

              <div className="text-center px-4 border-r border-slate-100 last:border-0">
                <div
                  className="text-3xl font-extrabold text-teal-700 mb-1"
                  style={{ color: primaryColor }}
                >
                  {statProducts}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Prescriptions Filled
                </div>
              </div>

              <div className="text-center px-4">
                <div
                  className="text-3xl font-extrabold text-teal-700 mb-1"
                  style={{ color: primaryColor }}
                >
                  {statHealthcareStaff}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Licensed Staff
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us (ProHealth Style) */}
        <section id="about" className="py-16 md:py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left Image grid */}
            <div className="relative">
              <img
                alt="Pharmacist Assisting Customer"
                className="rounded-2xl shadow-md w-full object-cover aspect-[4/3] max-h-[380px] border border-slate-100"
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"
              />
              <div className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-5 rounded-xl shadow-lg border border-slate-800 max-w-[220px] text-left">
                <div className="flex items-center gap-2 mb-1.5 text-teal-400">
                  <ShieldCheck size={24} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Verified Care
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-200 leading-tight">
                  Ministry Registered Pharmacy
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-mono">
                  Reg: {tenant.display_slmc_number || 'SLMC-PH-8921'}
                </div>
              </div>
            </div>

            {/* Right details content */}
            <div className="text-left space-y-6">
              <div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2 text-teal-600"
                  style={{ color: secondaryColor }}
                >
                  About Our Pharmacy
                </div>
                <h2
                  className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900"
                  style={headingStyle}
                >
                  Your Reliable Family Health Partner
                </h2>
              </div>

              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                At {tenant.name}, we are committed to providing the highest
                quality pharmaceutical care. We stock only registered and
                verified medications, verified by the National Medicines
                Regulatory Authority (NMRA).
              </p>

              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Our in-house pharmacists offer prescription analysis, drug
                interaction checks, and individual patient consultations to
                ensure the safety and success of your wellness plan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-teal-600 shrink-0 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    100% Genuine Brands
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-teal-600 shrink-0 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Experienced Pharmacists
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-teal-600 shrink-0 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Cold Chain Storage
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle
                    size={16}
                    className="text-teal-600 shrink-0 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Detailed Instructions
                  </span>
                </div>
              </div>

              {certificates.length > 0 && (
                <div className="pt-4">
                  <button
                    onClick={() => setShowCertificatesModal(true)}
                    className="px-5 py-3 border hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-sm cursor-pointer border-slate-300 text-slate-700"
                  >
                    <ShieldCheck size={16} />
                    View Certificates &amp; Licenses
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Dynamic Public Stock Search Panel (Request Integration) */}
        <section
          id="stock"
          className="py-16 md:py-24 bg-slate-100 border-t border-b border-slate-200/80 px-6"
        >
          <div className="max-w-7xl mx-auto text-left space-y-8">
            <div className="text-center md:text-left">
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 text-teal-600"
                style={{ color: secondaryColor }}
              >
                Real-Time Stock Query
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold text-slate-900"
                style={headingStyle}
              >
                Find Available Medicines
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Check medicine availability in our store registry instantly.
                Prices and quantities are updated in real-time.
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-8 relative">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by brand name or generic name (e.g. Paracetamol)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-sm"
                />
              </div>

              {/* Category selector */}
              <div className="md:col-span-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-sm"
                >
                  <option value="All">All Categories</option>
                  {categories
                    .filter((c) => c !== 'All')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Medicine Listing Display */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              {loadingInventory ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="text-xs font-semibold text-slate-500">
                    Checking inventory registry...
                  </span>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Info className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">
                    No in-stock medicines found matching search
                  </p>
                  <p className="text-xs max-w-sm mx-auto">
                    Please try searching with another spelling or contact our
                    counter via WhatsApp for manual checking.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6">Medicine Detail</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4 text-right">UOM</th>
                        <th className="py-4 px-4 text-right">Price (LKR)</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMedicines.map((med, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4.5 px-6">
                            <div className="font-bold text-slate-900">
                              {med.name}
                            </div>
                            {med.generic_name && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {med.generic_name}
                              </div>
                            )}
                          </td>
                          <td className="py-4.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {med.category}
                            </span>
                          </td>
                          <td className="py-4.5 px-4 text-right font-mono text-slate-600">
                            {med.unit}
                          </td>
                          <td className="py-4.5 px-4 text-right font-bold text-slate-900 font-mono">
                            {med.price.toLocaleString('en-LK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-4.5 px-6 text-center">
                            {med.quantity > 0 ? (
                              <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase rounded-full">
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase rounded-full">
                                Out of Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center bg-teal-50 border border-teal-100/60 p-4 rounded-xl text-teal-800 text-xs">
              <Info className="h-4 w-4 shrink-0 text-teal-600" />
              <span>
                Can't find a medicine? Sourced imports can be arranged. Contact
                our pharmacists via WhatsApp to request special imports.
              </span>
            </div>
          </div>
        </section>

        {/* Our Services (Departments Grid) */}
        <section id="services" className="py-16 md:py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto text-left space-y-12">
            <div className="text-center">
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 text-teal-600"
                style={{ color: secondaryColor }}
              >
                Our Departments
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold text-slate-900"
                style={headingStyle}
              >
                Comprehensive Pharmacy Care
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-slate-200/80 hover:border-slate-300 transition-colors shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      {getIconComponent(svc.icon)}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 font-display">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hours & Location (Interactive Map Integration) */}
        <section
          id="details"
          className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/80 px-6"
        >
          <div className="max-w-7xl mx-auto text-left space-y-12">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 text-teal-600"
                style={{ color: secondaryColor }}
              >
                Store Visit Details
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold text-slate-900"
                style={headingStyle}
              >
                Hours &amp; Store Location
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Hours Card */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Regular Store Hours
                </h3>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-semibold text-xs text-slate-700">
                    Monday - Friday
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    {mondayOpen} - {mondayClose}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 bg-slate-50 -mx-6 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-950">
                      Today
                    </span>
                    {isOpenNow ? (
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Open Now
                      </span>
                    ) : (
                      <span className="bg-rose-100 text-rose-800 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Closed
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-bold text-teal-700 font-mono"
                    style={{ color: primaryColor }}
                  >
                    {mondayOpen} - {mondayClose}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-semibold text-xs text-slate-700">
                    Saturday
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    09:00 AM - 07:00 PM
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-xs text-slate-700">
                    Sunday
                  </span>
                  <span className="text-xs text-slate-600 font-mono italic">
                    {sundayOpen}
                  </span>
                </div>

                {autoCloseHolidays && (
                  <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-500 flex gap-2 items-start leading-relaxed">
                    <Info size={13} className="shrink-0 mt-0.5 text-teal-600" />
                    <span>
                      Store is closed on Sri Lankan public holidays and
                      religious holidays
                      {exceptions.length > 0 &&
                        ` (${exceptions.map((e) => e.name).join(', ')})`}
                      .
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive map */}
              <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
                <div className="w-full h-56 border-b border-slate-200/80">
                  <LeafletMap
                    address={tenant.contact_address || 'Colombo, Sri Lanka'}
                    mapLink={tenant.map_link}
                  />
                </div>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-xs text-slate-900">
                      {tenant.contact_address || 'No store address configured.'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Colombo, Sri Lanka
                    </p>
                  </div>
                  <button
                    onClick={handleGetDirections}
                    className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95"
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

      {/* ProHealth Footer Layout */}
      <footer className="w-full bg-slate-900 text-slate-400 py-16 px-6 md:px-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-white text-lg font-bold font-display">
              {tenant.name}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Your registered digital community pharmacy providing licensed
              medical products and care consultation.
            </p>

            {/* Compliance badges */}
            {(tenant.display_nmra_number ||
              tenant.display_br_number ||
              tenant.display_slmc_number) && (
              <div className="text-[10px] text-slate-500 space-y-1 font-mono pt-1 leading-relaxed border-t border-slate-800/80 pt-4">
                {tenant.display_nmra_number && (
                  <div>NMRA Reg: {tenant.display_nmra_number}</div>
                )}
                {tenant.display_br_number && (
                  <div>BR Number: {tenant.display_br_number}</div>
                )}
                {tenant.display_slmc_number && (
                  <div>
                    SLMC Pharmacist License: {tenant.display_slmc_number}
                  </div>
                )}
              </div>
            )}

            <div className="text-[10px] text-slate-500 pt-2">
              &copy; {new Date().getFullYear()} {tenant.name}. Powered by{' '}
              <a
                href="https://quantumblaze.lk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:underline"
              >
                Quantum Blaze
              </a>
              .
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2.5 text-xs text-slate-400">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">
              E-Care Services
            </h4>
            <a className="hover:text-white" href="#stock">
              In-Stock Search
            </a>
            <a className="hover:text-white" href="#">
              Prescription Upload
            </a>
            <a className="hover:text-white" href="#">
              Consultation Booking
            </a>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2.5 text-xs text-slate-400">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">
              Compliance &amp; Legal
            </h4>
            <a className="hover:text-white" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-white" href="#">
              Terms &amp; Conditions
            </a>
            <a className="hover:text-white" href="#">
              Safety Regulations
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      {tenant.contact_phone && (
        <a
          href={`https://wa.me/${tenant.contact_phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z"></path>
          </svg>
        </a>
      )}

      {/* Verified Certificates gallery overlay */}
      {showCertificatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-teal-600">
                <ShieldCheck size={22} />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-wider font-display">
                  Verified Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertificatesModal(false)}
                className="text-slate-400 hover:text-slate-900 text-2xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-1.5 text-xs font-mono border-b border-slate-100 pb-3 bg-slate-50 p-3 rounded-lg">
                {tenant.display_nmra_number && (
                  <p>
                    <strong>NMRA Pharmacy Registration:</strong>{' '}
                    {tenant.display_nmra_number}
                  </p>
                )}
                {tenant.display_slmc_number && (
                  <p>
                    <strong>SLMC Certified Pharmacist Reg:</strong>{' '}
                    {tenant.display_slmc_number}
                  </p>
                )}
                {tenant.display_br_number && (
                  <p>
                    <strong>Business Registration No:</strong>{' '}
                    {tenant.display_br_number}
                  </p>
                )}
              </div>

              {certificates.map((cert, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col items-center"
                >
                  <span className="text-xs font-bold text-slate-800 self-start mb-2">
                    {cert.name}
                  </span>
                  <img
                    src={cert.url}
                    alt={cert.name}
                    className="max-h-64 object-contain rounded-lg border border-slate-200 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCertificatesModal(false)}
              className="mt-6 w-full py-3 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
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
