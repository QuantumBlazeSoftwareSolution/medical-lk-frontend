'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FileInput, Plus, Loader2, AlertCircle, Calendar, 
  Trash2, UserPlus, Sparkles, Check 
} from 'lucide-react';
import { apiFetch } from '@/utils/api';

interface GRNRow {
  medicine_id: string;
  batch_number: string;
  quantity_received: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
}

export default function GoodsReceivedNotes() {
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  
  // New GRN states
  const [grnNumber, setGrnNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [grnRows, setGrnRows] = useState<GRNRow[]>([
    { medicine_id: '', batch_number: '', quantity_received: 1, purchase_price: 0, selling_price: 0, expiry_date: '' }
  ]);
  const [grnError, setGrnError] = useState('');

  // Add Supplier modal states
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierError, setSupplierError] = useState('');

  // 1. Fetch GRN history
  const { data: grns = [], isLoading: grnsLoading, refetch: refetchGrns } = useQuery<any[]>({
    queryKey: ['grns-list'],
    queryFn: () => apiFetch('/api/inventory/grns'),
  });

  // 2. Fetch suppliers
  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery<any[]>({
    queryKey: ['suppliers-list'],
    queryFn: () => apiFetch('/api/inventory/suppliers'),
  });

  // 3. Fetch medicines catalog
  const { data: medicines = [] } = useQuery<any[]>({
    queryKey: ['medicines-catalog'],
    queryFn: () => apiFetch('/api/inventory/medicines'),
  });

  // 4. Create Supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetchSuppliers();
      setShowAddSupplier(false);
      setSupplierName('');
      setSupplierPhone('');
      setSupplierEmail('');
      setSupplierAddress('');
    },
    onError: (err: any) => {
      setSupplierError(err.message || 'Failed to register supplier.');
    }
  });

  // 5. Create GRN mutation
  const createGRNMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/inventory/grns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      refetchGrns();
      setActiveTab('history');
      // Reset form
      setGrnNumber('');
      setSelectedSupplierId('');
      setGrnRows([
        { medicine_id: '', batch_number: '', quantity_received: 1, purchase_price: 0, selling_price: 0, expiry_date: '' }
      ]);
    },
    onError: (err: any) => {
      setGrnError(err.message || 'Failed to submit Goods Received Note.');
    }
  });

  // Handle supplier submit
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError('');
    if (!supplierName.trim()) return;

    createSupplierMutation.mutate({
      name: supplierName.trim(),
      phone: supplierPhone.trim() || null,
      email: supplierEmail.trim() || null,
      address: supplierAddress.trim() || null
    });
  };

  // Add row to items builder
  const addRow = () => {
    setGrnRows([...grnRows, { medicine_id: '', batch_number: '', quantity_received: 1, purchase_price: 0, selling_price: 0, expiry_date: '' }]);
  };

  // Remove row
  const removeRow = (idx: number) => {
    if (grnRows.length === 1) return;
    setGrnRows(grnRows.filter((_, i) => i !== idx));
  };

  // Update row field
  const updateRowField = (idx: number, field: keyof GRNRow, value: any) => {
    const updated = [...grnRows];
    updated[idx] = { ...updated[idx], [field]: value };
    setGrnRows(updated);
  };

  // Calculate sum of cost price * quantities
  const totalCalculatedValue = grnRows.reduce((sum, r) => sum + (r.purchase_price * r.quantity_received), 0);

  // Submit GRN
  const handleGRNSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGrnError('');

    if (!selectedSupplierId) {
      setGrnError('Please select a supplier.');
      return;
    }

    if (!grnNumber.trim()) {
      setGrnError('Please input a GRN reference code.');
      return;
    }

    // Validate rows
    for (let i = 0; i < grnRows.length; i++) {
      const r = grnRows[i];
      if (!r.medicine_id) {
        setGrnError(`Row ${i + 1}: Medicine must be selected.`);
        return;
      }
      if (!r.batch_number.trim()) {
        setGrnError(`Row ${i + 1}: Batch number is required.`);
        return;
      }
      if (!r.expiry_date) {
        setGrnError(`Row ${i + 1}: Expiry date must be set.`);
        return;
      }
    }

    createGRNMutation.mutate({
      grn_number: grnNumber.trim(),
      supplier_id: selectedSupplierId,
      total_amount: totalCalculatedValue,
      items: grnRows
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">Goods Received Notes (GRN)</h1>
          <p className="text-sm text-slate-400 mt-1">Receive batch inventory and log supplier notes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-950 gap-4">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          GRN History Logs ({grns.length})
        </button>
        <button
          onClick={() => {
            setGrnError('');
            setActiveTab('new');
          }}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'new'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Record Stock Entry (New GRN)
        </button>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 min-h-[400px] flex flex-col">
        {activeTab === 'history' ? (
          /* GRN LOGS TAB */
          grnsLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
              <span>Fetching GRN logbooks...</span>
            </div>
          ) : grns.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 text-sm">
              <FileInput className="h-8 w-8 text-slate-700" />
              <span>No Goods Received Notes logged yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-semibold">
                    <th className="pb-3 pr-4">GRN Number</th>
                    <th className="pb-3 px-4">Supplier</th>
                    <th className="pb-3 px-4">Received Date</th>
                    <th className="pb-3 pl-4 text-right">Invoice Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {grns.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-3.5 pr-4 font-mono font-semibold text-white">{g.grn_number}</td>
                      <td className="py-3.5 px-4 text-slate-400">{g.supplier_name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {new Date(g.received_date).toLocaleString()}
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono font-bold text-teal-400">
                        LKR {g.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* RECORD NEW GRN FORM */
          <form onSubmit={handleGRNSubmit} className="space-y-6">
            {grnError && (
              <div className="p-4 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
                {grnError}
              </div>
            )}

            {/* Top Config Row */}
            <div className="grid sm:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                  GRN Code / Invoice Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GRN-0021"
                  value={grnNumber}
                  onChange={(e) => setGrnNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Supplier *</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSupplierError('');
                      setShowAddSupplier(true);
                    }}
                    className="text-teal-400 hover:text-teal-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="h-3 w-3" /> Quick Add
                  </button>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm text-slate-300"
                >
                  <option value="">Select a Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-right font-mono">
                <span className="text-[10px] text-slate-500 block">Calculated Net Value</span>
                <span className="text-base font-extrabold text-teal-400">
                  LKR {totalCalculatedValue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dynamic Items Table */}
            <div className="border border-slate-900 rounded-xl overflow-hidden mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 font-semibold border-b border-slate-900">
                    <th className="p-3 w-1/4">Medicine *</th>
                    <th className="p-3">Batch Number *</th>
                    <th className="p-3 w-20 text-right">Qty *</th>
                    <th className="p-3 text-right">Cost (LKR)</th>
                    <th className="p-3 text-right">Selling (LKR)</th>
                    <th className="p-3 w-32">Expiry Date *</th>
                    <th className="p-3 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {grnRows.map((row, idx) => (
                    <tr key={idx} className="bg-slate-900/10">
                      <td className="p-2">
                        <select
                          value={row.medicine_id}
                          onChange={(e) => updateRowField(idx, 'medicine_id', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 outline-none focus:border-teal-500/30"
                        >
                          <option value="">Select Item</option>
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          placeholder="B-001"
                          value={row.batch_number}
                          onChange={(e) => updateRowField(idx, 'batch_number', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg outline-none font-mono text-xs focus:border-teal-500/30"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          required
                          value={row.quantity_received}
                          onChange={(e) => updateRowField(idx, 'quantity_received', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-right font-mono outline-none focus:border-teal-500/30"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.purchase_price || ''}
                          placeholder="0.00"
                          onChange={(e) => updateRowField(idx, 'purchase_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-right font-mono outline-none focus:border-teal-500/30"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.selling_price || ''}
                          placeholder="0.00"
                          onChange={(e) => updateRowField(idx, 'selling_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-right font-mono outline-none focus:border-teal-500/30"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          required
                          value={row.expiry_date}
                          onChange={(e) => updateRowField(idx, 'expiry_date', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono outline-none text-xs focus:border-teal-500/30"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          disabled={grnRows.length === 1}
                          onClick={() => removeRow(idx)}
                          className="text-red-500 hover:text-red-400 p-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={addRow}
                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
              
              <button
                type="submit"
                disabled={createGRNMutation.isPending}
                className="ml-auto px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                {createGRNMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Logging Stocks...
                  </>
                ) : (
                  <>
                    Log GRN stock <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-6">
              <UserPlus className="h-5 w-5 text-teal-400" />
              <h3 className="text-xl font-bold text-white">Register Supplier</h3>
            </div>

            {supplierError && (
              <div className="p-4 mb-6 text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl">
                {supplierError}
              </div>
            )}

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPC Sri Lanka"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +94 11 222 3344"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="supplier@example.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Office Address
                </label>
                <textarea
                  placeholder="Enter office address"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500/30 outline-none text-sm h-20 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-900 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 py-3 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {createSupplierMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Add Supplier'
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
