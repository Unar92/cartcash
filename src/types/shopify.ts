export interface ShopifyAbandonedCart {
  id: string;
  token: string;
  email?: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  customer?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  line_items: Array<{
    id: string;
    title: string;
    price: string;
    quantity: number;
    variant_id: string;
    product_id: string;
  }>;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
}

export interface ShopifyAbandonedCartsResponse {
  checkouts: ShopifyAbandonedCart[];
}
