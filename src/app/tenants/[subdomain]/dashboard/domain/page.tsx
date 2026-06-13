'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Link2, Globe, ShieldCheck, CheckCircle2, 
  HelpCircle, Server, Copy, Check, Loader2, Info
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function DomainPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [customDomain, setCustomDomain] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const requestDomainMutation = useMutation({
    mutationFn: (payload: { subject: string; category: string; message: string }) =>
      apiFetch('/api/support/ticket', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      setSuccess(true);
      setCustomDomain('');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTimeout(() => setSuccess(false), 8000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to submit domain request.');
    }
  });

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!customDomain.trim()) {
      setFormError('Please enter a valid domain name.');
      return;
    }
    
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(customDomain.trim())) {
      setFormError('Please enter a valid domain format (e.g. pharmacy.lk).');
      return;
    }

    requestDomainMutation.mutate({
      subject: `[Custom Domain Request] ${customDomain.trim()}`,
      category: 'Billing & Subscriptions',
      message: `Please map the custom domain: "${customDomain.trim()}" to my pharmacy subdomain: "${subdomain}.medical.lk".`
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f7f9fc]">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#0f3d57]/10 text-[#0f3d57] rounded-2xl">
          <Link2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#00273b] font-display">Domain Settings</h1>
          <p className="text-xs text-[#42474d]">Configure your pharmacy's custom domain name or subdomain settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Subdomain & Domain Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subdomain Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm">
            <h2 className="font-display font-bold text-sm text-[#00273b] mb-1 flex items-center gap-2">
              <Globe size={16} className="text-[#0f3d57]" />
              <span>Default System Subdomain</span>
            </h2>
            <p className="text-[11px] text-[#72787e] mb-4">Your pharmacy is accessible by default via our shared platform domain.</p>
            
            <div className="p-4 bg-[#f8f9fa] rounded-xl border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Subdomain</p>
                <p className="text-sm font-bold text-[#0f3d57] mt-0.5">{subdomain}.medical.lk</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={10} /> SSL Active
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(`http://${subdomain}.localhost:3000`, 'subdomain')}
                  className="p-2 border border-slate-200 hover:bg-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                  title="Copy link"
                >
                  {copiedField === 'subdomain' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Domain Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm">
            <h2 className="font-display font-bold text-sm text-[#00273b] mb-1 flex items-center gap-2">
              <Link2 size={16} className="text-[#0f3d57]" />
              <span>Connect a Custom Domain</span>
            </h2>
            <p className="text-[11px] text-[#72787e] mb-4">Point your own custom branding domain (e.g. mypharmacy.lk) to our servers.</p>

            {success && (
              <div className="p-4 mb-5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Domain connected successfully!</p>
                  <p className="mt-0.5">Please allow up to 24-48 hours for DNS propagation and SSL certificate provisioning.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveDomain} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">Custom Domain Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. royalpharmacy.lk"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 bg-white border border-[#d2d5d8] rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-[#0f3d57] transition-all"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 font-bold text-white bg-[#0f3d57] hover:bg-[#00273b] rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </form>

            {/* DNS settings table */}
            <div className="mt-6 pt-5 border-t border-[#eceef1]">
              <h3 className="text-xs font-bold text-[#00273b] mb-3 flex items-center gap-1.5">
                <Server size={14} className="text-[#72787e]" />
                <span>Required DNS Configuration</span>
              </h3>
              <p className="text-[11px] text-[#72787e] mb-4 leading-normal">
                To connect your custom domain, log in to your domain registrar (e.g. GoDaddy, Namecheap) and add the following records to your DNS settings:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#f8f9fa] text-slate-500 text-left border-b border-[#eceef1]">
                      <th className="p-2.5 font-bold uppercase tracking-wider">Type</th>
                      <th className="p-2.5 font-bold uppercase tracking-wider">Host / Name</th>
                      <th className="p-2.5 font-bold uppercase tracking-wider">Value / Destination</th>
                      <th className="p-2.5 font-bold uppercase tracking-wider text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceef1]">
                    <tr>
                      <td className="p-2.5 font-bold text-[#00273b]">A Record</td>
                      <td className="p-2.5 font-mono text-slate-600">@</td>
                      <td className="p-2.5 font-mono text-slate-600 flex items-center gap-1.5 justify-between">
                        <span>76.76.21.21</span>
                        <button onClick={() => handleCopy('76.76.21.21', 'dnsA')} className="text-outline hover:text-slate-600 cursor-pointer">
                          {copiedField === 'dnsA' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </td>
                      <td className="p-2.5 text-right text-slate-400">Automatic</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#00273b]">CNAME</td>
                      <td className="p-2.5 font-mono text-slate-600">www</td>
                      <td className="p-2.5 font-mono text-slate-600 flex items-center gap-1.5 justify-between">
                        <span>cname.medical.lk</span>
                        <button onClick={() => handleCopy('cname.medical.lk', 'dnsCNAME')} className="text-outline hover:text-slate-600 cursor-pointer">
                          {copiedField === 'dnsCNAME' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </td>
                      <td className="p-2.5 text-right text-slate-400">Automatic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Instructions & FAQs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm">
            <h2 className="font-display font-bold text-sm text-[#00273b] mb-4 flex items-center gap-2">
              <HelpCircle size={16} className="text-[#0f3d57]" />
              <span>FAQ / Help Desk</span>
            </h2>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#00273b] mb-1">What is DNS propagation?</h4>
                <p className="text-[11px] text-[#72787e] leading-relaxed">
                  DNS updates can take up to 24-48 hours to update worldwide, though in most cases it happens in less than an hour.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#00273b] mb-1">How is the SSL certificate generated?</h4>
                <p className="text-[11px] text-[#72787e] leading-relaxed">
                  Once your DNS records point correctly to our server IP, the platform automatically provisions a free Let's Encrypt SSL certificate for you.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex gap-2.5 text-blue-800 text-[11px] leading-relaxed">
                <Info size={16} className="shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-bold">Need help?</p>
                  <p className="mt-0.5">If you're having trouble configuring custom domains, feel free to open a ticket in the Technical Support section.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
