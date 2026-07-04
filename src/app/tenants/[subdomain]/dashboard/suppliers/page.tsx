'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Check,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function SuppliersDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Fetch suppliers
  const {
    data: suppliers = [],
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: ['suppliers-list'],
    queryFn: () => apiFetch('/api/inventory/suppliers'),
  });

  // 2. Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/inventory/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      refetch();
      setShowAddSupplier(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to register supplier profile.');
    },
  });

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Supplier Name is required.');
      return;
    }

    createSupplierMutation.mutate({
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
    });
  };

  // Filter local search results
  const filteredSuppliers = suppliers.filter((sup: any) => {
    const term = searchQuery.toLowerCase();
    return (
      sup.name?.toLowerCase().includes(term) ||
      sup.phone?.toLowerCase().includes(term) ||
      sup.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#191c1e]">
            Suppliers Registry
          </h1>
          <p className="text-sm text-[#42474d] mt-1">
            Manage your wholesale medicine suppliers and distributors.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowAddSupplier(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#006d37] text-white text-sm font-semibold rounded-lg hover:bg-[#006d37]/90 transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
        >
          <Plus className="h-4.5 w-4.5" /> Register Supplier
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search suppliers by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#eceef1] rounded-xl focus:outline-none focus:border-[#0f3d57] focus:ring-1 focus:ring-[#0f3d57] text-sm text-[#191c1e] placeholder:text-[#42474d]/50"
        />
        <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#42474d]/50" />
      </div>

      {/* Suppliers List Container */}
      <div className="rounded-2xl border border-[#eceef1] bg-white p-6 min-h-[350px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#42474d] gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#0f3d57]" />
            <span>Fetching supplier records...</span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#42474d] gap-2 text-sm text-center max-w-sm mx-auto">
            <Building2 className="h-8 w-8 text-[#42474d]/30" />
            <span className="font-semibold text-[#191c1e]">
              No suppliers registered
            </span>
            <span className="text-xs text-[#42474d]">
              {searchQuery
                ? 'No matches found. Try another search term.'
                : 'Register suppliers to associate with stock batches and Good Received Notes (GRN).'}
            </span>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredSuppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-5 rounded-xl border border-[#eceef1] flex flex-col justify-between hover:border-[#0f3d57]/30 transition-all bg-[#f7f9fc]"
              >
                <div>
                  <h3 className="font-display font-bold text-base text-[#191c1e]">
                    {sup.name}
                  </h3>
                  <div className="flex flex-col gap-2 text-xs text-[#42474d] mt-4">
                    {sup.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[#0f3d57]" />
                        <span>{sup.phone}</span>
                      </div>
                    )}
                    {sup.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#0f3d57]" />
                        <span>{sup.email}</span>
                      </div>
                    )}
                    {sup.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#0f3d57]" />
                        <span>{sup.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#eceef1] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#eceef1] pb-4 mb-6">
              <Building2 className="h-5 w-5 text-[#0f3d57]" />
              <h3 className="text-lg font-bold text-[#191c1e]">
                Register Supplier Profile
              </h3>
            </div>

            {formError && (
              <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blaze Pharmacy Wholesalers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm text-[#191c1e]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0112345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm text-[#191c1e]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. supply@blaze.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm text-[#191c1e]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#42474d] uppercase tracking-wide mb-1">
                  Physical Address
                </label>
                <textarea
                  placeholder="e.g. 45, Galle Road, Colombo 03"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg focus:outline-none focus:border-[#0f3d57] text-sm h-20 resize-none text-[#191c1e]"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#eceef1] mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 py-2 border border-[#c2c7cd] rounded-lg text-sm font-semibold text-[#42474d] hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                  className="flex-1 py-2 bg-[#006d37] hover:bg-[#006d37]/90 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {createSupplierMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Register <Check className="h-4 w-4" />
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
