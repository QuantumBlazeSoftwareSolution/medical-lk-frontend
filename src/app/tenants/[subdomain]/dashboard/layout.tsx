'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, ShoppingCart, Package, FileInput, 
  Users, Settings, LogOut, Loader2, Activity, User,
  Truck, BarChart3, Globe, ShieldCheck, ClipboardList,
  Search, Bell, ChevronDown, AlertTriangle, Hourglass,
  Building2, LifeBuoy
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/portal/login');
    } else {
      setUsername(localStorage.getItem('username') || 'Employee');
      setRole(localStorage.getItem('role') || 'Staff');
      setAuthorized(true);
    }
  }, [router]);

  // Fetch tenant public metadata to render customized brand visuals
  const { data: tenant } = useQuery({
    queryKey: ['tenant-public', subdomain],
    queryFn: () => apiFetch('/api/tenant/public'),
    enabled: !!subdomain,
  });

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('subdomain');
    router.push('/portal/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const tenantName = tenant?.name || 'Pharmacy Portal';

  const mainMenuItems = [
    { name: 'Dashboard',      path: '/dashboard',               icon: LayoutDashboard, exact: true },
    { name: 'POS Terminal',   path: '/dashboard/pos',           icon: ShoppingCart,    exact: false },
    { name: 'Inventory',      path: '/dashboard/inventory',     icon: Package,         exact: false },
    { name: 'GRN/Receiving',  path: '/dashboard/grn',           icon: Truck,           exact: false },
    { name: 'Customers',      path: '/dashboard/patients',      icon: Users,           exact: false },
    { name: 'Suppliers',      path: '/dashboard/suppliers',     icon: Building2,       exact: false },
    { name: 'Reports',        path: '/dashboard/reports',       icon: BarChart3,       exact: false },
    { name: 'Prescriptions',  path: '/dashboard/prescriptions', icon: ClipboardList,   exact: false },
    { name: 'Technical Support', path: '/dashboard/support',      icon: LifeBuoy,        exact: false },
  ];

  if (role === 'admin') {
    mainMenuItems.push({ name: 'Website Builder', path: '/dashboard/website-builder', icon: Globe, exact: false });
  }

  const bottomMenuItems = [
    { name: 'Settings', path: '/dashboard/settings',  icon: Settings,   exact: false },
    { name: 'Security', path: '/dashboard/security',  icon: ShieldCheck, exact: false },
  ];

  // Get user initials for avatar
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'ST';
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[240px] bg-[#0f3d57] text-[#80a8c6] h-full flex flex-col shrink-0 border-r border-[#0f3d57] select-none">
        
        {/* Branding */}
        <div className="p-6 border-b border-[#00273b]/20">
          <h1 className="text-white font-bold text-[14px] truncate" title={tenantName}>
            {tenantName}
          </h1>
          <p className="text-[#6bfe9c] text-[11px] truncate mt-1">
            {subdomain}.medical.lk
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex-grow overflow-y-auto py-4 px-3 space-y-1">
          {mainMenuItems.map((item) => {
            // Exact match for /dashboard root so sub-pages don't highlight it
            const isActive = item.exact
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors border-l-4 text-sm font-medium group ${
                  isActive
                    ? 'bg-white/10 text-white border-[#6bfe9c]'
                    : 'text-[#80a8c6] hover:bg-white/5 hover:text-white border-transparent'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
              </Link>
            );
          })}

          {/* Divider and bottom menu */}
          <div className="pt-4 mt-4 border-t border-[#00273b]/20 space-y-1">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors border-l-4 text-sm font-medium group ${
                    isActive
                      ? 'bg-white/10 text-white border-[#6bfe9c]'
                      : 'text-[#80a8c6] hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Block */}
        <div className="p-4 border-t border-[#00273b]/20 bg-[#00273b]/30 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#6bfe9c] text-[#00743a] flex items-center justify-center font-bold text-sm shrink-0">
              {getInitials(username)}
            </div>
            <div className="truncate">
              <p className="text-white text-sm font-medium truncate">{username}</p>
              <p className="text-[#80a8c6] text-xs capitalize truncate">{role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            aria-label="Logout" 
            className="text-[#80a8c6] hover:text-red-400 transition-colors shrink-0 p-1 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[64px] bg-white border-b border-[#eceef1] flex items-center justify-between px-8 shrink-0 z-[9999] relative">
          {/* Left Side: Route Title */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-[#191c1e] capitalize font-display">
              {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
            <div className="h-4 w-px bg-[#e0e3e6]" />
            <span className="text-[11px] text-[#42474d] bg-[#f2f4f7] px-2.5 py-1 rounded-md font-semibold border border-[#e0e3e6] font-sans">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-[320px] mx-4 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#42474d] h-4 w-4" />
            <input 
              className="w-full h-9 pl-9 pr-12 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg text-xs focus:outline-none focus:border-[#0f3d57] focus:ring-1 focus:ring-[#0f3d57] transition-all text-[#191c1e] placeholder-[#42474d]/70 font-sans" 
              placeholder="Search products, invoices, customers..." 
              type="text"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-medium text-[#42474d] bg-white border border-[#e0e3e6] rounded-md font-sans">⌘K</kbd>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications Group */}
            <div className="relative group">
              <button className="relative p-1.5 text-[#42474d] hover:text-[#0f3d57] hover:bg-[#f2f4f7] rounded-full transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">5</span>
              </button>
              
              {/* Notification Dropdown Panel */}
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e0e3e6] rounded-xl shadow-[0_16px_32px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] transform origin-top-right">
                <div className="p-4 border-b border-[#e0e3e6] flex items-center justify-between">
                  <h3 className="font-semibold text-[#191c1e] font-display text-sm">Notifications</h3>
                  <button className="text-xs text-[#0f3d57] hover:underline cursor-pointer font-sans">Mark all as read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto font-sans">
                  {/* Alert Item */}
                  <div className="p-3 border-b border-[#eceef1] hover:bg-[#f2f4f7] transition-colors flex gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#191c1e]">Low Stock Alert</p>
                      <p className="text-[11px] text-[#42474d] mt-0.5">8 items are critically low</p>
                      <p className="text-[9px] text-[#42474d]/70 mt-1">10 mins ago</p>
                    </div>
                  </div>
                  {/* Alert Item */}
                  <div className="p-3 border-b border-[#eceef1] hover:bg-[#f2f4f7] transition-colors flex gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                      <Hourglass className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#191c1e]">Near Expiry Warning</p>
                      <p className="text-[11px] text-[#42474d] mt-0.5">12 batches expiring in &lt; 30 days</p>
                      <p className="text-[9px] text-[#42474d]/70 mt-1">1 hr ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-5 w-px bg-[#e0e3e6]" />
            
            {/* Language Selection */}
            <button className="flex items-center gap-1 text-[#42474d] hover:text-[#191c1e] text-xs font-semibold transition-colors cursor-pointer font-sans">
              <span>EN</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <div className="h-5 w-px bg-[#e0e3e6]" />

            {/* Profile Block */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#f2f4f7] border border-[#e0e3e6] overflow-hidden flex items-center justify-center text-[#42474d] group-hover:border-[#0f3d57] transition-colors">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-[#191c1e] hidden sm:block group-hover:text-[#0f3d57] transition-colors font-sans">{username}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content — POS gets a full-bleed, no-padding layout */}
        <main className={`flex-1 bg-[#f7f9fc] ${
          pathname.endsWith('/pos')
            ? 'overflow-hidden'
            : 'overflow-y-auto p-8'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
