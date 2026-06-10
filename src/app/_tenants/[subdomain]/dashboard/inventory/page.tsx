'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Package, Plus, Loader2, AlertCircle, Calendar, 
  Layers, Tag, DollarSign, Activity 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState<'medicines' | 'batches'>('medicines');
  const [showAddMedicine, setShowAddMedicine] = useState(false);

  // Form states
  const [medName, setMedName] = useState('');
  const [medGeneric, setMedGeneric] = useState('');
  const [medBarcode, setMedBarcode] = useState('');
  const [medCategory, setMedCategory] = useState('Tablet');
  const [medMinStock, setMedMinStock] = useState(10);
  const [formError, setFormError] = useState('');

  // 1. Fetch medicines
  const { data: medicines = [], isLoading: medicinesLoading, refetch: refetchMedicines } = useQuery<any[]>({
    queryKey: ['medicines-list'],
    queryFn: () => apiFetch('/api/inventory/medicines'),
  });

  // 2. Fetch batches
  const { data: batches = [], isLoading: batchesLoading } = useQuery<any[]>({
    queryKey: ['batches-all'],
    queryFn: () => apiFetch('/api/inventory/batches?only_in_stock=false'),
  });

  // 3. Create medicine mutation
  const createMedicineMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/inventory/medicines', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetchMedicines();
      setShowAddMedicine(false);
      // reset form
      setMedName('');
      setMedGeneric('');
      setMedBarcode('');
      setMedCategory('Tablet');
      setMedMinStock(10);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create medicine.');
    }
  });

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!medName.trim()) return;

    createMedicineMutation.mutate({
      name: medName.trim(),
      generic_name: medGeneric.trim() || null,
      barcode: medBarcode.trim() || null,
      category: medCategory,
      min_stock_level: medMinStock
    });
  };

  const isLoading = activeTab === 'medicines' ? medicinesLoading : batchesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Inventory & Batches</h1>
          <p className="text-sm text-slate-400 mt-1">Manage medicines catalog and track batch stocks.</p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setShowAddMedicine(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-sm font-semibold text-slate-950 transition-all cursor-pointer shadow-lg shadow-teal-500/10"
        >
          <Plus className="h-4.5 w-4.5" /> Add Medicine
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-950 gap-4">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'medicines'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Medicine Catalog ({medicines.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'batches'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Batches ({batches.length})
        </button>
      </div>

      {/* Main List Container */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            <span>Loading inventory directory...</span>
          </div>
        ) : activeTab === 'medicines' ? (
          /* MEDICINES DIRECTORY */
          medicines.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 text-sm">
              <Package className="h-8 w-8 text-slate-700" />
              <span>No medicines added yet. Register items to get started.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-semibold">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 px-4">Generic Name</th>
                    <th className="pb-3 px-4">Category</th>
                    <th className="pb-3 px-4">Barcode</th>
                    <th className="pb-3 pl-4 text-right">Min Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {medicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-3.5 pr-4 font-semibold text-white">{med.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{med.generic_name || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase tracking-wider">
                          {med.category || 'Tablet'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{med.barcode || '-'}</td>
                      <td className="py-3.5 pl-4 text-right font-semibold text-slate-400">{med.min_stock_level} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* BATCHES DIRECTORY */
          batches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 text-sm">
              <AlertCircle className="h-8 w-8 text-slate-700" />
              <span>No stock batches have been logged. Register a GRN to add stock.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-semibold">
                    <th className="pb-3 pr-4">Medicine</th>
                    <th className="pb-3 px-4">Batch Number</th>
                    <th className="pb-3 px-4">Expiry</th>
                    <th className="pb-3 px-4 text-right">Cost Price</th>
                    <th className="pb-3 px-4 text-right">Sale Price</th>
                    <th className="pb-3 pl-4 text-right">Qty Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-3.5 pr-4">
                        <span className="font-semibold text-white block">{b.medicine_name}</span>
                        <span className="text-[10px] text-slate-500">{b.generic_name || 'Generic'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{b.batch_number}</td>
                      <td className="py-3.5 px-4">
                        <span className={`flex items-center gap-1.5 text-xs ${b.is_expired ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{b.expiry_date}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">LKR {b.purchase_price.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-teal-400 font-bold">LKR {b.selling_price.toFixed(2)}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <span className={`font-mono font-bold ${b.quantity_remaining <= 10 ? 'text-red-400 bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/10' : 'text-slate-100'}`}>
                          {b.quantity_remaining} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-6">
              <Package className="h-5 w-5 text-teal-400" />
              <h3 className="text-xl font-bold text-white">Add New Medicine</h3>
            </div>

            {formError && (
              <div className="p-4 mb-6 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Generic Formula
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol"
                  value={medGeneric}
                  onChange={(e) => setMedGeneric(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="Scan / Type"
                    value={medBarcode}
                    onChange={(e) => setMedBarcode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm text-slate-300"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Low Stock Alert Level
                </label>
                <input
                  type="number"
                  value={medMinStock}
                  onChange={(e) => setMedMinStock(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono text-right"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMedicine(false)}
                  className="flex-1 py-3 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMedicineMutation.isPending}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {createMedicineMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Add Medicine'
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
