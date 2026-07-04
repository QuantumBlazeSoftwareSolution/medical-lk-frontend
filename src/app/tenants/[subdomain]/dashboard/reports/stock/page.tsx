'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Search,
  Filter,
  Download,
  Coins,
  Layers,
  AlertTriangle,
  FileText,
  Loader2,
  BadgeAlert,
  CheckCircle,
  Flame,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function StockReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock, expired

  // 1. Fetch batches (include out of stock)
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['stock-report-batches'],
    queryFn: () => apiFetch('/api/inventory/batches?only_in_stock=false'),
  });

  // Helper currency formatter
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace('LKR', 'LKR ');
  };

  // Dynamic category list from fetched data
  const categories = useMemo(() => {
    const cats = new Set<string>();
    batches.forEach((b: any) => {
      if (b.category) {
        cats.add(b.category);
      }
    });
    return ['all', ...Array.from(cats)];
  }, [batches]);

  // Filter batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b: any) => {
      // Search term
      const matchesSearch =
        b.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.generic_name &&
          b.generic_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory =
        categoryFilter === 'all' || b.category === categoryFilter;

      // Stock status filter
      let matchesStatus = true;
      const isOut = b.quantity_remaining === 0;
      const isLow = !isOut && b.quantity_remaining <= (b.min_stock_level ?? 10);
      const isExpired = b.is_expired;

      if (stockStatusFilter === 'out_of_stock') {
        matchesStatus = isOut;
      } else if (stockStatusFilter === 'low_stock') {
        matchesStatus = isLow;
      } else if (stockStatusFilter === 'in_stock') {
        matchesStatus = !isOut && !isLow;
      } else if (stockStatusFilter === 'expired') {
        matchesStatus = isExpired;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [batches, searchTerm, categoryFilter, stockStatusFilter]);

  // Aggregate KPI summaries
  const summaries = useMemo(() => {
    let totalSKUs = new Set(filteredBatches.map((b: any) => b.medicine_id))
      .size;
    let totalQty = 0;
    let lowStockCount = 0;
    let totalValuation = 0;

    filteredBatches.forEach((b: any) => {
      totalQty += b.quantity_remaining;
      totalValuation += b.quantity_remaining * b.purchase_price;

      const isOut = b.quantity_remaining === 0;
      const isLow = !isOut && b.quantity_remaining <= (b.min_stock_level ?? 10);
      if (isLow) {
        lowStockCount++;
      }
    });

    return {
      totalSKUs,
      totalQty,
      lowStockCount,
      totalValuation,
    };
  }, [filteredBatches]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-[#42474d] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f3d57]" />
        <span className="text-sm font-medium">
          Generating Stock Valuation Report...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans print:p-0 print:bg-white">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
            <Package className="text-[#0f3d57] h-6 w-6" /> Stock Valuation
            Report
          </h1>
          <p className="text-sm text-[#42474d] mt-1">
            Real-time telemetry on inventory counts, pharmaceutical values, and
            stock warnings.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f3d57] hover:bg-[#0c3045] text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start md:self-auto"
        >
          <Download className="h-4 w-4" /> Download Stock PDF
        </button>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block border-b border-[#0f3d57] pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[#0f3d57]">
              Medical.lk Pharmacy
            </h1>
            <p className="text-xs text-[#42474d] mt-1">
              Stock Sheet & Inventory Valuation Report
            </p>
            <p className="text-xs text-[#42474d]">
              Generated on: {new Date().toLocaleDateString('en-LK')}{' '}
              {new Date().toLocaleTimeString('en-LK')}
            </p>
          </div>
          <div className="text-right text-xs text-[#42474d]">
            <p>
              Category:{' '}
              {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
            </p>
            <p>
              Filter Status:{' '}
              {stockStatusFilter === 'all'
                ? 'All Batches'
                : stockStatusFilter.replace('_', ' ')}
            </p>
            <p>Total Records: {filteredBatches.length}</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {/* Total Unique SKUs */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">
              Total SKUs
            </p>
            <Layers className="text-[#0f3d57] h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {summaries.totalSKUs}
          </h3>
          <span className="text-xs text-[#42474d]">Unique medicine items</span>
        </div>

        {/* Total Quantity */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">
              Total Stock Qty
            </p>
            <Package className="text-teal-600 h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {summaries.totalQty.toLocaleString('en-LK')}
          </h3>
          <span className="text-xs text-[#42474d]">Total package count</span>
        </div>

        {/* Low Stock count */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">
              Low Stock Items
            </p>
            <AlertTriangle className="text-amber-500 h-5 w-5 print:hidden" />
          </div>
          <h3
            className={`text-2xl font-bold mb-1 font-display print:text-lg ${summaries.lowStockCount > 0 ? 'text-amber-600' : 'text-[#191c1e]'}`}
          >
            {summaries.lowStockCount}
          </h3>
          <span className="text-xs text-[#42474d]">Under minimum limit</span>
        </div>

        {/* Total Stock Valuation */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">
              Stock Valuation
            </p>
            <Coins className="text-emerald-600 h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-1 font-display print:text-lg">
            {formatLKR(summaries.totalValuation)}
          </h3>
          <span className="text-xs text-[#42474d]">
            Valued at purchase cost
          </span>
        </div>
      </div>

      {/* Filter Toolbar - Hidden on Print */}
      <div className="bg-white border border-[#eceef1] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:hidden flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#f2f4f7] pb-3">
          <Filter className="h-4 w-4 text-[#0f3d57]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f3d57]">
            Filters
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicine or Batch #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full pr-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57] capitalize"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((c) => c !== 'all')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Stock Status Dropdown */}
          <div>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            >
              <option value="all">All Stocks Levels</option>
              <option value="in_stock">In Stock (Normal)</option>
              <option value="low_stock">Low Stock Alerts</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="expired">Expired Batches</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#f2f4f7]">
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStockStatusFilter('all');
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#eceef1] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-none print:shadow-none">
        {filteredBatches.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#42474d] text-sm gap-2">
            <FileText className="h-8 w-8 text-slate-300" />
            <span>No stock batches matching the criteria were found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f7] print:bg-slate-200 text-[#42474d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eceef1]">
                  <th className="p-4 font-medium">Medicine Name</th>
                  <th className="p-4 font-medium">Generic Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Batch No.</th>
                  <th className="p-4 font-medium">Expiry Date</th>
                  <th className="p-4 font-medium text-right">
                    Remaining Stock
                  </th>
                  <th className="p-4 font-medium text-right">Purchase Price</th>
                  <th className="p-4 font-medium text-right">Selling Price</th>
                  <th className="p-4 font-medium text-right">Valuation</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#eceef1] text-[#191c1e]">
                {filteredBatches.map((b: any) => {
                  const isOut = b.quantity_remaining === 0;
                  const isLow =
                    !isOut && b.quantity_remaining <= (b.min_stock_level ?? 10);
                  const isExpired = b.is_expired;

                  const valuation = b.quantity_remaining * b.purchase_price;
                  const expiryStr = b.expiry_date
                    ? new Date(b.expiry_date).toLocaleDateString('en-LK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#f2f4f7]/30 transition-colors print:hover:bg-transparent"
                    >
                      <td className="p-4">
                        <div className="font-semibold">{b.medicine_name}</div>
                        {b.barcode && (
                          <div className="text-[10px] text-slate-400 font-mono print:hidden">
                            {b.barcode}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
                        {b.generic_name || '—'}
                      </td>
                      <td className="p-4 capitalize text-xs">
                        {b.category || 'General'}
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700">
                        {b.batch_number}
                      </td>
                      <td
                        className={`p-4 text-xs font-mono whitespace-nowrap ${isExpired ? 'text-red-600 font-bold' : 'text-slate-500'}`}
                      >
                        {expiryStr}
                      </td>
                      <td
                        className={`p-4 text-right font-mono font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-[#191c1e]'}`}
                      >
                        {b.quantity_remaining} {b.unit || 'Tablet'}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-500">
                        {formatLKR(b.purchase_price)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-500">
                        {formatLKR(b.selling_price)}
                      </td>
                      <td className="p-4 font-semibold text-right font-mono">
                        {formatLKR(valuation)}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider print:bg-transparent print:p-0 print:text-black ${
                            isExpired
                              ? 'bg-red-100 text-red-800'
                              : isOut
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExpired
                            ? 'Expired'
                            : isOut
                              ? 'Out of Stock'
                              : isLow
                                ? 'Low Stock'
                                : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSS Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide sidebar and navigation layout elements */
          aside,
          nav,
          header,
          aside + div > div:first-child {
            display: none !important;
          }
          /* Ensure content takes full page width */
          main,
          div[class*='max-w-'] {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide scrollbars */
          .overflow-x-auto {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
