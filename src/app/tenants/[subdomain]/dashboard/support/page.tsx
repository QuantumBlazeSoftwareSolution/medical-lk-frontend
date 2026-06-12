'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LifeBuoy, Loader2, Send, CheckCircle2, 
  AlertCircle, History, MessageSquare, Clock, ShieldAlert
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function SupportPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('POS Issue');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. Fetch support tickets history
  const { data: tickets = [], isLoading } = useQuery<any[]>({
    queryKey: ['support-tickets'],
    queryFn: () => apiFetch('/api/support/tickets'),
  });

  // 2. Submit ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: (newTicket: { subject: string; category: string; message: string }) =>
      apiFetch('/api/support/ticket', {
        method: 'POST',
        body: JSON.stringify(newTicket),
      }),
    onSuccess: () => {
      setSuccess(true);
      setSubject('');
      setMessage('');
      setCategory('POS Issue');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to submit support ticket.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!subject.trim()) {
      setFormError('Please enter a ticket subject.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please describe the issue in detail.');
      return;
    }

    submitTicketMutation.mutate({
      subject: subject.trim(),
      category,
      message: message.trim(),
    });
  };

  const categories = [
    'POS Issue',
    'Inventory & Stock',
    'Billing & Subscriptions',
    'Bug / System Glitch',
    'Feature Request',
    'General Question'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f7f9fc]">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#0f3d57]/10 text-[#0f3d57] rounded-2xl">
          <LifeBuoy className="h-6 w-6 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#00273b] font-display">Technical Support</h1>
          <p className="text-xs text-[#42474d]">Submit issue tickets directly to the Quantum Blaze support team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Create Ticket Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm flex flex-col justify-between h-fit">
          <div>
            <h2 className="font-display font-bold text-sm text-[#00273b] mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#0f3d57]" />
              <span>File a Support Ticket</span>
            </h2>

            {success && (
              <div className="p-4 mb-5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ticket Submitted successfully!</p>
                  <p className="mt-0.5">We have emailed the support request to our developers. We will get back to you shortly.</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="p-4 mb-5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#d2d5d8] rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-[#0f3d57] transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">Subject / Short Title</label>
                <input
                  type="text"
                  placeholder="Briefly summarize the problem"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-[#d2d5d8] rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-[#0f3d57] transition-all"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">Detailed Message</label>
                <textarea
                  placeholder="Describe the issue in detail. If it is a POS issue, please state the receipt or transaction number."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-[#d2d5d8] rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-[#0f3d57] transition-all min-h-[150px] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitTicketMutation.isPending}
                className="w-full py-3 inline-flex items-center justify-center gap-2 font-bold text-white bg-[#0f3d57] hover:bg-[#00273b] rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
              >
                {submitTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={13} /> Submit Issue
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-5 border-t border-[#eceef1] text-[10px] text-[#72787e] leading-normal space-y-2.5">
            <p className="flex gap-2 items-start">
              <ShieldAlert size={12} className="shrink-0 text-amber-500 mt-0.5" />
              <span>This ticket is saved on the secure database and copied directly to Quantum Blaze developer engineers.</span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket History */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm flex flex-col">
          <h2 className="font-display font-bold text-sm text-[#00273b] mb-4 flex items-center gap-2">
            <History size={16} className="text-[#0f3d57]" />
            <span>Ticket Submission History</span>
          </h2>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#72787e] text-xs gap-2 min-h-[300px]">
              <Loader2 className="h-6 w-6 animate-spin text-[#0f3d57]" />
              <span>Loading ticket archive...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#72787e] text-center border-2 border-dashed border-[#eceef1] rounded-2xl min-h-[300px]">
              <LifeBuoy size={36} className="text-slate-300 mb-3" />
              <p className="text-xs font-bold text-[#00273b]">No tickets submitted yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">If you experience any POS, stock checkout, or hosting issues, file a ticket on the left.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {tickets.map((t: any) => {
                const badgeColors: Record<string, string> = {
                  open: 'bg-amber-50 text-amber-700 border-amber-200',
                  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };
                
                return (
                  <div key={t.id} className="p-4 rounded-xl border border-[#eceef1] hover:border-[#d2d5d8] bg-white transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded uppercase font-mono">
                          #{t.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                          {t.category}
                        </span>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColors[t.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#00273b] mb-1">{t.subject}</h3>
                    <p className="text-[11px] text-[#42474d] leading-relaxed mb-3 whitespace-pre-wrap">{t.message}</p>

                    <div className="flex items-center justify-between text-[9px] text-[#72787e] pt-2.5 border-t border-[#f7f9fc]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {new Date(t.created_at).toLocaleString()}
                      </span>
                      <span>
                        Filed by: <strong>{t.submitted_by}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
