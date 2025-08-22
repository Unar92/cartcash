'use client';

import { useEffect, useState } from 'react';
import { ShopifyAbandonedCart } from '@/types/shopify';
import { CartCard } from '@/components/CartCard';

export default function Home() {
  const [carts, setCarts] = useState<ShopifyAbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/abandoned-carts');
      if (!response.ok) {
        throw new Error('Failed to fetch abandoned carts');
      }
      const data = await response.json();
      setCarts(data.checkouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Abandoned Carts</h1>
        <p className="text-gray-600">
          {carts.length} cart{carts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="space-y-6">
        {carts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No abandoned carts found</p>
          </div>
        ) : (
          carts.map((cart) => (
            <CartCard key={cart.id} cart={cart} />
          ))
        )}
      </div>
    </main>
  );
}