import { ShopifyAbandonedCart } from '@/types/shopify';
import { format } from 'date-fns';

interface CartCardProps {
  cart: ShopifyAbandonedCart;
}

export function CartCard({ cart }: CartCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cart #{cart.id}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {cart.email || 'No email provided'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: cart.currency
            }).format(parseFloat(cart.total_price))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created {format(new Date(cart.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {cart.line_items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: cart.currency
              }).format(parseFloat(item.price) * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm text-gray-900 dark:text-white">
          <span>Subtotal:</span>
          <span>{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: cart.currency
          }).format(parseFloat(cart.subtotal_price))}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-900 dark:text-white">
          <span>Tax:</span>
          <span>{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: cart.currency
          }).format(parseFloat(cart.total_tax))}</span>
        </div>
        <div className="flex justify-between font-bold mt-2 text-gray-900 dark:text-white">
          <span>Total:</span>
          <span>{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: cart.currency
          }).format(parseFloat(cart.total_price))}</span>
        </div>
      </div>
    </div>
  );
}
