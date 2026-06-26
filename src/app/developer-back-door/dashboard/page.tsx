'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Layout, Package, Settings, DollarSign, Activity, 
  CheckCircle, XCircle, Plus, Search, Building, Clock, 
  ArrowRight, Lock, RefreshCw, Database, Server, LogOut, ChevronRight
} from 'lucide-react';
import Template001 from '@/app/tenants/[subdomain]/templates/Template001';
import Template002 from '@/app/tenants/[subdomain]/templates/Template002';
import Template003 from '@/app/tenants/[subdomain]/templates/Template003';

const mockPreviewTenant = {
  name: "Lanka Care Pharmacy",
  brand_color_primary: "#0f766e",
  brand_color_secondary: "#14b8a6",
  website_title: "Lanka Care Pharmacy | Colombo",
  website_description: "Your trusted local healthcare partner in Colombo. Sourcing authentic NMRA registered medicines.",
  contact_email: "info@lankacare.medical.lk",
  contact_phone: "+94 11 234 5678",
  contact_address: "123, Main Street, Colombo 03, Sri Lanka",
  logo_height: 40,
  headings_font: "poppins",
  body_font: "inter",
  hero_headline: "Your Health, Our Priority",
  hero_subheadline: "Order online, search available medicines, and consult our licensed pharmacists 24/7.",
  hero_button_text: "Refill Now",
  hero_bg_image: "",
  opening_hours: JSON.stringify({ MondayOpen: "08:00 AM", MondayClose: "09:00 PM", SundayOpen: "Closed" }),
  display_nmra_number: "NMRA-PH-8921",
  display_br_number: "PV-8910-12",
  display_slmc_number: "SLMC-PH-3721",
  services_json: JSON.stringify([
    { title: "Prescription Dispensing", description: "Accurate dispensing of medicines with standard safety verification by clinical pharmacists.", icon: "Check" },
    { title: "OTC Supplements", description: "Wide range of OTC health supplements, skincare, and daily hygiene necessities.", icon: "Sparkles" },
    { title: "General Wellness", description: "Nutrition consultations, dietary planning, and custom vitamin suggestions.", icon: "Clock" }
  ]),
  stats_json: JSON.stringify({ experience: "15+", patients: "99%", products: "15,000+", staff: "6+" }),
  certificates_json: JSON.stringify([])
};

