'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, ShoppingCart, User, Plus, Minus, Trash2, 
  Printer, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';
import { usePOSStore, CartItem } from '@/store/usePOSStore';
import { apiFetch } from '@/utils/api';

export default function POSBilling() {
  const { 
    cart, discount, paymentMethod, selectedPatient,
    addToCart, removeFromCart, updateQuantity, clearCart,
    setDiscount, setPaymentMethod, setSelectedPatient 
  } = usePOSStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch active batches (stock items)
  const { data: batches = [], isLoading: batchesLoading, refetch: refetchBatches } = useQuery<any[]>({
    queryKey: ['active-batches'],
    queryFn: () => apiFetch('/api/inventory/batches?only_in_stock=true'),
  });

  // 2. Fetch patients for dropdown
  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patient-search', patientSearch],
    queryFn: () => apiFetch(`/api/patients/search?query=${patientSearch}`),
    enabled: patientSearch.length > 0,
  });

  // Auto-focus barcode scanner input on load
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // 3. POS Invoice creation mutation
  const invoiceMutation = useMutation({
    mutationFn: (payload: any) => apiFetch('/api/pos/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: (data) => {
      setLastInvoiceId(data.invoice_id);
      refetchBatches(); // Refresh stock quantities
      setShowPrintModal(true); // Open printing trigger
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to complete transaction.');
    }
  });

  // Fetch full details of the last created invoice for printing
  const { data: printedInvoice } = useQuery<any>({
    queryKey: ['invoice-details', lastInvoiceId],
    queryFn: () => apiFetch(`/api/pos/invoices/${lastInvoiceId}`),
    enabled: !!lastInvoiceId,
  });

  // Handle barcode submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    // Search for batch with exact barcode match
    const foundBatch = batches.find(b => b.barcode === barcodeQuery.trim());
    if (foundBatch) {
      if (foundBatch.quantity_remaining > 0) {
        addToCart({
          batchId: foundBatch.id,
          medicineId: foundBatch.medicine_id,
          medicineName: foundBatch.medicine_name,
          genericName: foundBatch.generic_name,
          batchNumber: foundBatch.batch_number,
          price: foundBatch.selling_price,
          stockAvailable: foundBatch.quantity_remaining,
          expiryDate: foundBatch.expiry_date,
        });
        setBarcodeQuery('');
      } else {
        alert('Stock item is currently sold out.');
      }
    } else {
      alert(`No active medicine found with barcode "${barcodeQuery}"`);
    }
  };

  // Filter batches locally based on text search
  const filteredBatches = batches.filter(b => {
    const term = searchQuery.toLowerCase();
    return (
      b.medicine_name.toLowerCase().includes(term) ||
      (b.generic_name && b.generic_name.toLowerCase().includes(term)) ||
      b.batch_number.toLowerCase().includes(term)
    );
  });

  // Compute Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netTotal = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const payload = {
      patient_id: selectedPatient?.id || null,
      discount: discount,
      payment_method: paymentMethod,
      items: cart.map(item => ({
        batch_id: item.batchId,
        quantity: item.quantity,
      }))
    };

    invoiceMutation.mutate(payload);
  };

  const triggerPrintAndClose = () => {
    setTimeout(() => {
      window.print();
      setShowPrintModal(false);
      setLastInvoiceId(null);
      clearCart();
    }, 100);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 relative">
      {/* Left Column: Inventory Items Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barcode Search */}
          <form onSubmit={handleBarcodeSubmit} className="flex-1">
            <div className="relative">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode (Press Enter)"
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-teal-500/50 outline-none text-sm text-slate-100 placeholder:text-slate-500"
              />
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            </div>
          </form>

          {/* Text Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name, Generic, Batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-teal-500/50 outline-none text-sm text-slate-100 placeholder:text-slate-500"
              />
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Batches Catalog */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col h-[550px]">
          <h2 className="font-display font-bold text-lg text-white mb-4">Stock Items</h2>

          {batchesLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
              <span>Fetching items catalog...</span>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
              <AlertCircle className="h-6 w-6 text-slate-600" />
              <span>No in-stock medicines found matching your search.</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredBatches.map((batch) => (
                <div 
                  key={batch.id}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between hover:border-teal-500/20 transition-all group"
                >
                  <div>
                    <span className="font-semibold text-sm text-white block group-hover:text-teal-400 transition-colors">
                      {batch.medicine_name}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Generic: {batch.generic_name || 'N/A'}</span>
                      <span>&bull;</span>
                      <span>Batch: {batch.batch_number}</span>
                      <span>&bull;</span>
                      <span className="text-red-400/80">Exp: {batch.expiry_date}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-sm font-bold text-teal-400 block">
                        LKR {batch.selling_price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Stock: {batch.quantity_remaining}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => addToCart({
                        batchId: batch.id,
                        medicineId: batch.medicine_id,
                        medicineName: batch.medicine_name,
                        genericName: batch.generic_name,
                        batchNumber: batch.batch_number,
                        price: batch.selling_price,
                        stockAvailable: batch.quantity_remaining,
                        expiryDate: batch.expiry_date,
                      })}
                      className="p-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Checkout Cart Panel */}
      <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 flex flex-col h-[680px]">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-4 mb-4">
          <ShoppingCart className="h-5 w-5 text-teal-400" />
          <h2 className="font-display font-bold text-lg text-white">POS Invoice</h2>
        </div>

        {/* Selected Customer */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Patient (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient by name or phone..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                if (selectedPatient) setSelectedPatient(null);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-teal-500/50 outline-none text-xs text-slate-100 placeholder:text-slate-600"
            />
            {selectedPatient && (
              <span className="absolute right-3 top-2.5 text-[10px] font-bold bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </div>
          
          {/* Patient dropdown selection */}
          {patientSearch && !selectedPatient && patients.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-h-40 overflow-y-auto">
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient({ id: p.id, name: p.name, phone: p.phone });
                    setPatientSearch(`${p.name} (${p.phone})`);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {p.name} - {p.phone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs gap-2">
              <ShoppingCart className="h-8 w-8 text-slate-800" />
              <span>Cart is empty. Scan barcodes to begin.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.batchId}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <span className="font-semibold text-xs text-white block truncate">{item.medicineName}</span>
                  <span className="text-[10px] text-slate-500 block truncate">Batch: {item.batchNumber}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Quantity adjustments */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.batchId, item.quantity - 1)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-xs font-bold font-mono min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.batchId, item.quantity + 1)}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <span className="text-xs font-bold text-slate-300 font-mono w-16 text-right">
                    {(item.price * item.quantity).toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => removeFromCart(item.batchId)}
                    className="text-red-500/80 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing Inputs */}
        <div className="border-t border-slate-900 pt-4 space-y-3 text-xs">
          {/* Discount Field */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Applied Discount (LKR)</span>
            <input
              type="number"
              value={discount || ''}
              placeholder="0.00"
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="w-24 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg outline-none text-right text-slate-100 font-mono focus:border-teal-500/30"
            />
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Payment Method</span>
            <div className="flex gap-2">
              {['Cash', 'Card', 'Mobile'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">LKR {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Discount</span>
              <span className="font-mono">- LKR {discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-1">
              <span>Total Payable</span>
              <span className="text-teal-400 font-mono">LKR {netTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || invoiceMutation.isPending}
          className="w-full py-4 mt-6 inline-flex items-center justify-center gap-2 font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl hover:from-teal-300 hover:to-emerald-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {invoiceMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
            </>
          ) : (
            <>
              Checkout & Print Invoice <Printer className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Printing Modal */}
      {showPrintModal && printedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm w-full text-center space-y-4">
            <Printer className="h-8 w-8 text-teal-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Invoice Generated</h3>
            <p className="text-xs text-slate-400">
              Invoice #{printedInvoice.invoice_number} created. Standard printer dialogue will open for thermal printing.
            </p>
            <button
              onClick={triggerPrintAndClose}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* HTML Layout for Thermal Printing (Hidden on screen via globals.css) */}
      {printedInvoice && (
        <div id="receipt-print" className="hidden font-mono">
          <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '10px' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{printedInvoice.invoice_number}</h2>
            <p style={{ margin: '0', fontSize: '10px' }}>Date: {new Date(printedInvoice.created_at).toLocaleString()}</p>
            <p style={{ margin: '0', fontSize: '10px' }}>Payment: {printedInvoice.payment_method}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid black' }}>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {printedInvoice.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0' }}>
                    {item.medicine_name} <br />
                    <span style={{ fontSize: '8px', color: '#555' }}>Batch: {item.batch_number}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px dashed black', paddingTop: '10px', marginTop: '10px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{printedInvoice.total_amount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
              <span>Discount:</span>
              <span>-{printedInvoice.discount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '5px' }}>
              <span>Payable:</span>
              <span>LKR {printedInvoice.net_amount.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '9px', borderTop: '1px solid black', paddingTop: '8px' }}>
            <p style={{ margin: '0' }}>Thank you for visiting us!</p>
            <p style={{ margin: '0 0 10px 0' }}>medical.lk Software</p>
          </div>
        </div>
      )}
    </div>
  );
}
