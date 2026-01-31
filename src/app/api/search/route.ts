import { NextRequest, NextResponse } from 'next/server';
import { searchProductsUnified } from '@/lib/productService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '15', 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await searchProductsUnified(query, limit);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 });
  }
}
