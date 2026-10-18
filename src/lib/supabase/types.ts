export type ProductType = 'digital' | 'physical';

export type OrderStatus = 'Menunggu Pembayaran' | 'Diproses' | 'Selesai' | 'Dibatalkan';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: ProductType;
  category: string;
  image_url: string;
  file_url: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_type: ProductType;
  price: number;
  quantity: number;
  file_url?: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_items'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
    };
  };
}
