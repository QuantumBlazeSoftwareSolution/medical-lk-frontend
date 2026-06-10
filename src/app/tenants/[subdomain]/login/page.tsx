'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Activity, Loader2, Lock } from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function TenantLoginPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = React.use(params);
  const subdomain = resolvedParams.subdomain;
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tenant public metadata to render customized brand visuals
  const { data: tenant } = useQuery({
    queryKey: ['tenant-public', subdomain],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Persist credentials
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('subdomain', data.subdomain);

      // Redirect to tenant dashboard
      router.push(`/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = tenant?.brand_color_primary || '#0f766e';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-6 overflow-hidden">
      {/* Background visual element */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-10" 
        style={{ backgroundColor: primaryColor }} 
      />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Activity className="h-6 w-6" style={{ color: primaryColor }} />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              {tenant?.name || 'Pharmacy Portal'}
            </span>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            System Employee Access
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl border border-slate-900 bg-slate-900/40 backdrop-blur-md shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mb-6 mx-auto">
            <Lock className="h-5 w-5" />
          </div>

          {error && (
            <div className="p-4 mb-6 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none text-slate-100 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Password
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
              className="w-full py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          <a href="/" className="hover:underline hover:text-slate-400 transition-colors">
            &larr; Back to medical.lk landing page
          </a>
        </div>
      </div>
    </div>
  );
}
