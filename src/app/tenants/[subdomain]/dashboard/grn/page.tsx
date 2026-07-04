'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Trash2,
  UserPlus,
  Check,
  Search,
  ReceiptText,
  ChevronDown,
  Package,
  X,
  History,
  Save,
  Sparkles,
  CheckCircle,
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
  const params = useParams();
  const subdomain = (params?.subdomain as string) || 'default';
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');

  // New GRN states
  const [grnNumber, setGrnNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [receivedDate, setReceivedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
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

  // Search Combobox states
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);

  // Draft Save indicator
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Add Supplier modal states
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierError, setSupplierError] = useState('');

  // Refs for clicking outside dropdowns
  const supplierContainerRef = useRef<HTMLDivElement>(null);
  const medicineContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch GRN history
  const {
    data: grns = [],
    isLoading: grnsLoading,
    refetch: refetchGrns,
  } = useQuery<any[]>({
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

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draftKey = `medical-lk-grn-draft-${subdomain}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.grnNumber) setGrnNumber(parsed.grnNumber);
        if (parsed.selectedSupplierId) {
          setSelectedSupplierId(parsed.selectedSupplierId);
          // Pre-populate search query for supplier if list exists
          const supplier = suppliers.find(
            (s) => s.id === parsed.selectedSupplierId
          );
          if (supplier) setSupplierSearchQuery(supplier.name);
        }
        if (parsed.receivedDate) setReceivedDate(parsed.receivedDate);
        if (parsed.grnRows) setGrnRows(parsed.grnRows);
        if (parsed.savedTime) setLastSavedTime(parsed.savedTime);
      }
    } catch (e) {
      console.error('Error loading draft', e);
    }
  }, [subdomain, suppliers]);

  // Sync state to local storage to auto-save draft
  useEffect(() => {
    if (
      activeTab === 'new' &&
      (grnNumber || selectedSupplierId || grnRows.length > 0)
    ) {
      const draftKey = `medical-lk-grn-draft-${subdomain}`;
      const timeString = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const draftPayload = {
        grnNumber,
        selectedSupplierId,
        receivedDate,
        grnRows,
        savedTime: timeString,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftPayload));
      setLastSavedTime(timeString);
    }
  }, [
    grnNumber,
    selectedSupplierId,
    receivedDate,
    grnRows,
    subdomain,
    activeTab,
  ]);

  // Supplier Search sync when selectedSupplierId changes
  useEffect(() => {
    if (selectedSupplierId && suppliers.length > 0) {
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      if (supplier) {
        setSupplierSearchQuery(supplier.name);
      }
    }
  }, [selectedSupplierId, suppliers]);

  // Click outside listener for comboboxes
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        supplierContainerRef.current &&
        !supplierContainerRef.current.contains(event.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
      if (
        medicineContainerRef.current &&
        !medicineContainerRef.current.contains(event.target as Node)
      ) {
        setShowMedicineDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Create Supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/inventory/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      refetchSuppliers();
      setShowAddSupplier(false);

      // Auto-select the newly added supplier
      if (data && data.id) {
        setSelectedSupplierId(data.id);
        setSupplierSearchQuery(data.name || supplierName.trim());
      }

      setSupplierName('');
      setSupplierPhone('');
      setSupplierEmail('');
      setSupplierAddress('');
    },
    onError: (err: any) => {
      setSupplierError(err.message || 'Failed to register supplier.');
    },
  });

  // 5. Create GRN mutation
  const createGRNMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/inventory/grns', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grns-list'] });
      qc.invalidateQueries({ queryKey: ['batches-all'] });
      qc.invalidateQueries({ queryKey: ['medicines-list'] });
      qc.invalidateQueries({ queryKey: ['inventory-alerts'] });

      // Clear local storage draft
      const draftKey = `medical-lk-grn-draft-${subdomain}`;
      localStorage.removeItem(draftKey);
      setLastSavedTime('');

      setActiveTab('history');
      // Reset form
      setGrnNumber('');
      setSelectedSupplierId('');
      setSupplierSearchQuery('');
      setGrnRows([]);
    },
    onError: (err: any) => {
      setGrnError(err.message || 'Failed to submit Goods Received Note.');
    },
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
      address: supplierAddress.trim() || null,
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
    if (activePPrice === '' || activePPrice < 0) {
      setActiveItemError('Purchase price must be positive.');
      return;
    }
    if (activeSPrice === '' || activeSPrice < 0) {
      setActiveItemError('Selling price must be positive.');
      return;
    }
    if (!activeExpDate) {
      setActiveItemError('Expiry date is required.');
      return;
    }

    // Check for duplicates
    const duplicateIdx = grnRows.findIndex(
      (r) =>
        r.medicine_id === activeMedId &&
        r.batch_number.toLowerCase() === activeBatchNum.trim().toLowerCase()
    );

    if (duplicateIdx > -1) {
      // Merge quantity and update prices if needed
      const updatedRows = [...grnRows];
      updatedRows[duplicateIdx].quantity_received += Number(activeQty);
      updatedRows[duplicateIdx].purchase_price = Number(activePPrice);
      updatedRows[duplicateIdx].selling_price = Number(activeSPrice);
      updatedRows[duplicateIdx].expiry_date = activeExpDate;
      setGrnRows(updatedRows);
    } else {
      const newRow: GRNRow = {
        medicine_id: activeMedId,
        batch_number: activeBatchNum.trim(),
        quantity_received: Number(activeQty),
        purchase_price: Number(activePPrice),
        selling_price: Number(activeSPrice),
        expiry_date: activeExpDate,
      };
      setGrnRows((prev) => [...prev, newRow]);
    }

    // Clear active item form states
    setActiveMedId('');
    setMedicineSearchQuery('');
    setActiveBatchNum('');
    setActiveQty('');
    setActivePPrice('');
    setActiveSPrice('');
    setActiveExpDate('');
  };

  // Remove row
  const removeRow = (idx: number) => {
    const updated = grnRows.filter((_, i) => i !== idx);
    setGrnRows(updated);

    // Clear draft if no rows remain
    if (updated.length === 0 && !grnNumber && !selectedSupplierId) {
      const draftKey = `medical-lk-grn-draft-${subdomain}`;
      localStorage.removeItem(draftKey);
      setLastSavedTime('');
    }
  };

  // Clear entire form & draft
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear the current draft?')) {
      setGrnNumber('');
      setSelectedSupplierId('');
      setSupplierSearchQuery('');
      setGrnRows([]);
      setReceivedDate(new Date().toISOString().split('T')[0]);
      const draftKey = `medical-lk-grn-draft-${subdomain}`;
      localStorage.removeItem(draftKey);
      setLastSavedTime('');
      setGrnError('');
    }
  };

  // Calculate sum of cost price * quantities
  const totalCalculatedValue = grnRows.reduce(
    (sum, r) => sum + r.purchase_price * r.quantity_received,
    0
  );

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
      received_date: receivedDate
        ? new Date(receivedDate).toISOString()
        : new Date().toISOString(),
      total_amount: totalCalculatedValue,
      items: grnRows,
    });
  };

  // Filters for Searchable Suppliers
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  // Filters for Searchable Medicines
  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(medicineSearchQuery.toLowerCase()) ||
      (m.generic_name &&
        m.generic_name
          .toLowerCase()
          .includes(medicineSearchQuery.toLowerCase())) ||
      (m.barcode && m.barcode.includes(medicineSearchQuery))
  );

  const selectedMed = medicines.find((m) => m.id === activeMedId);
  const isActiveExpDateInPast =
    activeExpDate && new Date(activeExpDate) < new Date();

  return (
    <div className="space-y-ds-lg max-w-[1200px] mx-auto w-full text-on-background text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-ds-md border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-display text-headline-lg font-bold text-primary mb-1">
            Goods Received Notes (GRN)
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Log supplier stock entries and manage batch inventory.
          </p>
        </div>

        {/* Tabs switcher inside header */}
        <div className="flex gap-6 border-b-2 border-transparent">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface-variant'
            }`}
          >
            <History size={14} />
            History Logs ({grns.length})
          </button>
          <button
            onClick={() => {
              setGrnError('');
              setActiveTab('new');
            }}
            className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface-variant'
            }`}
          >
            <Plus size={15} />
            New Stock Entry (GRN)
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* GRN LOGS TAB */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[400px]">
          {grnsLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-outline gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary-container" />
              <span className="text-body-sm">Fetching GRN logbooks...</span>
            </div>
          ) : grns.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-outline gap-3 py-16">
              <ReceiptText className="h-10 w-10 text-outline-variant" />
              <span className="text-body-sm font-medium">
                No Goods Received Notes logged yet.
              </span>
              <button
                onClick={() => setActiveTab('new')}
                className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Create First GRN
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/60">
                    <th className="px-6 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      GRN / Invoice Reference
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Received Date
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                      Invoice Value (LKR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low text-body-sm">
                  {grns.map((g) => (
                    <tr
                      key={g.id}
                      className="hover:bg-background transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-primary">
                        {g.grn_number}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-medium">
                        {g.supplier_name}
                      </td>
                      <td className="px-6 py-4 text-outline font-mono">
                        {new Date(g.received_date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-secondary">
                        {g.total_amount.toLocaleString('en-LK', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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
            <div className="p-4 text-body-sm text-error bg-error-container border border-error/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{grnError}</span>
            </div>
          )}

          <form onSubmit={handleGRNSubmit} className="space-y-ds-lg">
            {/* Top Toolbar / Draft Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-outline-variant/40 rounded-xl px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-3">
              <div className="flex items-center gap-2 text-outline text-xs">
                {lastSavedTime ? (
                  <>
                    <Save size={14} className="text-secondary" />
                    <span>
                      Draft auto-saved to browser local storage at{' '}
                      <strong>{lastSavedTime}</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-primary-container" />
                    <span>
                      Fill details below to build and record your stock receipt.
                    </span>
                  </>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {(grnNumber || selectedSupplierId || grnRows.length > 0) && (
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="px-3 py-1.5 border border-error/20 hover:bg-error-container hover:text-error text-on-surface-variant font-label-md text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <X size={13} /> Clear Draft
                  </button>
                )}
              </div>
            </div>

            {/* Supplier & Invoice Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <h3 className="font-display text-title-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wide">
                Supplier &amp; Invoice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-gutter">
                {/* Supplier Search Combobox */}
                <div
                  className="flex flex-col gap-ds-xs"
                  ref={supplierContainerRef}
                >
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex justify-between items-center">
                    <span>Supplier *</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSupplierError('');
                        setShowAddSupplier(true);
                      }}
                      className="text-primary hover:underline text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="h-3 w-3" /> Quick Add
                    </button>
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Type to filter suppliers..."
                      value={supplierSearchQuery}
                      onChange={(e) => {
                        setSupplierSearchQuery(e.target.value);
                        setShowSupplierDropdown(true);
                        // Clear selection if input is cleared
                        if (!e.target.value) {
                          setSelectedSupplierId('');
                        }
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      className="w-full pl-9 pr-8 py-2 bg-background border border-outline-variant rounded-lg font-sans text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow cursor-pointer"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowSupplierDropdown(!showSupplierDropdown)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {/* Suppliers Dropdown menu */}
                    {showSupplierDropdown && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-outline-variant rounded-xl shadow-[0_16px_48px_rgba(15,61,87,0.12)] max-h-60 overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                        {filteredSuppliers.length === 0 ? (
                          <div className="p-4 text-center text-outline text-xs">
                            <p className="mb-2">
                              No suppliers matched "{supplierSearchQuery}"
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSupplierName(supplierSearchQuery);
                                setShowSupplierDropdown(false);
                                setSupplierError('');
                                setShowAddSupplier(true);
                              }}
                              className="px-3 py-1 bg-primary text-white rounded text-[10px] uppercase font-bold tracking-wider hover:bg-primary/95 transition-colors cursor-pointer"
                            >
                              Register "{supplierSearchQuery}"
                            </button>
                          </div>
                        ) : (
                          <div className="py-1">
                            {filteredSuppliers.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSupplierId(s.id);
                                  setSupplierSearchQuery(s.name);
                                  setShowSupplierDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-sans hover:bg-surface-container-low transition-colors flex justify-between items-center ${
                                  selectedSupplierId === s.id
                                    ? 'bg-surface-container-low text-primary font-bold'
                                    : 'text-on-surface-variant'
                                }`}
                              >
                                <span>{s.name}</span>
                                {selectedSupplierId === s.id && (
                                  <Check size={14} className="text-secondary" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Number */}
                <div className="flex flex-col gap-ds-xs">
                  <label
                    className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                    htmlFor="invoiceNo"
                  >
                    Supplier Invoice No *
                  </label>
                  <input
                    type="text"
                    id="invoiceNo"
                    required
                    placeholder="e.g. INV-HEM-4521"
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface placeholder:text-outline/75 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow uppercase"
                  />
                </div>

                {/* Received Date */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Received Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={receivedDate}
                      onChange={(e) => setReceivedDate(e.target.value)}
                      className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Product Item Builder Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <h3 className="font-display text-title-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wide">
                Add Product Item
              </h3>

              {activeItemError && (
                <div className="mb-4 p-3 text-body-sm text-error bg-error-container border border-error/20 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />{' '}
                  {activeItemError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-gutter">
                {/* Searchable Medicine Combobox */}
                <div
                  className="flex flex-col gap-ds-xs md:col-span-2"
                  ref={medicineContainerRef}
                >
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Select Medicine / Product *
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by catalog name, generic name, or barcode..."
                      value={medicineSearchQuery}
                      onChange={(e) => {
                        setMedicineSearchQuery(e.target.value);
                        setShowMedicineDropdown(true);
                        // Reset selection if cleared
                        if (!e.target.value) {
                          setActiveMedId('');
                        }
                      }}
                      onFocus={() => setShowMedicineDropdown(true)}
                      className="w-full pl-9 pr-8 py-2 bg-background border border-outline-variant rounded-lg font-sans text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowMedicineDropdown(!showMedicineDropdown)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {/* Medicines Dropdown list */}
                    {showMedicineDropdown && (
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-outline-variant rounded-xl shadow-[0_16px_48px_rgba(15,61,87,0.12)] max-h-60 overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                        {filteredMedicines.length === 0 ? (
                          <div className="p-4 text-center text-outline text-xs">
                            No medicines match "{medicineSearchQuery}". Please
                            add them to the catalog first.
                          </div>
                        ) : (
                          <div className="py-1">
                            {filteredMedicines.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setActiveMedId(m.id);
                                  setMedicineSearchQuery(m.name);
                                  setShowMedicineDropdown(false);
                                  // Pre-populate prices
                                  setActivePPrice(
                                    m.purchase_price !== undefined
                                      ? m.purchase_price
                                      : ''
                                  );
                                  setActiveSPrice(
                                    m.selling_price !== undefined
                                      ? m.selling_price
                                      : ''
                                  );
                                  setActiveItemError('');
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-surface-container-low transition-colors flex justify-between items-start border-b border-surface-container-low last:border-0 ${
                                  activeMedId === m.id
                                    ? 'bg-surface-container-low text-primary font-bold'
                                    : 'text-on-surface-variant'
                                }`}
                              >
                                <div className="text-left font-sans">
                                  <div className="font-semibold">{m.name}</div>
                                  {m.generic_name && (
                                    <div className="text-[10px] text-outline mt-0.5">
                                      {m.generic_name}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right font-mono text-[10px] text-outline">
                                  {m.barcode && <span>[{m.barcode}] </span>}
                                  <span>{m.uom || 'Tab'}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Batch Number */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B-HEM-99"
                    value={activeBatchNum}
                    onChange={(e) => setActiveBatchNum(e.target.value)}
                    className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow uppercase"
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Quantity Received *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={activeQty}
                    onChange={(e) =>
                      setActiveQty(
                        e.target.value === ''
                          ? ''
                          : parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Purchase Cost */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Purchase Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={activePPrice}
                    onChange={(e) =>
                      setActivePPrice(
                        e.target.value === ''
                          ? ''
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Retail Price */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Selling Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={activeSPrice}
                    onChange={(e) =>
                      setActiveSPrice(
                        e.target.value === ''
                          ? ''
                          : parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow text-right"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-ds-xs">
                  <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={activeExpDate}
                    onChange={(e) => setActiveExpDate(e.target.value)}
                    className={`w-full bg-background border rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow ${
                      isActiveExpDateInPast
                        ? 'border-error ring-1 ring-error/50 bg-error-container/10'
                        : 'border-outline-variant'
                    }`}
                  />
                </div>

                {/* Item Details Info & Warnings */}
                <div className="md:col-span-2 flex flex-col justify-end gap-2 text-left">
                  {selectedMed && (
                    <div className="text-[11px] text-outline font-sans flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30">
                      <Package size={12} className="text-primary-container" />
                      <span>
                        Catalog Match: <strong>{selectedMed.name}</strong>
                        {selectedMed.brand_name &&
                          ` | Brand: ${selectedMed.brand_name}`}
                        {selectedMed.uom && ` | UOM: ${selectedMed.uom}`}
                      </span>
                    </div>
                  )}

                  {isActiveExpDateInPast && (
                    <div className="text-[11px] text-error font-sans flex items-center gap-1 bg-error-container/30 px-3 py-1.5 rounded-lg border border-error/20">
                      <AlertCircle size={12} />
                      <span>
                        Warning: Selected expiry date is in the past! This batch
                        is expired.
                      </span>
                    </div>
                  )}

                  {activeMedId &&
                    grnRows.some((r) => r.medicine_id === activeMedId) && (
                      <div className="text-[11px] text-[#b28000] font-sans flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <AlertCircle size={12} />
                        <span>
                          Note: This product is already in the list. Adding will
                          merge the quantities.
                        </span>
                      </div>
                    )}
                </div>

                {/* Add Item Button */}
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full md:w-auto px-6 py-2.5 bg-transparent border border-primary text-primary hover:bg-primary/5 font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Add Item to List
                  </button>
                </div>
              </div>
            </section>

            {/* GRN Itemized Table Card */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
              <h3 className="font-display text-title-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wide">
                GRN Itemized List
              </h3>

              {grnRows.length === 0 ? (
                <div className="py-12 text-center text-outline flex flex-col items-center justify-center gap-2">
                  <Package size={28} className="text-outline-variant" />
                  <span className="text-body-sm font-medium">
                    No items added to this stock entry yet.
                  </span>
                  <span className="text-xs text-outline">
                    Select a medicine and fill the batch fields above to add
                    products.
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto border border-outline-variant/60 rounded-xl bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant/60">
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                            Product Name
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                            Batch No
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                            Cost (LKR)
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                            Retail (LKR)
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                            Expiry
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                            Total Cost
                          </th>
                          <th className="px-4 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-center">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low text-body-sm">
                        {grnRows.map((row, idx) => {
                          const med = medicines.find(
                            (m) => m.id === row.medicine_id
                          );
                          const lineTotal =
                            row.purchase_price * row.quantity_received;
                          const isRowExpired =
                            new Date(row.expiry_date) < new Date();
                          return (
                            <tr
                              key={idx}
                              className="hover:bg-background transition-colors"
                            >
                              <td className="px-4 py-3.5 font-semibold text-primary">
                                {med?.name || 'Unknown Medicine'}
                                {med?.generic_name && (
                                  <span className="block text-[10px] text-outline font-normal mt-0.5">
                                    {med.generic_name}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-xs">
                                {row.batch_number}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-medium">
                                {row.quantity_received}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono">
                                {row.purchase_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono">
                                {row.selling_price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-xs">
                                <span
                                  className={
                                    isRowExpired
                                      ? 'text-error font-semibold bg-error-container/30 px-1.5 py-0.5 rounded border border-error/10'
                                      : ''
                                  }
                                >
                                  {row.expiry_date}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-secondary">
                                {lineTotal.toFixed(2)}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeRow(idx)}
                                  className="text-error hover:text-error/85 p-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-primary-container text-on-primary-container rounded-xl border border-primary/10 gap-4 shadow-[0_4px_12px_rgba(15,61,87,0.05)]">
                    <div className="text-left font-sans text-xs">
                      <span className="block text-white font-bold uppercase tracking-wider mb-1">
                        Stock Receipt Summary
                      </span>
                      <span>
                        Total Added Items:{' '}
                        <strong className="text-white text-sm">
                          {grnRows.length}
                        </strong>{' '}
                        | Total Units:{' '}
                        <strong className="text-white text-sm">
                          {grnRows.reduce((s, r) => s + r.quantity_received, 0)}
                        </strong>
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] uppercase tracking-wider block text-on-primary-container/80 font-sans font-semibold">
                        Calculated Net Value
                      </span>
                      <span className="text-2xl font-extrabold text-secondary-container">
                        LKR{' '}
                        {totalCalculatedValue.toLocaleString('en-LK', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex gap-3 justify-end border-t border-outline-variant/30 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('history');
                      }}
                      className="px-5 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Back to Logs
                    </button>
                    <button
                      type="submit"
                      disabled={createGRNMutation.isPending}
                      className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {createGRNMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{' '}
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={15} /> Submit GRN
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
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md w-full p-6 md:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.16)] text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-primary-container" />
                <h3 className="text-lg font-bold text-primary font-display">
                  Register Supplier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSupplier(false)}
                className="text-outline hover:text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <Plus className="rotate-45 h-5 w-5" />
              </button>
            </div>

            {supplierError && (
              <div className="p-4 mb-6 text-body-sm text-error bg-error-container border border-error/20 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{supplierError}</span>
              </div>
            )}

            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPC Sri Lanka"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-sans text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +94 11 222 3344"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-mono text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="supplier@example.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-sans text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-ds-xs">
                <label className="block font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Office Address
                </label>
                <textarea
                  placeholder="Enter office address"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full bg-background border border-outline-variant rounded-lg px-4 py-2 font-sans text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow h-20 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/30 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="flex-1 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                  className="flex-1 py-2 bg-secondary hover:bg-secondary/90 text-white font-sans text-xs font-semibold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
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
