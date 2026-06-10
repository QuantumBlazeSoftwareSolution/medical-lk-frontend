'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Search, Plus, Minus, X, Trash2, Printer, Loader2,
  AlertCircle, Scan, CreditCard, Banknote, Check,
  UserSearch, Pencil, Calendar, User, QrCode, ArrowRight, Package,
} from 'lucide-react';
import { usePOSStore } from '@/store/usePOSStore';
import { apiFetch } from '@/utils/api';

function fmt(n: number) {
  return n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0)
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a]">Out of stock</span>;
  if (qty <= 10)
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#fef9ec] text-[#e67e22]">{qty} in stock</span>;
  return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f8f5] text-[#2ecc71]">{qty} in stock</span>;
}

const CATEGORIES = ['All', 'Medicines', 'First Aid', 'Vitamins', 'Personal Care'];

export default function POSTerminal() {
  const {
    cart, discount, paymentMethod, selectedPatient,
    addToCart, removeFromCart, updateQuantity, clearCart,
    setDiscount, setPaymentMethod, setSelectedPatient,
  } = usePOSStore();

  const [searchQuery, setSearchQuery]           = useState('');
  const [activeCategory, setActiveCategory]     = useState('All');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cashReceived, setCashReceived]         = useState('');
  const [showPayModal, setShowPayModal]         = useState(false);
  const [lastInvoiceId, setLastInvoiceId]       = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientSearch, setPatientSearch]       = useState('');
  const [showPatientEdit, setShowPatientEdit]   = useState(false);
  const [now, setNow]                           = useState(new Date());
  const [username, setUsername]                 = useState('Cashier');

  const searchRef       = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUsername(localStorage.getItem('username') || 'Cashier'); }, []);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node))
        setShowAutocomplete(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => { searchRef.current?.focus(); }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: batches = [], isLoading: batchesLoading, refetch: refetchBatches } = useQuery<any[]>({
    queryKey: ['active-batches'],
    queryFn: () => apiFetch('/api/inventory/batches?only_in_stock=true'),
  });

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patient-search', patientSearch],
    queryFn: () => apiFetch(`/api/patients/search?query=${patientSearch}`),
    enabled: patientSearch.length > 1,
  });

  const { data: printedInvoice } = useQuery<any>({
    queryKey: ['invoice-details', lastInvoiceId],
    queryFn: () => apiFetch(`/api/pos/invoices/${lastInvoiceId}`),
    enabled: !!lastInvoiceId,
  });

  const invoiceMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/pos/invoices', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setLastInvoiceId(data.invoice_id);
      refetchBatches();
      setShowPayModal(false);
      setShowSuccessModal(true);
    },
    onError: (err: any) => alert(err.message || 'Transaction failed.'),
  });

  // ── Derived ───────────────────────────────────────────────────────────────
  const subtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const netTotal  = Math.max(0, subtotal - discount);
  const changeDue = Math.max(0, parseFloat(cashReceived || '0') - netTotal);

  const filteredBatches = batches.filter(b => {
    const term = searchQuery.toLowerCase();
    return !searchQuery ||
      b.medicine_name.toLowerCase().includes(term) ||
      (b.generic_name && b.generic_name.toLowerCase().includes(term)) ||
      b.batch_number.toLowerCase().includes(term);
  });

  const autoSuggestions = searchQuery.length > 0 ? filteredBatches.slice(0, 5) : [];

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAddBatch = useCallback((batch: any) => {
    if (batch.quantity_remaining <= 0) return;
    addToCart({
      batchId: batch.id, medicineId: batch.medicine_id,
      medicineName: batch.medicine_name, genericName: batch.generic_name,
      batchNumber: batch.batch_number, price: batch.selling_price,
      stockAvailable: batch.quantity_remaining, expiryDate: batch.expiry_date,
    });
    setSearchQuery('');
    setShowAutocomplete(false);
    searchRef.current?.focus();
  }, [addToCart]);

  const handleCheckout = () => {
    if (cart.length === 0) { alert('Cart is empty.'); return; }
    setShowPayModal(true);
  };

  const handleConfirmPayment = () => {
    invoiceMutation.mutate({
      patient_id: selectedPatient?.id || null,
      discount,
      payment_method: paymentMethod,
      items: cart.map(i => ({ batch_id: i.batchId, quantity: i.quantity })),
    });
  };

  const handlePrintAndClose = () => {
    setTimeout(() => { window.print(); reset(); }, 100);
  };

  const reset = () => {
    setShowSuccessModal(false);
    setLastInvoiceId(null);
    clearCart();
    setCashReceived('');
  };

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Full-height split layout */}
      <div className="flex flex-col h-full overflow-hidden bg-[#f7f9fc] font-sans">

        {/* ── TOP BAR ────────────────────────────────────────────────────── */}
        <header className="h-14 bg-white border-b border-[#c2c7cd] flex items-center justify-between px-6 shrink-0 z-10">
          {/* Title + Live badge */}
          <div className="flex items-center gap-3.5">
            <h1 className="font-display text-xl font-bold text-[#00273b] leading-none">POS Terminal</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e8f8f5] border border-[#2ecc71] rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#2ecc71] tracking-wide">Live</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-5 text-[12px] font-medium text-[#42474d]">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#00273b]" />
              <span>{dateStr} — {timeStr}</span>
            </div>
            <div className="w-px h-5 bg-[#c2c7cd]" />
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-[#00273b]" />
              <span>{username}</span>
            </div>
            <div className="w-px h-5 bg-[#c2c7cd]" />
            <div className="flex items-center gap-1.5">
              <Printer size={14} className="text-[#2ecc71]" />
              <span>Connected</span>
            </div>
            <div className="w-px h-5 bg-[#c2c7cd]" />
            <div className="flex items-center gap-1.5">
              <Scan size={14} className="text-[#2ecc71]" />
              <span>Ready</span>
            </div>
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── LEFT PANEL (60%) ─────────────────────────────────────────── */}
          <section className="w-[60%] flex flex-col bg-[#f2f4f7] border-r border-[#c2c7cd] overflow-hidden">

            {/* Search + categories */}
            <div className="bg-white border-b border-[#e6e8eb] px-4 py-3 flex flex-col gap-2.5 shrink-0 shadow-sm z-10 relative">

              {/* Search input */}
              <div className="relative" ref={autocompleteRef}>
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787e] pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  className="w-full pl-10 pr-12 py-3 border-[1.5px] border-[#17a589] rounded-lg bg-white text-[15px] text-[#191c1e] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(23,165,137,0.15)] placeholder:text-[#72787e]"
                  placeholder="Scan barcode or type product name..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowAutocomplete(true); }}
                  onFocus={() => searchQuery && setShowAutocomplete(true)}
                  autoComplete="off"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[#42474d] hover:text-[#00273b] hover:bg-[#f2f4f7] transition-colors"
                  title="Scan barcode"
                >
                  <Scan size={18} />
                </button>

                {/* Autocomplete dropdown */}
                {showAutocomplete && autoSuggestions.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#c2c7cd] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
                    {autoSuggestions.map(b => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-[#eceef1] last:border-b-0 cursor-pointer hover:bg-[#f2f4f7] transition-colors"
                        onMouseDown={() => handleAddBatch(b)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[#eceef1] flex items-center justify-center text-[#00273b] shrink-0">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#191c1e]">
                              {b.medicine_name}
                              {b.generic_name && b.generic_name !== b.medicine_name &&
                                <span className="font-normal text-[#72787e]"> ({b.generic_name})</span>}
                            </div>
                            <div className="text-[11px] text-[#42474d] mt-0.5">
                              In Stock: {b.quantity_remaining} &bull; {b.unit || 'Unit'}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#00273b] whitespace-nowrap ml-4">
                          LKR {fmt(b.selling_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap border transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#0f3d57] border-[#0f3d57] text-[#80a8c6]'
                        : 'border-[#c2c7cd] text-[#42474d] hover:border-[#00273b] hover:text-[#00273b] hover:bg-[#eceef1]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {batchesLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#72787e] text-sm">
                  <Loader2 size={28} className="animate-spin text-[#17a589]" />
                  <span>Loading catalog...</span>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#72787e] text-sm">
                  <AlertCircle size={28} className="text-[#c2c7cd]" />
                  <span>No items found matching your search.</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredBatches.map(b => (
                    <div
                      key={b.id}
                      onClick={() => handleAddBatch(b)}
                      className={`bg-white border border-[#e0e3e6] rounded-lg p-3 flex flex-col gap-2 cursor-pointer transition-all group hover:border-[#00273b] hover:shadow-[0_4px_12px_rgba(0,39,59,0.08)] ${
                        b.quantity_remaining <= 0 ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Top: icon + badge */}
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-md bg-[#f2f4f7] flex items-center justify-center text-[#00273b] group-hover:scale-110 transition-transform">
                          <Package size={20} />
                        </div>
                        <StockBadge qty={b.quantity_remaining} />
                      </div>

                      {/* Name */}
                      <div>
                        <div
                          className="text-[13px] font-semibold text-[#191c1e] overflow-hidden"
                          style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                          title={b.medicine_name}
                        >
                          {b.medicine_name}
                        </div>
                        <div className="text-[11px] text-[#42474d] mt-0.5">{b.unit || b.generic_name || 'Unit'}</div>
                      </div>

                      {/* Footer: price + add */}
                      <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#e0e3e6]">
                        <span className="font-display text-[15px] font-bold text-[#00273b]">Rs. {fmt(b.selling_price)}</span>
                        <button
                          className="w-7 h-7 rounded-full bg-[#eceef1] flex items-center justify-center text-[#00273b] hover:bg-[#2ecc71] hover:text-white transition-colors"
                          onClick={e => { e.stopPropagation(); handleAddBatch(b); }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── RIGHT PANEL — CART (40%) ──────────────────────────────── */}
          <section className="w-[40%] bg-[#00273b] flex flex-col h-full overflow-hidden">

            {/* Cart header */}
            <div className="px-5 py-3.5 border-b border-[#0f3d57] flex items-start justify-between shrink-0">
              <div>
                <h2 className="font-display text-[20px] font-bold text-white">Current Sale</h2>
                <p className="text-[11px] font-semibold text-[#80a8c6] tracking-wide mt-0.5">#INV-PENDING</p>
              </div>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ba1a1a] text-[#ba1a1a] rounded text-[11px] font-semibold hover:bg-[#ba1a1a] hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 size={12} /> Clear Cart
              </button>
            </div>

            {/* Customer row */}
            <div className="px-5 py-2.5 border-b border-[#0f3d57] bg-[#0f3d57]/30 flex items-center justify-between shrink-0 relative">
              {showPatientEdit ? (
                <div className="flex-1 relative">
                  <input
                    className="bg-black/30 border border-[#0f3d57] rounded-md px-3 py-1.5 text-white text-[13px] outline-none w-full placeholder:text-[#80a8c6]"
                    placeholder="Search patient by name or phone..."
                    value={patientSearch}
                    autoFocus
                    onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                    onBlur={() => setTimeout(() => setShowPatientEdit(false), 200)}
                  />
                  {patientSearch && !selectedPatient && patients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f3d57] border border-[#1e5070] rounded-md overflow-hidden z-50 max-h-40 overflow-y-auto">
                      {patients.map((p: any) => (
                        <div
                          key={p.id}
                          className="px-3.5 py-2 text-white text-[13px] cursor-pointer border-b border-[#1e5070] last:border-b-0 hover:bg-[#1e5070] transition-colors"
                          onMouseDown={() => {
                            setSelectedPatient({ id: p.id, name: p.name, phone: p.phone });
                            setPatientSearch(`${p.name} (${p.phone})`);
                            setShowPatientEdit(false);
                          }}
                        >
                          {p.name} — {p.phone}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white text-[14px] font-medium">
                  <UserSearch size={17} />
                  <span>{selectedPatient ? `${selectedPatient.name} (${selectedPatient.phone})` : 'Walk-in Customer (default)'}</span>
                </div>
              )}
              <button
                className="text-[#6bfe9c] hover:text-white transition-colors p-1 cursor-pointer ml-2 shrink-0"
                onClick={() => setShowPatientEdit(true)}
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* Cart items table */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2.5 text-[#80a8c6] text-[13px]">
                  <Package size={36} className="text-[#0f3d57]" />
                  <span>Cart is empty. Search or click a product.</span>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#0f3d57] sticky top-0 bg-[#00273b] z-10">
                      <th className="py-2 px-5 text-left text-[11px] font-semibold text-[#80a8c6] uppercase tracking-widest">Item</th>
                      <th className="py-2 px-2 text-center text-[11px] font-semibold text-[#80a8c6] uppercase tracking-widest w-24">Qty</th>
                      <th className="py-2 px-5 text-right text-[11px] font-semibold text-[#80a8c6] uppercase tracking-widest w-24">Price</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.batchId} className="border-b border-[#0f3d57]/40 hover:bg-[#0f3d57]/20 group transition-colors">
                        <td className="py-3 px-5">
                          <div className="text-[14px] font-semibold text-white">{item.medicineName}</div>
                          <div className="text-[11px] text-[#80a8c6] mt-0.5">Rs. {fmt(item.price)}/ea</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center gap-1.5 bg-[#0f3d57] rounded px-2 py-0.5 w-fit mx-auto">
                            <button
                              className="text-[#80a8c6] hover:text-white transition-colors p-0.5 cursor-pointer"
                              onClick={() => updateQuantity(item.batchId, item.quantity - 1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-white font-bold text-[14px] min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              className="text-[#80a8c6] hover:text-white transition-colors p-0.5 cursor-pointer"
                              onClick={() => updateQuantity(item.batchId, item.quantity + 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-right text-[14px] font-semibold text-white">
                          {fmt(item.price * item.quantity)}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            className="text-[#80a8c6] hover:text-[#ba1a1a] transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                            onClick={() => removeFromCart(item.batchId)}
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Order summary + payment */}
            <div className="bg-[#0f3d57] rounded-t-xl px-5 py-4 flex flex-col gap-3 shrink-0">

              {/* Subtotal */}
              <div className="flex justify-between items-center text-[14px] text-white">
                <span>Subtotal</span>
                <span>LKR {fmt(subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center text-[13px] text-[#e67e22]">
                <span>Discount (LKR)</span>
                <input
                  type="number"
                  className="w-24 px-2.5 py-1.5 bg-[#00273b]/50 border border-[#264b65] rounded-md text-white text-[13px] font-semibold text-right outline-none focus:border-[#2ecc71] transition-colors"
                  placeholder="0.00"
                  value={discount || ''}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>

              <div className="h-px bg-[#00273b]" />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="text-[16px] font-bold text-white">Total</span>
                <span className="font-display text-[30px] font-bold text-[#2ecc71] leading-none">LKR {fmt(netTotal)}</span>
              </div>

              {/* Payment method buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Cash',      value: 'Cash',      icon: <Banknote size={17} /> },
                  { label: 'Card',      value: 'Card',      icon: <CreditCard size={17} /> },
                  { label: 'QR/Online', value: 'QR/Online', icon: <QrCode size={17} /> },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`rounded-md py-2 flex flex-col items-center gap-1 text-[11px] font-semibold border cursor-pointer transition-all ${
                      paymentMethod === m.value
                        ? 'border-[#6bfe9c] text-[#6bfe9c] bg-[#6bfe9c]/8'
                        : 'border-[#264b65] text-[#80a8c6] hover:border-[#80a8c6] hover:text-white bg-[#00273b]'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Cash tendered row */}
              {paymentMethod === 'Cash' && (
                <div className="flex justify-between items-center bg-[#00273b] border border-[#264b65] rounded-md px-3.5 py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-[#80a8c6] tracking-wider uppercase">Cash Received</span>
                    <input
                      type="number"
                      className="bg-transparent text-white text-[15px] font-bold outline-none w-28 mt-1 placeholder:text-[#80a8c6] placeholder:font-normal"
                      placeholder="Enter amount..."
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                    />
                  </div>
                  <div className="w-px h-9 bg-[#264b65]" />
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-[#80a8c6] tracking-wider uppercase">Change Due</span>
                    <span className="text-[15px] font-bold text-[#e67e22] mt-1">LKR {fmt(changeDue)}</span>
                  </div>
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || invoiceMutation.isPending}
                className="w-full h-14 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#264b65] disabled:text-[#80a8c6] disabled:cursor-not-allowed rounded-lg text-white font-display text-[17px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(46,204,113,0.3)] active:scale-[0.99] transition-all cursor-pointer"
              >
                {invoiceMutation.isPending ? (
                  <><Loader2 size={20} className="animate-spin" /> Finalizing...</>
                ) : (
                  <>Proceed to Payment <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ── PAYMENT MODAL ──────────────────────────────────────────────────── */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2d3133]/60 backdrop-blur-sm"
          onClick={() => setShowPayModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.16)] w-full max-w-md overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-5 py-4 bg-[#00273b] flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-white">Confirm Payment</h3>
              <button
                className="text-[#80a8c6] hover:text-white hover:bg-white/10 rounded p-1 transition-colors cursor-pointer"
                onClick={() => setShowPayModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 flex flex-col gap-5">
              <div className="text-center">
                <p className="text-[11px] font-semibold text-[#42474d] uppercase tracking-widest">Amount Due</p>
                <p className="font-display text-[40px] font-bold text-[#191c1e] leading-tight mt-1">LKR {fmt(netTotal)}</p>
              </div>

              <div className="bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg px-4 py-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#42474d]">Payment Method</span>
                  <span className="font-semibold text-[#191c1e]">{paymentMethod}</span>
                </div>
                <div className="h-px bg-[#e0e3e6]" />
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#42474d]">Subtotal</span>
                  <span className="font-semibold text-[#191c1e]">LKR {fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#42474d]">Discount</span>
                    <span className="font-semibold text-[#e67e22]">-LKR {fmt(discount)}</span>
                  </div>
                )}
                {paymentMethod === 'Cash' && parseFloat(cashReceived) > 0 && (
                  <>
                    <div className="h-px bg-[#e0e3e6]" />
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#42474d]">Cash Tendered</span>
                      <span className="font-semibold text-[#191c1e]">LKR {fmt(parseFloat(cashReceived))}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#42474d]">Change Due</span>
                      <span className="font-semibold text-[#e67e22]">LKR {fmt(changeDue)}</span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-[13px] text-[#42474d] text-center leading-relaxed">
                Confirm receipt of payment to complete this transaction and generate the receipt.
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 border border-[#72787e] text-[#191c1e] bg-white rounded-md text-[14px] font-semibold hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                  onClick={() => setShowPayModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-[2] py-3 bg-[#2ecc71] hover:bg-[#27ae60] disabled:bg-[#b2dfdb] text-white rounded-md text-[14px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  onClick={handleConfirmPayment}
                  disabled={invoiceMutation.isPending}
                >
                  {invoiceMutation.isPending
                    ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
                    : <><Check size={15} /> Confirm &amp; Complete Sale</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ──────────────────────────────────────────────────── */}
      {showSuccessModal && printedInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2d3133]/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.16)] w-full max-w-sm overflow-hidden">
            <div className="px-6 py-6 flex flex-col gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e8f8f5] flex items-center justify-center mx-auto text-[#2ecc71]">
                <Check size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-display text-[20px] font-bold text-[#191c1e]">Sale Complete!</h3>
                <p className="text-[13px] text-[#42474d] mt-1">
                  Invoice #{printedInvoice.invoice_number} created successfully.
                </p>
              </div>
              <div className="bg-[#f2f4f7] border border-[#e0e3e6] rounded-lg px-4 py-3 flex flex-col gap-2 text-left">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#42474d]">Items sold</span>
                  <span className="font-semibold text-[#191c1e]">{printedInvoice.items?.length ?? 0} products</span>
                </div>
                <div className="h-px bg-[#e0e3e6]" />
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#42474d]">Total Paid</span>
                  <span className="font-bold text-[#2ecc71]">LKR {fmt(netTotal)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 border border-[#72787e] text-[#191c1e] rounded-md text-[13px] font-semibold hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                  onClick={reset}
                >
                  Skip &amp; New Sale
                </button>
                <button
                  className="flex-1 py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-md text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  onClick={handlePrintAndClose}
                >
                  <Printer size={15} /> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── THERMAL RECEIPT (hidden — shown only via window.print()) ─────── */}
      {printedInvoice && (
        <div id="receipt-print" style={{ fontFamily: 'monospace', padding: '16px', width: '300px' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 10, marginBottom: 10 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>{printedInvoice.invoice_number}</h2>
            <p style={{ margin: 0, fontSize: 10 }}>Date: {new Date(printedInvoice.created_at).toLocaleString()}</p>
            <p style={{ margin: 0, fontSize: 10 }}>Payment: {printedInvoice.payment_method}</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {printedInvoice.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0' }}>
                    {item.medicine_name}<br />
                    <span style={{ fontSize: 8, color: '#555' }}>Batch: {item.batch_number}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px dashed #000', paddingTop: 10, marginTop: 10, fontSize: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span><span>{printedInvoice.total_amount?.toFixed(2)}</span>
            </div>
            {printedInvoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount:</span><span>-{printedInvoice.discount?.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 12, marginTop: 5 }}>
              <span>Payable:</span><span>LKR {printedInvoice.net_amount?.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 9, borderTop: '1px solid #000', paddingTop: 8 }}>
            <p style={{ margin: 0 }}>Thank you for visiting us!</p>
            <p style={{ margin: '0 0 10px' }}>medical.lk Software</p>
          </div>
        </div>
      )}
    </>
  );
}
