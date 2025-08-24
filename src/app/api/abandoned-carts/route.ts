import { NextRequest, NextResponse } from 'next/server';
import { fetchAbandonedCarts } from '@/utils/shopify';

export async function GET(request: NextRequest) {
  try {
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
      const csvRows = [
        // CSV Headers
        ['Cart ID', 'Created At', 'Email', 'Total Price', 'Currency', 'Status', 'Products'].join(','),
        // CSV Data
        ...checkouts.map(cart => [
          cart.id,
          cart.created_at,
          cart.email || 'N/A',
          cart.total_price,
          cart.currency,
          cart.completed_at ? 'Completed' : 'Abandoned',
          cart.line_items.map(item => item.title).join(';')
        ].join(','))
      ];

      return new NextResponse(csvRows.join('\\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=abandoned-carts-${startDate}-${endDate}.csv`
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