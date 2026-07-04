import { create } from 'zustand';

export interface CartItem {
  batchId: string;
  medicineId: string;
  medicineName: string;
  genericName?: string;
  batchNumber: string;
  price: number;
  quantity: number;
  stockAvailable: number;
  expiryDate: string;
}

export interface PatientSelection {
  id: string;
  name: string;
  phone: string;
}

interface POSState {
  cart: CartItem[];
  discount: number;
  paymentMethod: string;
  selectedPatient: PatientSelection | null;

  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (batchId: string) => void;
  updateQuantity: (batchId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: string) => void;
  setSelectedPatient: (patient: PatientSelection | null) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  discount: 0,
  paymentMethod: 'Cash',
  selectedPatient: null,

  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (i) => i.batchId === item.batchId
      );
      if (existingIndex > -1) {
        const updatedCart = [...state.cart];
        const newQty = updatedCart[existingIndex].quantity + 1;
        // Clamp to available stock
        updatedCart[existingIndex].quantity = Math.min(
          newQty,
          item.stockAvailable
        );
        return { cart: updatedCart };
      }
      return { cart: [...state.cart, { ...item, quantity: 1 }] };
    }),

  removeFromCart: (batchId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.batchId !== batchId),
    })),

  updateQuantity: (batchId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.batchId === batchId) {
          // Clamp between 1 and available stock
          const clampedQty = Math.max(
            1,
            Math.min(quantity, item.stockAvailable)
          );
          return { ...item, quantity: clampedQty };
        }
        return item;
      }),
    })),

  clearCart: () =>
    set({
      cart: [],
      discount: 0,
      paymentMethod: 'Cash',
      selectedPatient: null,
    }),

  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
}));
