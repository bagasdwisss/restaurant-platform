export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  modifierGroups: any[];
}

export interface TableItem {
  id: number;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: string;
  area: string;
}

export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  selectedVariants: { group: string; option: string; extraPrice: number }[];
  notes: string;
}

export interface TimeSlotOption {
  label: string;
  desc: string;
}
