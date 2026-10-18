import { createClient, isSupabaseConfigured } from '../supabase/client';
import { Product, Order, OrderItem, OrderStatus } from '../supabase/types';
import { INITIAL_PRODUCTS } from './mockProducts';

const STORAGE_PRODUCTS_KEY = 'store_products_data';
const STORAGE_ORDERS_KEY = 'store_orders_data';

// Initial dummy orders for demo view
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: "ord-883192",
    user_id: "00000000-0000-0000-0000-00000002",
    customer_name: "Budi Santoso",
    customer_email: "budi.santoso@gmail.com",
    customer_phone: "081234567890",
    shipping_address: "Jl. Sudirman Kav. 52, Jakarta Selatan, DKI Jakarta 12190",
    total_amount: 2999000,
    status: "Diproses",
    payment_method: "QRIS Instant",
    notes: "Tolong bungkus bubble wrap tebal",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    order_items: [
      {
        id: "item-1",
        order_id: "ord-883192",
        product_id: "p1111111-1111-4111-8111-111111111111",
        product_title: "Keychron Q1 Pro Custom Mechanical Keyboard (Wireless)",
        product_type: "physical",
        price: 2650000,
        quantity: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: "item-2",
        order_id: "ord-883192",
        product_id: "d1111111-1111-4111-8111-111111111111",
        product_title: "Next.js 15 Full-Stack SaaS Starter Kit",
        product_type: "digital",
        price: 349000,
        quantity: 1,
        file_url: "https://github.com/example/saas-starter-download.zip",
        created_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: "ord-492102",
    user_id: "00000000-0000-0000-0000-00000002",
    customer_name: "Budi Santoso",
    customer_email: "budi.santoso@gmail.com",
    customer_phone: "081234567890",
    shipping_address: null,
    total_amount: 129000,
    status: "Selesai",
    payment_method: "BCA Virtual Account",
    notes: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    order_items: [
      {
        id: "item-3",
        order_id: "ord-492102",
        product_id: "d2222222-2222-4222-8222-222222222222",
        product_title: "E-Book: Masterclass Arsitektur Web Modern",
        product_type: "digital",
        price: 129000,
        quantity: 1,
        file_url: "https://example.com/downloads/masterclass-arsitektur-web.pdf",
        created_at: new Date().toISOString(),
      }
    ]
  }
];

export interface ProductFilterOptions {
  type?: ProductType | 'all';
  category?: string;
  search?: string;
}

export const StoreService = {
  // --- PRODUCTS ---
  async getProducts(filter?: ProductFilterOptions): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (filter?.type && filter.type !== 'all') {
          query = query.eq('type', filter.type);
        }
        if (filter?.category && filter.category !== 'Semua') {
          query = query.eq('category', filter.category);
        }
        if (filter?.search && filter.search.trim()) {
          const q = filter.search.trim();
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Product[];
        }
        if (error) {
          console.warn('Supabase query returned error, falling back:', error.message);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, fallback to local products:', err);
      }
    }

    // Local / Demo Mode
    let allProducts = INITIAL_PRODUCTS;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        try {
          allProducts = JSON.parse(stored);
        } catch {
          // ignore
        }
      } else {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      }
    }

    let result = allProducts;
    if (filter?.type && filter.type !== 'all') {
      result = result.filter((p) => p.type === filter.type);
    }
    if (filter?.category && filter.category !== 'Semua') {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id || p.slug === id) || null;
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const isNew = !productData.id;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (isNew) {
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...productData,
            slug: productData.slug || (productData.title || 'produk').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })
          .select()
          .single();

        if (error) throw error;
        return data as Product;
      } else {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productData.id!)
          .select()
          .single();

        if (error) throw error;
        return data as Product;
      }
    }

    // Local fallback
    const products = await this.getProducts();
    let updatedProduct: Product;

    if (isNew) {
      updatedProduct = {
        id: 'prod-' + Math.random().toString(36).substring(2, 9),
        title: productData.title || 'Produk Baru',
        slug: (productData.title || 'produk-baru').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
        description: productData.description || '',
        price: Number(productData.price) || 0,
        type: productData.type || 'physical',
        category: productData.category || 'Lainnya',
        image_url: productData.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1000&auto=format&fit=crop',
        file_url: productData.type === 'digital' ? (productData.file_url || 'https://example.com/download-sample.zip') : null,
        stock: productData.type === 'digital' ? 9999 : Number(productData.stock) || 10,
        rating: 5.0,
        reviews_count: 0,
        is_featured: Boolean(productData.is_featured),
        created_at: now,
        updated_at: now,
      };
      products.unshift(updatedProduct);
    } else {
      const idx = products.findIndex((p) => p.id === productData.id);
      if (idx === -1) throw new Error('Product not found');
      updatedProduct = {
        ...products[idx],
        ...productData,
        updated_at: now,
      };
      products[idx] = updatedProduct;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    }
    return updatedProduct;
  },

  async deleteProduct(productId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
    }

    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== productId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(filtered));
    }
  },

  // --- ORDERS ---
  async getOrders(userId?: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase getOrders failed, fallback to local:', err);
      }
    }

    // Local / Demo Mode
    let orders: Order[] = INITIAL_DEMO_ORDERS;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        try {
          orders = JSON.parse(stored);
        } catch {
          // ignore
        }
      } else {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      }
    }

    if (userId) {
      return orders.filter((o) => o.user_id === userId);
    }
    return orders;
  },

  async createOrder(
    orderPayload: {
      userId: string | null;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      shippingAddress?: string;
      paymentMethod: string;
      notes?: string;
      items: { product: Product; quantity: number }[];
      totalAmount: number;
    }
  ): Promise<Order> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      // Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderPayload.userId,
          customer_name: orderPayload.customerName,
          customer_email: orderPayload.customerEmail,
          customer_phone: orderPayload.customerPhone || null,
          shipping_address: orderPayload.shippingAddress || null,
          total_amount: orderPayload.totalAmount,
          status: 'Menunggu Pembayaran',
          payment_method: orderPayload.paymentMethod,
          notes: orderPayload.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = orderPayload.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_title: item.product.title,
        product_type: item.product.type,
        price: item.product.price,
        quantity: item.quantity,
        file_url: item.product.type === 'digital' ? item.product.file_url : null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      return {
        ...orderData,
        order_items: orderItems as OrderItem[],
      };
    }

    // Local Demo Mode
    const orderId = 'ord-' + Math.floor(100000 + Math.random() * 900000);
    const orderItems: OrderItem[] = orderPayload.items.map((item, idx) => ({
      id: `item-${orderId}-${idx + 1}`,
      order_id: orderId,
      product_id: item.product.id,
      product_title: item.product.title,
      product_type: item.product.type,
      price: item.product.price,
      quantity: item.quantity,
      file_url: item.product.type === 'digital' ? item.product.file_url : null,
      created_at: now,
    }));

    const newOrder: Order = {
      id: orderId,
      user_id: orderPayload.userId,
      customer_name: orderPayload.customerName,
      customer_email: orderPayload.customerEmail,
      customer_phone: orderPayload.customerPhone || null,
      shipping_address: orderPayload.shippingAddress || null,
      total_amount: orderPayload.totalAmount,
      status: 'Menunggu Pembayaran',
      payment_method: orderPayload.paymentMethod,
      notes: orderPayload.notes || null,
      created_at: now,
      updated_at: now,
      order_items: orderItems,
    };

    const currentOrders = await this.getOrders();
    const updated = [newOrder, ...currentOrders];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    }

    const orders = await this.getOrders();
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status, updated_at: new Date().toISOString() };
      }
      return o;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
    }
  },
};
