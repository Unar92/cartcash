import { NextRequest, NextResponse } from 'next/server';
import { fetchAbandonedCarts, setShopifyConfig } from '@/utils/shopify';
import { sessionStorage } from '@/utils/sessionStorage';
import { Session } from '@/utils/shopifyApi';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and get session with configuration
    console.log('🔍 Abandoned carts API: Checking authentication...');
    
    // First try to get the session from the request headers
    const shopHeader = request.headers.get('x-shop-domain');
    const accessTokenHeader = request.headers.get('x-access-token');

    let sessionWithConfig = null;

    if (shopHeader && accessTokenHeader) {
      console.log('🔑 Abandoned carts API: Found auth headers, validating...');
      // Create a temporary session with the provided credentials
      const tempSession = new Session({
        id: `temp_${Date.now()}`,
        shop: shopHeader,
        accessToken: accessTokenHeader,
        state: '',
        isOnline: false,
        scope: 'read_orders read_customers read_content',
      });

      // Store the session with config (use default userId for backward compatibility)
      await sessionStorage.storeSession(tempSession, 'legacy-user', {
        shopName: shopHeader,
        accessToken: accessTokenHeader,
        apiVersion: '2024-04'
      });

      // Get the stored session with config
      sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();
    } else {
      console.log('🔍 Abandoned carts API: No auth headers, checking stored sessions...');
      sessionWithConfig = await sessionStorage.getCurrentSessionWithConfig();
    }

    if (!sessionWithConfig || !sessionWithConfig.config) {
      console.log('❌ Abandoned carts API: No valid session or configuration found');
      return NextResponse.json(
        { error: 'Authentication required. Please log in to access cart data.' },
        { status: 401 }
      );
    }

    const { session, config } = sessionWithConfig;

    // Set the Shopify configuration for this request
    setShopifyConfig(config);

    console.log('✅ Abandoned carts API: Found session for shop:', session.shop);
    console.log('📋 Abandoned carts API: Session ID:', session.id);
    console.log('⚙️ Abandoned carts API: Using config for shop:', config.shopName);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format');

    const response = await fetchAbandonedCarts(limit);
    let { checkouts } = response;

    // Apply date filtering if dates are provided
    if (startDate || endDate) {
      checkouts = checkouts.filter(cart => {
        const cartDate = new Date(cart.created_at);
        if (startDate && new Date(startDate) > cartDate) return false;
        if (endDate && new Date(endDate) < cartDate) return false;
        return true;
      });
    }

    // Calculate pagination
    const total = checkouts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCheckouts = checkouts.slice(offset, offset + limit);

    // Handle CSV export
    if (format === 'csv') {
      // Function to escape CSV fields properly
      const escapeCSV = (field: any): string => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      // Format date in a more readable way
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
      };

      // Format currency with 2 decimal places
      const formatPrice = (price: string) => {
        return Number(price).toFixed(2);
      };

      const csvRows = [
        // CSV Headers
        [
          'Cart ID',
          'Created At',
          'Email',
          'Total Price',
          'Currency',
          'Status',
          'Products',
          'Product Details',
          'Total Items',
          'Last Modified'
        ].map(escapeCSV).join(','),
        // CSV Data
        ...checkouts.map(cart => [
          escapeCSV(cart.id),
          escapeCSV(formatDate(cart.created_at)),
          escapeCSV(cart.email || 'N/A'),
          escapeCSV(formatPrice(cart.total_price)),
          escapeCSV(cart.currency),
          escapeCSV(cart.completed_at ? 'Completed' : 'Abandoned'),
          escapeCSV(cart.line_items.map(item => item.title).join(', ')),
          escapeCSV(cart.line_items.map(item => `${item.title} (Qty: ${item.quantity}, Price: ${formatPrice(item.price)})`).join(' | ')),
          escapeCSV(cart.line_items.reduce((sum, item) => sum + (item.quantity || 0), 0)),
          escapeCSV(formatDate(cart.updated_at || cart.created_at))
        ].join(','))
      ];

      const filename = `abandoned-carts-${startDate || 'all'}-to-${endDate || 'all'}.csv`;
      
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Return JSON response
    return NextResponse.json({
      checkouts: paginatedCheckouts,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Error in abandoned carts API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch abandoned carts' },
      { status: 500 }
    );
  }
}