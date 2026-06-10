'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Users, Plus, Search, Loader2, AlertCircle, 
  ShieldAlert, ShieldCheck, Heart, Phone, Mail, Check 
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
  const { data: patients = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['patients-list', searchQuery],
    queryFn: () => {
      const endpoint = searchQuery.trim() 
        ? `/api/patients/search?query=${encodeURIComponent(searchQuery.trim())}`
        : '/api/patients';
      return apiFetch(endpoint);
    }
  });

  // 2. Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/patients', {
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
    }
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
      medical_history: history.trim() || null
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white flex items-center gap-3">
            Patients Directory 
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> AES-256 Encrypted
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Store patient records securely. Medical histories and details are encrypted at rest.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowAddPatient(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-sm font-semibold text-slate-950 transition-all cursor-pointer shadow-lg shadow-teal-500/10"
        >
          <Plus className="h-4.5 w-4.5" /> Register Patient
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search encrypted patient names or phone numbers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-teal-500/50 outline-none text-sm text-slate-100 placeholder:text-slate-500"
        />
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
      </div>

      {/* Patients List Grid */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 min-h-[350px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            <span>Decrypting patient directory records...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 text-sm text-center max-w-sm mx-auto">
            <Users className="h-8 w-8 text-slate-700" />
            <span className="font-semibold text-slate-400">No patients registered</span>
            <span className="text-xs text-slate-500">
              {searchQuery ? "No matches found. Try searching by correct full name or phone code." : "Add recurring patients to keep track of their medication cycles and histories."}
            </span>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {patients.map((pat) => (
              <div 
                key={pat.id}
                className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col justify-between hover:border-teal-500/20 transition-all relative overflow-hidden"
              >
                <div>
                  <h3 className="font-display font-bold text-base text-white">{pat.name}</h3>
                  <div className="flex flex-col gap-2 text-xs text-slate-400 mt-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>{pat.phone}</span>
                    </div>
                    {pat.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <span>{pat.email}</span>
                      </div>
                    )}
                  </div>

                  {pat.medical_history && (
                    <div className="mt-4 pt-4 border-t border-slate-900">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mb-1">
                        Medical / Prescription History
                      </span>
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-900 leading-relaxed max-h-24 overflow-y-auto font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-6">
              <Users className="h-5 w-5 text-teal-400" />
              <h3 className="text-xl font-bold text-white">Register Patient Profile</h3>
            </div>

            {formError && (
              <div className="p-4 mb-6 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ruwan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Medical Notes / Diagnosis / History
                </label>
                <textarea
                  placeholder="e.g. Diabetic type 2, allergic to Penicillin."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm h-24 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 py-3 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {createPatientMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Register Profile <Check className="h-4 w-4" />
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
