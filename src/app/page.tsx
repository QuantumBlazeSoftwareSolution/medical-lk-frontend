'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Activity, CheckCircle, BarChart3, Globe, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-20 right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-400 animate-pulse" />
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              medical.lk
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors">Pricing</a>
            <a href="#security" className="hover:text-slate-100 transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-lg hover:from-teal-300 hover:to-emerald-300 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-95 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-xs text-teal-400 mb-6 font-semibold backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" /> Sri Lanka's Modern Pharmacy SaaS
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Supercharge Your Pharmacy <br />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            POS & Inventory
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          Manage your stocks, issue invoices at sub-millisecond speeds, run batch operations, and launch a pharmacy profile website dynamically in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-95 text-center"
          >
            Start 3-Month Free Trial
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 border border-slate-800 rounded-xl transition-all text-center"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Everything Your Pharmacy Needs
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete cloud ecosystem designed specifically for modern pharmacies, cashiers, and patients.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-teal-500/30 hover:bg-slate-900/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning-Fast POS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Scan barcodes, auto-retrieve items, apply active discounts, and issue thermal prints in millisecond speeds.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-emerald-500/30 hover:bg-slate-900/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Centralized Stock & GRN</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Add stocks via GRNs, track batch expirations, supplier history, and receive dashboard alerts for low quantities.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-indigo-500/30 hover:bg-slate-900/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mini-Website Customizer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instantly publish a public page on your subdomain. Choose brand colors, embed Google Maps location, upload logos, and post contact details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Trial Section */}
      <section id="pricing" className="py-20 border-t border-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Simple, Honest SaaS Pricing
          </h2>
          <p className="text-slate-400 text-base mb-10">
            No upfront setup fees. No hidden costs. Every single pharmacist receives full access to all features absolutely free for the first 3 months.
          </p>
          <div className="p-10 rounded-3xl border border-teal-500/20 bg-gradient-to-b from-teal-950/10 to-slate-950 backdrop-blur-md max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-teal-500 text-slate-950 text-xs font-bold rounded-bl-xl tracking-wide uppercase">
              Launch Trial
            </div>
            <h3 className="text-2xl font-bold mb-2">Free Trial Access</h3>
            <div className="flex items-baseline justify-center gap-1 my-6">
              <span className="text-5xl font-extrabold tracking-tight text-white">LKR 0</span>
              <span className="text-slate-400 text-sm">/ 3 months</span>
            </div>
            <ul className="text-left space-y-4 mb-8 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Unlimited subdomains (tenant.medical.lk)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Lightning-fast POS with barcode checkout</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Secure AES-256 patient records encryption</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Stock warnings and batch expiry alerts</span>
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full py-4 px-6 text-center text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 transition-all active:scale-[0.98]"
            >
              Sign Up In 60 Seconds
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-400" />
            <span className="font-semibold text-slate-400">medical.lk</span>
          </div>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Sri Lanka. All rights reserved. &copy; 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
