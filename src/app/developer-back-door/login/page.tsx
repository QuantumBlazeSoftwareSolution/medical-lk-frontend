'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DeveloperBackDoorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Credentials, 2: OTP
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email === 'vihangaheshan37@gmail.com' && password === 'Test@123') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 800);
    } else {
      setError('Invalid developer credentials.');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp === '200237') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dev_backdoor_auth', 'true');
        }
        router.push('/developer-back-door/dashboard');
      }, 1000);
    } else {
      setError('Invalid OTP code.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden font-sans">
      {/* Background shapes */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-900/30 border border-teal-800 flex items-center justify-center text-teal-400 mb-4">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Developer Backdoor</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Platform Administrative Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dev Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input 
                  type="email"
                  required
                  placeholder="vihangaheshan37@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <LoaderIcon />
              ) : (
                <>
                  Verify Credentials
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-900 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck size={12} />
                Credentials Passed
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                A verification prompt is active. Enter the 6-digit developer bypass OTP code.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">6-Digit OTP Bypass Code</label>
              <input 
                type="text"
                required
                maxLength={6}
                placeholder="200237"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-bold tracking-[0.5em] text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LoaderIcon /> : 'Access Platform Dashboard'}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold cursor-pointer underline"
            >
              Back to Credentials
            </button>
          </form>
        )}
      </div>

      <p className="text-[10px] text-slate-600 mt-8 font-mono">
        &copy; {new Date().getFullYear()} Medical.lk SaaS Platform admin gateway. Authorized developer access only.
      </p>
    </div>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
