'use client';

import React, { useState, useMemo } from 'react';
import { 
  Hourglass, Search, Filter, Download, 
  Coins, UserCheck, AlertCircle, FileText,
  TrendingUp, CheckCircle2, RefreshCw
} from 'lucide-react';

// Pre-defined high-fidelity mock shifts data
const MOCK_SHIFTS = [
  {
    id: 'SHF-000105',
    cashier: 'Admin',
    startTime: '2026-06-13T08:00:00.000Z',
    endTime: null, // Active
    openingBalance: 10000,
    expectedCash: 35480,
    actualCash: null,
    status: 'active'
  },
  {
    id: 'SHF-000104',
    cashier: 'Sanduni Perera',
    startTime: '2026-06-12T14:00:00.000Z',
    endTime: '2026-06-12T22:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 48900,
    actualCash: 48900,
    status: 'closed'
  },
  {
    id: 'SHF-000103',
    cashier: 'Kasun Silva',
    startTime: '2026-06-12T06:00:00.000Z',
    endTime: '2026-06-12T14:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 28450,
    actualCash: 28400, // -50 variance
    status: 'closed'
  },
  {
    id: 'SHF-000102',
    cashier: 'Sanduni Perera',
    startTime: '2026-06-11T14:00:00.000Z',
    endTime: '2026-06-11T22:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 52100,
    actualCash: 52200, // +100 variance
    status: 'closed'
  },
  {
    id: 'SHF-000101',
    cashier: 'Kasun Silva',
    startTime: '2026-06-11T06:00:00.000Z',
    endTime: '2026-06-11T14:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 31200,
    actualCash: 31200,
    status: 'closed'
  },
  {
    id: 'SHF-000100',
    cashier: 'Sanduni Perera',
    startTime: '2026-06-10T14:00:00.000Z',
    endTime: '2026-06-10T22:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 42350,
    actualCash: 42300, // -50 variance
    status: 'closed'
  },
  {
    id: 'SHF-000099',
    cashier: 'Kasun Silva',
    startTime: '2026-06-10T06:00:00.000Z',
    endTime: '2026-06-10T14:00:00.000Z',
    openingBalance: 5000,
    expectedCash: 26900,
    actualCash: 26900,
    status: 'closed'
  }
];

