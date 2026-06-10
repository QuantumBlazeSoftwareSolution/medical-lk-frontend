'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Search, Plus, Minus, X, Trash2, Printer, Loader2,
  AlertCircle, Scan, CreditCard, Smartphone, Banknote,
  Check, UserSearch, Pencil, Calendar, User, Wifi,
  QrCode, ArrowRight, Package
} from 'lucide-react';
import { usePOSStore, CartItem } from '@/store/usePOSStore';
import { apiFetch } from '@/utils/api';

// ─── tiny helpers ──────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StockBadge({ qty }: { qty: number }) {
  if (qty <= 0)
    return <span className="pos-badge pos-badge-out">Out of stock</span>;
  if (qty <= 10)
    return <span className="pos-badge pos-badge-low">{qty} in stock</span>;
  return <span className="pos-badge pos-badge-ok">{qty} in stock</span>;
}

const CATEGORIES = ['All', 'Medicines', 'First Aid', 'Vitamins', 'Personal Care'];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function POSTerminal() {
  const {
    cart, discount, paymentMethod, selectedPatient,
    addToCart, removeFromCart, updateQuantity, clearCart,
    setDiscount, setPaymentMethod, setSelectedPatient,
  } = usePOSStore();

  // UI state
  const [searchQuery, setSearchQuery]         = useState('');
  const [activeCategory, setActiveCategory]   = useState('All');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cashReceived, setCashReceived]        = useState('');
  const [showPayModal, setShowPayModal]        = useState(false);
  const [lastInvoiceId, setLastInvoiceId]     = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [patientSearch, setPatientSearch]      = useState('');
  const [showPatientEdit, setShowPatientEdit]  = useState(false);
  const [now, setNow]                          = useState(new Date());

  const searchRef  = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close autocomplete on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search
  useEffect(() => { searchRef.current?.focus(); }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // ── Invoice mutation ───────────────────────────────────────────────────────
  const invoiceMutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch('/api/pos/invoices', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setLastInvoiceId(data.invoice_id);
      refetchBatches();
      setShowPayModal(false);
      setShowSuccessModal(true);
    },
    onError: (err: any) => {
      alert(err.message || 'Transaction failed. Please try again.');
    },
  });

  // ── Derived values ─────────────────────────────────────────────────────────
  const subtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const netTotal  = Math.max(0, subtotal - discount);
  const changeDue = Math.max(0, parseFloat(cashReceived || '0') - netTotal);

  const filteredBatches = batches.filter(b => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      b.medicine_name.toLowerCase().includes(term) ||
      (b.generic_name && b.generic_name.toLowerCase().includes(term)) ||
      b.batch_number.toLowerCase().includes(term);
    return matchesSearch;
  });

  // Autocomplete: top 5 matches
  const autoSuggestions = searchQuery.length > 0 ? filteredBatches.slice(0, 5) : [];

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAddBatch = useCallback((batch: any) => {
    if (batch.quantity_remaining <= 0) return;
    addToCart({
      batchId: batch.id,
      medicineId: batch.medicine_id,
      medicineName: batch.medicine_name,
      genericName: batch.generic_name,
      batchNumber: batch.batch_number,
      price: batch.selling_price,
      stockAvailable: batch.quantity_remaining,
      expiryDate: batch.expiry_date,
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
    const payload = {
      patient_id: selectedPatient?.id || null,
      discount,
      payment_method: paymentMethod,
      items: cart.map(i => ({ batch_id: i.batchId, quantity: i.quantity })),
    };
    invoiceMutation.mutate(payload);
  };

  const handlePrintAndClose = () => {
    setTimeout(() => {
      window.print();
      setShowSuccessModal(false);
      setLastInvoiceId(null);
      clearCart();
      setCashReceived('');
    }, 100);
  };

  const handleSkipPrint = () => {
    setShowSuccessModal(false);
    setLastInvoiceId(null);
    clearCart();
    setCashReceived('');
  };

  // ── Formatted date/time ────────────────────────────────────────────────────
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  // Next invoice number preview (just display cart length as indicator)
  const invoiceRef = `#INV-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

  return (
    <>
      {/* ── Scoped CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        .pos-root {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: #f7f9fc;
          font-family: 'Inter', sans-serif;
        }

        /* Top bar */
        .pos-topbar {
          height: 56px;
          background: #ffffff;
          border-bottom: 1px solid #c2c7cd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
          z-index: 10;
        }
        .pos-topbar-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #00273b;
          line-height: 1;
        }
        .pos-live-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 10px;
          background: #e8f8f5;
          border: 1px solid #2ecc71;
          border-radius: 999px;
        }
        .pos-live-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #2ecc71;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pos-live-text {
          font-size: 11px; font-weight: 600;
          color: #2ecc71; letter-spacing: 0.04em;
        }
        .pos-meta {
          display: flex; align-items: center; gap: 20px;
          font-size: 12px; font-weight: 500; color: #42474d;
        }
        .pos-meta-item { display: flex; align-items: center; gap: 6px; }
        .pos-meta-sep { width: 1px; height: 20px; background: #c2c7cd; }
        .pos-meta-icon { color: #00273b; }
        .pos-meta-icon-green { color: #2ecc71; }

        /* Body: two panels */
        .pos-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* LEFT panel */
        .pos-left {
          width: 60%;
          display: flex;
          flex-direction: column;
          background: #f2f4f7;
          border-right: 1px solid #c2c7cd;
          overflow: hidden;
        }

        /* Search area */
        .pos-search-area {
          background: #ffffff;
          border-bottom: 1px solid #e6e8eb;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          z-index: 5;
          position: relative;
        }
        .pos-search-wrap {
          position: relative;
        }
        .pos-search-input {
          width: 100%;
          padding: 12px 48px 12px 44px;
          border: 1.5px solid #17a589;
          border-radius: 8px;
          background: #ffffff;
          font-size: 15px;
          color: #191c1e;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
          box-sizing: border-box;
        }
        .pos-search-input:focus {
          border-color: #17a589;
          box-shadow: 0 0 0 3px rgba(23,165,137,0.15);
        }
        .pos-search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #72787e;
          pointer-events: none;
        }
        .pos-scan-btn {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          color: #42474d;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
        }
        .pos-scan-btn:hover { color: #00273b; background: #f2f4f7; }

        /* Autocomplete */
        .pos-autocomplete {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #ffffff;
          border: 1px solid #c2c7cd;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 100;
          overflow: hidden;
        }
        .pos-auto-item {
          padding: 10px 16px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer;
          border-bottom: 1px solid #eceef1;
          transition: background 0.1s;
        }
        .pos-auto-item:last-child { border-bottom: none; }
        .pos-auto-item:hover { background: #f2f4f7; }
        .pos-auto-icon {
          width: 32px; height: 32px;
          border-radius: 6px;
          background: #eceef1;
          display: flex; align-items: center; justify-content: center;
          color: #00273b;
          flex-shrink: 0;
          margin-right: 12px;
        }
        .pos-auto-name {
          font-size: 14px; font-weight: 600; color: #191c1e;
        }
        .pos-auto-sub {
          font-size: 11px; color: #42474d; margin-top: 1px;
        }
        .pos-auto-price {
          font-size: 14px; font-weight: 700; color: #00273b;
          white-space: nowrap;
        }

        /* Category pills */
        .pos-cats {
          display: flex; gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }
        .pos-cats::-webkit-scrollbar { display: none; }
        .pos-cat {
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid #c2c7cd;
          font-size: 11px; font-weight: 600;
          color: #42474d;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
          letter-spacing: 0.02em;
        }
        .pos-cat:hover { border-color: #00273b; color: #00273b; background: #eceef1; }
        .pos-cat.active {
          background: #0f3d57;
          border-color: #0f3d57;
          color: #80a8c6;
        }

        /* Product grid */
        .pos-grid-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .pos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (min-width: 1280px) {
          .pos-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .pos-card {
          background: #ffffff;
          border: 1px solid #e0e3e6;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          position: relative;
          overflow: hidden;
        }
        .pos-card:hover { border-color: #00273b; box-shadow: 0 4px 12px rgba(0,39,59,0.08); }
        .pos-card.out-of-stock { opacity: 0.5; pointer-events: none; }
        .pos-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .pos-card-icon {
          width: 40px; height: 40px;
          border-radius: 6px;
          background: #f2f4f7;
          display: flex; align-items: center; justify-content: center;
          color: #00273b;
          transition: transform 0.2s;
        }
        .pos-card:hover .pos-card-icon { transform: scale(1.1); }
        .pos-card-name {
          font-size: 13px; font-weight: 600;
          color: #191c1e;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .pos-card-unit { font-size: 12px; color: #42474d; }
        .pos-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid #e0e3e6;
        }
        .pos-card-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px; font-weight: 700;
          color: #00273b;
        }
        .pos-card-add {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #eceef1;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #00273b;
          transition: background 0.15s, color 0.15s;
        }
        .pos-card-add:hover { background: #2ecc71; color: #ffffff; }

        /* Badges */
        .pos-badge {
          font-size: 10px; font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .pos-badge-ok { color: #2ecc71; background: #e8f8f5; }
        .pos-badge-low { color: #e67e22; background: #fef9ec; }
        .pos-badge-out { color: #ba1a1a; background: #ffdad6; }

        /* Empty/loading states */
        .pos-state-center {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; color: #72787e; font-size: 13px;
        }

        /* ── RIGHT PANEL ─────────────────────────────────────────── */
        .pos-right {
          width: 40%;
          background: #00273b;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* Cart header */
        .pos-cart-header {
          padding: 14px 20px;
          border-bottom: 1px solid #0f3d57;
          background: #00273b;
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-shrink: 0;
        }
        .pos-cart-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #ffffff;
        }
        .pos-cart-invno {
          font-size: 11px; font-weight: 600;
          color: #80a8c6; margin-top: 2px;
          letter-spacing: 0.04em;
        }
        .pos-clear-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          border: 1px solid #ba1a1a;
          color: #ba1a1a;
          border-radius: 4px;
          font-size: 11px; font-weight: 600;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .pos-clear-btn:hover { background: #ba1a1a; color: #ffffff; }

        /* Customer row */
        .pos-customer-row {
          padding: 10px 20px;
          border-bottom: 1px solid #0f3d57;
          background: rgba(15,61,87,0.3);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .pos-customer-info {
          display: flex; align-items: center; gap: 8px;
          color: #ffffff; font-size: 14px; font-weight: 500;
        }
        .pos-customer-edit {
          background: none; border: none; cursor: pointer;
          color: #6bfe9c; padding: 4px;
          transition: color 0.15s;
        }
        .pos-customer-edit:hover { color: #ffffff; }

        /* Patient search dropdown (inside customer row) */
        .pos-patient-search {
          background: rgba(0,0,0,0.3);
          border: 1px solid #0f3d57;
          border-radius: 6px;
          padding: 6px 12px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          width: 200px;
        }
        .pos-patient-search::placeholder { color: #80a8c6; }
        .pos-patient-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #0f3d57;
          border: 1px solid #1e5070;
          border-radius: 6px;
          overflow: hidden;
          z-index: 50;
          max-height: 160px;
          overflow-y: auto;
        }
        .pos-patient-option {
          padding: 8px 14px;
          color: #ffffff; font-size: 13px;
          cursor: pointer;
          border-bottom: 1px solid #1e5070;
          transition: background 0.1s;
        }
        .pos-patient-option:hover { background: #1e5070; }
        .pos-patient-option:last-child { border-bottom: none; }

        /* Cart table */
        .pos-cart-table-wrap {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .pos-cart-table-wrap::-webkit-scrollbar { display: none; }
        .pos-cart-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pos-cart-thead th {
          padding: 8px 20px;
          font-size: 11px; font-weight: 600;
          color: #80a8c6;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #0f3d57;
          background: #00273b;
          position: sticky; top: 0; z-index: 2;
        }
        .pos-cart-row {
          border-bottom: 1px solid rgba(15,61,87,0.4);
          transition: background 0.1s;
        }
        .pos-cart-row:hover { background: rgba(15,61,87,0.2); }
        .pos-cart-row td { padding: 12px 20px; vertical-align: middle; }
        .pos-item-name {
          font-size: 14px; font-weight: 600; color: #ffffff;
        }
        .pos-item-price {
          font-size: 11px; font-weight: 500; color: #80a8c6; margin-top: 2px;
        }
        .pos-qty-ctrl {
          display: flex; align-items: center; gap: 6px;
          background: #0f3d57;
          border-radius: 4px;
          padding: 3px 6px;
          width: fit-content;
          margin: 0 auto;
        }
        .pos-qty-btn {
          background: none; border: none;
          color: #80a8c6; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 2px;
          transition: color 0.1s;
        }
        .pos-qty-btn:hover { color: #ffffff; }
        .pos-qty-val {
          font-size: 14px; font-weight: 700;
          color: #ffffff;
          min-width: 20px;
          text-align: center;
        }
        .pos-item-total {
          font-size: 14px; font-weight: 600;
          color: #ffffff; text-align: right;
        }
        .pos-remove-btn {
          background: none; border: none;
          color: #80a8c6; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 4px;
          opacity: 0;
          transition: color 0.1s, opacity 0.1s;
        }
        .pos-cart-row:hover .pos-remove-btn { opacity: 1; }
        .pos-remove-btn:hover { color: #ba1a1a; }

        /* Empty cart */
        .pos-cart-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%;
          gap: 10px;
          color: #80a8c6;
          font-size: 13px;
        }

        /* Order summary */
        .pos-summary {
          background: #0f3d57;
          border-radius: 12px 12px 0 0;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
        }
        .pos-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 14px; color: #ffffff;
        }
        .pos-summary-row.discount { color: #e67e22; }
        .pos-summary-divider {
          height: 1px; background: #00273b; margin: 2px 0;
        }
        .pos-total-row {
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .pos-total-label {
          font-size: 16px; font-weight: 700; color: #ffffff;
        }
        .pos-total-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 32px; font-weight: 700;
          color: #2ecc71; line-height: 1;
        }

        /* Discount input */
        .pos-discount-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px;
        }
        .pos-discount-input {
          width: 90px;
          padding: 5px 10px;
          background: rgba(0,39,59,0.5);
          border: 1px solid #264b65;
          border-radius: 6px;
          color: #ffffff;
          font-size: 13px; font-weight: 600;
          text-align: right;
          outline: none;
          transition: border-color 0.15s;
        }
        .pos-discount-input:focus { border-color: #2ecc71; }

        /* Payment method buttons */
        .pos-pay-methods {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .pos-pay-btn {
          background: #00273b;
          border: 1px solid #264b65;
          color: #80a8c6;
          border-radius: 6px;
          padding: 8px 4px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px;
          font-size: 11px; font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pos-pay-btn:hover { border-color: #80a8c6; color: #ffffff; }
        .pos-pay-btn.active {
          border-color: #6bfe9c;
          color: #6bfe9c;
          background: rgba(107,254,156,0.08);
        }

        /* Cash tendered row */
        .pos-cash-row {
          display: flex; justify-content: space-between; align-items: center;
          background: #00273b;
          border: 1px solid #264b65;
          border-radius: 6px;
          padding: 8px 14px;
        }
        .pos-cash-col { display: flex; flex-direction: column; }
        .pos-cash-label { font-size: 10px; font-weight: 600; color: #80a8c6; letter-spacing: 0.04em; }
        .pos-cash-val { font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 2px; }
        .pos-cash-change { font-size: 15px; font-weight: 700; color: #e67e22; margin-top: 2px; }
        .pos-cash-sep { width: 1px; height: 36px; background: #264b65; }
        .pos-cash-input {
          background: none; border: none;
          color: #ffffff; font-size: 15px; font-weight: 700;
          outline: none; width: 100px; text-align: right;
        }
        .pos-cash-input::placeholder { color: #80a8c6; font-weight: 400; }

        /* Checkout button */
        .pos-checkout-btn {
          width: 100%;
          height: 60px;
          background: #2ecc71;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 4px 16px rgba(46,204,113,0.3);
        }
        .pos-checkout-btn:hover { background: #27ae60; }
        .pos-checkout-btn:active { transform: scale(0.99); }
        .pos-checkout-btn:disabled {
          background: #264b65; color: #80a8c6;
          box-shadow: none; cursor: not-allowed;
        }

        /* ── MODALS ──────────────────────────────────────── */
        .pos-modal-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          background: rgba(45,49,51,0.6);
          backdrop-filter: blur(4px);
        }
        .pos-modal {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.16);
          width: 100%; max-width: 440px;
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .pos-modal-header {
          padding: 16px 20px;
          background: #00273b;
          color: #ffffff;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pos-modal-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px; font-weight: 700;
        }
        .pos-modal-close {
          background: none; border: none;
          color: #80a8c6; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          padding: 4px; border-radius: 4px;
          transition: color 0.1s, background 0.1s;
        }
        .pos-modal-close:hover { color: #ffffff; background: rgba(255,255,255,0.1); }
        .pos-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .pos-modal-amount-label {
          font-size: 11px; font-weight: 600;
          color: #42474d; text-transform: uppercase; letter-spacing: 0.06em;
          text-align: center;
        }
        .pos-modal-amount-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 42px; font-weight: 700;
          color: #191c1e; text-align: center; line-height: 1;
        }
        .pos-modal-detail-box {
          background: #f2f4f7;
          border: 1px solid #e0e3e6;
          border-radius: 8px;
          padding: 14px 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .pos-modal-detail-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 13px;
        }
        .pos-modal-detail-row span:first-child { color: #42474d; }
        .pos-modal-detail-row span:last-child { color: #191c1e; font-weight: 600; }
        .pos-modal-detail-divider { height: 1px; background: #e0e3e6; }
        .pos-modal-note {
          font-size: 13px; color: #42474d; text-align: center; line-height: 1.5;
        }
        .pos-modal-actions { display: flex; gap: 12px; }
        .pos-modal-cancel {
          flex: 1; padding: 12px;
          border: 1px solid #72787e;
          color: #191c1e;
          background: #ffffff;
          border-radius: 6px;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pos-modal-cancel:hover { background: #f2f4f7; }
        .pos-modal-confirm {
          flex: 2; padding: 12px;
          background: #2ecc71;
          border: none;
          color: #ffffff;
          border-radius: 6px;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background 0.15s;
        }
        .pos-modal-confirm:hover { background: #27ae60; }
        .pos-modal-confirm:disabled { background: #b2dfdb; cursor: not-allowed; }

        /* Success modal */
        .pos-success-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: #e8f8f5;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto;
          color: #2ecc71;
        }
        .pos-success-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #191c1e; text-align: center;
        }
        .pos-success-sub {
          font-size: 13px; color: #42474d; text-align: center;
        }

        /* Print styles */
        @media print {
          body > * { display: none !important; }
          #receipt-print { display: block !important; }
        }
        #receipt-print { display: none; }
      `}</style>

      <div className="pos-root">

        {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
        <header className="pos-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 className="pos-topbar-title">POS Terminal</h1>
            <div className="pos-live-badge">
              <div className="pos-live-dot" />
              <span className="pos-live-text">Live</span>
            </div>
          </div>

          <div className="pos-meta">
            <div className="pos-meta-item">
              <Calendar size={15} className="pos-meta-icon" />
              <span>{dateStr} — {timeStr}</span>
            </div>
            <div className="pos-meta-sep" />
            <div className="pos-meta-item">
              <User size={15} className="pos-meta-icon" />
              <span>{typeof window !== 'undefined' ? localStorage.getItem('username') || 'Cashier' : 'Cashier'}</span>
            </div>
            <div className="pos-meta-sep" />
            <div className="pos-meta-item">
              <Printer size={15} className="pos-meta-icon-green" />
              <span>Connected</span>
            </div>
            <div className="pos-meta-sep" />
            <div className="pos-meta-item">
              <Scan size={15} className="pos-meta-icon-green" />
              <span>Ready</span>
            </div>
          </div>
        </header>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        <div className="pos-body">

          {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
          <section className="pos-left">

            {/* Search + categories */}
            <div className="pos-search-area">
              <div className="pos-search-wrap" ref={autocompleteRef}>
                <Search size={18} className="pos-search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  className="pos-search-input"
                  placeholder="Scan barcode or type product name..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => searchQuery && setShowAutocomplete(true)}
                  autoComplete="off"
                />
                <button className="pos-scan-btn" title="Scan barcode">
                  <Scan size={18} />
                </button>

                {/* Autocomplete */}
                {showAutocomplete && autoSuggestions.length > 0 && (
                  <div className="pos-autocomplete">
                    {autoSuggestions.map(b => (
                      <div
                        key={b.id}
                        className="pos-auto-item"
                        onMouseDown={() => handleAddBatch(b)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="pos-auto-icon">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="pos-auto-name">
                              {b.medicine_name}
                              {b.generic_name && b.generic_name !== b.medicine_name &&
                                <span style={{ fontWeight: 400, color: '#72787e' }}> ({b.generic_name})</span>
                              }
                            </div>
                            <div className="pos-auto-sub">In Stock: {b.quantity_remaining} &bull; {b.unit || 'Unit'}</div>
                          </div>
                        </div>
                        <span className="pos-auto-price">LKR {fmt(b.selling_price)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category pills */}
              <div className="pos-cats">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`pos-cat${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="pos-grid-wrap">
              {batchesLoading ? (
                <div className="pos-state-center">
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#17a589' }} />
                  <span>Loading catalog...</span>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="pos-state-center">
                  <AlertCircle size={28} style={{ color: '#c2c7cd' }} />
                  <span>No items found matching your search.</span>
                </div>
              ) : (
                <div className="pos-grid">
                  {filteredBatches.map(b => (
                    <div
                      key={b.id}
                      className={`pos-card${b.quantity_remaining <= 0 ? ' out-of-stock' : ''}`}
                      onClick={() => handleAddBatch(b)}
                    >
                      <div className="pos-card-top">
                        <div className="pos-card-icon">
                          <Package size={20} />
                        </div>
                        <StockBadge qty={b.quantity_remaining} />
                      </div>
                      <div>
                        <div className="pos-card-name" title={b.medicine_name}>{b.medicine_name}</div>
                        <div className="pos-card-unit">{b.unit || b.generic_name || 'Unit'}</div>
                      </div>
                      <div className="pos-card-footer">
                        <span className="pos-card-price">Rs. {fmt(b.selling_price)}</span>
                        <button className="pos-card-add" onClick={e => { e.stopPropagation(); handleAddBatch(b); }}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── RIGHT PANEL (CART) ─────────────────────────────────────── */}
          <section className="pos-right">

            {/* Cart header */}
            <div className="pos-cart-header">
              <div>
                <div className="pos-cart-title">Current Sale</div>
                <div className="pos-cart-invno">{invoiceRef}</div>
              </div>
              <button className="pos-clear-btn" onClick={clearCart}>
                <Trash2 size={13} /> Clear Cart
              </button>
            </div>

            {/* Customer row */}
            <div className="pos-customer-row" style={{ position: 'relative' }}>
              {showPatientEdit ? (
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    className="pos-patient-search"
                    placeholder="Search patient by name or phone..."
                    value={patientSearch}
                    autoFocus
                    onChange={e => {
                      setPatientSearch(e.target.value);
                      setSelectedPatient(null);
                    }}
                    onBlur={() => setTimeout(() => setShowPatientEdit(false), 200)}
                  />
                  {patientSearch && !selectedPatient && patients.length > 0 && (
                    <div className="pos-patient-dropdown">
                      {patients.map((p: any) => (
                        <div
                          key={p.id}
                          className="pos-patient-option"
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
                <div className="pos-customer-info">
                  <UserSearch size={18} />
                  <span>{selectedPatient ? `${selectedPatient.name} (${selectedPatient.phone})` : 'Walk-in Customer (default)'}</span>
                </div>
              )}
              <button
                className="pos-customer-edit"
                title="Edit customer"
                onClick={() => setShowPatientEdit(true)}
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* Cart table */}
            <div className="pos-cart-table-wrap">
              {cart.length === 0 ? (
                <div className="pos-cart-empty">
                  <Package size={36} style={{ color: '#0f3d57' }} />
                  <span>Cart is empty. Search or click a product to add.</span>
                </div>
              ) : (
                <table className="pos-cart-table">
                  <thead className="pos-cart-thead">
                    <tr>
                      <th style={{ textAlign: 'left' }}>Item</th>
                      <th style={{ textAlign: 'center', width: 100 }}>Qty</th>
                      <th style={{ textAlign: 'right', width: 90 }}>Price</th>
                      <th style={{ width: 32 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.batchId} className="pos-cart-row">
                        <td>
                          <div className="pos-item-name">{item.medicineName}</div>
                          <div className="pos-item-price">Rs. {fmt(item.price)}/ea</div>
                        </td>
                        <td>
                          <div className="pos-qty-ctrl">
                            <button className="pos-qty-btn" onClick={() => updateQuantity(item.batchId, item.quantity - 1)}>
                              <Minus size={13} />
                            </button>
                            <span className="pos-qty-val">{item.quantity}</span>
                            <button className="pos-qty-btn" onClick={() => updateQuantity(item.batchId, item.quantity + 1)}>
                              <Plus size={13} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="pos-item-total">{fmt(item.price * item.quantity)}</div>
                        </td>
                        <td>
                          <button className="pos-remove-btn" onClick={() => removeFromCart(item.batchId)}>
                            <X size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Order summary + payment */}
            <div className="pos-summary">
              {/* Subtotal / discount */}
              <div className="pos-summary-row">
                <span>Subtotal</span>
                <span>LKR {fmt(subtotal)}</span>
              </div>

              {/* Discount input */}
              <div className="pos-discount-row" style={{ color: '#e67e22' }}>
                <span style={{ fontSize: 13, color: '#e67e22' }}>Discount (LKR)</span>
                <input
                  type="number"
                  className="pos-discount-input"
                  placeholder="0.00"
                  value={discount || ''}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>

              <div className="pos-summary-divider" />

              {/* Total */}
              <div className="pos-total-row">
                <span className="pos-total-label">Total</span>
                <span className="pos-total-val">LKR {fmt(netTotal)}</span>
              </div>

              {/* Payment method */}
              <div className="pos-pay-methods">
                <button
                  className={`pos-pay-btn${paymentMethod === 'Cash' ? ' active' : ''}`}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <Banknote size={18} />
                  <span>Cash</span>
                </button>
                <button
                  className={`pos-pay-btn${paymentMethod === 'Card' ? ' active' : ''}`}
                  onClick={() => setPaymentMethod('Card')}
                >
                  <CreditCard size={18} />
                  <span>Card</span>
                </button>
                <button
                  className={`pos-pay-btn${paymentMethod === 'QR/Online' ? ' active' : ''}`}
                  onClick={() => setPaymentMethod('QR/Online')}
                >
                  <QrCode size={18} />
                  <span>QR/Online</span>
                </button>
              </div>

              {/* Cash tendered row (only when Cash selected) */}
              {paymentMethod === 'Cash' && (
                <div className="pos-cash-row">
                  <div className="pos-cash-col">
                    <span className="pos-cash-label">Cash Received</span>
                    <input
                      className="pos-cash-input"
                      type="number"
                      placeholder="Enter amount..."
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                    />
                  </div>
                  <div className="pos-cash-sep" />
                  <div className="pos-cash-col" style={{ alignItems: 'flex-end' }}>
                    <span className="pos-cash-label">Change Due</span>
                    <span className="pos-cash-change">LKR {fmt(changeDue)}</span>
                  </div>
                </div>
              )}

              {/* Checkout */}
              <button
                className="pos-checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0 || invoiceMutation.isPending}
              >
                {invoiceMutation.isPending ? (
                  <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Finalizing...</>
                ) : (
                  <>Proceed to Payment <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ── PAYMENT CONFIRMATION MODAL ────────────────────────────────────── */}
      {showPayModal && (
        <div className="pos-modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="pos-modal" onClick={e => e.stopPropagation()}>
            <div className="pos-modal-header">
              <span className="pos-modal-title">Confirm Payment</span>
              <button className="pos-modal-close" onClick={() => setShowPayModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pos-modal-body">
              <div>
                <div className="pos-modal-amount-label">Amount Due</div>
                <div className="pos-modal-amount-val">LKR {fmt(netTotal)}</div>
              </div>

              <div className="pos-modal-detail-box">
                <div className="pos-modal-detail-row">
                  <span>Payment Method</span>
                  <span>{paymentMethod}</span>
                </div>
                <div className="pos-modal-detail-divider" />
                <div className="pos-modal-detail-row">
                  <span>Subtotal</span>
                  <span>LKR {fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="pos-modal-detail-row">
                    <span>Discount</span>
                    <span style={{ color: '#e67e22' }}>-LKR {fmt(discount)}</span>
                  </div>
                )}
                {paymentMethod === 'Cash' && parseFloat(cashReceived) > 0 && (
                  <>
                    <div className="pos-modal-detail-divider" />
                    <div className="pos-modal-detail-row">
                      <span>Cash Tendered</span>
                      <span>LKR {fmt(parseFloat(cashReceived))}</span>
                    </div>
                    <div className="pos-modal-detail-row">
                      <span>Change Due</span>
                      <span style={{ color: '#e67e22' }}>LKR {fmt(changeDue)}</span>
                    </div>
                  </>
                )}
              </div>

              <p className="pos-modal-note">
                Please confirm receipt of payment to complete this transaction and generate the receipt.
              </p>

              <div className="pos-modal-actions">
                <button className="pos-modal-cancel" onClick={() => setShowPayModal(false)}>
                  Cancel
                </button>
                <button
                  className="pos-modal-confirm"
                  onClick={handleConfirmPayment}
                  disabled={invoiceMutation.isPending}
                >
                  {invoiceMutation.isPending ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    <><Check size={16} /> Confirm &amp; Complete Sale</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ────────────────────────────────────────────────── */}
      {showSuccessModal && printedInvoice && (
        <div className="pos-modal-overlay">
          <div className="pos-modal">
            <div className="pos-modal-body" style={{ textAlign: 'center', gap: 16 }}>
              <div className="pos-success-icon">
                <Check size={32} strokeWidth={2.5} />
              </div>
              <div>
                <div className="pos-success-title">Sale Complete!</div>
                <div className="pos-success-sub" style={{ marginTop: 4 }}>
                  Invoice #{printedInvoice.invoice_number} has been created successfully.
                </div>
              </div>

              <div className="pos-modal-detail-box" style={{ textAlign: 'left' }}>
                <div className="pos-modal-detail-row">
                  <span>Items</span>
                  <span>{cart.length} product{cart.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="pos-modal-detail-divider" />
                <div className="pos-modal-detail-row">
                  <span>Total Paid</span>
                  <span style={{ color: '#2ecc71' }}>LKR {fmt(netTotal)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="pos-modal-cancel" onClick={handleSkipPrint}>
                  Skip &amp; New Sale
                </button>
                <button className="pos-modal-confirm" onClick={handlePrintAndClose}>
                  <Printer size={16} /> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── THERMAL RECEIPT (hidden, shown only on print) ─────────────── */}
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
                  <td style={{ padding: '4px 0' }}>{item.medicine_name}<br /><span style={{ fontSize: 8, color: '#555' }}>Batch: {item.batch_number}</span></td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px dashed #000', paddingTop: 10, marginTop: 10, fontSize: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>{printedInvoice.total_amount?.toFixed(2)}</span></div>
            {printedInvoice.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount:</span><span>-{printedInvoice.discount?.toFixed(2)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 12, marginTop: 5 }}><span>Payable:</span><span>LKR {printedInvoice.net_amount?.toFixed(2)}</span></div>
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
