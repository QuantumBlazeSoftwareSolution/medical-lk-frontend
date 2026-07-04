'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Phone,
  Mail,
  Check,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function PatientsDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [history, setHistory] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Fetch patients (uses search query if typed, else lists all)
  const {
    data: patients = [],
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['patients-list', searchQuery],
    queryFn: () => {
      const endpoint = searchQuery.trim()
        ? `/api/patients/search?query=${encodeURIComponent(searchQuery.trim())}`
        : '/api/patients';
      return apiFetch(endpoint);
    },
  });

  // 2. Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      refetch();
      setShowAddPatient(false);
      setName('');
      setPhone('');
      setEmail('');
      setHistory('');
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to register patient profile.');
    },
  });

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim()) {
      setFormError('Name and phone fields are required.');
      return;
    }

    createPatientMutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      medical_history: history.trim() || null,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f7f9fc] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-[#00273b] flex items-center gap-3">
            Patients Directory
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> AES-256 Encrypted
            </span>
          </h1>
          <p className="text-xs text-[#42474d] mt-1">
            Store patient records securely. Medical histories and details are
            encrypted at rest.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowAddPatient(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f3d57] hover:bg-[#00273b] text-xs font-bold text-white transition-all active:scale-[0.98] cursor-pointer shadow-sm uppercase tracking-wide"
        >
          <Plus className="h-4 w-4" /> Register Patient
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search encrypted patient names or phone numbers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#d2d5d8] rounded-xl focus:border-[#0f3d57] outline-none text-xs text-[#00273b] placeholder:text-[#72787e] shadow-sm transition-all"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#72787e]" />
      </div>

      {/* Patients List Grid */}
      <div className="bg-white p-6 rounded-2xl border border-[#eceef1] shadow-sm min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#72787e] gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#0f3d57]" />
            <span className="text-xs">
              Decrypting patient directory records...
            </span>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#72787e] gap-3 text-center max-w-sm mx-auto py-12">
            <div className="p-4 bg-[#0f3d57]/5 rounded-2xl text-[#0f3d57]">
              <Users className="h-8 w-8" />
            </div>
            <span className="font-display font-bold text-sm text-[#00273b]">
              No patients registered
            </span>
            <span className="text-xs text-[#72787e] leading-relaxed">
              {searchQuery
                ? 'No matches found. Try searching by correct full name or phone number.'
                : 'Add recurring patients to keep track of their medication cycles and histories.'}
            </span>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-6 rounded-2xl bg-white border border-[#eceef1] hover:border-[#0f3d57]/30 hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-[#eceef1] pb-3 mb-4">
                    <h3 className="font-display font-bold text-sm text-[#00273b]">
                      {pat.name}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                      <ShieldCheck size={10} /> Secure
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-[#42474d]">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#72787e]" />
                      <span className="font-mono">{pat.phone}</span>
                    </div>
                    {pat.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#72787e]" />
                        <span>{pat.email}</span>
                      </div>
                    )}
                  </div>

                  {pat.medical_history && (
                    <div className="mt-4 pt-4 border-t border-[#eceef1]">
                      <span className="text-[10px] font-bold text-[#72787e] uppercase block tracking-wider mb-1.5">
                        Medical & Prescription History
                      </span>
                      <p className="text-xs text-[#42474d] bg-[#f8f9fa] p-3.5 rounded-xl border border-[#eceef1] leading-relaxed max-h-24 overflow-y-auto font-mono">
                        {pat.medical_history}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00273b]/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#eceef1] rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-[#eceef1] pb-4 mb-6">
              <div className="p-2 bg-[#0f3d57]/10 text-[#0f3d57] rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#00273b] font-display">
                  Register Patient Profile
                </h3>
                <p className="text-[10px] text-[#72787e]">
                  Create a new secure, encrypted record
                </p>
              </div>
            </div>

            {formError && (
              <div className="p-4 mb-6 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d2d5d8] rounded-xl focus:border-[#0f3d57] outline-none text-xs text-[#00273b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d2d5d8] rounded-xl focus:border-[#0f3d57] outline-none text-xs text-[#00273b] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ruwan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d2d5d8] rounded-xl focus:border-[#0f3d57] outline-none text-xs text-[#00273b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1.5">
                  Medical Notes / Diagnosis / History
                </label>
                <textarea
                  placeholder="e.g. Diabetic type 2, allergic to Penicillin."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d2d5d8] rounded-xl focus:border-[#0f3d57] outline-none text-xs text-[#00273b] h-24 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#eceef1] mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 py-2.5 border border-[#d2d5d8] rounded-xl text-xs font-bold text-[#42474d] hover:bg-[#f8f9fa] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="flex-1 py-2.5 bg-[#0f3d57] hover:bg-[#00273b] text-white font-bold rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 uppercase tracking-wider disabled:bg-[#72787e]/60"
                >
                  {createPatientMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Register Profile <Check className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
