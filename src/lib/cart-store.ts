import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedVariant {
  group: string;
  option: string;
  extraPrice: number;
}

export interface CartItem {
  id: string; // unique item uuid (menuId + variants hash)
  menuId: number;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
  notes: string;
  selectedVariants: SelectedVariant[];
}

interface CartStore {
  tableToken: string | null;
  tableNumber: string | null;
  items: CartItem[];
  customerName: string;
  orderType: "dine_in" | "takeaway";
  setTableInfo: (token: string, tableNumber: string) => void;
  setCustomerName: (name: string) => void;
  setOrderType: (type: "dine_in" | "takeaway") => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getService: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      tableToken: null,
      tableNumber: null,
      items: [],
      customerName: "",
      orderType: "dine_in",

      setTableInfo: (token, tableNumber) =>
        set({ tableToken: token, tableNumber }),

      setCustomerName: (name) => set({ customerName: name }),

      setOrderType: (type) => set({ orderType: type }),

      addItem: (newItem) => {
        const variantsKey = (newItem.selectedVariants || [])
          .map((v) => `${v.group}:${v.option}`)
          .sort()
          .join("|");
        const uniqueId = `${newItem.menuId}-${variantsKey}-${newItem.notes || ""}`;

        const existingIndex = get().items.findIndex((i) => i.id === uniqueId);
        if (existingIndex > -1) {
          const updated = [...get().items];
          updated[existingIndex].quantity += newItem.quantity;
          set({ items: updated });
        } else {
          set({
            items: [...get().items, { ...newItem, id: uniqueId }],
          });
        }
      },

      updateQuantity: (id, delta) => {
        const updated = get()
          .items.map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        set({ items: updated });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const variantExtra = item.selectedVariants.reduce(
            (vSum, v) => vSum + (v.extraPrice || 0),
            0
          );
          return sum + (item.price + variantExtra) * item.quantity;
        }, 0);
      },

      getTax: () => {
        return Math.round(get().getSubtotal() * 0.1);
      },

      getService: () => {
        return Math.round(get().getSubtotal() * 0.05);
      },

      getTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getService();
      },
    }),
    {
      name: "restosync-customer-cart",
    }
  )
);
