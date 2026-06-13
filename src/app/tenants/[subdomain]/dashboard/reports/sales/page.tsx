'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Receipt, Search, Filter, Download, 
  TrendingUp, Coins, Calendar, Loader2, 
  Percent, FileText, ArrowUpDown
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function SalesReport() {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

  // 1. Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['sales-report-invoices'],
    queryFn: () => apiFetch('/api/pos/invoices'),
  });

  // Format currency helper
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace('LKR', 'LKR ');
  };

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv: any) => {
        // Search filter (Invoice number or Patient name)
        const matchesSearch = 
          inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.patient_name && inv.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (!inv.patient_name && 'walk-in customer'.includes(searchTerm.toLowerCase()));

        // Payment method filter
        const matchesPayment = 
          paymentMethod === 'all' || 
          inv.payment_method.toLowerCase() === paymentMethod.toLowerCase();

        // Date filter
        let matchesDate = true;
        if (inv.created_at) {
          const invDate = new Date(inv.created_at);
          // Set invoice date to start of day for comparison
          const invDateStr = invDate.toISOString().split('T')[0];
          
          if (startDate && invDateStr < startDate) {
            matchesDate = false;
          }
          if (endDate && invDateStr > endDate) {
            matchesDate = false;
          }
        }

        return matchesSearch && matchesPayment && matchesDate;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'date-desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.net_amount - a.net_amount;
        }
        if (sortBy === 'amount-asc') {
          return a.net_amount - b.net_amount;
        }
        return 0;
      });
  }, [invoices, searchTerm, paymentMethod, startDate, endDate, sortBy]);

  // Aggregate KPI metrics based on filtered invoices
  const kpis = useMemo(() => {
    const netSales = filteredInvoices.reduce((acc: number, curr: any) => acc + (curr.net_amount || 0), 0);
    const totalCost = filteredInvoices.reduce((acc: number, curr: any) => {
      const cost = curr.total_cost ?? (curr.net_amount - curr.net_profit);
      return acc + (cost || 0);
    }, 0);
    const totalProfit = filteredInvoices.reduce((acc: number, curr: any) => acc + (curr.net_profit || 0), 0);
    const profitMargin = netSales > 0 ? (totalProfit / netSales) * 100 : 0;

    return {
      netSales,
      totalCost,
      totalProfit,
      profitMargin
    };
  }, [filteredInvoices]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-[#42474d] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f3d57]" />
        <span className="text-sm font-medium">Generating Sales Report...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans print:p-0 print:bg-white">
      
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
            <Receipt className="text-[#0f3d57] h-6 w-6" /> Sales Report
          </h1>
          <p className="text-sm text-[#42474d] mt-1">
            Perform deep-dives into billing transactions, profit margins, and payment distributions.
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
            <p className="text-xs text-[#42474d] mt-1">Sales Valuation & Invoice Summary Report</p>
            <p className="text-xs text-[#42474d]">
              Generated on: {new Date().toLocaleDateString('en-LK')} {new Date().toLocaleTimeString('en-LK')}
            </p>
          </div>
          <div className="text-right text-xs text-[#42474d]">
            {startDate || endDate ? (
              <p>Period: {startDate || 'Beginning'} to {endDate || 'Today'}</p>
            ) : (
              <p>Period: All Transactions</p>
            )}
            <p>Total Records: {filteredInvoices.length}</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {/* Net Sales */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2 print:mb-1">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Net Sales</p>
            <TrendingUp className="text-[#006d37] h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {formatLKR(kpis.netSales)}
          </h3>
          <span className="text-xs text-[#42474d]">Gross revenue billed</span>
        </div>

        {/* Total Cost */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2 print:mb-1">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Total Cost</p>
            <Coins className="text-amber-600 h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display print:text-lg">
            {formatLKR(kpis.totalCost)}
          </h3>
          <span className="text-xs text-[#42474d]">Cost of goods sold</span>
        </div>

        {/* Total Profit */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2 print:mb-1">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Total Profit</p>
            <TrendingUp className="text-emerald-600 h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-1 font-display print:text-lg">
            {formatLKR(kpis.totalProfit)}
          </h3>
          <span className="text-xs text-[#42474d]">Accumulated earnings</span>
        </div>

        {/* Profit Margin */}
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:border-slate-300 print:shadow-none">
          <div className="flex justify-between items-start mb-2 print:mb-1">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Profit Margin</p>
            <Percent className="text-blue-600 h-5 w-5 print:hidden" />
          </div>
          <h3 className="text-2xl font-bold text-blue-600 mb-1 font-display print:text-lg">
            {kpis.profitMargin.toFixed(1)}%
          </h3>
          <span className="text-xs text-[#42474d]">Net return percentage</span>
        </div>
      </div>

      {/* Filter Toolbar - Hidden on Print */}
      <div className="bg-white border border-[#eceef1] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] print:hidden flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#f2f4f7] pb-3">
          <Filter className="h-4 w-4 text-[#0f3d57]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f3d57]">Filters & Sorting</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice # or Patient Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full pr-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            />
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-[#eceef1] rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f3d57]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setPaymentMethod('all');
                setStartDate('');
                setEndDate('');
                setSortBy('date-desc');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-[#f2f4f7]">
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
        
        {filteredInvoices.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#42474d] text-sm gap-2">
            <FileText className="h-8 w-8 text-slate-300" />
            <span>No transactions matching the criteria were found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f7] print:bg-slate-200 text-[#42474d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eceef1]">
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Invoice Number</th>
                  <th className="p-4 font-medium">Patient Name</th>
                  <th className="p-4 font-medium">Payment Method</th>
                  <th className="p-4 font-medium text-right">Total Amount</th>
                  <th className="p-4 font-medium text-right">Net Amount</th>
                  <th className="p-4 font-medium text-right">Total Cost</th>
                  <th className="p-4 font-medium text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#eceef1] text-[#191c1e]">
                {filteredInvoices.map((inv: any) => {
                  const dateStr = inv.created_at 
                    ? new Date(inv.created_at).toLocaleString('en-LK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A';
                  
                  const cost = inv.total_cost ?? (inv.net_amount - inv.net_profit);

                  return (
                    <tr key={inv.id} className="hover:bg-[#f2f4f7]/30 transition-colors print:hover:bg-transparent">
                      <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">{dateStr}</td>
                      <td className="p-4 font-medium text-[#0f3d57] font-mono">{inv.invoice_number}</td>
                      <td className="p-4">{inv.patient_name || <span className="text-slate-400 italic">Walk-in Customer</span>}</td>
                      <td className="p-4">
                        <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-slate-100 font-medium text-slate-700 print:bg-transparent print:p-0">
                          {inv.payment_method}
                        </span>
                      </td>
                      <td className="p-4 text-[#42474d] text-right font-mono">{formatLKR(inv.total_amount)}</td>
                      <td className="p-4 font-semibold text-right font-mono">{formatLKR(inv.net_amount)}</td>
                      <td className="p-4 text-[#42474d] text-right font-mono">{formatLKR(cost)}</td>
                      <td className="p-4 font-semibold text-right text-emerald-600 font-mono">{formatLKR(inv.net_profit)}</td>
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
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>

    </div>
  );
}
