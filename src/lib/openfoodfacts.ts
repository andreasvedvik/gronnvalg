// Open Food Facts API Integration

// ===== CACHING =====
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const productCache = new Map<string, CacheEntry<ProductData | null>>();
const searchCache = new Map<string, CacheEntry<ProductData[]>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // Remove expired entry
  }
  return undefined;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    // Remove oldest entries
    const keysToDelete = Array.from(cache.keys()).slice(0, 20);
    keysToDelete.forEach(k => cache.delete(k));
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// Export for debugging/clearing
export function clearProductCache(): void {
  productCache.clear();
  searchCache.clear();
}

export function getCacheStats(): { products: number; searches: number } {
  return {
    products: productCache.size,
    searches: searchCache.size,
  };
}
// ===== END CACHING =====

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  product_name_no?: string;
  brands: string;
  image_url: string;
  image_small_url: string;
  categories: string;
  categories_tags?: string[];
  countries_tags: string[];
  origins: string;
  origins_tags?: string[];
  manufacturing_places?: string;
  manufacturing_places_tags?: string[];
  packaging: string;
  packaging_tags?: string[];
  packaging_materials_tags?: string[];
  packaging_recycling_tags?: string[];
  labels: string;
  labels_tags?: string[];
  ecoscore_grade: string;
  ecoscore_score: number;
  ecoscore_data?: {
    grade?: string;
    score?: number;
    adjustments?: {
      origins_of_ingredients?: {
        origins_from_origins_field?: string[];
        transportation_scores?: Record<string, number>;
        value?: number;
      };
      packaging?: {
        value?: number;
        packagings?: Array<{
          material?: string;
          recycling?: string;
          shape?: string;
        }>;
      };
      production_system?: {
        labels?: string[];
        value?: number;
      };
    };
  };
  nutriscore_grade: string;
  nutriscore_score: number;
  nova_group: number;
  ingredients_text: string;
  nutriments: {
    energy_kcal_100g: number;
    fat_100g: number;
    saturated_fat_100g: number;
    sugars_100g: number;
    salt_100g: number;
    proteins_100g: number;
    fiber_100g: number;
  };
}

export interface ProductData {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  category: string;
  origin: string;
  originTags: string[]; // NEW: structured origin tags
  manufacturingPlaces: string; // NEW: where it's made
  packaging: string;
  packagingTags: string[]; // NEW: structured packaging info
  packagingMaterials: string[]; // NEW: specific materials
  packagingRecycling: string[]; // NEW: recycling info
  labels: string[];
  labelTags: string[]; // NEW: structured label tags
  ecoscore: {
    grade: string;
    score: number;
    hasDetailedData: boolean; // NEW: do we have ecoscore_data?
    transportScore?: number; // NEW: from ecoscore_data.adjustments
    packagingScore?: number; // NEW: from ecoscore_data.adjustments
  };
  nutriscore: {
    grade: string;
    score: number;
  };
  novaGroup: number;
  ingredients: string;
  isNorwegian: boolean;
  raw: OpenFoodFactsProduct;
}

