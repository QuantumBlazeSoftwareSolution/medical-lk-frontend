'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, ShoppingCart, Package, FileInput, 
  Users, Settings, LogOut, Loader2, Activity, User 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setUsername(localStorage.getItem('username') || 'Employee');
      setRole(localStorage.getItem('role') || 'Staff');
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('subdomain');
    router.push('/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'POS Billing', path: '/dashboard/pos', icon: ShoppingCart },
    { name: 'Inventory & Batches', path: '/dashboard/inventory', icon: Package },
    { name: 'Goods Received (GRN)', path: '/dashboard/grn', icon: FileInput },
    { name: 'Patients Directory', path: '/dashboard/patients', icon: Users },
  ];

  if (role === 'admin') {
    menuItems.push({ name: 'Website Customizer', path: '/dashboard/settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-900 shrink-0 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-400" />
          <span className="font-display font-bold text-base tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            medical.lk portal
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 text-teal-400 border border-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile and Logout */}
        <div className="p-4 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-white block truncate">{username}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block">
                {role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
