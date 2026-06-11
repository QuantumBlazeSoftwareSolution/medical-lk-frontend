'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Loader2, AlertCircle, Calendar, 
  Trash2, UserPlus, Check, Search, ReceiptText, ChevronDown, Package
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
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  
  // New GRN states
  const [grnNumber, setGrnNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [grnRows, setGrnRows] = useState<GRNRow[]>([]);
  const [grnError, setGrnError] = useState('');

  // Active item builder form states
  const [activeMedId, setActiveMedId] = useState('');
  const [activeBatchNum, setActiveBatchNum] = useState('');
  const [activeQty, setActiveQty] = useState<number | ''>('');
  const [activePPrice, setActivePPrice] = useState<number | ''>('');
  const [activeSPrice, setActiveSPrice] = useState<number | ''>('');
  const [activeExpDate, setActiveExpDate] = useState('');
  const [activeItemError, setActiveItemError] = useState('');

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
      qc.invalidateQueries({ queryKey: ['grns-list'] });
      qc.invalidateQueries({ queryKey: ['batches-all'] });
      qc.invalidateQueries({ queryKey: ['medicines-list'] });
      qc.invalidateQueries({ queryKey: ['inventory-alerts'] });
      setActiveTab('history');
      // Reset form
      setGrnNumber('');
      setSelectedSupplierId('');
      setGrnRows([]);
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

  // Add Item to GRN List
  const handleAddItem = () => {
    setActiveItemError('');
    if (!activeMedId) {
      setActiveItemError('Please select a medicine.');
      return;
    }
    if (!activeBatchNum.trim()) {
      setActiveItemError('Please enter a batch number.');
      return;
    }
    if (!activeQty || activeQty <= 0) {
      setActiveItemError('Quantity must be greater than 0.');
      return;
    }
    if (!activePPrice || activePPrice < 0) {
      setActiveItemError('Purchase price must be positive.');
      return;
    }
    if (!activeSPrice || activeSPrice < 0) {
      setActiveItemError('Selling price must be positive.');
      return;
    }
    if (!activeExpDate) {
      setActiveItemError('Expiry date is required.');
      return;
    }

    const newRow: GRNRow = {
      medicine_id: activeMedId,
      batch_number: activeBatchNum.trim(),
      quantity_received: Number(activeQty),
      purchase_price: Number(activePPrice),
      selling_price: Number(activeSPrice),
      expiry_date: activeExpDate
    };

    setGrnRows(prev => [...prev, newRow]);
    
    // Clear active item form states
    setActiveMedId('');
    setActiveBatchNum('');
    setActiveQty('');
    setActivePPrice('');
    setActiveSPrice('');
    setActiveExpDate('');
  };

  // Remove row
  const removeRow = (idx: number) => {
    setGrnRows(grnRows.filter((_, i) => i !== idx));
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
      setGrnError('Please input a supplier invoice number.');
      return;
    }

    if (grnRows.length === 0) {
      setGrnError('Please add at least one product item to the GRN.');
      return;
    }

    createGRNMutation.mutate({
      grn_number: grnNumber.trim(),
      supplier_id: selectedSupplierId,
      total_amount: totalCalculatedValue,
      items: grnRows
    });
  };

  return (
    <div className="space-y-ds-lg max-w-[1200px] mx-auto w-full text-[#191c1e] text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-ds-md border-b border-[#e6e8eb] pb-4">
        <div>
          <h2 className="font-display text-[24px] font-bold text-[#00273b] mb-1">Goods Received Notes (GRN)</h2>
          <p className="text-xs text-[#42474d] tracking-wide font-medium">Log supplier stock entries and manage batch inventory.</p>
        </div>
        
        {/* Tabs switcher inside header */}
        <div className="flex gap-4 border-b-2 border-transparent">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#00273b] text-[#00273b]'
                : 'border-transparent text-[#72787e] hover:text-[#42474d]'
            }`}
          >
            History Logs ({grns.length})
          </button>
          <button
            onClick={() => {
              setGrnError('');
              setActiveTab('new');
            }}
            className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'border-[#00273b] text-[#00273b]'
                : 'border-transparent text-[#72787e] hover:text-[#42474d]'
            }`}
          >
            New Stock Entry (GRN)
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* GRN LOGS TAB */
        <div className="bg-white border border-[#c2c7cd] rounded-xl shadow-[0_4px_8px_-2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[400px]">
          {grnsLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-[#72787e] gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#0f3d57]" />
              <span>Fetching GRN logbooks...</span>
            </div>
          ) : grns.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-[#72787e] gap-3 py-16">
              <ReceiptText className="h-10 w-10 text-[#c2c7cd]" />
              <span className="text-sm font-medium">No Goods Received Notes logged yet.</span>
              <button 
                onClick={() => setActiveTab('new')}
                className="px-4 py-2 bg-[#006d37] hover:bg-[#006d37]/90 text-white font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Create First GRN
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f4f7] border-b border-[#c2c7cd]">
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">GRN / Invoice Reference</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">Supplier</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">Received Date</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-right">Invoice Value (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef1] text-sm">
                  {grns.map((g) => (
                    <tr key={g.id} className="hover:bg-[#f7f9fc] transition-colors cursor-pointer">
                      <td className="px-5 py-3.5 font-mono font-semibold text-[#00273b]">{g.grn_number}</td>
                      <td className="px-5 py-3.5 text-[#42474d] font-medium">{g.supplier_name}</td>
                      <td className="px-5 py-3.5 text-[#72787e] text-xs">
                        {new Date(g.received_date).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-[#006d37]">
                        {g.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* RECORD NEW GRN FORM */
        <div className="space-y-ds-lg">
          {grnError && (
            <div className="p-4 text-sm text-error bg-error-container border border-error/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{grnError}</span>
            </div>
          )}

          <form onSubmit={handleGRNSubmit} className="space-y-ds-lg">
            
            {/* Supplier & Invoice Card */}
            <section className="bg-white border border-[#c2c7cd] rounded-xl p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.04)]">
              <h3 className="font-sans text-[16px] font-bold text-[#00273b] mb-4 border-b border-[#e6e8eb] pb-2 uppercase tracking-wide">Supplier &amp; Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-gutter">
                
                {/* Supplier Field */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider flex justify-between items-center">
                    <span>Supplier *</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSupplierError('');
                        setShowAddSupplier(true);
                      }}
                      className="text-[#00273b] hover:underline text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="h-3 w-3" /> Quick Add
                    </button>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 pr-10 font-sans text-[14px] text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow cursor-pointer"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#42474d]">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Invoice Number */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider" htmlFor="invoiceNo">
                    Supplier Invoice No *
                  </label>
                  <input
                    type="text"
                    id="invoiceNo"
                    required
                    placeholder="e.g. INV-HEM-4521"
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface placeholder:text-[#72787e] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow uppercase"
                  />
                </div>

                {/* Received Date */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Received Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Product Item Builder Card */}
            <section className="bg-white border border-[#c2c7cd] rounded-xl p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.04)]">
              <h3 className="font-sans text-[16px] font-bold text-[#00273b] mb-4 border-b border-[#e6e8eb] pb-2 uppercase tracking-wide">Add Product Item</h3>
              
              {activeItemError && (
                <div className="mb-4 p-3 text-[13px] text-error bg-error-container border border-error/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} /> {activeItemError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-gutter">
                {/* Select Medicine */}
                <div className="flex flex-col gap-ds-xs md:col-span-2">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Select Medicine / Product
                  </label>
                  <div className="relative">
                    <select
                      value={activeMedId}
                      onChange={(e) => {
                        setActiveMedId(e.target.value);
                        // Pre-populate prices if medicine has catalog prices
                        const med = medicines.find(m => m.id === e.target.value);
                        if (med) {
                          setActivePPrice(med.purchase_price || '');
                          setActiveSPrice(med.selling_price || '');
                        }
                      }}
                      className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 pr-10 font-sans text-[14px] text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow cursor-pointer"
                    >
                      <option value="">Search / Select Medicine</option>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} {m.generic_name ? `(${m.generic_name})` : ''} {m.barcode ? ` - [${m.barcode}]` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#42474d]">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Batch Number */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-99"
                    value={activeBatchNum}
                    onChange={(e) => setActiveBatchNum(e.target.value)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Quantity Received
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={activeQty}
                    onChange={(e) => setActiveQty(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Purchase Cost */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Purchase Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={activePPrice}
                    onChange={(e) => setActivePPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Retail Price */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Selling Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={activeSPrice}
                    onChange={(e) => setActiveSPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-[12px] font-semibold text-[#42474d] uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={activeExpDate}
                    onChange={(e) => setActiveExpDate(e.target.value)}
                    className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                  />
                </div>

                {/* Add Item Button */}
                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-6 py-2 border border-[#00273b] text-[#00273b] hover:bg-[#00273b]/5 font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={15} /> Add Item to List
                  </button>
                </div>
              </div>
            </section>

            {/* GRN Itemized Table Card */}
            <section className="bg-white border border-[#c2c7cd] rounded-xl p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.04)]">
              <h3 className="font-sans text-[16px] font-bold text-[#00273b] mb-4 border-b border-[#e6e8eb] pb-2 uppercase tracking-wide">GRN Itemized List</h3>
              
              {grnRows.length === 0 ? (
                <div className="py-12 text-center text-[#72787e] flex flex-col items-center justify-center gap-2">
                  <Package size={28} className="text-[#c2c7cd]" />
                  <span className="text-sm font-medium">No items added to this stock entry yet.</span>
                  <span className="text-xs text-[#72787e]">Select a medicine and fill the batch fields above.</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto border border-[#c2c7cd] rounded-lg">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#f2f4f7] border-b border-[#c2c7cd]">
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">Product Name</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">Batch No</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-right">Qty</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-right">Cost (LKR)</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-right">Retail (LKR)</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider">Expiry</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-right">Total Cost</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-[#42474d] uppercase tracking-wider text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eceef1]">
                        {grnRows.map((row, idx) => {
                          const med = medicines.find(m => m.id === row.medicine_id);
                          const lineTotal = row.purchase_price * row.quantity_received;
                          return (
                            <tr key={idx} className="hover:bg-[#f7f9fc] transition-colors">
                              <td className="px-4 py-3 font-semibold text-[#00273b]">
                                {med?.name || 'Unknown Medicine'}
                                {med?.generic_name && (
                                  <span className="block text-[11px] text-[#72787e] font-normal">{med.generic_name}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs">{row.batch_number}</td>
                              <td className="px-4 py-3 text-right font-mono">{row.quantity_received}</td>
                              <td className="px-4 py-3 text-right font-mono">{row.purchase_price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-mono">{row.selling_price.toFixed(2)}</td>
                              <td className="px-4 py-3 font-mono text-xs">{row.expiry_date}</td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-[#006d37]">{lineTotal.toFixed(2)}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeRow(idx)}
                                  className="text-red-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#0f3d57] text-[#80a8c6] rounded-xl border border-[#0f3d57]/10 gap-4">
                    <div className="text-left font-sans text-xs">
                      <span className="block text-white font-bold uppercase tracking-wider mb-1">Stock Receipt Summary</span>
                      <span>Total Added Items: <strong className="text-white">{grnRows.length}</strong> | Total Units: <strong className="text-white">{grnRows.reduce((s,r) => s+r.quantity_received, 0)}</strong></span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] uppercase tracking-wider block text-[#80a8c6]">Calculated Net Value</span>
                      <span className="text-lg font-extrabold text-[#6bfe9c]">
                        LKR {totalCalculatedValue.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex gap-4 justify-end border-t border-[#e6e8eb] pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setGrnNumber('');
                        setSelectedSupplierId('');
                        setGrnRows([]);
                        setActiveTab('history');
                      }}
                      className="px-4 py-2 border border-[#c2c7cd] text-[#42474d] hover:bg-[#f2f4f7] font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createGRNMutation.isPending}
                      className="px-6 py-2 bg-[#006d37] hover:bg-[#006d37]/90 text-white font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {createGRNMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Submit GRN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>
      )}

      {/* Quick Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#0b1c30]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#c2c7cd] rounded-xl max-w-md w-full p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.16)] text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e6e8eb] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-[#0f3d57]" />
                <h3 className="text-lg font-bold text-[#00273b] font-display">Register Supplier</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddSupplier(false)}
                className="text-[#72787e] hover:text-[#42474d] hover:bg-[#f2f4f7] rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <Plus className="rotate-45 h-5 w-5" />
              </button>
            </div>

            {supplierError && (
              <div className="p-4 mb-6 text-sm text-error bg-error-container border border-error/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{supplierError}</span>
              </div>
            )}

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-[11px] font-bold text-[#42474d] uppercase tracking-wider">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPC Sri Lanka"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-sans text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-[11px] font-bold text-[#42474d] uppercase tracking-wider">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +94 11 222 3344"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-mono text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-[11px] font-bold text-[#42474d] uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="supplier@example.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-sans text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-[11px] font-bold text-[#42474d] uppercase tracking-wider">
                  Office Address
                </label>
                <textarea
                  placeholder="Enter office address"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full bg-[#f7f9fc] border border-[#c2c7cd] rounded-lg px-4 py-2 font-sans text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow h-20 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#e6e8eb] mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 py-2 border border-[#c2c7cd] text-[#42474d] hover:bg-[#f2f4f7] font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                  className="flex-1 py-2 bg-[#006d37] hover:bg-[#006d37]/90 text-white font-sans text-[12px] font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5"
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