export async function fetchProduct(barcode: string): Promise<ProductData | null> {
  // Check cache first
  const cached = getCached(productCache, barcode);
  if (cached !== undefined) {
    console.log('📦 Cache hit for product:', barcode);
    return cached;
  }

  try {
    // Try Norwegian database first, then world database
    const urls = [
      `https://no.openfoodfacts.org/api/v2/product/${barcode}.json`,
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    ];

    for (const url of urls) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GrønnValg/1.0 (contact@gronnvalg.no)',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        // Check if product is Norwegian
        // Check if product is Norwegian (multiple sources)
        const isNorwegian =
          product.countries_tags?.includes('en:norway') ||
          product.origins_tags?.some((t: string) => t.includes('norway') || t.includes('norge')) ||
          product.manufacturing_places_tags?.some((t: string) => t.includes('norway') || t.includes('norge')) ||
          product.origins?.toLowerCase().includes('norge') ||
          product.origins?.toLowerCase().includes('norway') ||
          product.manufacturing_places?.toLowerCase().includes('norge') ||
          product.labels?.toLowerCase().includes('nyt norge') ||
          product.labels_tags?.includes('en:produced-in-norway');

        // Extract origin info from multiple sources
        const originSources = [
          product.origins,
          product.manufacturing_places,
          ...(product.origins_tags || []).map((t: string) => t.replace('en:', '').replace('-', ' ')),
          ...(product.manufacturing_places_tags || []).map((t: string) => t.replace('en:', '').replace('-', ' ')),
        ].filter(Boolean);
        const bestOrigin = originSources[0] || (isNorwegian ? 'Norge' : '');

        // Extract ecoscore details if available
        const ecoscoreData = product.ecoscore_data;
        const hasDetailedEcoscore = !!(ecoscoreData?.adjustments);

        const productData: ProductData = {
          barcode: product.code,
          name: product.product_name || product.product_name_no || 'Ukjent produkt',
          brand: product.brands || 'Ukjent merke',
          imageUrl: product.image_url || product.image_small_url || '',
          category: product.categories?.split(',')[0]?.trim() || 'Ukjent kategori',
          origin: bestOrigin,
          originTags: product.origins_tags || [],
          manufacturingPlaces: product.manufacturing_places || '',
          packaging: product.packaging || '',
          packagingTags: product.packaging_tags || [],
          packagingMaterials: product.packaging_materials_tags || [],
          packagingRecycling: product.packaging_recycling_tags || [],
          labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
          labelTags: product.labels_tags || [],
          ecoscore: {
            grade: product.ecoscore_grade || 'unknown',
            score: product.ecoscore_score || 0,
            hasDetailedData: hasDetailedEcoscore,
            transportScore: ecoscoreData?.adjustments?.origins_of_ingredients?.value,
            packagingScore: ecoscoreData?.adjustments?.packaging?.value,
          },
          nutriscore: {
            grade: product.nutriscore_grade || 'unknown',
            score: product.nutriscore_score || 0,
          },
          novaGroup: product.nova_group || 0,
          ingredients: product.ingredients_text || '',
          isNorwegian,
          raw: product,
        };

        // Cache the result
        setCache(productCache, barcode, productData);
        return productData;
      }
    }

    // Cache the null result too (product not found)
    setCache(productCache, barcode, null);
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Helper function to check if a product is truly Norwegian (produced in Norway)
function isProductNorwegian(product: any): boolean {
  // Check origins field for Norwegian origin
  const origins = (product.origins || '').toLowerCase();
  if (origins.includes('norge') || origins.includes('norway')) {
    return true;
  }

  // Check manufacturing places
  const manufacturingPlaces = (product.manufacturing_places || '').toLowerCase();
  if (manufacturingPlaces.includes('norge') || manufacturingPlaces.includes('norway')) {
    return true;
  }

  // Check for "Nyt Norge" label (official Norwegian quality label)
  const labels = (product.labels || '').toLowerCase();
  if (labels.includes('nyt norge') || labels.includes('nyt-norge')) {
    return true;
  }

  // Check brands that are known Norwegian
  const norwegianBrands = [
    'tine', 'gilde', 'prior', 'norvegia', 'jarlsberg', 'synnøve',
    'mills', 'stabburet', 'idun', 'lerøy', 'maarud', 'sørlandschips',
    'aass', 'ringnes', 'hansa', 'freia', 'nidar', 'diplom-is',
    'kavli', 'bama', 'coop', 'first price', 'eldorado', 'jacobs'
  ];
  const brand = (product.brands || '').toLowerCase();
  if (norwegianBrands.some(nb => brand.includes(nb))) {
    return true;
  }

  return false;
}

