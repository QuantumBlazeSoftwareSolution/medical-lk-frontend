'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Sparkles, 
  Shield, 
  Globe, 
  BarChart3, 
  CheckCircle, 
  Heart, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Printer, 
  Check, 
  Monitor, 
  Search, 
  Layers, 
  Database,
  Cpu,
  Clock,
  ChevronRight,
  TrendingUp,
  Settings,
  Users,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import confetti from 'canvas-confetti';

// Register GSAP Plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// POS Item interface
interface POSItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  code: string;
}

// Initial mockup items
const INITIAL_ITEMS: POSItem[] = [
  { id: '1', name: 'Amoxicillin 250mg', price: 18.0, qty: 10, code: 'AMX-02' },
  { id: '2', name: 'Paracetamol 500mg', price: 4.5, qty: 20, code: 'PAR-15' },
  { id: '3', name: 'Vitamin C 500mg', price: 12.0, qty: 5, code: 'VIT-09' },
];

const PRESETS = [
  { name: 'Cetirizine 10mg', price: 8.0, code: 'CET-04' },
  { name: 'Metformin 500mg', price: 15.0, code: 'MET-88' },
  { name: 'Atorvastatin 10mg', price: 28.0, code: 'ATO-11' },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [items, setItems] = useState<POSItem[]>(INITIAL_ITEMS);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printDuration, setPrintDuration] = useState<number | null>(null);
  const [pharmacyName, setPharmacyName] = useState('Lanka Care');
  const [activeTab, setActiveTab] = useState<'pos' | 'website' | 'stock'>('pos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Background particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.2, // Float upwards
        color: i % 2 === 0 ? 'rgba(20, 184, 166, 0.15)' : 'rgba(16, 185, 129, 0.15)',
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screens
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // GSAP ScrollTrigger Animations
  useGSAP(
    () => {
      // Fade in sections on scroll
      const fadeElements = gsap.utils.toArray('.gsap-fade-in');
      fadeElements.forEach((el: any) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Stagger animate features
      gsap.fromTo(
        '.gsap-feature-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-features-grid',
            start: 'top 75%',
          },
        }
      );

      // Hero content animations
      gsap.fromTo(
        '.gsap-hero-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power4.out' }
      );
      gsap.fromTo(
        '.gsap-hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.gsap-hero-cta',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.6, ease: 'back.out(1.7)' }
      );
    },
    { scope: containerRef }
  );

  // POS Logic
  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return { ...item, qty: Math.max(0, nextQty) };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const addPresetItem = () => {
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    const existing = items.find((i) => i.code === preset.code);
    if (existing) {
      updateQty(existing.id, 1);
    } else {
      const newItem: POSItem = {
        id: Math.random().toString(),
        name: preset.name,
        price: preset.price,
        qty: 1,
        code: preset.code,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const triggerMockPrint = () => {
    if (items.length === 0) return;
    setIsPrinting(true);
    
    // Simulate ultra-fast print thread execution time (typically 8-15ms with our Chrome Extension)
    const duration = parseFloat((Math.random() * 8 + 6).toFixed(2));
    
    setTimeout(() => {
      setPrintDuration(duration);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8, x: 0.7 },
        colors: ['#10b981', '#14b8a6', '#6366f1', '#10b981'],
      });
      setIsPrinting(false);
    }, 1200); // Animation duration
  };

  const clearPrint = () => {
    setPrintDuration(null);
  };

  return (
    <div 
      ref={containerRef}
      className="light-theme-root relative min-h-screen overflow-x-hidden selection-light"
    >
      {/* Background canvas particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />
      
      {/* Soft color glowing backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] glow-spot-teal pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] glow-spot-emerald pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] glow-spot-indigo pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-200/60 bg-white/75 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/10">
              <Activity className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              medical.lk
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-9 text-[15px] font-medium text-slate-600">
            <a href="#demo" className="hover:text-teal-600 transition-colors">Interactive Demo</a>
            <a href="#features" className="hover:text-teal-600 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-teal-600 transition-colors">Subdomain Simulator</a>
            <a href="#pricing" className="hover:text-teal-600 transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/15 hover:shadow-teal-500/25 hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-end">
              <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'w-6 translate-y-2 rotate-45' : 'w-6'}`} />
              <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'w-0 opacity-0' : 'w-4'}`} />
              <span className={`h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'w-6 -translate-y-2.5 -rotate-45' : 'w-5'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-4 text-slate-700 font-medium">
                <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-600 py-1 transition-colors">Interactive Demo</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-600 py-1 transition-colors">Features</a>
                <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-600 py-1 transition-colors">Subdomain Simulator</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-teal-600 py-1 transition-colors">Pricing</a>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full mt-2 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl transition-all"
                >
                  Start 3-Month Trial
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-50/70 text-xs text-teal-600 mb-6 font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" /> Sri Lanka's Modern Pharmacy SaaS
            </div>
            
            <h1 className="gsap-hero-title font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.15]">
              Supercharge Your <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-indigo-600 bg-clip-text text-transparent">
                Pharmacy POS
              </span> <br />
              & Stock Management
            </h1>
            
            <p className="gsap-hero-subtitle max-w-xl text-slate-600 text-lg md:text-xl mb-10 leading-relaxed">
              Scan barcodes, track batch expirations, run bulk inventory operations, and issue instant silent thermal receipts via WebUSB extension in under 12ms.
            </p>
            
            <div className="gsap-hero-cta flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all hover:translate-y-[-2px] active:translate-y-[0px] text-center"
              >
                Start 3-Month Free Trial
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border border-slate-200 bg-white/40 backdrop-blur-sm rounded-xl transition-all text-center"
              >
                Try Interactive POS
              </a>
            </div>

            {/* Micro stats banner */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <h4 className="text-2xl font-bold text-slate-900">12ms</h4>
                <p className="text-xs text-slate-500">Receipt Print Speed</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">99.9%</h4>
                <p className="text-xs text-slate-500">Cloud Uptime</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">AES-256</h4>
                <p className="text-xs text-slate-500">Patient Data Security</p>
              </div>
            </div>
          </div>

          {/* Hero Right Decorative Floating UI Elements */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Visual background rings */}
            <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-200/50 pointer-events-none animate-pulse duration-[6000ms]" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-slate-200/80 pointer-events-none" />

            {/* Floating glass card: active prescription status */}
            <div className="absolute top-[10%] left-[-5%] w-[180px] glass-card-light p-4 rounded-2xl z-20 animate-float-slow hidden sm:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                  <CheckCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Status</h5>
                  <p className="text-xs font-semibold text-slate-800">Paracetamol: 820</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Floating glass card: network latency */}
            <div className="absolute bottom-[10%] right-[-5%] w-[200px] glass-card-light p-4 rounded-2xl z-20 animate-float-medium hidden sm:block">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sync Telemetry</h5>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-800">1.4s</span>
                <span className="text-xs text-slate-500">DB commit speed</span>
              </div>
              <div className="flex gap-0.5 mt-2 h-6 items-end">
                {[4, 8, 5, 9, 3, 7, 2, 8, 4, 9, 6].map((h, i) => (
                  <div key={i} className="flex-1 bg-teal-400/50 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                ))}
              </div>
            </div>

            {/* Main Interactive Demo Container Anchor */}
            <div className="w-full max-w-[460px] glass-card-light p-6 rounded-3xl relative z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4.5 w-4.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">POS Cashier Screen Mock</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Minimal Interactive List */}
              <div className="space-y-3.5 mb-6 min-h-[170px]">
                {items.length === 0 ? (
                  <div className="h-[170px] flex flex-col items-center justify-center text-slate-400 text-sm">
                    <p>No items in cart</p>
                    <button 
                      onClick={addPresetItem} 
                      className="mt-3 text-xs text-teal-600 font-bold hover:underline"
                    >
                      + Add Random Medicine
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                        <div className="flex gap-2 text-xs text-slate-500 font-medium">
                          <span>{item.code}</span>
                          <span>•</span>
                          <span>LKR {item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-700 min-w-[12px] text-center">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* POS control panel */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={addPresetItem}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Medicine
                </button>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subtotal</div>
                  <div className="text-lg font-extrabold text-slate-900">LKR {calculateTotal().toFixed(2)}</div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={triggerMockPrint}
                disabled={isPrinting || items.length === 0}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment & Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4.5 w-4.5" />
                    Simulate One-Click Print
                  </>
                )}
              </button>

              {/* Animated rolling thermal receipt */}
              <AnimatePresence>
                {printDuration && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 border-t border-dashed border-slate-300 pt-4 overflow-hidden"
                  >
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-inner relative">
                      {/* Close button */}
                      <button 
                        onClick={clearPrint}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                      >
                        [Clear]
                      </button>

                      {/* WebUSB status notification */}
                      <div className="mb-3 px-2 py-1 rounded bg-emerald-50 text-[10px] text-emerald-700 font-bold flex items-center justify-between border border-emerald-100">
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> WebUSB Extension Direct Connect
                        </span>
                        <span>{printDuration}ms</span>
                      </div>

                      {/* Receipt design */}
                      <div className="text-center font-mono text-[11px] text-slate-700 uppercase tracking-tight">
                        <div className="font-bold text-xs text-slate-900">{pharmacyName} Pharmacy</div>
                        <div>No. 45, Galle Road, Colombo</div>
                        <div className="border-t border-dashed border-slate-200 my-2" />
                        
                        {/* Receipt Items */}
                        <div className="space-y-1 text-left">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.qty}x {item.name.substring(0, 16)}..</span>
                              <span>{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-dashed border-slate-200 my-2" />
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>Total</span>
                          <span>LKR {calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="border-t border-dashed border-slate-200 my-2" />
                        
                        {/* Fake barcode */}
                        <div className="flex justify-center gap-[1px] h-8 bg-slate-900/10 px-4 py-1.5 rounded-sm">
                          {[3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8,4,6].map((w, i) => (
                            <div key={i} className="bg-slate-600 h-full" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1">Thank you! Powered by medical.lk</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Anchor Section */}
      <section id="demo" className="py-20 bg-slate-100/50 border-t border-b border-slate-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Real-time Interactive Demonstration
            </h2>
            <p className="text-slate-600">
              Explore the core workflow components. Switch tabs below to see how our POS cashier screen, automatic subdomain website customization, and real-time inventory systems interact.
            </p>
          </div>

          {/* Interactive Demo Tabs */}
          <div className="flex justify-center gap-2 mb-10 p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all ${activeTab === 'pos' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cashier POS
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all ${activeTab === 'website' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Custom Website
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all ${activeTab === 'stock' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Stock GRN
            </button>
          </div>

          {/* Tab contents with transitions */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'pos' && (
                <motion.div
                  key="pos-demo"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid md:grid-cols-12 gap-8 items-center glass-card-light p-8 rounded-3xl"
                >
                  <div className="md:col-span-7 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Millisecond Barcode Checkout</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Cashiers search medicines instantly with NMRA catalog auto-fills. Invoices compute, deduct active stock, refresh databases, and trigger thermal receipts in concurrent threads to eliminate checkout lanes.
                    </p>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4.5 w-4.5 text-teal-500" />
                        <span>Fuzzy search by generic or brand names</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4.5 w-4.5 text-teal-500" />
                        <span>Automatic pricing/discount batches</span>
                      </li>
                    </ul>
                  </div>
                  <div className="md:col-span-5 bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs space-y-3 shadow-xl">
                    <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                      <span>CONSOLE LOGS</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="space-y-1.5 text-emerald-400">
                      <div>[DEBUG] invoice mutation trigger...</div>
                      <div className="text-slate-400">▸ patient verification: 0.1ms</div>
                      <div className="text-slate-400">▸ batch lookup & check: 120.4ms</div>
                      <div className="text-slate-400">▸ database commit: 89.2ms</div>
                      <div>[SUCCESS] WebUSB printer event broadcast!</div>
                      <div className="text-white font-bold">▸ receipt printed in 12.04ms</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'website' && (
                <motion.div
                  key="website-demo"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid md:grid-cols-12 gap-8 items-center glass-card-light p-8 rounded-3xl"
                >
                  <div className="md:col-span-7 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Custom Dynamic Subdomain Pages</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      SaaS automatically launches a public-facing website on your custom subdomain (e.g. `lanka-care.medical.lk`). Customize page content, colors, maps, logo uploads, and contacts directly from your dashboard.
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">Interactive Preview:</label>
                      <input
                        type="text"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        placeholder="Type Pharmacy Name"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-5 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {pharmacyName.toLowerCase().replace(/\s+/g, '-')}.medical.lk
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-100">
                      <h4 className="font-display font-bold text-slate-800 text-base">{pharmacyName} Pharmacy</h4>
                      <p className="text-xs text-slate-500 mt-1">Open 24/7 • Licensed Pharmacists</p>
                      <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                        Locate on Google Maps
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stock' && (
                <motion.div
                  key="stock-demo"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid md:grid-cols-12 gap-8 items-center glass-card-light p-8 rounded-3xl"
                >
                  <div className="md:col-span-7 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">GRN Stock & Batch Expiration Warnings</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Efficiently manage goods received notes (GRN). Define individual batch numbers, expiry dates, supplier rates, and selling limits. System triggers dashboard alarms 30/60/90 days before chemical expiration.
                    </p>
                  </div>
                  <div className="md:col-span-5 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
                      <span>EXPIRY WARNING ALERTS</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">3 Warnings</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-red-50/70 border border-red-100 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-red-900">Panadol Extra (Batch B02)</div>
                          <div className="text-slate-500 text-[10px]">Expires in 12 days</div>
                        </div>
                        <span className="text-red-700 font-bold font-mono">12d</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-orange-900">Amoxil Capsule (Batch B99)</div>
                          <div className="text-slate-500 text-[10px]">Expires in 34 days</div>
                        </div>
                        <span className="text-orange-700 font-bold font-mono">34d</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-2xl mx-auto gsap-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Designed For High-Volume Pharmacies
            </h2>
            <p className="text-slate-600">
              Our cloud software takes the heavy lift of inventory, customer, and print operations so you can focus entirely on patient health.
            </p>
          </div>

          <div className="gsap-features-grid grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Checkout</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Cashiers can process checkout events under 100ms. Scan barcode, deduct inventory, and issue bills dynamically.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Feature 2 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Stock GRN</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Add stock batches, manage supplier credits, and track medicine expiry warnings smoothly from a central portal.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Feature 3 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Custom Subdomains</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Get an instant web profile under your own address. Showcase locations, store hours, and pharmacy logos automatically.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Feature 4 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Neon Serverless DB</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                High availability database clustering hosted on Neon PostgreSQL. Safely query large logs without lag or timeout.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Feature 5 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">USB Printer Direct</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Send thermal ESC/POS print batches silently with our lightweight Chrome Extension. Skip browser system dialogs completely.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Feature 6 */}
            <div className="gsap-feature-card glass-card-light p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sub-second Sync</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Local cached operations synchronize instantly once you commit back-end transactions. Zero loss of transaction history.
              </p>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Subdomain Live Simulator Widget */}
      <section id="simulator" className="py-20 bg-slate-100/50 border-t border-b border-slate-200/50 relative z-10 gsap-fade-in">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-4">
            Claim Your Free Pharmacy Subdomain
          </h2>
          <p className="text-slate-600 mb-10 max-w-xl mx-auto">
            Input your store name. We dynamically register a clean public subdomain website showcasing locations, contacts, and stock lists.
          </p>

          <div className="max-w-md mx-auto p-3 bg-white border border-slate-200 rounded-2xl flex items-center shadow-lg">
            <span className="pl-3 text-slate-400 font-bold text-sm">https://</span>
            <input
              type="text"
              value={pharmacyName.toLowerCase().replace(/\s+/g, '-')}
              onChange={(e) => setPharmacyName(e.target.value)}
              className="flex-1 px-2 py-2 text-sm font-bold text-slate-800 placeholder-slate-300 focus:outline-none"
              placeholder="lanka-care"
            />
            <span className="pr-3 text-teal-600 font-extrabold text-sm">.medical.lk</span>
          </div>

          <div className="mt-8 text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
            <Check className="h-4 w-4 text-emerald-500" /> Auto-claims dynamic SSL certificate in production
          </div>
        </div>
      </section>

      {/* Pricing / Trial Section */}
      <section id="pricing" className="py-24 relative z-10 gsap-fade-in">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-base mb-14 max-w-xl mx-auto">
            No upfront setup fees, no complex licensing constraints. Start immediately with a full feature-set, absolute free for the first 3 months.
          </p>
          
          <div className="p-10 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md max-w-lg mx-auto relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-teal-500 text-white text-[10px] font-bold rounded-bl-xl tracking-wider uppercase">
              Launch Trial
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">3-Month Free Plan</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6">No credit card registration required</p>
            
            <div className="flex items-baseline justify-center gap-1 my-8">
              <span className="text-5xl font-extrabold tracking-tight text-slate-900">LKR 0</span>
              <span className="text-slate-500 text-sm font-semibold">/ 3 months</span>
            </div>

            <ul className="text-left space-y-4 mb-10 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                <span>Unlimited subdomains (tenant.medical.lk)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                <span>Lightning-fast POS with barcode checkout</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                <span>Secure AES-256 patient records encryption</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                <span>Stock warnings and batch expiry alerts</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="block w-full py-4 px-6 text-center text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all active:scale-[0.98] shadow-md shadow-teal-500/10"
            >
              Sign Up In 60 Seconds
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-base">medical.lk</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span>Developed By</span>
              <a 
                href="https://www.quantumblaze.lk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent hover:from-teal-500 hover:to-indigo-500 font-extrabold flex items-center gap-0.5 hover:underline transition-all"
              >
                Quantum Blaze
              </a>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Sri Lanka. All rights reserved. &copy; 2026.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500">
              <a href="mailto:contact@quantumblaze.lk" className="hover:text-teal-600 transition-colors">
                Email: contact@quantumblaze.lk
              </a>
              <span className="hidden md:inline text-slate-300">|</span>
              <a href="tel:+94788056838" className="hover:text-teal-600 transition-colors">
                Contact: +94 78 805 6838
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
