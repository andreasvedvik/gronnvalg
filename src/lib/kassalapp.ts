// Kassalapp API Integration
// Norwegian grocery product database with prices and nutrition
// API docs: https://kassal.app/docs/api

export interface KassalappProduct {
  ean: string;
  name: string;
  brand: string;
  vendor: string;
  description: string;
  ingredients: string;
  url: string;
  image: string;
  category: {
    id: number;
    name: string;
    depth: number;
  }[];
  allergens: {
    code: string;
    display_name: string;
    contains: string; // 'YES' | 'NO' | 'MAY_CONTAIN'
  }[];
  nutrition: {
    code: string;
    display_name: string;
    amount: number;
    unit: string;
  }[];
  store_prices: {
    price: {
      current: number;
      unit_price: number;
    };
    store: {
      name: string;
      code: string;
      logo: string;
    };
  }[];
  weight: number;
  weight_unit: string;
  created_at: string;
  updated_at: string;
}

export interface KassalappResponse {
  data: KassalappProduct;
}

export interface KassalappSearchResponse {
  data: KassalappProduct[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Cache for Kassalapp responses
const kassalappCache = new Map<string, { data: KassalappProduct | null; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key: string): KassalappProduct | null | undefined {
  const entry = kassalappCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    kassalappCache.delete(key);
  }
  return undefined;
}

function setCache(key: string, data: KassalappProduct | null): void {
  if (kassalappCache.size > 100) {
    const keysToDelete = Array.from(kassalappCache.keys()).slice(0, 20);
    keysToDelete.forEach(k => kassalappCache.delete(k));
  }
  kassalappCache.set(key, { data, timestamp: Date.now() });
}

// Get API key from environment or localStorage (for client-side)
function getApiKey(): string | null {
  // Server-side
  if (typeof process !== 'undefined' && process.env?.KASSALAPP_API_KEY) {
    return process.env.KASSALAPP_API_KEY;
  }
  // Client-side fallback
  if (typeof window !== 'undefined') {
    return localStorage.getItem('kassalapp_api_key');
  }
  return null;
}

/**
 * Fetch product from Kassalapp by EAN (barcode)
 */
export async function fetchFromKassalapp(ean: string): Promise<KassalappProduct | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.log('⚠️ Kassalapp API key not configured');
    return null;
  }

  // Check cache
  const cached = getCached(ean);
  if (cached !== undefined) {
    console.log('📦 Kassalapp cache hit:', ean);
    return cached;
  }

  try {
    const response = await fetch(`https://kassal.app/api/v1/products/ean/${ean}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        setCache(ean, null);
        return null;
      }
      console.error('Kassalapp API error:', response.status);
      return null;
    }

    const result: KassalappResponse = await response.json();
    setCache(ean, result.data);
    console.log('✅ Kassalapp product found:', result.data.name);
    return result.data;
  } catch (error) {
    console.error('Kassalapp fetch error:', error);
    return null;
  }
}

/**
 * Search products by name
 */
export async function searchKassalapp(query: string, limit: number = 10): Promise<KassalappProduct[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://kassal.app/api/v1/products?search=${encodeURIComponent(query)}&size=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const result: KassalappSearchResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Kassalapp search error:', error);
    return [];
  }
}

/**
 * Check if a product is Norwegian based on Kassalapp data
 */
export function isNorwegianFromKassalapp(product: KassalappProduct): boolean {
  const norwegianIndicators = [
    'norge', 'norway', 'norsk', 'nyt norge',
    'tine', 'gilde', 'prior', 'stabburet', 'mills', 'freia', 'nidar'
  ];

  const searchText = [
    product.brand,
    product.vendor,
    product.description,
    product.name,
  ].filter(Boolean).join(' ').toLowerCase();

  return norwegianIndicators.some(indicator => searchText.includes(indicator));
}

/**
 * Extract packaging info from Kassalapp product
 */
export function extractPackagingFromKassalapp(product: KassalappProduct): {
  material: string;
  weight: number;
  unit: string;
} {
  // Kassalapp doesn't have detailed packaging info, but we can infer from name/description
  const name = (product.name + ' ' + (product.description || '')).toLowerCase();

  let material = 'unknown';
  if (name.includes('glass') || name.includes('flaske')) {
    material = 'glass';
  } else if (name.includes('boks') || name.includes('bokser') || name.includes('hermetikk')) {
    material = 'metal';
  } else if (name.includes('kartong') || name.includes('papir')) {
    material = 'cardboard';
  } else if (name.includes('plastflaske') || name.includes('pet')) {
    material = 'pet-plastic';
  } else if (name.includes('plast') || name.includes('pose')) {
    material = 'plastic';
  }

  return {
    material,
    weight: product.weight || 0,
    unit: product.weight_unit || 'g',
  };
}

/**
 * Get best price from Kassalapp
 */
export function getBestPrice(product: KassalappProduct): { price: number; store: string } | null {
  if (!product.store_prices || product.store_prices.length === 0) {
    return null;
  }

  const sorted = [...product.store_prices].sort((a, b) => a.price.current - b.price.current);
  return {
    price: sorted[0].price.current,
    store: sorted[0].store.name,
  };
}