// Category mapping for better alternative matching
// Maps broad categories to more specific search terms
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  // Sodas and soft drinks
  'cola': ['sodas', 'colas', 'soft drinks', 'brus'],
  'soda': ['sodas', 'colas', 'soft drinks', 'brus'],
  'brus': ['sodas', 'colas', 'soft drinks', 'brus'],
  'soft drink': ['sodas', 'soft drinks', 'brus'],
  'carbonated': ['sodas', 'carbonated drinks', 'brus'],
  // Dairy
  'milk': ['milk', 'melk'],
  'melk': ['milk', 'melk'],
  'yogurt': ['yogurt', 'yoghurt'],
  'cheese': ['cheese', 'ost'],
  'ost': ['cheese', 'ost'],
  // Snacks
  'chips': ['chips', 'crisps', 'snacks'],
  'chocolate': ['chocolate', 'sjokolade'],
  'sjokolade': ['chocolate', 'sjokolade'],
  'candy': ['candy', 'sweets', 'godteri'],
  // Bread and cereals
  'bread': ['bread', 'brød'],
  'brød': ['bread', 'brød'],
  'cereal': ['cereals', 'frokostblanding'],
  // Meat
  'meat': ['meat', 'kjøtt'],
  'kjøtt': ['meat', 'kjøtt'],
  'chicken': ['chicken', 'kylling'],
  'kylling': ['chicken', 'kylling'],
};

// Find the best category for searching alternatives
function getBestSearchCategory(productName: string, categories: string): string {
  const nameLower = productName.toLowerCase();
  const categoriesLower = categories.toLowerCase();

  // Check product name first for specific product types
  for (const [keyword, _mappings] of Object.entries(CATEGORY_MAPPINGS)) {
    if (nameLower.includes(keyword)) {
      return keyword;
    }
  }

  // Check if it's a cola/soda specifically
  if (nameLower.includes('cola') || nameLower.includes('zero') || nameLower.includes('pepsi') || nameLower.includes('fanta') || nameLower.includes('sprite')) {
    return 'sodas';
  }

  // Parse categories and find most specific one
  const categoryList = categories.split(',').map(c => c.trim().toLowerCase());

  // Prefer more specific categories (longer names or containing specific keywords)
  const specificCategories = categoryList.filter(c =>
    c.includes('cola') || c.includes('soda') || c.includes('brus') ||
    c.includes('chips') || c.includes('chocolate') || c.includes('yogurt') ||
    c.includes('cheese') || c.includes('bread') || c.includes('meat')
  );

  if (specificCategories.length > 0) {
    return specificCategories[0];
  }

  // Fall back to first category, but try to avoid overly generic ones
  const genericCategories = ['beverages', 'drinks', 'food', 'drikkevarer', 'mat'];
  const nonGeneric = categoryList.find(c => !genericCategories.some(g => c.includes(g)));

  return nonGeneric || categoryList[0] || categories.split(',')[0]?.trim() || '';
}