export default function DeveloperBackDoorDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacies' | 'templates' | 'medicines' | 'diagnostics'>('overview');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  
  // Data States
  const [overview, setOverview] = useState<any>({
    total_tenants: 0,
    active_tenants: 0,
    total_users: 0,
    total_medicines: 0,
    total_invoices_processed: 0,
    total_sales_value: 0.0,
    subscription_revenue: 0,
    system_status: "Healthy",
    api_latency: "14ms",
    db_connection: "Neon PostgreSQL",
    backup_status: "Successful"
  });
  const [tenants, setTenants] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  
  // Loaders & Interactivity
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modals / Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [newPharmacySubdomain, setNewPharmacySubdomain] = useState('');
  const [newPharmacyCity, setNewPharmacyCity] = useState('');
  const [newPharmacyNmra, setNewPharmacyNmra] = useState('');
  const [newPharmacyBr, setNewPharmacyBr] = useState('');
  const [formError, setFormError] = useState('');
  
  // Search
  const [tenantSearch, setTenantSearch] = useState('');
  const [medSearch, setMedSearch] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Secure backdoor check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('dev_backdoor_auth');
      if (auth !== 'true') {
        router.push('/developer-back-door/login');
      } else {
        setAuthenticated(true);
        fetchOverview();
        fetchTenants();
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_backdoor_auth');
    }
    router.push('/developer-back-door/login');
  };

  // Fetch API handlers
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchMedicines = async () => {
    setLoadingMedicines(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/medicines`);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Switch tab loader triggers
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (tab === 'overview') fetchOverview();
    if (tab === 'pharmacies') fetchTenants();
    if (tab === 'medicines') fetchMedicines();
  };

  // Administrative Actions
  const toggleTenantStatus = async (id: string, currentStatus: boolean) => {
    setActionLoading(`status-${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchTenants();
        fetchOverview();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const switchTenantTemplate = async (id: string, currentTemplate: string) => {
    setActionLoading(`template-${id}`);
    let nextTemplate = 'template-001';
    if (currentTemplate === 'template-001' || currentTemplate === 'default') {
      nextTemplate = 'template-002';
    } else if (currentTemplate === 'template-002' || currentTemplate === 'prohealth') {
      nextTemplate = 'template-003';
    } else if (currentTemplate === 'template-003' || currentTemplate === 'genex') {
      nextTemplate = 'template-001';
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants/${id}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: nextTemplate })
      });
      if (res.ok) {
        fetchTenants();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const extendTenantPlan = async (id: string) => {
    setActionLoading(`plan-${id}`);
    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants/${id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trial_days_extension: 30 })
      });
      if (res.ok) {
        fetchTenants();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newPharmacyName || !newPharmacySubdomain) {
      setFormError('Name and Subdomain are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPharmacyName,
          subdomain: newPharmacySubdomain.toLowerCase(),
          city: newPharmacyCity || 'Colombo',
          display_nmra_number: newPharmacyNmra || 'NMRA-PH-MOCK',
          display_br_number: newPharmacyBr || 'BR-MOCK-123'
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewPharmacyName('');
        setNewPharmacySubdomain('');
        setNewPharmacyCity('');
        setNewPharmacyNmra('');
        setNewPharmacyBr('');
        fetchTenants();
        fetchOverview();
      } else {
        const errorData = await res.json();
        setFormError(errorData.detail || 'Failed to register subdomain.');
      }
    } catch (err) {
      setFormError('Connection failed.');
    }
  };

  // Filter lists
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    (t.city && t.city.toLowerCase().includes(tenantSearch.toLowerCase()))
  );

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
    (m.generic_name && m.generic_name.toLowerCase().includes(medSearch.toLowerCase())) ||
    m.category.toLowerCase().includes(medSearch.toLowerCase())
  );

  // Template usage statistics count
  const templateStats = React.useMemo(() => {
    let t001 = 0;
    let t002 = 0;
    let t003 = 0;
    tenants.forEach(t => {
      const tid = (t.template_id || '').toLowerCase();
      if (tid === 'template-002' || tid === 'prohealth') t002++;
      else if (tid === 'template-003' || tid === 'genex') t003++;
      else t001++;
    });
    return { template001: t001, template002: t002, template003: t003 };
  }, [tenants]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Validating Backdoor Bypass Credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-teal-600 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Branding header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-black text-white text-xs">
              M
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-100 tracking-tight">Medical.lk Admin</h2>
              <p className="text-[10px] text-slate-500 font-bold">Landlord Panel v1.0</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Tab Items List */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Activity size={16} />
            System Overview
          </button>
          
          <button
            onClick={() => handleTabChange('pharmacies')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'pharmacies' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <div className="flex items-center gap-3">
              <Building size={16} />
              Pharmacy Registry
            </div>
            <span className="text-[10px] bg-slate-950/40 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'templates' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Layout size={16} />
            Templates &amp; Themes
          </button>

          <button
            onClick={() => handleTabChange('medicines')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'medicines' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Package size={16} />
            Global Catalogs
          </button>

          <button
            onClick={() => handleTabChange('diagnostics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'diagnostics' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Settings size={16} />
            Diagnostics &amp; Logs
          </button>
        </nav>

        {/* Database state indicator */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[10px] text-slate-500 font-mono space-y-1.5 text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Status: Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database size={12} className="text-teal-600" />
            <span className="truncate">Neon PG Database</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* TAB 1: SYSTEM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 text-left">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">System Overview</h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Key multi-tenant platform metrics and performance telemetry.</p>
            </div>

            {/* Overview statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Registered Pharmacies</div>
                  <div className="text-3xl font-black text-slate-100">{overview.total_tenants}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
                    <span>{overview.active_tenants} Active tenants</span>
                  </div>
                </div>
                <div className="p-3 bg-teal-900/20 border border-teal-800/40 text-teal-400 rounded-xl">
                  <Building size={20} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Global Medicines</div>
                  <div className="text-3xl font-black text-slate-100">{overview.total_medicines}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1.5">Across all locations</div>
                </div>
                <div className="p-3 bg-teal-900/20 border border-teal-800/40 text-teal-400 rounded-xl">
                  <Package size={20} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly Subscription Rev</div>
                  <div className="text-3xl font-black text-slate-100">LKR {overview.subscription_revenue?.toLocaleString()}</div>
                  <div className="text-[10px] text-teal-400 font-bold mt-1.5">Estimate from active plans</div>
                </div>
                <div className="p-3 bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 rounded-xl">
                  <DollarSign size={20} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Business Sales Volume</div>
                  <div className="text-3xl font-black text-slate-100">LKR {overview.total_sales_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1.5">{overview.total_invoices_processed} invoices logged</div>
                </div>
                <div className="p-3 bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 rounded-xl">
                  <Activity size={20} />
                </div>
              </div>

            </div>

            {/* Platform Telemetry Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Backdoor Admin System Quick-Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTabChange('pharmacies')}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-teal-700 rounded-xl text-left space-y-2 group transition-all"
                  >
                    <Building className="h-5 w-5 text-teal-400" />
                    <h4 className="font-bold text-xs text-slate-200 group-hover:text-teal-400">Manage Tenant Subdomains</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Toggle active states, swap layout templates, and extend billing trial days.</p>
                  </button>
                  <button 
                    onClick={() => handleTabChange('templates')}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-teal-700 rounded-xl text-left space-y-2 group transition-all"
                  >
                    <Layout className="h-5 w-5 text-teal-400" />
                    <h4 className="font-bold text-xs text-slate-200 group-hover:text-teal-400">Themes &amp; Website Design</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Verify active template distribution counts and manage layouts globally.</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Database Status</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-500 font-bold">SQL dialect</span>
                    <span className="font-mono text-slate-300">PostgreSQL (Neon)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-500 font-bold">Backup status</span>
                    <span className="text-emerald-400 font-bold">Active &amp; Daily</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                    <span className="text-slate-500 font-bold">Backdoor mode</span>
                    <span className="text-yellow-500 font-bold">Bypass Auth enabled</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-bold">Last Sync Run</span>
                    <span className="font-mono text-slate-300">Today 12:00 PM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PHARMACIES MANAGEMENT */}
        {activeTab === 'pharmacies' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-100">Pharmacy Registry</h1>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Verify configurations, toggle suspension states, or modify active templates.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={15} />
                Register Pharmacy
              </button>
            </div>

            {/* Filter and Search controls */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="text"
                placeholder="Search registered pharmacies by name, subdomain, or city..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
              />
            </div>

            {/* Tenants Listing Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {loadingTenants ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
                  <span className="text-xs text-slate-500 font-semibold">Fetching tenant list...</span>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-1">
                  <Building className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-bold">No pharmacies found matching search</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4.5 px-6">Brand / Subdomain</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-center">Active Template</th>
                        <th className="py-4.5 px-4">Trial Ends</th>
                        <th className="py-4.5 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                          
                          {/* Name & subdomain */}
                          <td className="py-4 px-6 text-left">
                            <div className="font-bold text-slate-200">{t.name}</div>
                            <div className="text-[10px] text-teal-500 font-mono mt-0.5">
                              {t.subdomain}.medical.lk
                            </div>
                            <div className="text-[9px] text-slate-500 font-semibold mt-1">
                              Registered: {new Date(t.created_at).toLocaleDateString()} &bull; {t.city || 'Colombo'}
                            </div>
                          </td>

                          {/* Suspension status */}
                          <td className="py-4 px-4 text-center">
                            {t.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-950/50 border border-emerald-900/60 text-emerald-400">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-950/50 border border-red-900/60 text-red-400">
                                Suspended
                              </span>
                            )}
                          </td>

                          {/* Layout template ID */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-300 uppercase">
                              {t.template_id || 'default'}
                            </span>
                          </td>

                          {/* Free trial end date */}
                          <td className="py-4 px-4 font-mono text-xs text-slate-400">
                            {new Date(t.trial_ends_at).toLocaleDateString()}
                          </td>

                          {/* Backdoor Operations */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center gap-2">
                              {/* Toggle active state */}
                              <button
                                onClick={() => toggleTenantStatus(t.id, t.is_active)}
                                disabled={actionLoading === `status-${t.id}`}
                                className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-300 cursor-pointer"
                              >
                                {actionLoading === `status-${t.id}` ? '...' : t.is_active ? 'Suspend' : 'Activate'}
                              </button>

                              {/* Swap Template ID */}
                              <button
                                onClick={() => switchTenantTemplate(t.id, t.template_id)}
                                disabled={actionLoading === `template-${t.id}`}
                                className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-300 cursor-pointer"
                              >
                                {actionLoading === `template-${t.id}` ? '...' : 'Swap Template'}
                              </button>

                              {/* Extend Plan +30 days */}
                              <button
                                onClick={() => extendTenantPlan(t.id)}
                                disabled={actionLoading === `plan-${t.id}`}
                                className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all bg-teal-900/20 hover:bg-teal-950 text-teal-400 border-teal-800/40 hover:border-teal-700 disabled:opacity-50 cursor-pointer"
                              >
                                {actionLoading === `plan-${t.id}` ? '...' : '+30 Days'}
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TEMPLATES MANAGEMENT */}
        {activeTab === 'templates' && (
          <div className="space-y-8 text-left">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Templates &amp; Themes</h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Distribution mapping and layout metrics of public pharmacy websites.</p>
            </div>

            {/* Template Distribution Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Default Template card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200">Template001</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Classic colorful pharmacy aesthetic</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-950/60 text-slate-400 border border-slate-800 font-mono text-xs font-bold rounded-lg uppercase">
                      ID: template-001
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active distribution count:</span>
                    <span className="text-3xl font-black text-slate-100">{templateStats.template001} pharmacies</span>
                  </div>

                  <hr className="border-slate-800" />
                  <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    <p>&bull; Includes color-pickable brand assets dynamically rendered on-demand.</p>
                    <p>&bull; Features announcement strip, medical testimonials, and leaflet navigation map.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setPreviewTemplateId('template-001')}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    View Layout Design
                  </button>
                </div>
              </div>

              {/* ProHealth Template card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200">Template002</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Professional teal/solid clinical theme</p>
                    </div>
                    <span className="px-2.5 py-1 bg-teal-900/10 text-teal-400 border border-teal-800/40 font-mono text-xs font-bold rounded-lg uppercase">
                      ID: template-002
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active distribution count:</span>
                    <span className="text-3xl font-black text-teal-400">{templateStats.template002} pharmacies</span>
                  </div>

                  <hr className="border-slate-800" />
                  <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    <p>&bull; Features solid color medical typography for maximum professional impact.</p>
                    <p>&bull; Integrated real-time client-side public stock lookup search component.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setPreviewTemplateId('template-002')}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    View Layout Design
                  </button>
                </div>
              </div>

              {/* GeneX Template card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200">Template003</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Biotech longevity clinical theme</p>
                    </div>
                    <span className="px-2.5 py-1 bg-cyan-900/10 text-cyan-400 border border-cyan-800/40 font-mono text-xs font-bold rounded-lg uppercase">
                      ID: template-003
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Active distribution count:</span>
                    <span className="text-3xl font-black text-cyan-400">{templateStats.template003} pharmacies</span>
                  </div>

                  <hr className="border-slate-800" />
                  <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
                    <p>&bull; Premium clinical DNA double-helix layouts and medical graphics.</p>
                    <p>&bull; Customized statistics grid panels, research spotlights, and stock query search list.</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setPreviewTemplateId('template-003')}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    View Layout Design
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL MEDICINE CATALOG */}
        {activeTab === 'medicines' && (
          <div className="space-y-6 text-left">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Global Medicine Catalog</h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Aggregated inventory analysis from all tenant databases.</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input 
                type="text"
                placeholder="Search global medicines catalog by brand/generic name..."
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
              />
            </div>

            {/* Medicines List table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {loadingMedicines ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-teal-400" />
                  <span className="text-xs text-slate-500 font-semibold">Running global aggregate search...</span>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-1">
                  <Package className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs font-bold">No registered medicines catalogued yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4.5 px-6">Medicine Name</th>
                        <th className="py-4.5 px-4">Generic Formula</th>
                        <th className="py-4.5 px-4">Category</th>
                        <th className="py-4.5 px-4 text-right">UOM</th>
                        <th className="py-4.5 px-4 text-center">Tenants Carrying</th>
                        <th className="py-4.5 px-6 text-right">Max Selling Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredMedicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 text-slate-200 font-bold">{med.name}</td>
                          <td className="py-4 px-4 font-mono text-slate-400">{med.generic_name || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                              {med.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-slate-500">{med.uom}</td>
                          <td className="py-4 px-4 text-center font-bold text-teal-400">{med.tenants_count}</td>
                          <td className="py-4 px-6 text-right font-mono text-slate-200 font-bold">
                            LKR {med.highest_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DIAGNOSTICS & TELEMETRY */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-8 text-left">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Diagnostics &amp; System Telemetry</h1>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Real-time health statistics of the pharmacyhub backend infrastructure.</p>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Server Info Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-teal-400">
                  <Server size={18} />
                  <h3 className="font-bold text-xs uppercase tracking-wider">FastAPI Server</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Framework</span>
                    <span className="font-mono text-slate-300">FastAPI 0.110.0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Python Version</span>
                    <span className="font-mono text-slate-300">Python 3.12.x</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">API Health Status</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Healthy</span>
                  </div>
                </div>
              </div>

              {/* Database Telemetry Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-teal-400">
                  <Database size={18} />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Database Telemetry</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-mono text-slate-300">Neon Postgres</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Region</span>
                    <span className="text-slate-400">AWS us-east-1 (N. Virginia)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Pool Connection Status</span>
                    <span className="text-emerald-400 font-bold">20/20 active connections</span>
                  </div>
                </div>
              </div>

              {/* Backups card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-teal-400">
                  <Clock size={18} />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Automated Backups</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Daily database dump</span>
                    <span className="text-emerald-400 font-semibold">Configured</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Storage target</span>
                    <span className="font-mono text-slate-300">AWS S3 (Private Bucket)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Last run timing</span>
                    <span className="font-mono text-slate-300">Today 03:00 AM</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* CREATE PHARMACY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left">
            <h3 className="font-extrabold text-sm md:text-base uppercase tracking-wider text-teal-400 mb-4">Register New Pharmacy</h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pharmacy Brand Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lanka Care Pharmacy"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subdomain Prefix (lowercase)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner pr-3.5">
                  <input 
                    type="text"
                    required
                    placeholder="e.g. lanka-care"
                    value={newPharmacySubdomain}
                    onChange={(e) => setNewPharmacySubdomain(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent border-0 text-xs text-slate-100 focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">.medical.lk</span>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City Location</label>
                <input 
                  type="text"
                  placeholder="e.g. Colombo"
                  value={newPharmacyCity}
                  onChange={(e) => setNewPharmacyCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NMRA Reg Number</label>
                <input 
                  type="text"
                  placeholder="e.g. NMRA-PH-8921"
                  value={newPharmacyNmra}
                  onChange={(e) => setNewPharmacyNmra(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BR Number</label>
                <input 
                  type="text"
                  placeholder="e.g. PV-8910-12"
                  value={newPharmacyBr}
                  onChange={(e) => setNewPharmacyBr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TEMPLATE PREVIEW MODAL */}
      {previewTemplateId && (
        <div className="fixed inset-0 bg-[#f8f9ff] z-[300] overflow-y-auto">
          {/* Floating Absolute Preview Control Popup */}
          <div className="fixed top-6 right-6 z-[350] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-3 min-w-[220px] text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Preview Mode
              </div>
              <h4 className="font-extrabold text-xs text-slate-100 mt-2">
                {previewTemplateId === 'template-002' ? 'Template002' : previewTemplateId === 'template-003' ? 'Template003' : 'Template001'}
              </h4>
              <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Live Interactive Preview</p>
            </div>
            
            <button
              onClick={() => setPreviewTemplateId(null)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer text-center"
            >
              Close Preview
            </button>
          </div>

          {/* Main preview frame */}
          <div className="w-full min-h-screen">
            {previewTemplateId === 'template-002' ? (
              <Template002 tenant={mockPreviewTenant} subdomain={tenants[0]?.subdomain || 'lanka-care'} />
            ) : previewTemplateId === 'template-003' ? (
              <Template003 tenant={mockPreviewTenant} subdomain={tenants[0]?.subdomain || 'lanka-care'} />
            ) : (
              <Template001 tenant={mockPreviewTenant} subdomain={tenants[0]?.subdomain || 'lanka-care'} />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
