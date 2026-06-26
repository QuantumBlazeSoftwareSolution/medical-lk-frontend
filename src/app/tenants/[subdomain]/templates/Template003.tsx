'use client';

import React, { useState, useEffect, useMemo } from 'react';
import nextDynamic from 'next/dynamic';
import { 
  MapPin, Mail, Phone, Loader2, Activity, Heart, Clock, 
  Globe, Calendar, CheckCircle, ShieldCheck, Sparkles, 
  MessageSquare, Menu, Search, ChevronRight, Check, Info,
  BookOpen, Star, HelpCircle, User, ShoppingCart, ArrowRight
} from 'lucide-react';
import { getFontFamily } from '@/utils/fontConfig';

const LeafletMap = nextDynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f8f9ff] flex flex-col items-center justify-center text-[#a3aab0] text-xs gap-1.5 min-h-[192px]">
      <Loader2 className="h-5 w-5 animate-spin text-[#06b6d4]" />
      <span>Loading map...</span>
    </div>
  )
});

interface Template003Props {
  tenant: any;
  subdomain: string;
}

export default function Template003({ tenant, subdomain }: Template003Props) {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/inventory/public/batches`, {
          headers: {
            'X-Tenant-Subdomain': subdomain
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, [subdomain]);

  // Calculate if open now
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-4 font-sans p-6 text-center">
        <Activity className="h-10 w-10 text-cyan-500 animate-pulse" />
        <h2 className="text-lg font-bold text-cyan-500">Pharmacy Website Not Found</h2>
        <p className="text-xs max-w-sm">Please verify the URL or ensure the pharmacy trial is active.</p>
      </div>
    );
  }

  // Resolve branding colors (Default to Slate-900 / Cyan-500 for GeneX scientific look)
  const primaryColor = tenant.brand_color_primary || '#0f172a'; // Slate-900
  const secondaryColor = tenant.brand_color_secondary || '#06b6d4'; // Cyan-500
  
  const logoHeight = tenant.logo_height || 40;
  const headingsFont = tenant.headings_font || 'space-grotesk';
  const bodyFont = tenant.body_font || 'inter';
  
  const heroHeadline = tenant.hero_headline || `Institute of Longevity`;
  const heroSubheadline = tenant.hero_subheadline || tenant.website_description || 'Developing personalized longevity strategies based on your genetic code and evidence-based medicine.';
  const heroButtonText = tenant.hero_button_text || 'Start your program';
  const heroBgImage = tenant.hero_bg_image || '/templates/hero-003.png';
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

  // Resolve stats
  let statExperience = '18+';
  let statPatients = '6 500+';
  let statPartners = '15';
  let statPublications = '400+';
  if (tenant.stats_json) {
    try {
      const parsedStats = JSON.parse(tenant.stats_json);
      if (parsedStats.experience) statExperience = parsedStats.experience;
      if (parsedStats.patients) statPatients = parsedStats.patients;
      if (parsedStats.partners) statPartners = parsedStats.partners;
      if (parsedStats.publications) statPublications = parsedStats.publications;
    } catch (e) {
      console.error(e);
    }
  }

  // Group batches by unique medicine name
  const uniqueMedicines = useMemo(() => {
    const map = new Map<string, any>();
    batches.forEach(b => {
      const key = b.medicine_name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: b.id,
          name: b.medicine_name,
          generic_name: b.generic_name,
          category: b.category || 'General',
          unit: b.unit || 'Tablet',
          price: b.selling_price,
          quantity: b.quantity_remaining
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
    return uniqueMedicines.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (m.generic_name && m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [uniqueMedicines, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    uniqueMedicines.forEach(m => {
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
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.contact_address)}`, '_blank');
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col font-sans selection:bg-cyan-500 selection:text-white"
      style={bodyStyle}
    >
      <title>{tenant.website_title || tenant.name}</title>

      {/* 1. Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 w-full z-50 border-b border-slate-100 shadow-sm transition-all duration-200">
        <div className="flex justify-between items-center w-full px-6 md:px-10 max-w-7xl mx-auto h-20">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
              G
            </div>
            <span 
              className="font-extrabold text-base tracking-tight text-slate-900 font-display"
              style={headingStyle}
            >
              GeneX<span className="text-cyan-500">.</span>{tenant.name.split(' ')[0]}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a className="hover:text-slate-900 transition-colors" href="#">About</a>
            <a className="hover:text-slate-900 transition-colors" href="#what-we-do">Research Institute</a>
            <a className="hover:text-slate-900 transition-colors" href="#what-we-do">Medical Center</a>
            <a className="hover:text-slate-900 transition-colors" href="#stock">Stock Search</a>
            <a className="hover:text-slate-900 transition-colors" href="#details">Contacts</a>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-slate-400">
              <button className="text-xs font-bold hover:text-slate-900 transition-colors">EN</button>
              <User className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
              <ShoppingCart className="h-4 w-4 hover:text-slate-900 cursor-pointer" />
            </div>

            <a 
              href="#stock"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              {heroButtonText}
            </a>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              aria-label="Toggle Menu" 
              className="p-2 lg:hidden text-slate-500 hover:text-slate-900 focus:outline-none"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3 shadow-md text-left">
            <a className="block text-xs font-bold uppercase tracking-wider text-slate-500 py-1" href="#" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a className="block text-xs font-bold uppercase tracking-wider text-slate-500 py-1" href="#what-we-do" onClick={() => setMobileMenuOpen(false)}>Research Institute</a>
            <a className="block text-xs font-bold uppercase tracking-wider text-slate-500 py-1" href="#what-we-do" onClick={() => setMobileMenuOpen(false)}>Medical Center</a>
            <a className="block text-xs font-bold uppercase tracking-wider text-slate-500 py-1" href="#stock" onClick={() => setMobileMenuOpen(false)}>Stock Search</a>
            <a className="block text-xs font-bold uppercase tracking-wider text-slate-500 py-1" href="#details" onClick={() => setMobileMenuOpen(false)}>Contacts</a>
          </div>
        )}
      </header>

      <main>
        
        {/* 2. Longevity Hero Section */}
        <section className="relative min-h-[85vh] flex items-center bg-slate-950 text-white overflow-hidden">
          {/* Scientific backdrop image with dark blue tint */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent z-10" />
            <img 
              src={heroBgImage} 
              alt="DNA Backdrop" 
              className="object-cover w-full h-full opacity-40 filter saturate-50" 
            />
          </div>

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 py-20 text-left">
            <div className="max-w-2xl space-y-8">
              
              <h1 
                className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white font-display"
                style={headingStyle}
              >
                {heroHeadline}
              </h1>
              
              <p className="text-sm md:text-base opacity-85 leading-relaxed max-w-xl text-slate-300">
                {heroSubheadline}
              </p>

              <div className="pt-2">
                <a
                  href="#stock"
                  className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg active:scale-95 transition-all inline-block"
                >
                  Start programs
                </a>
              </div>

              {/* Location indicator box */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-10 border-t border-slate-800/80 gap-4 text-xs text-slate-400">
                <div 
                  onClick={handleGetDirections}
                  className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                >
                  <MapPin size={16} className="text-cyan-400" />
                  <span>{tenant.contact_address || 'Innovation Dr, San Diego, CA'}</span>
                </div>
                <div className="flex gap-4">
                  <span className="hover:text-white cursor-pointer">In</span>
                  <span className="hover:text-white cursor-pointer">Fb</span>
                  <span className="hover:text-white cursor-pointer">Yt</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. "What GENEX does" Departments Grid */}
        <section id="what-we-do" className="py-20 md:py-28 bg-[#f8f9fa] px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight" style={headingStyle}>
                What {tenant.name.split(' ')[0]} Does
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Card 1: Research Institute */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="space-y-4 text-left">
                  <h3 className="text-xl font-bold text-slate-900">Research Institute</h3>
                  <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed font-semibold">
                    <li>Genetic &amp; lab testing (genetics, biochemistry)</li>
                    <li>Advanced prevention &amp; treatment methods</li>
                    <li>Personalized molecules &amp; wellness therapies</li>
                    <li>Sourcing premium scientific formulas</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <a 
                    href="#stock"
                    className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider transition-all text-center inline-block"
                  >
                    More about the Institute
                  </a>
                  <img 
                    src="https://images.unsplash.com/photo-1579310964728-44f860182b10?auto=format&fit=crop&w=150&q=80" 
                    alt="Microscope" 
                    className="w-16 h-16 object-contain opacity-80"
                  />
                </div>
              </div>

              {/* Card 2: Medical Center */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="space-y-4 text-left">
                  <h3 className="text-xl font-bold text-slate-900">Medical Center</h3>
                  <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 leading-relaxed font-semibold">
                    <li>Personalized longevity &amp; health strategies</li>
                    <li>Preventive care &amp; early biological diagnostics</li>
                    <li>Licensed pharmacist monitoring &amp; consultation support</li>
                    <li>In-store testing: BMI, blood pressure, lipid panel</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <a
                    href="#stock"
                    className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Go to the Medical Center
                  </a>
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=150&q=80" 
                    alt="Clinical DNA" 
                    className="w-16 h-16 object-contain opacity-80"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. "Proven Efficiency in Numbers" Stats Grid */}
        <section className="py-20 md:py-28 bg-white px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center text-left">
            
            {/* Left intro text & image column */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight" style={headingStyle}>
                Proven Efficiency in Numbers
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                We operate with data, not assumptions. Every step we take is based on years of research and international scientific standards.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" 
                alt="Clinic Showcase" 
                className="rounded-2xl w-full object-cover aspect-[4/3] border border-slate-100" 
              />
            </div>

            {/* Right Masonry Stats Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-2">
                <div className="text-3xl font-black text-slate-900">{statPatients}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patients Treated</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Unique longevity strategies developed.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-2">
                <div className="text-3xl font-black text-slate-900">{statExperience}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Research Experience</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Of research in biogerontology and prevention.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-2">
                <div className="text-3xl font-black text-slate-900">{statPartners}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Global Partners</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Global partner universities and R&D centers.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-2">
                <div className="text-3xl font-black text-slate-900">{statPublications}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scientific Papers</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Scientific publications in international journals.</p>
              </div>

            </div>

          </div>
        </section>

        {/* 5. "Your Personalized Strategy" Pillars Grid */}
        <section className="py-20 md:py-28 bg-[#f8f9fa] px-6">
          <div className="max-w-7xl mx-auto space-y-12 text-left">
            
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900" style={headingStyle}>
                Your Personalized Strategy
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left pillars */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Personalized Longevity Strategy</h4>
                  <p className="text-[11px] text-slate-500">A rigorous health assessment mapped to genetics and real-time biometric indicators.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Evidence-Based Scientific Approach</h4>
                  <p className="text-[11px] text-slate-500">A multidisciplinary team of MD researchers and scientists guiding each formulation.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Prevention Over Treatment</h4>
                  <p className="text-[11px] text-slate-500">Early-risk detection and proactive wellness counseling to prevent chronic illnesses.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Holistic Quality of Life</h4>
                  <p className="text-[11px] text-slate-500">Focus on peak energy levels, mental clarity, and sleep cycle optimization.</p>
                </div>

              </div>

              {/* Center landscape photo */}
              <div className="lg:col-span-4 flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=500&q=80" 
                  alt="Doctor consultation" 
                  className="rounded-3xl shadow-md object-cover aspect-[3/4] max-h-[380px] border border-slate-200"
                />
              </div>

              {/* Right pillars */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Advanced Labs &amp; Infrastructure</h4>
                  <p className="text-[11px] text-slate-500">Equipped with state-of-the-art diagnostic testing and biological analytics.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Innovative Treatment Protocols</h4>
                  <p className="text-[11px] text-slate-500">Implementation of pioneering clinical solutions approved by scientific boards.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Long-term Health Stewardship</h4>
                  <p className="text-[11px] text-slate-500">Continuous monitoring, testing checks, and dynamic medication tracking.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">Excellence in Care &amp; Discretion</h4>
                  <p className="text-[11px] text-slate-500">A custom client experience delivered with complete security and safety standards.</p>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* 6. Research Spotlight Highlight Banner */}
        <section className="py-20 md:py-28 bg-white px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center text-left">
            
            {/* Left Scientist photo */}
            <div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80" 
                alt="Scientist" 
                className="rounded-3xl object-cover aspect-[4/3] border border-slate-200 shadow-sm"
              />
            </div>

            {/* Right details content */}
            <div className="space-y-5">
              <span className="inline-block px-3 py-1 bg-cyan-100 border border-cyan-200 text-cyan-800 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                Research spotlight
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900" style={headingStyle}>
                Healthy Aging &amp; Epigenetics
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Our scientific spotlight focuses on identifying epigenetic markers that influence how human cells regenerate. By analyzing cellular biological age, we aim to deliver customized clinical formulas that optimize energy and slow physical decline.
              </p>
              <div className="pt-2">
                <a
                  href="#stock"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all inline-block"
                >
                  View All Products
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 7. Real-time Public Stock Registry Lookup (GeneX styled) */}
        <section id="stock" className="py-20 md:py-28 bg-[#0f172a] text-white px-6">
          <div className="max-w-7xl mx-auto text-left space-y-8">
            
            <div className="text-center md:text-left space-y-2">
              <span className="inline-block px-3 py-1 bg-cyan-900/40 border border-cyan-800 text-cyan-400 text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                Registry Lookup
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-100" style={headingStyle}>
                Check In-Stock Medicines
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Query our active clinical storage registry instantly. Verify pricing, packaging, and real-time inventory levels.
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 relative">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Enter formula or brand name (e.g. Lipitor)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
                />
              </div>

              <div className="md:col-span-4">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listing grid / table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {loadingInventory ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                  <span className="text-xs text-slate-400 font-semibold">Running telemetry query...</span>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Info className="h-6 w-6 mx-auto text-slate-600 mb-1" />
                  <p className="text-xs font-semibold">No registered medicines found matching search query</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6">Product Detail</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4 text-right">UOM</th>
                        <th className="py-4 px-4 text-right">Price (LKR)</th>
                        <th className="py-4 px-6 text-center">Registry Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredMedicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-200">{med.name}</div>
                            {med.generic_name && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{med.generic_name}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-950 border border-slate-800 text-slate-400">
                              {med.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-slate-400 font-mono">{med.unit}</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-200 font-mono">
                            {med.price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {med.quantity > 0 ? (
                              <span className="inline-block px-2.5 py-0.5 bg-cyan-950 border border-cyan-900 text-cyan-400 text-[9px] font-extrabold uppercase rounded-full">
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 bg-rose-950 border border-rose-900 text-rose-400 text-[9px] font-extrabold uppercase rounded-full">
                                Depleted
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

          </div>
        </section>

        {/* 8. Hours & Location (Interactive Map Integration) */}
        <section id="details" className="py-20 bg-white px-6 border-t border-slate-100">
          <div className="max-w-7xl mx-auto text-left space-y-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900" style={headingStyle}>
                Store Visits &amp; Timings
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Hours Card */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200/50 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Store Hours</h3>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-200/40">
                  <span className="font-bold text-xs text-slate-700">Monday - Friday</span>
                  <span className="text-xs text-slate-600 font-mono">{mondayOpen} - {mondayClose}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-200/40 bg-slate-100/50 -mx-6 px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Today</span>
                    {isOpenNow ? (
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">Open</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-800 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">Closed</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-cyan-600 font-mono">{mondayOpen} - {mondayClose}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200/40">
                  <span className="font-bold text-xs text-slate-700">Saturday</span>
                  <span className="text-xs text-slate-600 font-mono">09:00 AM - 07:00 PM</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-xs text-slate-700">Sunday</span>
                  <span className="text-xs text-slate-600 font-mono italic">{sundayOpen}</span>
                </div>

                {autoCloseHolidays && (
                  <div className="pt-4 border-t border-slate-200/40 text-[10px] text-slate-500 flex gap-2 items-start leading-relaxed">
                    <Info size={13} className="shrink-0 mt-0.5 text-cyan-600" />
                    <span>
                      Closed on Sri Lankan public and religious holidays 
                      {exceptions.length > 0 && ` (${exceptions.map(e => e.name).join(', ')})`}.
                    </span>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="w-full h-56 border-b border-slate-200/40">
                  <LeafletMap address={tenant.contact_address || 'Colombo, Sri Lanka'} mapLink={tenant.map_link} />
                </div>
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-left">
                    <p className="font-bold text-xs text-slate-900">{tenant.contact_address || 'No address configured.'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Colombo, Sri Lanka</p>
                  </div>
                  <button 
                    onClick={handleGetDirections}
                    className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
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
      <footer className="w-full bg-slate-950 text-slate-500 py-16 px-6 md:px-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-white text-lg font-bold font-display" style={headingStyle}>
              GeneX<span className="text-cyan-500">.</span>{tenant.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Premium scientific clinical pharmacy and longevity therapy diagnostics.
            </p>
            
            {/* Compliance */}
            {(tenant.display_nmra_number || tenant.display_br_number || tenant.display_slmc_number) && (
              <div className="text-[10px] text-slate-600 space-y-1 font-mono pt-1 leading-relaxed border-t border-slate-900/60 pt-4">
                {tenant.display_nmra_number && <div>NMRA License: {tenant.display_nmra_number}</div>}
                {tenant.display_br_number && <div>BR Number: {tenant.display_br_number}</div>}
                {tenant.display_slmc_number && <div>SLMC Pharmacist License: {tenant.display_slmc_number}</div>}
              </div>
            )}

            <div className="text-[10px] text-slate-600 pt-2">
              &copy; {new Date().getFullYear()} {tenant.name}. Powered by <a href="https://quantumblaze.lk" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-400 hover:text-white hover:underline">Quantum Blaze</a>.
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2.5 text-xs text-slate-500">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">Institute Care</h4>
            <a className="hover:text-white" href="#stock">In-Stock Registry</a>
            <a className="hover:text-white" href="#">Longevity Programs</a>
            <a className="hover:text-white" href="#">Genetic Sequencing</a>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2.5 text-xs text-slate-500">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px]">Legal compliance</h4>
            <a className="hover:text-white" href="#">Privacy Policy</a>
            <a className="hover:text-white" href="#">SaaS Terms</a>
            <a className="hover:text-white" href="#">NMRA Quality Control</a>
          </div>

        </div>
      </footer>

      {/* Floating Action Button (WhatsApp) */}
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
              <div className="flex items-center gap-2 text-cyan-600">
                <ShieldCheck size={22} />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-wider font-display">Verified Credentials</h3>
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
                {tenant.display_nmra_number && <p><strong>NMRA Pharmacy Registration:</strong> {tenant.display_nmra_number}</p>}
                {tenant.display_slmc_number && <p><strong>SLMC Certified Pharmacist Reg:</strong> {tenant.display_slmc_number}</p>}
                {tenant.display_br_number && <p><strong>Business Registration No:</strong> {tenant.display_br_number}</p>}
              </div>
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
