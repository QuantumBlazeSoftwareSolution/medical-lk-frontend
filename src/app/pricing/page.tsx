'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  ArrowRight,
  Shield,
  HelpCircle,
  Minus,
  Plus,
  ArrowLeft,
  Zap,
  Globe,
  Database,
  Mail,
  Smartphone,
  Server,
  FileCode,
  FileCheck2
} from 'lucide-react';

export default function PricingDetail() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'basic';
  const [activePlan, setActivePlan] = useState<string>(initialPlan);

  const plans = {
    basic: {
      name: 'Basic Plan',
      tagline: 'Ideal for independent local pharmacies looking for dynamic cloud operations.',
      price: 'LKR 0',
      period: '3-Month Free Trial',
      subtitle: 'Post-Trial: LKR 1,200/mo or LKR 12,000/yr (Save LKR 2,400)',
      color: 'teal',
      badge: 'Start Risk-Free',
      cta: 'Sign Up In 60 Seconds',
      link: '/register?plan=basic',
      features: [
        {
          title: 'Lightning-Fast Cloud POS',
          desc: 'Speedy medicine checkout with barcode scanning integration, itemized billing, and quick shortcuts.'
        },
        {
          title: 'Dynamic Subdomain Layout',
          desc: 'Your public portal runs instantly under the medical.lk namespace (e.g. yourbrand.medical.lk).'
        },
        {
          title: 'Automated Weekly Backups',
          desc: 'We backup your full medicine library, stock levels, and POS records safely to our private AWS S3 vaults once a week.'
        },
        {
          title: 'AES-256 Patient Encrypted Database',
          desc: 'State-of-the-art encryption protecting clinical medical records, customer logs, and phone profiles.'
        },
        {
          title: 'Smart Stock & Expiry Alerts',
          desc: 'Real-time warning notifications on inventory thresholds and batch notifications before critical expiry.'
        },
        {
          title: '3 Public Website Templates',
          desc: 'Access to 3 fully responsive, dynamic CSS website styles tailored for traditional local pharmacies.'
        }
      ],
      suitable: [
        'Single-branch local pharmacies',
        'Independent pharmacists launching a clinic',
        'Startups wanting to test local POS delivery flow'
      ]
    },
    premium: {
      name: 'Premium Plan',
      tagline: 'Engineered for growing pharmacies requiring custom domains, premium layouts, and dedicated assets.',
      price: 'LKR 2,500',
      period: '/ month',
      subtitle: 'Save LKR 5,000 on Annual Billing (LKR 25,000/yr)',
      color: 'teal',
      badge: 'Brand Identity',
      cta: 'Get Started with Premium',
      link: '/register?plan=premium',
      features: [
        {
          title: 'Custom Domain Mapping',
          desc: 'Own your full identity. Connect custom domains directly (e.g. www.yourpharmacy.lk) through our Cloudflare routing.'
        },
        {
          title: 'Daily Secure Automated Backups',
          desc: 'Maximum safety. Your complete business operations and database snapshots are backed up daily.'
        },
        {
          title: '3 Premium Corporate Emails',
          desc: 'Dedicated workspace email accounts (e.g. info@yourdomain.lk) setup automatically on secure SMTP layers.'
        },
        {
          title: 'Unlimited Public Website Templates',
          desc: 'Bypass design limits. Access all premium, modern, scroll-driven layouts (like the iOS Liquid Glass layout).'
        },
        {
          title: 'Priority API Gateway Speed',
          desc: 'Your pharmacy requests bypass shared nodes, ensuring lightning-fast load times even under high user traffic.'
        },
        {
          title: '24/7 Dedicated Developer Support',
          desc: 'Direct hotline access to our developer core team for template adjustments and custom features integrations.'
        }
      ],
      suitable: [
        'Multi-location pharmacy networks',
        'Pharmacies seeking a premium web brand identity',
        'Clinics requiring daily database updates and corporate mail channels'
      ]
    }
  };

  const current = activePlan === 'premium' ? plans.premium : plans.basic;

  const faqs = [
    {
      q: 'Can I switch from the Basic Plan to Premium later?',
      a: 'Yes, absolutely! You can upgrade your pharmacy from the developer dashboard or tenant settings at any time with a single click.'
    },
    {
      q: 'How does the 3-month free trial work?',
      a: 'When you sign up for the Basic Plan, you get full access to all features for 90 days completely free of charge. No credit card is required.'
    },
    {
      q: 'Will my custom domain have SSL (HTTPS)?',
      a: 'Yes! When you map your custom domain on the Premium Plan, our system automatically generates a Let\'s Encrypt SSL certificate for free, ensuring HTTPS security.'
    },
    {
      q: 'Where is my data stored?',
      a: 'All database configurations and transaction data are securely isolated on Neon PostgreSQL servers and backed up to private AWS S3 buckets.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-800 font-sans antialiased selection:bg-teal-600 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-100 bg-white/75 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-xs">
              M
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">Medical.lk</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Details Wrapper */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16">
        
        {/* Header Segment */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
            Detailed Comparison
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Simple Plans built for pharmacies of all sizes
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Choose the best plan to power your local storefront, patient digital booking, and checkout points. Select a plan below to see dynamic details.
          </p>

          {/* Plan Selector Buttons */}
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mt-6 gap-1 shadow-inner">
            <button
              onClick={() => setActivePlan('basic')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePlan === 'basic'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Basic Plan Details
            </button>
            <button
              onClick={() => setActivePlan('premium')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePlan === 'premium'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              Premium Plan Details
            </button>
          </div>
        </section>

        {/* Dynamic Highlight Card (Visual Hierarchy Focus) */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          
          {/* Plan Overview Info (Left 2 Columns) */}
          <div className="md:col-span-2 space-y-6 md:border-r border-slate-100 md:pr-10 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                activePlan === 'premium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-teal-50 text-teal-700 border border-teal-100'
              }`}>
                {current.badge}
              </span>
              <h2 className="text-3xl font-black text-slate-900">{current.name}</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{current.tagline}</p>
              
              <div className="pt-4 space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900">{current.price}</span>
                  <span className="text-slate-500 text-xs font-semibold">{current.period}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{current.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 md:pt-0">
              <Link
                href={current.link}
                className="w-full py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
              >
                {current.cta}
                <ArrowRight size={14} />
              </Link>
              <p className="text-[10px] text-slate-400 font-medium text-center">
                Instant setup. No credit card required. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Plan Detailed Features List (Right 3 Columns) */}
          <div className="md:col-span-3 space-y-6 text-left md:pl-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Zap size={14} className="text-teal-500" /> Key Features & Benefits
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              {current.features.map((f, i) => (
                <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-2xl transition-colors duration-200">
                  <div className="p-2 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">{f.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Suitability Guide Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={180} />
          </div>
          <div className="relative z-10 max-w-2xl text-left space-y-4">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-400">Target Audience</span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">Is the {current.name} right for you?</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              We tailored this solution after working with dozens of local pharmacies across Sri Lanka. Here is who benefits most from this plan configuration:
            </p>
            <ul className="space-y-3 pt-2 text-xs text-slate-300 font-semibold">
              {current.suitable.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 font-medium">Got questions about our pricing structures? We have answers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-teal-600 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-[10px] text-slate-400 font-semibold">
        <p>© 2026 Medical.lk. Built for modern clinical pharmacies. All rights reserved.</p>
      </footer>
    </div>
  );
}
