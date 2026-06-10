'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, ShoppingBag, AlertTriangle, Calendar, 
  ArrowRight, Sparkles, Loader2, RefreshCw 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function DashboardHome() {
  // 1. Fetch sales KPI metrics
  const { data: summary, isLoading: kpiLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: () => apiFetch('/api/pos/reports/summary'),
  });

  // 2. Fetch stock and expiry alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: () => apiFetch('/api/inventory/alerts'),
  });

  const isLoading = kpiLoading || alertsLoading;

  const handleRefresh = () => {
    refetchKpis();
    refetchAlerts();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <span className="text-sm font-medium">Loading analytics metrics...</span>
      </div>
    );
  }

  // Format currency
  const formatLKR = (val: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(val);
  };

  const lowStockCount = alerts?.low_stock_alerts?.length || 0;
  const nearExpiryCount = alerts?.expiry_alerts?.length || 0;

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Dashboard Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time telemetry of your pharmacy operations.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Revenue */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {formatLKR(summary?.today_revenue || 0)}
          </span>
          <span className="text-[10px] font-bold text-teal-400 bg-teal-500/5 px-2 py-0.5 rounded-full mt-2 inline-block">
            Active POS Sales
          </span>
        </div>

        {/* Monthly Revenue */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {formatLKR(summary?.monthly_revenue || 0)}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full mt-2 inline-block">
            This Month
          </span>
        </div>

        {/* Today's Invoices */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {summary?.today_transactions || 0}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full mt-2 inline-block">
            Transactions
          </span>
        </div>

        {/* Total Invoices */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white block">
            {summary?.total_transactions || 0}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full mt-2 inline-block">
            Overall Invoices
          </span>
        </div>
      </div>

      {/* Warnings & Alerts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <h2 className="font-display font-bold text-lg text-white">Low Stock Warnings</h2>
            <span className="ml-auto text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full">
              {lowStockCount} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {lowStockCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span>All stock levels are optimal.</span>
              </div>
            ) : (
              alerts?.low_stock_alerts?.map((item: any) => (
                <div 
                  key={item.medicine_id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-sm text-white block">{item.name}</span>
                    <span className="text-xs text-slate-500">{item.generic_name || 'Generic Medicine'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">
                      Stock: {item.current_stock}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Min Alert: {item.min_stock_level}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiry Date Alerts */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-red-500 shrink-0" />
            <h2 className="font-display font-bold text-lg text-white">Expiry Warnings</h2>
            <span className="ml-auto text-xs font-bold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full">
              {nearExpiryCount} batches
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {nearExpiryCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span>No batches nearing expiration.</span>
              </div>
            ) : (
              alerts?.expiry_alerts?.map((item: any) => (
                <div 
                  key={item.batch_id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    item.is_expired
                      ? 'bg-red-950/10 border-red-500/20'
                      : 'bg-slate-900/50 border-slate-800/80'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      {item.medicine_name}
                    </span>
                    <span className="text-xs text-slate-500">Batch: {item.batch_number}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold block ${item.is_expired ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                      {item.is_expired ? 'EXPIRED' : `${item.days_left} Days Left`}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.expiry_date}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
