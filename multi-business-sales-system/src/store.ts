import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Sales';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Library' | 'Uniform' | 'Advertising';
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  size?: string;
  color?: string;
  school?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  category: 'Library' | 'Uniform' | 'Advertising';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  total: number;
  paid: number;
  remaining: number;
  paymentMethod: 'Cash' | 'Vodafone Cash' | 'InstaPay' | 'Transfer';
  paymentRef?: string;
  date: string;
  category: 'Library' | 'Uniform' | 'Advertising';
  type: 'Direct' | 'Reservation';
  status: 'Completed' | 'Pending';
  createdBy: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  address: string;
  logo: string | null;
}

interface AppState {
  users: User[];
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
  settings: Settings;
  currentUser: User | null;

  // Actions
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, newQuantity: number) => void;

  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;

  updateSettings: (settings: Partial<Settings>) => void;
  resetSystem: () => void;
}

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'MTM',
    password: 'MTM',
    role: 'Admin',
    startDate: new Date().toISOString(),
    endDate: '2099-12-31',
    isActive: true,
  }
];

const DEFAULT_SETTINGS: Settings = {
  companyName: 'Marqex Sales OS',
  phone: '01016208017',
  address: 'Main St, Cairo, Egypt',
  logo: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,
      products: [],
      invoices: [],
      customers: [],
      settings: DEFAULT_SETTINGS,
      currentUser: null,

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),
      setCurrentUser: (user) => set({ currentUser: user }),

      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p)
      })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
      updateProductQuantity: (id, newQuantity) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, quantity: newQuantity } : p)
      })),

      addInvoice: (invoice) => {
        const { customers, products } = get();
        
        // Update customer
        const existingCustomer = customers.find(c => c.phone === invoice.customerPhone);
        let newCustomers = [...customers];
        if (existingCustomer) {
          newCustomers = customers.map(c => c.id === existingCustomer.id ? {
            ...c,
            totalSpent: c.totalSpent + invoice.total,
            orderCount: c.orderCount + 1,
            lastOrderDate: invoice.date
          } : c);
        } else {
          newCustomers.push({
            id: invoice.customerId,
            name: invoice.customerName,
            phone: invoice.customerPhone,
            totalSpent: invoice.total,
            orderCount: 1,
            lastOrderDate: invoice.date
          });
        }

        // Deduct products (if direct or if the logic says so)
        const newProducts = products.map(p => {
          const item = invoice.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, quantity: p.quantity - item.quantity };
          }
          return p;
        });

        set((state) => ({
          invoices: [...state.invoices, invoice],
          customers: newCustomers,
          products: newProducts
        }));
      },

      updateInvoice: (invoice) => {
        // Simple update logic for now
        set((state) => ({
          invoices: state.invoices.map(inv => inv.id === invoice.id ? invoice : inv)
        }));
      },

      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(inv => inv.id !== id)
      })),

      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (customer) => set((state) => ({
        customers: state.customers.map(c => c.id === customer.id ? customer : c)
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetSystem: () => set({
        products: [],
        invoices: [],
        customers: [],
        users: DEFAULT_USERS,
        settings: DEFAULT_SETTINGS,
        currentUser: null
      }),
    }),
    {
      name: 'marqex-sales-os-storage',
    }
  )
);
