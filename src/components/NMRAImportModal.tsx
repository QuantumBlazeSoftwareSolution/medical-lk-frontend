import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  X,
  Loader2,
  Sparkles,
  Plus,
  Award,
  Globe,
  Database,
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface MasterMedicine {
  id: string;
  generic_name: string;
  brand_name: string;
  dosage?: string;
  pack_size?: string;
  pack_type?: string;
  manufacturer?: string;
  country?: string;
  agent?: string;
  reg_no: string;
  schedule?: string;
  dossier_no?: string;
}

interface NMRAImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: MasterMedicine) => void;
}

export default function NMRAImportModal({
  isOpen,
  onClose,
  onSelectProduct,
}: NMRAImportModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from backend search endpoint
  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useQuery<MasterMedicine[]>({
    queryKey: ['master-medicines-search', searchQuery],
    queryFn: () =>
      apiFetch(
        `/api/inventory/master-medicines?search=${encodeURIComponent(searchQuery)}&limit=15`
      ),
    enabled: searchQuery.length >= 2, // only search if at least 2 chars entered
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-6 animate-fade-in font-sans">
      <div
        className="w-full max-w-4xl bg-[#f8f9ff] text-[#0b1c30] rounded-3xl border border-[#d3e4fe] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#eceef1] flex items-center justify-between bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9e6ff] text-[#00273b] flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#00273b]">
                NMRA Global Drug Catalog
              </h2>
              <p className="text-xs text-[#42474d] mt-0.5">
                Search and import verified pharmaceutical formulations from
                6,688 NMRA entries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f2f4f7] text-[#42474d] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-6 border-b border-[#eceef1] bg-white">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by Brand Name, Generic Name, or NMRA Reg No. (e.g. Paracetamol, Rosuvil, M007131)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-[#f2f4f7] border border-[#e0e3e6] rounded-2xl text-sm focus:outline-none focus:border-[#0f3d57] focus:ring-1 focus:ring-[#0f3d57] transition-all text-[#191c1e] placeholder-slate-400"
              autoFocus
            />
            {(isLoading || isFetching) && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-[#0f3d57]" />
              </div>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchQuery.length < 2 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center max-w-md mx-auto text-[#42474d] gap-3">
              <Sparkles className="h-8 w-8 text-[#006d37] animate-pulse" />
              <p className="text-sm font-semibold text-[#00273b]">
                Type to search the directory
              </p>
              <p className="text-xs text-[#42474d]/80">
                Please enter at least 2 characters of the generic formulation
                name, brand name, or NMRA registration code to begin querying
                the database.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 w-full bg-white border border-[#eceef1] rounded-2xl animate-pulse flex items-center justify-between px-6"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-100 rounded"></div>
                    <div className="h-3 w-64 bg-slate-50 rounded"></div>
                  </div>
                  <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center max-w-md mx-auto text-[#42474d] gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Award className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#00273b]">
                No formulations found
              </p>
              <p className="text-xs text-[#42474d]/80">
                We couldn't find any registered drugs matching "{searchQuery}".
                Please check the spelling or type a generic name.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Found {results.length} registered formulations
              </p>
              {results.map((med) => (
                <div
                  key={med.id}
                  className="bg-white border border-[#eceef1] hover:border-[#c9e6ff] hover:bg-white/95 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] group"
                >
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#00273b] font-display">
                        {med.brand_name}
                      </span>
                      {med.dosage && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#0f3d57] rounded-md">
                          {med.dosage}
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 text-[9px] font-mono font-semibold bg-[#e8f8f5] text-[#00743a] rounded-md"
                        title="NMRA Registration Number"
                      >
                        REG: {med.reg_no}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 line-clamp-1">
                      {med.generic_name}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />{' '}
                        {med.country || 'Unknown Country'}
                      </span>
                      <span>•</span>
                      <span>
                        Mfr: {med.manufacturer || 'Unknown Manufacturer'}
                      </span>
                      {med.pack_size && (
                        <>
                          <span>•</span>
                          <span>Packs: {med.pack_size}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectProduct(med)}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-[#0f3d57] hover:bg-[#0c3045] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Import
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#eceef1] bg-white flex justify-between items-center text-xs text-[#42474d] rounded-b-3xl">
          <span>NMRA Data Version: 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-[#f2f4f7] rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
