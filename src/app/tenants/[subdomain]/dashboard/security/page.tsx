'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  Lock,
  Eye,
  Fingerprint,
  EyeOff,
} from 'lucide-react';

export default function SecuritySettings() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
          <ShieldCheck className="text-[#0f3d57] h-6 w-6" /> Security
          Configurations
        </h1>
        <p className="text-sm text-[#42474d] mt-1">
          Monitor your database security, encryption indicators, and login
          settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Encryption Details */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-base font-bold text-[#191c1e] font-display flex items-center gap-2">
            <Database className="text-[#0f3d57] h-5 w-5" /> Data Protection &
            Encryption
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3.5 bg-[#f2f4f7] border border-[#e0e3e6] rounded-xl">
              <span className="font-semibold text-[#191c1e]">
                Patient Name Encryption
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/30 text-[#00743a] text-xs font-bold border border-[#6bfe9c]">
                AES-256 Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#f2f4f7] border border-[#e0e3e6] rounded-xl">
              <span className="font-semibold text-[#191c1e]">
                Contact Phone Encryption
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/30 text-[#00743a] text-xs font-bold border border-[#6bfe9c]">
                AES-256 Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#f2f4f7] border border-[#e0e3e6] rounded-xl">
              <span className="font-semibold text-[#191c1e]">
                Business Registration Num
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/30 text-[#00743a] text-xs font-bold border border-[#6bfe9c]">
                AES-256 Active
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-base font-bold text-[#191c1e] font-display flex items-center gap-2">
            <Key className="text-[#0f3d57] h-5 w-5" /> Update Administrator
            Password
          </h3>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm text-[#191c1e]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm text-[#191c1e]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#0f3d57] hover:bg-[#00273b] text-white font-semibold rounded-lg text-sm transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