// Search for alternative products - ONLY truly Norwegian products
export async function searchAlternatives(category: string, limit: number = 5, productName: string = ''): Promise<ProductData[]> {
  // Get a better search category based on product name and categories
  const searchCategory = getBestSearchCategory(productName, category);
  const cacheKey = `alt:${searchCategory}:${limit}`;
  const cached = getCached(searchCache, cacheKey);
  if (cached !== undefined) {
    console.log('📦 Cache hit for alternatives:', searchCategory);
    return cached;
  }

  try {
    console.log('🔍 Searching alternatives for category:', searchCategory, '(original:', category, ')');

    // Search for products in the same category, fetch more to filter for Norwegian
    const searchUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(searchCategory)}&tagtype_1=countries&tag_contains_1=contains&tag_1=norway&sort_by=ecoscore_score&page_size=${limit * 4}&json=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'GrønnValg/1.0 (contact@gronnvalg.no)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (data.products && data.products.length > 0) {
      const results = data.products
        // Only include products with known ecoscore
        .filter((p: any) => p.ecoscore_grade && p.ecoscore_grade !== 'unknown')
        // Only include truly Norwegian products (produced in Norway)
        .filter((p: any) => isProductNorwegian(p))
        .slice(0, limit)
        .map((product: any) => {
          const isNorwegian = isProductNorwegian(product);
          const ecoscoreData = product.ecoscore_data;
          return {
            barcode: product.code,
            name: product.product_name || 'Ukjent',
            brand: product.brands || '',
            imageUrl: product.image_small_url || '',
            category: product.categories?.split(',')[0]?.trim() || '',
            origin: product.origins || (isNorwegian ? 'Norge' : ''),
            originTags: product.origins_tags || [],
            manufacturingPlaces: product.manufacturing_places || '',
            packaging: product.packaging || '',
            packagingTags: product.packaging_tags || [],
            packagingMaterials: product.packaging_materials_tags || [],
            packagingRecycling: product.packaging_recycling_tags || [],
            labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
            labelTags: product.labels_tags || [],
            ecoscore: {
              grade: product.ecoscore_grade || 'unknown',
              score: product.ecoscore_score || 0,
              hasDetailedData: !!(ecoscoreData?.adjustments),
              transportScore: ecoscoreData?.adjustments?.origins_of_ingredients?.value,
              packagingScore: ecoscoreData?.adjustments?.packaging?.value,
            },
            nutriscore: {
              grade: product.nutriscore_grade || 'unknown',
              score: product.nutriscore_score || 0,
            },
            novaGroup: product.nova_group || 0,
            ingredients: '',
            isNorwegian,
            raw: product,
          };
        });

      // Cache the results
      setCache(searchCache, cacheKey, results);
      return results;
    }

    // Cache empty result
    setCache(searchCache, cacheKey, []);
    return [];
  } catch (error) {
    console.error('Error searching alternatives:', error);
    return [];
  }
}

// Search for products by name
export async function searchProducts(query: string, limit: number = 10): Promise<ProductData[]> {
  try {
    if (!query || query.length < 2) return [];

    // Search Norwegian database first
    const searchUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(query)}&search_simple=1&tagtype_0=countries&tag_contains_0=contains&tag_0=norway&sort_by=unique_scans_n&page_size=${limit}&json=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'GrønnValg/1.0 (contact@gronnvalg.no)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (data.products && data.products.length > 0) {
      return data.products
        .filter((p: any) => p.product_name) // Only products with names
        .slice(0, limit)
        .map((product: any) => {
          const isNorwegian = isProductNorwegian(product);
          const ecoscoreData = product.ecoscore_data;
          return {
            barcode: product.code,
            name: product.product_name || 'Ukjent',
            brand: product.brands || '',
            imageUrl: product.image_small_url || product.image_url || '',
            category: product.categories?.split(',')[0]?.trim() || '',
            origin: product.origins || (isNorwegian ? 'Norge' : ''),
            originTags: product.origins_tags || [],
            manufacturingPlaces: product.manufacturing_places || '',
            packaging: product.packaging || '',
            packagingTags: product.packaging_tags || [],
            packagingMaterials: product.packaging_materials_tags || [],
            packagingRecycling: product.packaging_recycling_tags || [],
            labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
            labelTags: product.labels_tags || [],
            ecoscore: {
              grade: product.ecoscore_grade || 'unknown',
              score: product.ecoscore_score || 0,
              hasDetailedData: !!(ecoscoreData?.adjustments),
              transportScore: ecoscoreData?.adjustments?.origins_of_ingredients?.value,
              packagingScore: ecoscoreData?.adjustments?.packaging?.value,
            },
            nutriscore: {
              grade: product.nutriscore_grade || 'unknown',
              score: product.nutriscore_score || 0,
            },
            novaGroup: product.nova_group || 0,
            ingredients: product.ingredients_text || '',
            isNorwegian,
            raw: product,
          };
        });
    }

    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}
