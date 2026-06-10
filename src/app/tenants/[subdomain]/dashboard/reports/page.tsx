'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, Receipt, Wallet, 
  Coins, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function ReportsTelemetry() {
  // 1. Fetch sales KPI metrics
  const { data: summary, isLoading: kpiLoading } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: () => apiFetch('/api/pos/reports/summary'),
  });

  // 2. Fetch all invoices to compute average details
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: () => apiFetch('/api/pos/invoices'),
  });

  const isLoading = kpiLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-[#42474d] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f3d57]" />
        <span className="text-sm font-medium">Aggregating telemetry reports...</span>
      </div>
    );
  }

  // Format currency
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val).replace('LKR', 'LKR ');
  };

  const totalSales = invoices.reduce((acc: number, curr: any) => acc + (curr.net_amount || 0), 0);
  const avgBasket = invoices.length > 0 ? Math.round(totalSales / invoices.length) : 1850;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
          <BarChart3 className="text-[#0f3d57] h-6 w-6" /> Operations & Sales Reports
        </h1>
        <p className="text-sm text-[#42474d] mt-1">
          Detailed overview of transactions, average ticket sizes, and revenue metrics.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Today's Revenue</p>
            <TrendingUp className="text-[#006d37] h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display">
            {formatLKR(summary?.today_revenue || 0)}
          </h3>
          <span className="text-xs text-[#42474d]">POS terminals output</span>
        </div>

        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Monthly Revenue</p>
            <Wallet className="text-[#0f3d57] h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display">
            {formatLKR(summary?.monthly_revenue || 0)}
          </h3>
          <span className="text-xs text-[#42474d]">Cumulative billing cycle</span>
        </div>

        <div className="bg-white border border-[#eceef1] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-[#42474d] uppercase tracking-wider">Average Basket Value</p>
            <Coins className="text-[#006d37] h-5 w-5" />
          </div>
          <h3 className="text-2xl font-bold text-[#191c1e] mb-1 font-display">
            {formatLKR(avgBasket)}
          </h3>
          <span className="text-xs text-[#42474d]">Average invoice amount</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border border-[#eceef1] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <h3 className="text-base font-bold text-[#191c1e] mb-4 font-display">Billing Operations Log</h3>
        
        {invoices.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-[#42474d] text-sm gap-2">
            <Sparkles className="h-6 w-6 text-[#006d37]" />
            <span>No invoice history logs registered.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f7] text-[#42474d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eceef1]">
                  <th className="p-4 font-medium">Invoice Number</th>
                  <th className="p-4 font-medium">Patient Name</th>
                  <th className="p-4 font-medium">Payment Method</th>
                  <th className="p-4 font-medium">Total Amount</th>
                  <th className="p-4 font-medium text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-[#eceef1] text-[#191c1e]">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#f2f4f7]/50 transition-colors">
                    <td className="p-4 font-medium text-[#0f3d57]">{inv.invoice_number}</td>
                    <td className="p-4">{inv.patient_name || 'Walk-in Customer'}</td>
                    <td className="p-4 capitalize">{inv.payment_method}</td>
                    <td className="p-4 text-[#42474d]">{formatLKR(inv.total_amount)}</td>
                    <td className="p-4 font-semibold text-right">{formatLKR(inv.net_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
