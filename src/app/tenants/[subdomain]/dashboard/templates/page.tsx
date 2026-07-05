'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layout,
  Globe,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Check,
  Loader2,
  Sparkles,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

const TEMPLATE_CARDS = [
  {
    id: 'template-001',
    name: 'Template 001',
    codename: 'Classic Teal',
    description:
      'Clean, professional, and highly readable clinical layout. Tailored for traditional pharmacies prioritizing trust, clear hours, and local mapping structure.',
    features: [
      'Trust Badges',
      'Opening Hours Highlight',
      'Interactive Map',
      'Fully Responsive',
    ],
    color: 'from-teal-600 to-emerald-600',
    textColors: 'text-teal-700',
    bgLight: 'bg-teal-50/50',
    borderColor: 'border-teal-200',
  },
  {
    id: 'template-002',
    name: 'Template 002',
    codename: 'ProHealth Mint',
    description:
      'Patient-centric modern portal displaying categorized public inventory. Ideal for active pharmacies looking to showcase medicine availability to patients beforehand.',
    features: [
      'Real-time Public Inventory Search',
      'Category Filter Badges',
      'Structured Grid Layout',
      'WhatsApp Refills integration',
    ],
    color: 'from-emerald-500 to-teal-500',
    textColors: 'text-emerald-700',
    bgLight: 'bg-emerald-50/50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'template-003',
    name: 'Template 003',
    codename: 'Genex Premium',
    description:
      'Future-focused immersive design utilizing premium iOS 26 liquid glass effects. Features scroll-driven headers adapting between light and dark sections and testimonials.',
    features: [
      'Liquid Glassmorphism Header',
      'Scroll Adaptive Colors',
      'High-Fidelity Visual Elements',
      'Customer Review Carousel',
    ],
    color: 'from-cyan-500 to-teal-500',
    textColors: 'text-cyan-700',
    bgLight: 'bg-cyan-50/50',
    borderColor: 'border-cyan-200',
  },
];

export default function WebsiteTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState('template-001');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch current tenant configuration to check current template_id
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-public', subdomain],
    queryFn: () => apiFetch('/api/tenant/public'),
    enabled: !!subdomain,
  });

  useEffect(() => {
    if (tenant?.template_id) {
      // Map backward compatibility strings to their standard template IDs
      let tid = tenant.template_id.toLowerCase();
      if (tid === 'default') tid = 'template-001';
      if (tid === 'prohealth') tid = 'template-002';
      if (tid === 'genex') tid = 'template-003';
      setSelectedId(tid);
    }
  }, [tenant]);

  // Mutation to update tenant config (including template_id)
  const selectTemplateMutation = useMutation({
    mutationFn: (templateId: string) =>
      apiFetch('/api/tenant/config', {
        method: 'PUT',
        body: JSON.stringify({ template_id: templateId }),
      }),
    onSuccess: () => {
      setSuccess(true);
      // Invalidate queries so the layout header and landing pages refresh their metadata/templates
      queryClient.invalidateQueries({ queryKey: ['tenant-public', subdomain] });
      queryClient.invalidateQueries({ queryKey: ['tenant-public'] });
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.message || 'Failed to update website template selection.'
      );
    },
  });

  const handleConfirmTemplate = () => {
    setErrorMessage('');
    selectTemplateMutation.mutate(selectedId);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-[#72787e] gap-2 font-sans text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f9fc]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0f3d57]/10 text-[#0f3d57] rounded-2xl">
            <Layout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#00273b] font-display">
              Website Templates
            </h1>
            <p className="text-xs text-[#42474d]">
              Choose the primary visual theme and feature set for your
              pharmacy's public website.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const origin = window.location.origin;
              let targetUrl = '';
              if (origin.includes('localhost')) {
                targetUrl = `http://${subdomain}.localhost:3000`;
              } else {
                const cleanDomain = origin.replace(/^https?:\/\//, '').replace(/^[a-z0-9-]+\./, '');
                targetUrl = `https://${subdomain}.${cleanDomain}`;
              }
              window.open(targetUrl, '_blank', 'noreferrer');
            }
          }}
          className="self-start sm:self-auto px-4 py-2 border border-[#0f3d57] text-[#0f3d57] font-semibold hover:bg-[#0f3d57]/5 rounded-xl transition-all text-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Eye size={14} />
          <span>View Public Site</span>
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>
            Website template updated successfully! Your public page has been
            updated.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in shadow-sm">
          <HelpCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {TEMPLATE_CARDS.map((card) => {
          const isSelected = selectedId === card.id;
          const isCurrentlyActive =
            tenant?.template_id?.toLowerCase() === card.id ||
            (card.id === 'template-001' &&
              tenant?.template_id?.toLowerCase() === 'default') ||
            (card.id === 'template-002' &&
              tenant?.template_id?.toLowerCase() === 'prohealth') ||
            (card.id === 'template-003' &&
              tenant?.template_id?.toLowerCase() === 'genex');

          return (
            <div
              key={card.id}
              onClick={() => setSelectedId(card.id)}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer relative flex flex-col ${
                isSelected
                  ? 'border-[#0f3d57] ring-4 ring-[#0f3d57]/5 shadow-md scale-[1.01]'
                  : 'border-[#eceef1] hover:border-[#cbd5e1] hover:shadow-sm'
              }`}
            >
              {/* Header Gradient Strip */}
              <div className={`h-2.5 bg-gradient-to-r ${card.color}`} />

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#00273b]">
                      {card.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {card.codename}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {isCurrentlyActive && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window !== 'undefined') {
                          const origin = window.location.origin;
                          let targetUrl = '';
                          if (origin.includes('localhost')) {
                            targetUrl = `http://${subdomain}.localhost:3000?template=${card.id}`;
                          } else {
                            const cleanDomain = origin.replace(/^https?:\/\//, '').replace(/^[a-z0-9-]+\./, '');
                            targetUrl = `https://${subdomain}.${cleanDomain}?template=${card.id}`;
                          }
                          window.open(targetUrl, '_blank', 'noreferrer');
                        }
                      }}
                      className="text-[10px] text-[#0f3d57] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Eye size={10} />
                      <span>Preview Live</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#42474d] leading-relaxed mb-5">
                  {card.description}
                </p>

                {/* Key Features list */}
                <div className="mt-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Key Features
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={12} className="text-teal-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom selection footer */}
              <div
                className={`px-6 py-4 border-t border-slate-100 flex items-center justify-between transition-colors ${
                  isSelected ? card.bgLight : 'bg-slate-50/50'
                }`}
              >
                <span className="text-xs font-semibold text-slate-500">
                  {isSelected ? 'Selected' : 'Click to select'}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#0f3d57] border-[#0f3d57] text-white shadow-sm'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Actions Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs text-[#00273b]">
              Confirm your template choice
            </h4>
            <p className="text-[10px] text-[#72787e]">
              Confirming will update your pharmacy website instantly to the
              chosen layout.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirmTemplate}
          disabled={
            selectTemplateMutation.isPending ||
            tenant?.template_id?.toLowerCase() === selectedId
          }
          className="w-full sm:w-auto px-6 py-2.5 bg-[#0f3d57] hover:bg-[#0b2b3e] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {selectTemplateMutation.isPending ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Applying Theme...</span>
            </>
          ) : (
            <>
              <span>Confirm & Apply Template</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
