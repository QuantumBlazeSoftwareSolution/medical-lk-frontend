'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Plus, Loader2, AlertCircle, Search, X,
  ChevronDown, ChevronRight, Upload, Download, ReceiptText,
  TrendingDown, TriangleAlert, MoreVertical, Printer,
  RefreshCw, ArrowLeft, ArrowRight, ShieldAlert,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function stockStatus(qty: number, minLevel: number) {
  if (qty <= 0)      return { label: 'Out of Stock',  color: 'text-[#ba1a1a]',  bg: 'bg-[#ffdad6]', bar: 'bg-[#ba1a1a]', pct: 0 };
  if (qty <= minLevel) return { label: 'Low Stock',     color: 'text-[#e67e22]',  bg: 'bg-[#fef9ec]', bar: 'bg-[#e67e22]', pct: Math.max(5, (qty / (minLevel * 3)) * 100) };
  return               { label: 'In Stock',       color: 'text-[#006d37]',  bg: 'bg-[#e8f8f5]', bar: 'bg-[#006d37]', pct: Math.min(100, (qty / (minLevel * 5)) * 100) };
}

function batchExpiry(dateStr: string) {
  const d = daysUntil(dateStr);
  if (d < 0)   return { color: 'text-[#ba1a1a] font-semibold', badge: 'bg-[#ffdad6] text-[#ba1a1a]', label: 'Expired' };
  if (d <= 30) return { color: 'text-[#b45309] font-semibold', badge: 'bg-[#fef3c7] text-[#b45309]', label: 'Expiring Soon' };
  return          { color: 'text-[#42474d]',                  badge: 'bg-[#eceef1] text-[#42474d]',  label: 'OK' };
}

const ITEMS_PER_PAGE = 20;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Medicine { id: string; name: string; generic_name?: string; category?: string; barcode?: string; min_stock_level: number; }
interface Batch    { id: string; medicine_id: string; medicine_name: string; generic_name?: string; batch_number: string; expiry_date: string; quantity_remaining: number; purchase_price: number; selling_price: number; is_expired: boolean; }
interface AlertData { low_stock_alerts: any[]; expiry_alerts: any[]; }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InventoryPage() {
  const qc = useQueryClient();