export default function ShiftReport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Currency Formatter
  const formatLKR = (val: number | null) => {
    if (val === null) return '—';
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace('LKR', 'LKR ');
  };

  // Format date time helper
  const formatDateTime = (isoStr: string | null) => {
    if (!isoStr) return 'Active Shift';
    return new Date(isoStr).toLocaleString('en-LK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return MOCK_SHIFTS.filter((shift) => {
      const matchesSearch = shift.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            shift.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;

      let matchesDate = true;
      const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
      if (startDate && shiftDate < startDate) matchesDate = false;
      if (endDate && shiftDate > endDate) matchesDate = false;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, startDate, endDate]);

  // Aggregate KPI summaries
  const totals = useMemo(() => {
    let activeShifts = 0;
    let closedShifts = 0;
    let totalCashReceived = 0;
    let totalVariance = 0;

    filteredShifts.forEach(shift => {
      if (shift.status === 'active') {
        activeShifts += 1;
        totalCashReceived += (shift.expectedCash - shift.openingBalance);
      } else {
        closedShifts += 1;
        totalCashReceived += ((shift.actualCash || 0) - shift.openingBalance);
        totalVariance += ((shift.actualCash || 0) - shift.expectedCash);
      }
    });

    return {
      activeShifts,
      closedShifts,
      totalCashReceived,
      totalVariance
    };
  }, [filteredShifts]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans print:p-0 print:bg-white">
      
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
            <Hourglass className="text-[#0f3d57] h-6 w-6" /> Cashier Shift Report
          </h1>
          <p className="text-sm text-[#42474d] mt-1">
            Audit register drawer sessions, daily cashier handovers, and cash drawer variances.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0f3d57] hover:bg-[#0c3045] text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start md:self-auto"
        >
          <Download className="h-4 w-4" /> Download PDF Report
        </button>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block border-b border-[#0f3d57] pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-[#0f3d57]">Medical.lk Pharmacy</h1>
            <p className="text-xs text-[#42474d] mt-1">Cashier Shift Drawer Sessions & Audits</p>
            <p className="text-xs text-[#42474d]">
              Generated on: {new Date().toLocaleDateString('en-LK')} {new Date().toLocaleTimeString('en-LK')}
            </p>
          </div>
          <div className="text-right text-xs text-[#42474d]">
            {startDate || endDate ? (
              <p>Period: {startDate || 'Beginning'} to {endDate || 'Today'}</p>
            ) : (
              <p>Period: All Shift Records</p>
            )}
            <p>Total Shifts Filtered: {filteredShifts.length}</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {/* Active Sessions */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Active Sessions</p>
            <RefreshCw className="text-amber-500 h-5 w-5 print:hidden animate-spin-slow" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {totals.activeShifts}
          </h3>
          <span className="text-xs text-[#42474d]">Ongoing drawers open</span>
        </div>

        {/* Closed Sessions */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Closed Sessions</p>
            <CheckCircle2 className="text-[#006d37] h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {totals.closedShifts}
          </h3>
          <span className="text-xs text-[#42474d]">Audited & finalized</span>
        </div>

        {/* Total Cash Billed */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Cash Collected</p>
            <Coins className="text-[#0f3d57] h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {formatLKR(totals.totalCashReceived)}
          </h3>
          <span className="text-xs text-[#42474d]">Excluding opening drawers</span>
        </div>

        {/* Net Drawer Variance */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Net Variance</p>
            <AlertCircle className={`h-5 w-5 print:hidden ${totals.totalVariance < 0 ? 'text-red-500' : totals.totalVariance > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-1 font-display print:text-lg ${totals.totalVariance < 0 ? 'text-red-600' : totals.totalVariance > 0 ? 'text-emerald-600' : 'text-[#191c1e]'}`}>
            {totals.totalVariance === 0 ? 'LKR 0' : (totals.totalVariance > 0 ? '+' : '') + formatLKR(totals.totalVariance)}
          </h3>
          <span className="text-xs text-[#42474d]">Cash audit differences</span>
        </div>
      </div>

      {/* Filter Toolbar - Hidden on Print */}
      <div className="bg-white border border-[#eceef1] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:hidden flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#f2f4f7] pb-3">
          <Filter className="h-4 w-4 text-[#0f3d57]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f3d57]">Filters</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Cashier name or Shift ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full pr-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Sessions</option>
              <option value="closed">Closed Sessions</option>
            </select>
          </div>

          {/* Clear button */}
          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full h-full"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f2f4f7]">
          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#42474d] shrink-0 font-medium w-16">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#42474d] shrink-0 font-medium w-16">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#eceef1] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-none print:shadow-none">
        {filteredShifts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#42474d] text-sm gap-2">
            <FileText className="h-8 w-8 text-slate-300" />
            <span>No shift sessions matching the criteria were found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f7] print:bg-slate-200 text-[#42474d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eceef1]">
                  <th className="p-4 font-medium">Shift ID</th>
                  <th className="p-4 font-medium">Cashier</th>
                  <th className="p-4 font-medium">Start Time</th>
                  <th className="p-4 font-medium">End Time</th>
                  <th className="p-4 font-medium text-right">Opening Cash</th>
                  <th className="p-4 font-medium text-right">Expected Cash</th>
                  <th className="p-4 font-medium text-right">Actual Cash</th>
                  <th className="p-4 font-medium text-right">Variance</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#eceef1] text-[#191c1e]">
                {filteredShifts.map((shift) => {
                  const variance = shift.status === 'active' 
                    ? null 
                    : (shift.actualCash || 0) - shift.expectedCash;

                  return (
                    <tr key={shift.id} className="hover:bg-[#f2f4f7]/30 transition-colors print:hover:bg-transparent">
                      <td className="p-4 font-medium text-[#0f3d57] font-mono">{shift.id}</td>
                      <td className="p-4 font-medium">{shift.cashier}</td>
                      <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">{formatDateTime(shift.startTime)}</td>
                      <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">{formatDateTime(shift.endTime)}</td>
                      <td className="p-4 text-right font-mono">{formatLKR(shift.openingBalance)}</td>
                      <td className="p-4 text-right font-mono">{formatLKR(shift.expectedCash)}</td>
                      <td className="p-4 text-right font-mono">{formatLKR(shift.actualCash)}</td>
                      <td className={`p-4 text-right font-mono font-semibold ${variance === null ? 'text-slate-400' : variance < 0 ? 'text-red-600' : variance > 0 ? 'text-emerald-600' : 'text-[#191c1e]'}`}>
                        {variance === null ? '—' : (variance > 0 ? '+' : '') + formatLKR(variance)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider print:bg-transparent print:p-0 print:text-black ${
                          shift.status === 'active'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {shift.status}
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
          aside, nav, header, aside + div > div:first-child {
            display: none !important;
          }
          /* Ensure content takes full page width */
          main, div[class*="max-w-"] {
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
