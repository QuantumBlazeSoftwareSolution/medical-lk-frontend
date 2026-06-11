'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Settings, Loader2, Check, User, MapPin, 
  Phone, Mail, Building, Receipt, Percent, 
  Printer, ShieldAlert, AlertTriangle, CheckCircle,
  Globe, Clock, ChevronDown
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function BusinessSettings() {
  // Config states (bound to backend API)
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Local-only settings (mocked configuration fields)
  const [taxRate, setTaxRate] = useState<number>(0);
  const [receiptWidth, setReceiptWidth] = useState<'80mm' | '58mm'>('80mm');
  const [currency, setCurrency] = useState('LKR');
  const [timezone, setTimezone] = useState('Asia/Colombo');
  const [nearExpiryDays, setNearExpiryDays] = useState(30);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. Fetch current settings
  const { data: config, isLoading, refetch } = useQuery<any>({
    queryKey: ['tenant-config'],
    queryFn: () => apiFetch('/api/tenant/public'),
  });

  // Load configurations
  useEffect(() => {
    if (config) {
      setName(config.name || '');
      setCity(config.city || '');
      setAddress(config.contact_address || '');
      setPhone(config.contact_phone || '');
      setEmail(config.contact_email || '');
      setLogoUrl(config.logo_url || '');

      // Load local-only config mockups if saved
      const localPrefs = localStorage.getItem(`pharmacy-prefs-${config.subdomain}`);
      if (localPrefs) {
        try {
          const parsed = JSON.parse(localPrefs);
          if (parsed.taxRate !== undefined) setTaxRate(parsed.taxRate);
          if (parsed.receiptWidth) setReceiptWidth(parsed.receiptWidth);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.timezone) setTimezone(parsed.timezone);
          if (parsed.nearExpiryDays !== undefined) setNearExpiryDays(parsed.nearExpiryDays);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [config]);

  // 2. Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/tenant/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetch();
      if (config?.subdomain) {
        localStorage.setItem(`pharmacy-prefs-${config.subdomain}`, JSON.stringify({
          taxRate,
          receiptWidth,
          currency,
          timezone,
          nearExpiryDays
        }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (err: any) => {
      setSaveError(err.message || 'Failed to save modifications.');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    updateConfigMutation.mutate({
      name: name.trim(),
      city: city.trim() || null,
      contact_address: address.trim() || null,
      contact_phone: phone.trim() || null,
      contact_email: email.trim() || null,
      logo_url: logoUrl.trim() || null
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-outline gap-2 font-sans">
        <Loader2 className="h-6 w-6 animate-spin text-primary-container" />
        <span className="text-xs">Loading settings configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto w-full text-on-background text-left font-sans space-y-ds-lg">
      <div>
        <h2 className="font-display text-headline-lg font-bold text-primary mb-1">Pharmacy Profile &amp; Settings</h2>
        <p className="text-body-sm text-on-surface-variant font-medium">Manage pharmacy business registry information, POS billing defaults, and printers.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-secondary-container/20 border border-secondary/20 text-[#00743a] rounded-xl flex items-center gap-2 font-semibold text-xs">
          <CheckCircle className="h-4.5 w-4.5 text-secondary" /> Settings modifications applied and saved successfully!
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-error-container/30 border border-error/20 text-error rounded-xl flex items-center gap-2 text-xs">
          <AlertTriangle className="h-4.5 w-4.5" /> {saveError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Business Profile Details */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-display text-title-lg font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide flex items-center gap-2">
            <Building size={18} className="text-primary-container" />
            Business Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Pharmacy Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs font-bold text-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Colombo 03"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs font-mono text-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-primary"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Registered Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-primary"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Logo Brand URL</label>
              <input
                type="text"
                placeholder="e.g. https://domain.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-primary font-mono"
              />
            </div>
          </div>
        </section>

        {/* POS & Billing Default Configurations */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-display text-title-lg font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide flex items-center gap-2">
            <Receipt size={18} className="text-primary-container" />
            POS &amp; Receipt Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide flex items-center gap-1">
                <Percent size={12} className="text-outline" />
                Default VAT / Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-right font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide flex items-center gap-1">
                <Printer size={12} className="text-outline" />
                Thermal Receipt Printer Roll
              </label>
              <div className="relative">
                <select
                  value={receiptWidth}
                  onChange={(e) => setReceiptWidth(e.target.value as any)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                >
                  <option value="80mm">80mm standard width rolls</option>
                  <option value="58mm">58mm compact width rolls</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Currency Unit</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs font-bold font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide flex items-center gap-1">
                <Clock size={12} className="text-outline" />
                Inventory Near-Expiry Warning
              </label>
              <input
                type="number"
                min="5"
                max="365"
                value={nearExpiryDays}
                onChange={(e) => setNearExpiryDays(Number(e.target.value) || 30)}
                className="w-full px-3 py-2 bg-background border border-outline-variant rounded-lg focus:border-primary outline-none text-xs text-right font-mono"
              />
              <span className="text-[10px] text-outline mt-0.5">Alert matches batches expiring within this many days.</span>
            </div>
          </div>
        </section>

        {/* System & Localization Preferences */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-display text-title-lg font-bold text-primary border-b border-outline-variant/30 pb-2 uppercase tracking-wide flex items-center gap-2">
            <Globe size={18} className="text-primary-container" />
            System &amp; Timezone
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">System Timezone</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-3 py-2 pr-10 outline-none text-xs appearance-none cursor-pointer"
                >
                  <option value="Asia/Colombo">Asia/Colombo (GMT+05:30)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+05:30)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Submit Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={updateConfigMutation.isPending}
            className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {updateConfigMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check size={14} /> Save Config
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