  // State
  const [search, setSearch]           = useState('');
  const [categoryFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerMed, setDrawerMed]     = useState<Medicine | null>(null);
  const [page, setPage]               = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add medicine form
  const [medName, setMedName]         = useState('');
  const [medGeneric, setMedGeneric]   = useState('');
  const [medBarcode, setMedBarcode]   = useState('');
  const [medCategory, setMedCategory] = useState('Tablet');
  const [medMinStock, setMedMinStock] = useState(10);
  const [formError, setFormError]     = useState('');

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: medicines = [], isLoading: medsLoading, refetch: refetchMeds } = useQuery<Medicine[]>({
    queryKey: ['medicines-list'],
    queryFn: () => apiFetch('/api/inventory/medicines'),
  });

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['batches-all'],
    queryFn: () => apiFetch('/api/inventory/batches?only_in_stock=false'),
  });

  const { data: alerts } = useQuery<AlertData>({
    queryKey: ['inventory-alerts'],
    queryFn: () => apiFetch('/api/inventory/alerts'),
  });

  // ── Create medicine mutation ─────────────────────────────────────────────────
  const createMed = useMutation({
    mutationFn: (p: any) => apiFetch('/api/inventory/medicines', { method: 'POST', body: JSON.stringify(p) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines-list'] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (e: any) => setFormError(e.message || 'Failed to create medicine.'),
  });

  const resetForm = () => { setMedName(''); setMedGeneric(''); setMedBarcode(''); setMedCategory('Tablet'); setMedMinStock(10); setFormError(''); };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const batchMap = useMemo(() => {
    const map: Record<string, Batch[]> = {};
    batches.forEach(b => { if (!map[b.medicine_id]) map[b.medicine_id] = []; map[b.medicine_id].push(b); });
    return map;
  }, [batches]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(medicines.map(m => m.category || 'Other').filter(Boolean)))], [medicines]);

  const filteredMeds = useMemo(() => {
    return medicines.filter(m => {
      const term = search.toLowerCase();
      const matchSearch = !search || m.name.toLowerCase().includes(term) || (m.generic_name || '').toLowerCase().includes(term) || (m.barcode || '').includes(term);
      const matchCat = categoryFilter === 'All' || m.category === categoryFilter;
      const batForMed = batchMap[m.id] || [];
      const totalQty = batForMed.reduce((s, b) => s + b.quantity_remaining, 0);
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'In Stock'    && totalQty > m.min_stock_level) ||
        (statusFilter === 'Low Stock'   && totalQty > 0 && totalQty <= m.min_stock_level) ||
        (statusFilter === 'Out of Stock' && totalQty === 0);
      return matchSearch && matchCat && matchStatus;
    });
  }, [medicines, search, categoryFilter, statusFilter, batchMap]);

  const totalPages = Math.max(1, Math.ceil(filteredMeds.length / ITEMS_PER_PAGE));
  const pagedMeds  = filteredMeds.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Stats
  const totalProducts  = medicines.length;
  const lowStockCount  = medicines.filter(m => { const q = (batchMap[m.id] || []).reduce((s,b) => s+b.quantity_remaining, 0); return q > 0 && q <= m.min_stock_level; }).length;
  const outOfStockCount = medicines.filter(m => (batchMap[m.id] || []).reduce((s,b) => s+b.quantity_remaining, 0) === 0).length;
  const nearExpiryCount = alerts?.expiry_alerts?.length ?? 0;

  // Select helpers
  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === pagedMeds.length ? new Set() : new Set(pagedMeds.map(m => m.id)));

  const drawerBatches = drawerMed ? (batchMap[drawerMed.id] || []) : [];
  const drawerTotalQty = drawerBatches.reduce((s, b) => s + b.quantity_remaining, 0);
  const drawerBuyAvg = drawerBatches.length > 0 ? drawerBatches.reduce((s,b) => s + b.purchase_price, 0) / drawerBatches.length : 0;
  const drawerSellPrice = drawerBatches.length > 0 ? drawerBatches[drawerBatches.length - 1].selling_price : 0;
  const drawerMargin = drawerBuyAvg > 0 ? ((drawerSellPrice - drawerBuyAvg) / drawerBuyAvg * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 relative">

      {/* ── Expiry alert banner ────────────────────────────────────────────── */}
      {nearExpiryCount > 0 && (
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#ffb961] text-[#361f00] rounded-xl border border-[#e67e22]/30 -mb-2">
          <div className="flex items-center gap-2.5 text-[13px] font-medium">
            <TriangleAlert size={18} />
            <span>Critical Alert: {nearExpiryCount} batches are expiring within the next 30 days.</span>
          </div>
          <button className="text-[12px] font-semibold underline hover:opacity-70 cursor-pointer">Review Batches</button>
        </div>
      )}

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#42474d] mb-1">
            <span>PharmacyHub</span>
            <ChevronRight size={13} />
            <span className="text-[#00273b] font-medium">Inventory</span>
          </div>
          <h1 className="font-display text-[28px] font-bold text-[#191c1e] leading-tight">Inventory Management</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#00273b] text-[#00273b] text-[12px] font-semibold hover:bg-[#00273b]/5 transition-colors cursor-pointer">
            <Upload size={15} /> Import CSV
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#00273b] text-[#00273b] text-[12px] font-semibold hover:bg-[#00273b]/5 transition-colors cursor-pointer">
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#00273b] text-[#00273b] text-[12px] font-semibold hover:bg-[#00273b]/5 transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Product
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#006d37] text-white text-[12px] font-semibold hover:bg-[#006d37]/90 transition-colors cursor-pointer shadow-sm">
            <ReceiptText size={15} /> Add GRN
          </button>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products',  val: totalProducts,   icon: <Package size={22} />,     iconBg: 'bg-[#00273b]/10 text-[#00273b]',     border: '' },
          { label: 'Low Stock',       val: lowStockCount,   icon: <TrendingDown size={22} />, iconBg: 'bg-[#fef3c7] text-[#b45309]',         border: 'border-l-4 border-l-[#d97706]' },
          { label: 'Out of Stock',    val: outOfStockCount, icon: <ShieldAlert size={22} />,  iconBg: 'bg-[#ffdad6] text-[#ba1a1a]',         border: 'border-l-4 border-l-[#ba1a1a]' },
          { label: 'Near Expiry',     val: nearExpiryCount, icon: <TriangleAlert size={22} />,iconBg: 'bg-[#fef3c7] text-[#b45309]',         border: 'border-l-4 border-l-[#d97706]' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl p-4 border border-[#e0e3e6] shadow-sm flex items-center gap-4 ${c.border}`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>{c.icon}</div>
            <div>
              <p className="text-[12px] text-[#42474d]">{c.label}</p>
              <p className="text-[22px] font-bold text-[#191c1e] font-display leading-tight">{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e0e3e6] rounded-xl shadow-sm flex flex-col">

        {/* Filter bar */}
        <div className="p-4 border-b border-[#e0e3e6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72787e] pointer-events-none" />
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-[#f7f9fc] rounded-md border border-[#c2c7cd] text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#00273b] focus:border-[#00273b] transition-all placeholder:text-[#72787e]"
                placeholder="Filter products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Category */}
            <select
              className="py-1.5 px-3 bg-[#f7f9fc] rounded-md border border-[#c2c7cd] text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#00273b] font-medium cursor-pointer"
              value={categoryFilter}
              onChange={e => { setCatFilter(e.target.value); setPage(1); }}
            >
              {categories.map(c => <option key={c} value={c}>Category: {c}</option>)}
            </select>

            {/* Status */}
            <select
              className="py-1.5 px-3 bg-[#f7f9fc] rounded-md border border-[#c2c7cd] text-[13px] text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#00273b] cursor-pointer"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => <option key={s} value={s}>Status: {s}</option>)}
            </select>
          </div>

          <button onClick={() => refetchMeds()} className="p-1.5 rounded-md border border-[#c2c7cd] text-[#42474d] hover:bg-[#f7f9fc] transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-[#f2f4f7] border-b border-[#e0e3e6] w-10 text-center sticky top-0 z-10">
                  <input type="checkbox" className="h-4 w-4 rounded border-[#c2c7cd] accent-[#00273b] cursor-pointer"
                    checked={pagedMeds.length > 0 && selectedIds.size === pagedMeds.length}
                    onChange={toggleSelectAll} />
                </th>
                {['Product Name', 'Category', 'Barcode', 'Stock Level', 'Batches', 'Unit Price', 'Margin', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 bg-[#f2f4f7] border-b border-[#e0e3e6] text-[11px] font-semibold text-[#42474d] uppercase tracking-wider whitespace-nowrap sticky top-0 z-10">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-[13px]">
              {medsLoading ? (
                <tr><td colSpan={9} className="py-16 text-center text-[#72787e]">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#00273b]" />
                    <span>Loading inventory...</span>
                  </div>
                </td></tr>
              ) : pagedMeds.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-[#72787e]">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={28} className="text-[#c2c7cd]" />
                    <span>No products match your filters.</span>
                  </div>
                </td></tr>
              ) : pagedMeds.map(med => {
                const medBatches  = batchMap[med.id] || [];
                const totalQty    = medBatches.reduce((s, b) => s + b.quantity_remaining, 0);
                const status      = stockStatus(totalQty, med.min_stock_level);
                const pct         = Math.min(100, Math.max(0, status.pct));
                const activeBat   = medBatches.filter(b => b.quantity_remaining > 0).length;
                const lastBatch   = medBatches[medBatches.length - 1];
                const sellPrice   = lastBatch?.selling_price ?? 0;
                const buyAvg      = medBatches.length > 0 ? medBatches.reduce((s,b) => s+b.purchase_price, 0) / medBatches.length : 0;
                const margin      = buyAvg > 0 ? ((sellPrice - buyAvg) / buyAvg * 100) : 0;
                const isExpanded  = expandedId === med.id;
                const isSelected  = selectedIds.has(med.id);

                return (
                  <React.Fragment key={med.id}>
                    {/* Main row */}
                    <tr
                      className={`border-b border-[#eceef1] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#e5eeff]' :
                        isExpanded ? 'bg-[#f8f9ff] border-l-2 border-l-[#00273b]' :
                        'hover:bg-[#f7f9fc]'
                      }`}
                      onClick={() => setDrawerMed(med)}
                    >
                      <td className="px-4 py-3 text-center" onClick={e => { e.stopPropagation(); toggleSelect(med.id); }}>
                        <input type="checkbox" className="h-4 w-4 rounded border-[#c2c7cd] accent-[#00273b] cursor-pointer"
                          checked={isSelected} onChange={() => toggleSelect(med.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-[#42474d] hover:text-[#00273b] transition-colors p-0.5"
                            onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : med.id); }}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <div>
                            <div className="font-semibold text-[#191c1e]">{med.name}</div>
                            <div className="text-[11px] text-[#42474d]">{med.generic_name || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#42474d]">{med.category || '—'}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-[#42474d]">{med.barcode || '—'}</td>
                      <td className="px-4 py-3 w-[180px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className={totalQty === 0 ? 'text-[#ba1a1a] font-semibold' : totalQty <= med.min_stock_level ? 'text-[#b45309] font-semibold' : 'text-[#191c1e]'}>
                            {totalQty} units
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="w-full bg-[#e0e3e6] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${status.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[11px] font-semibold ${activeBat > 0 ? 'bg-[#0f3d57] text-[#80a8c6] border border-[#00273b]/20' : 'bg-[#eceef1] text-[#72787e]'}`}>
                          {activeBat > 0 ? `${activeBat} Active` : 'None'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#191c1e]">{sellPrice > 0 ? `Rs ${fmt(sellPrice)}` : '—'}</td>
                      <td className="px-4 py-3">
                        {margin > 0 ? (
                          <div>
                            <div className="text-[#191c1e] font-medium">{margin.toFixed(1)}%</div>
                            <div className="text-[10px] text-[#006d37] font-semibold">margin</div>
                          </div>
                        ) : <span className="text-[#72787e]">—</span>}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button className="p-1 text-[#42474d] hover:text-[#00273b] cursor-pointer rounded hover:bg-[#f2f4f7] transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded batch breakdown */}
                    {isExpanded && (
                      <tr className="border-b border-[#eceef1] bg-[#f8f9ff]">
                        <td />
                        <td colSpan={8} className="pb-4 pt-1 pr-4">
                          <div className="ml-8 bg-white border border-[#e0e3e6] rounded-lg p-3 shadow-sm">
                            <h4 className="text-[10px] font-bold text-[#42474d] uppercase tracking-widest mb-2">Batch Breakdown</h4>
                            {medBatches.length === 0 ? (
                              <p className="text-[12px] text-[#72787e]">No batches recorded for this product.</p>
                            ) : (
                              <table className="w-full text-[12px]">
                                <thead>
                                  <tr className="border-b border-[#eceef1] text-[#42474d]">
                                    <th className="text-left font-semibold pb-1.5">Batch No.</th>
                                    <th className="text-left font-semibold pb-1.5">Expiry Date</th>
                                    <th className="text-right font-semibold pb-1.5">Qty</th>
                                    <th className="text-right font-semibold pb-1.5">Sell Price</th>
                                    <th className="text-center font-semibold pb-1.5">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {medBatches.map(b => {
                                    const exp = batchExpiry(b.expiry_date);
                                    return (
                                      <tr key={b.id} className="border-b border-[#eceef1]/50 last:border-b-0">
                                        <td className="py-1.5 font-mono">{b.batch_number}</td>
                                        <td className={`py-1.5 ${exp.color}`}>{b.expiry_date}</td>
                                        <td className="py-1.5 text-right font-semibold">{b.quantity_remaining}</td>
                                        <td className="py-1.5 text-right text-[#42474d]">Rs {fmt(b.selling_price)}</td>
                                        <td className="py-1.5 text-center">
                                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${exp.badge}`}>{exp.label}</span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#e0e3e6] flex items-center justify-between text-[12px] text-[#42474d]">
          <span>Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredMeds.length)}–{Math.min(page * ITEMS_PER_PAGE, filteredMeds.length)} of {filteredMeds.length} products</span>
          <div className="flex items-center gap-1.5">
            <button
              className="p-1 rounded hover:bg-[#f2f4f7] disabled:opacity-40 cursor-pointer transition-colors"
              disabled={page === 1} onClick={() => setPage(p => p - 1)}
            ><ArrowLeft size={16} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page <= 3 ? i + 1 : page + i - 2;
              if (pg > totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-medium transition-colors cursor-pointer ${pg === page ? 'bg-[#00273b] text-white' : 'hover:bg-[#f2f4f7] text-[#42474d]'}`}
                >{pg}</button>
              );
            })}
            <button
              className="p-1 rounded hover:bg-[#f2f4f7] disabled:opacity-40 cursor-pointer transition-colors"
              disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            ><ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* ── Bulk action floating bar ───────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00273b] rounded-xl shadow-[0_10px_25px_rgba(15,61,87,0.3)] px-6 py-3 flex items-center gap-5 z-40">
          <div className="flex items-center gap-2 text-white border-r border-white/20 pr-5">
            <div className="w-6 h-6 rounded bg-white text-[#00273b] flex items-center justify-center font-bold text-sm">{selectedIds.size}</div>
            <span className="text-[13px] font-medium">Products Selected</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: 'Print Barcodes', icon: <Printer size={16} /> },
              { label: 'Update Stock',   icon: <RefreshCw size={16} /> },
              { label: 'Bulk Price',     icon: <ReceiptText size={16} /> },
            ].map(a => (
              <button key={a.label} className="px-3 py-1.5 text-[12px] text-white hover:bg-[#0f3d57] rounded transition-colors cursor-pointer flex items-center gap-1.5">
                {a.icon} {a.label}
              </button>
            ))}
            <button className="px-3 py-1.5 text-[12px] text-[#ffb4ab] hover:bg-[#93000a] rounded transition-colors cursor-pointer ml-1">
              Mark Inactive
            </button>
          </div>
          <button className="text-white/50 hover:text-white transition-colors cursor-pointer ml-1" onClick={() => setSelectedIds(new Set())}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── Product detail drawer ──────────────────────────────────────────── */}
      {drawerMed && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setDrawerMed(null)} />

          <aside className="fixed right-0 top-0 h-screen w-[400px] bg-white border-l border-[#e0e3e6] shadow-[-4px_0_20px_rgba(0,0,0,0.08)] z-50 flex flex-col">
            {/* Drawer header */}
            <div className="p-4 border-b border-[#e0e3e6] flex items-center justify-between bg-[#f7f9fc]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0f3d57] text-[#80a8c6] flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-[#191c1e] leading-tight">{drawerMed.name}</h3>
                  <p className="text-[12px] text-[#42474d]">{drawerMed.category}{drawerMed.generic_name ? ` • ${drawerMed.generic_name}` : ''}</p>
                </div>
              </div>
              <button className="p-1.5 text-[#42474d] hover:bg-[#e0e3e6] rounded-full transition-colors cursor-pointer" onClick={() => setDrawerMed(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Quick actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#00273b] text-white rounded-lg text-[12px] font-semibold hover:bg-[#00273b]/90 transition-colors cursor-pointer">Edit Product</button>
                <button className="flex-1 py-2 border border-[#00273b] text-[#00273b] rounded-lg text-[12px] font-semibold hover:bg-[#00273b]/5 transition-colors cursor-pointer">Adjust Stock</button>
              </div>

              {/* Pricing card */}
              <div className="bg-[#f7f9fc] rounded-xl p-4 border border-[#e0e3e6]">
                <h4 className="text-[10px] font-bold text-[#42474d] uppercase tracking-widest mb-3">Pricing Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] text-[#42474d] mb-1">Unit Selling Price</p>
                    <p className="font-display text-[18px] font-bold text-[#191c1e]">Rs {fmt(drawerSellPrice)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#42474d] mb-1">Avg. Purchase Price</p>
                    <p className="text-[16px] font-semibold text-[#42474d]">Rs {fmt(drawerBuyAvg)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e0e3e6]/60 flex items-center justify-between">
                  <span className="text-[12px] text-[#42474d]">Profit Margin</span>
                  <span className="px-2 py-1 rounded bg-[#6bfe9c] text-[#006d37] font-bold text-[13px]">{drawerMargin.toFixed(1)}%</span>
                </div>
              </div>

              {/* Stock summary */}
              <div>
                <h4 className="text-[10px] font-bold text-[#42474d] uppercase tracking-widest mb-3">Stock Summary</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Current Quantity', val: `${drawerTotalQty} units`, cls: 'font-semibold text-[#191c1e]' },
                    { label: 'Reorder Level',    val: `${drawerMed.min_stock_level} units`, cls: 'font-semibold text-[#42474d]' },
                    { label: 'Barcode',          val: drawerMed.barcode || '—', cls: 'font-mono text-[12px] text-[#42474d]' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center py-2 border-b border-[#eceef1]">
                      <span className="text-[13px] text-[#191c1e]">{r.label}</span>
                      <span className={`text-[13px] ${r.cls}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Batch list */}
              <div>
                <h4 className="text-[10px] font-bold text-[#42474d] uppercase tracking-widest mb-3">Active Batches</h4>
                {drawerBatches.length === 0 ? (
                  <p className="text-[12px] text-[#72787e]">No batches recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {drawerBatches.map(b => {
                      const exp = batchExpiry(b.expiry_date);
                      return (
                        <div key={b.id} className="flex items-center justify-between py-2 border-b border-[#eceef1] text-[12px]">
                          <div>
                            <div className="font-mono font-semibold text-[#191c1e]">{b.batch_number}</div>
                            <div className={exp.color}>Exp: {b.expiry_date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#191c1e]">{b.quantity_remaining} units</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${exp.badge}`}>{exp.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ── Add Medicine Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2d3133]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.16)] w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-[#00273b] flex items-center justify-between">
              <h3 className="font-display text-[17px] font-bold text-white">Add New Product</h3>
              <button className="text-[#80a8c6] hover:text-white hover:bg-white/10 rounded p-1 transition-colors cursor-pointer" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-5">
              {formError && (
                <div className="mb-4 p-3 text-[13px] text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} /> {formError}
                </div>
              )}
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); setFormError(''); if (!medName.trim()) return; createMed.mutate({ name: medName.trim(), generic_name: medGeneric.trim() || null, barcode: medBarcode.trim() || null, category: medCategory, min_stock_level: medMinStock }); }}>
                <div>
                  <label className="block text-[11px] font-bold text-[#42474d] uppercase tracking-wider mb-1">Medicine Name *</label>
                  <input required type="text" placeholder="e.g. Paracetamol 500mg" value={medName} onChange={e => setMedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00273b]/30 focus:border-[#00273b] transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#42474d] uppercase tracking-wider mb-1">Generic / Formula</label>
                  <input type="text" placeholder="e.g. Paracetamol" value={medGeneric} onChange={e => setMedGeneric(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00273b]/30 focus:border-[#00273b] transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#42474d] uppercase tracking-wider mb-1">Barcode</label>
                    <input type="text" placeholder="Scan / Type" value={medBarcode} onChange={e => setMedBarcode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#00273b]/30 focus:border-[#00273b] transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#42474d] uppercase tracking-wider mb-1">Category</label>
                    <select value={medCategory} onChange={e => setMedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg text-[13px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#00273b]/30 cursor-pointer">
                      {['Tablet','Capsule','Syrup','Ointment','Injection','Drops','Analgesics','Antibiotics','Vitamins','Dermatology','Hormones','Anti-Diabetic','Cardiovascular','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#42474d] uppercase tracking-wider mb-1">Low Stock Alert Level</label>
                  <input type="number" min={0} value={medMinStock} onChange={e => setMedMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg text-[13px] font-mono text-right focus:outline-none focus:ring-2 focus:ring-[#00273b]/30 focus:border-[#00273b] transition-all" />
                </div>
                <div className="flex gap-3 pt-2 border-t border-[#eceef1] mt-2">
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 border border-[#72787e] text-[#191c1e] rounded-lg text-[13px] font-semibold hover:bg-[#f7f9fc] transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={createMed.isPending}
                    className="flex-1 py-2.5 bg-[#00273b] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0f3d57] disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    {createMed.isPending ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Add Medicine'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
