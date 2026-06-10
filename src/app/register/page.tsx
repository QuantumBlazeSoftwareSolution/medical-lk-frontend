'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { BASE_URL } from '@/utils/api';

export default function RegisterPage() {
  const [pharmacyName, setPharmacyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdSubdomain, setCreatedSubdomain] = useState('');

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanedSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanedSubdomain) {
        throw new Error('Please enter a valid subdomain containing letters or numbers.');
      }

      const response = await fetch(`${BASE_URL}/api/auth/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacy_name: pharmacyName,
          subdomain: cleanedSubdomain,
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to complete registration.');
      }

      setCreatedSubdomain(cleanedSubdomain);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6 py-12 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative">
        {/* Logo Link */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Activity className="h-6 w-6 text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              medical.lk
            </span>
          </Link>
        </div>

        {/* Success Card */}
        {success ? (
          <div className="p-8 md:p-10 rounded-3xl border border-teal-500/30 bg-slate-900/60 backdrop-blur-md text-center shadow-2xl">
            <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3 text-white">Pharmacy Registered!</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your 3-month free trial portal is now ready. You can log in using your admin credentials.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left mb-8">
              <span className="text-xs text-slate-500 block mb-1">Your Unique Portal URL</span>
              <span className="font-mono text-sm text-teal-300 font-semibold break-all">
                http://{createdSubdomain}.localhost:3000/login
              </span>
            </div>

            <a
              href={`http://${createdSubdomain}.localhost:3000/login`}
              className="w-full py-4 px-6 inline-flex items-center justify-center gap-2 font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 transition-all active:scale-[0.98]"
            >
              Go to Login Portal <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          /* Register Form Card */
          <div className="p-8 md:p-10 rounded-3xl border border-slate-900 bg-slate-900/40 backdrop-blur-md shadow-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Register Your Pharmacy
              </h2>
              <p className="text-sm text-slate-400">
                Setup your centralized multi-tenant account in under 60 seconds.
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleOnboard} className="space-y-5">
              {/* Pharmacy Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Care First Pharmacy"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all"
                />
              </div>

              {/* Subdomain */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Requested Subdomain
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="carefirst"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full pl-4 pr-32 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all font-mono"
                  />
                  <span className="absolute right-4 text-xs text-slate-500 font-semibold select-none pointer-events-none">
                    .medical.lk
                  </span>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pharmacist123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="pharmacist@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Secret Access Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 inline-flex items-center justify-center gap-2 font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Provisioning Pharmacy...
                  </>
                ) : (
                  <>
                    Complete Registration <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have a pharmacy account? Go to your subdomain URL to login.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
