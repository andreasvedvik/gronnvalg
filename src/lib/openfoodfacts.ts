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

// ===== NORWEGIAN TEXT NORMALIZATION =====
// Fix common ASCII representations of Norwegian characters
const norwegianWordMappings: Record<string, string> = {
  // Common typos and misspellings
  'youghurt': 'yoghurt',  // Common typo in databases
  'joghurt': 'yoghurt',   // German spelling sometimes seen
  'yogourt': 'yoghurt',   // French spelling sometimes seen
  // Common food words with æ
  'baer': 'bær',
  'aerter': 'ærter',
  'paere': 'pære',
  'vaere': 'være',
  // Common food words with ø
  'kjoett': 'kjøtt',
  'broed': 'brød',
  'smoer': 'smør',
  'floete': 'fløte',
  'roem': 'røm',
  'roemme': 'rømme',
  'noetter': 'nøtter',
  'roedbet': 'rødbete',
  'loeek': 'løk',
  'groenn': 'grønn',
  'groent': 'grønt',
  'groennsaker': 'grønnsaker',
  'oekologisk': 'økologisk',
  'oel': 'øl',
  // Common food words with å
  'raa': 'rå',
  'paasmurt': 'påsmurt',
  'paalegg': 'pålegg',
  'blaabaer': 'blåbær',
  'blaaber': 'blåbær',
  'aapnet': 'åpnet',
  // Berry names
  'jordbaer': 'jordbær',
  'bringebaer': 'bringebær',
  'tranebaer': 'tranebær',
  'multebaer': 'multebær',
  'tyttbaer': 'tyttebær',
  'skogsbaer': 'skogsbær',
  'stikkelbaer': 'stikkelsbær',
  'solbaer': 'solbær',
  'ripsbaer': 'ripsbær',
  // Product-specific fixes
  'tine baer': 'tine bær',
};

function normalizeNorwegianText(text: string): string {
  if (!text) return text;

  let normalized = text;

  // Apply word-level mappings (case-insensitive)
  for (const [ascii, norwegian] of Object.entries(norwegianWordMappings)) {
    const regex = new RegExp(ascii, 'gi');
    normalized = normalized.replace(regex, (match) => {
      // Preserve original case
      if (match[0] === match[0].toUpperCase()) {
        return norwegian.charAt(0).toUpperCase() + norwegian.slice(1);
      }
      return norwegian;
    });
  }

  return normalized;
}
// ===== END NORWEGIAN TEXT NORMALIZATION =====

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
  // Allergen fields
  allergens?: string;
  allergens_tags?: string[];
  allergens_hierarchy?: string[];
  traces?: string;
  traces_tags?: string[];
  traces_hierarchy?: string[];
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

// Allergen info structure
export interface AllergenInfo {
  allergens: string[];       // Confirmed allergens
  traces: string[];          // May contain traces of
  hasAllergens: boolean;     // Quick check if any allergens
  hasTraces: boolean;        // Quick check if any traces
}

export interface ProductData {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  category: string;
  origin: string;
  originTags: string[]; // Structured origin tags
  manufacturingPlaces: string; // Where it's made
  packaging: string;
  packagingTags: string[]; // Structured packaging info
  packagingMaterials: string[]; // Specific materials
  packagingRecycling: string[]; // Recycling info
  labels: string[];
  labelTags: string[]; // Structured label tags
  // Allergen information
  allergenInfo: AllergenInfo;
  ecoscore: {
    grade: string;
    score: number;
    hasDetailedData: boolean; // Do we have ecoscore_data?
    transportScore?: number; // From ecoscore_data.adjustments
    packagingScore?: number; // From ecoscore_data.adjustments
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

// Parse allergen tags to readable names
function parseAllergenTags(tags: string[] | undefined): string[] {
  if (!tags || tags.length === 0) return [];

  // Mapping of allergen tags to Norwegian names
  const allergenNames: Record<string, string> = {
    'en:gluten': 'Gluten',
    'en:milk': 'Melk',
    'en:eggs': 'Egg',
    'en:nuts': 'Nøtter',
    'en:peanuts': 'Peanøtter',
    'en:soybeans': 'Soya',
    'en:celery': 'Selleri',
    'en:mustard': 'Sennep',
    'en:sesame-seeds': 'Sesamfrø',
    'en:sulphur-dioxide-and-sulphites': 'Sulfitt',
    'en:lupin': 'Lupin',
    'en:molluscs': 'Bløtdyr',
    'en:crustaceans': 'Skalldyr',
    'en:fish': 'Fisk',
    'en:wheat': 'Hvete',
    'en:barley': 'Bygg',
    'en:oats': 'Havre',
    'en:rye': 'Rug',
    'en:spelt': 'Spelt',
    'en:almonds': 'Mandler',
    'en:hazelnuts': 'Hasselnøtter',
    'en:walnuts': 'Valnøtter',
    'en:cashews': 'Cashewnøtter',
    'en:pecans': 'Pekannøtter',
    'en:brazil-nuts': 'Paranøtter',
    'en:pistachios': 'Pistasj',
    'en:macadamia-nuts': 'Macadamianøtter',
  };

  return tags.map(tag => {
    // Try to get Norwegian name, otherwise clean up the tag
    if (allergenNames[tag]) {
      return allergenNames[tag];
    }
    // Clean up tag: remove 'en:' prefix and format
    return tag.replace('en:', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  });
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
          'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)',
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

        // Extract allergen info
        const allergens = parseAllergenTags(product.allergens_tags);
        const traces = parseAllergenTags(product.traces_tags);

        const productData: ProductData = {
          barcode: product.code,
          name: normalizeNorwegianText(product.product_name || product.product_name_no || 'Ukjent produkt'),
          brand: normalizeNorwegianText(product.brands || 'Ukjent merke'),
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
          allergenInfo: {
            allergens,
            traces,
            hasAllergens: allergens.length > 0,
            hasTraces: traces.length > 0,
          },
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
  // Dairy - Yoghurt (multiple spellings!)
  'yoghurt': ['yogurts', 'yoghurt', 'yogurt', 'dairy desserts'],
  'yogurt': ['yogurts', 'yoghurt', 'yogurt', 'dairy desserts'],
  'youghurt': ['yogurts', 'yoghurt', 'yogurt', 'dairy desserts'], // common misspelling
  'skyr': ['yogurts', 'skyr', 'dairy desserts'],
  'biola': ['yogurts', 'fermented milk', 'dairy drinks'],
  'kefir': ['yogurts', 'fermented milk', 'kefir'],
  // Dairy - Milk
  'milk': ['milk', 'melk'],
  'melk': ['milk', 'melk'],
  'fløte': ['cream', 'fløte'],
  'rømme': ['sour cream', 'rømme'],
  // Dairy - Cheese
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
  // Fish
  'fisk': ['fish', 'fisk', 'seafood'],
  'laks': ['salmon', 'laks', 'fish'],
  // Juice and drinks
  'juice': ['juice', 'juices', 'fruit juices'],
  'smoothie': ['smoothies', 'fruit drinks'],
  // Water (to avoid mixing with other categories)
  'vann': ['water', 'vann'],
  'water': ['water', 'vann'],
};

// Find the best category for searching alternatives
function getBestSearchCategory(productName: string, categories: string): string {
  const nameLower = productName.toLowerCase();
  const categoriesLower = categories.toLowerCase();

  // Yoghurt detection - handle all spelling variations first
  if (nameLower.includes('yoghurt') || nameLower.includes('yogurt') || nameLower.includes('youghurt') ||
      nameLower.includes('skyr') || nameLower.includes('biola')) {
    return 'yogurts'; // Use the Open Food Facts category name
  }

  // Kefir detection
  if (nameLower.includes('kefir')) {
    return 'fermented milk';
  }

  // Check if it's a cola/soda specifically
  if (nameLower.includes('cola') || nameLower.includes('pepsi') || nameLower.includes('fanta') ||
      nameLower.includes('sprite') || nameLower.includes('brus') || nameLower.includes('soda')) {
    return 'sodas';
  }

  // Check if it's water
  if (nameLower.includes('vann') || nameLower.includes('water') || nameLower.includes('imsdal') ||
      nameLower.includes('farris') || nameLower.includes('olden')) {
    return 'water';
  }

  // Check product name for other specific product types
  for (const [keyword, mappings] of Object.entries(CATEGORY_MAPPINGS)) {
    if (nameLower.includes(keyword)) {
      // Return the first mapping which is usually the best Open Food Facts category
      return mappings[0] || keyword;
    }
  }

  // Parse categories and find most specific one
  const categoryList = categories.split(',').map(c => c.trim().toLowerCase());

  // Prefer more specific categories (longer names or containing specific keywords)
  const specificCategories = categoryList.filter(c =>
    c.includes('yogurt') || c.includes('yoghurt') || c.includes('dairy') ||
    c.includes('cola') || c.includes('soda') || c.includes('brus') ||
    c.includes('chips') || c.includes('chocolate') || c.includes('cheese') ||
    c.includes('bread') || c.includes('meat') || c.includes('milk')
  );

  if (specificCategories.length > 0) {
    return specificCategories[0];
  }

  // Fall back to first category, but try to avoid overly generic ones
  const genericCategories = ['beverages', 'drinks', 'food', 'drikkevarer', 'mat', 'snacks'];
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
        'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)',
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
          const allergens = parseAllergenTags(product.allergens_tags);
          const traces = parseAllergenTags(product.traces_tags);
          return {
            barcode: product.code,
            name: normalizeNorwegianText(product.product_name || 'Ukjent'),
            brand: normalizeNorwegianText(product.brands || ''),
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
            allergenInfo: {
              allergens,
              traces,
              hasAllergens: allergens.length > 0,
              hasTraces: traces.length > 0,
            },
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

    const parseProducts = (products: any[]): ProductData[] => {
      return products
        .filter((p: any) => p.product_name)
        .map((product: any) => {
          const isNorwegian = isProductNorwegian(product);
          const ecoscoreData = product.ecoscore_data;
          const allergens = parseAllergenTags(product.allergens_tags);
          const traces = parseAllergenTags(product.traces_tags);
          return {
            barcode: product.code,
            name: normalizeNorwegianText(product.product_name || 'Ukjent'),
            brand: normalizeNorwegianText(product.brands || ''),
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
            allergenInfo: {
              allergens,
              traces,
              hasAllergens: allergens.length > 0,
              hasTraces: traces.length > 0,
            },
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
    };

    // Search Norwegian Open Food Facts - products available in Norwegian stores
    // Use two searches: one strict (products tagged Norway) and one broader (all products in Norwegian database)
    const strictNorwayUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(query)}&search_simple=1&tagtype_0=countries&tag_contains_0=contains&tag_0=norway&sort_by=unique_scans_n&page_size=${limit * 2}&json=1`;
    const broaderNorwayUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(query)}&search_simple=1&sort_by=unique_scans_n&page_size=${limit * 2}&json=1`;

    const [strictResponse, broaderResponse] = await Promise.all([
      fetch(strictNorwayUrl, { headers: { 'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)' } }),
      fetch(broaderNorwayUrl, { headers: { 'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)' } }),
    ]);

    const strictData = strictResponse.ok ? await strictResponse.json() : { products: [] };
    const broaderData = broaderResponse.ok ? await broaderResponse.json() : { products: [] };

    const strictProducts = parseProducts(strictData.products || []);
    const broaderProducts = parseProducts(broaderData.products || []);

    // Combine: strictly Norwegian tagged first, then other products from Norwegian database
    const seenBarcodes = new Set<string>();
    const combined: ProductData[] = [];

    // Add products explicitly tagged with Norway first
    for (const product of strictProducts) {
      if (!seenBarcodes.has(product.barcode)) {
        seenBarcodes.add(product.barcode);
        combined.push(product);
      }
    }

    // Add other products from Norwegian database (scanned/available in Norway)
    for (const product of broaderProducts) {
      if (!seenBarcodes.has(product.barcode)) {
        seenBarcodes.add(product.barcode);
        combined.push(product);
      }
    }

    return combined.slice(0, limit);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Search for similar products - KUN NORSKE PRODUKTER
// Denne appen er laget for norske forbrukere, så vi viser kun norske produkter
export async function searchSimilarProducts(
  product: ProductData,
  limit: number = 8
): Promise<ProductData[]> {
  const searchCategory = getBestSearchCategory(product.name, product.category);
  const cacheKey = `similar-no:${searchCategory}:${limit}`;

  // Check cache first
  const cached = getCached(searchCache, cacheKey);
  if (cached !== undefined) {
    console.log('📦 Cache hit for similar products:', searchCategory);
    return cached;
  }

  try {
    console.log('🔍 Søker etter lignende norske produkter for:', product.name, '-> kategori:', searchCategory);

    // Søk KUN i norsk database med Norway-filter
    const norwegianUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(searchCategory)}&tagtype_1=countries&tag_contains_1=contains&tag_1=norway&sort_by=unique_scans_n&page_size=${limit * 4}&json=1`;

    const response = await fetch(norwegianUrl, {
      headers: {
        'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      // Fallback: search by product name keywords (only Norwegian)
      return await searchByNameKeywordsNorwegian(product.name, product.barcode, limit);
    }

    const norwegianProducts = data.products
      .filter((p: any) => p.product_name && p.code !== product.barcode) // Exclude the scanned product
      .filter((p: any) => isProductNorwegian(p)) // KUN norske produkter
      .slice(0, limit)
      .map((p: any) => {
        const ecoscoreData = p.ecoscore_data;
        const allergens = parseAllergenTags(p.allergens_tags);
        const traces = parseAllergenTags(p.traces_tags);
        return {
          barcode: p.code,
          name: normalizeNorwegianText(p.product_name || 'Ukjent'),
          brand: normalizeNorwegianText(p.brands || ''),
          imageUrl: p.image_small_url || p.image_url || '',
          category: p.categories?.split(',')[0]?.trim() || '',
          origin: p.origins || 'Norge',
          originTags: p.origins_tags || [],
          manufacturingPlaces: p.manufacturing_places || '',
          packaging: p.packaging || '',
          packagingTags: p.packaging_tags || [],
          packagingMaterials: p.packaging_materials_tags || [],
          packagingRecycling: p.packaging_recycling_tags || [],
          labels: p.labels?.split(',').map((l: string) => l.trim()) || [],
          labelTags: p.labels_tags || [],
          allergenInfo: {
            allergens,
            traces,
            hasAllergens: allergens.length > 0,
            hasTraces: traces.length > 0,
          },
          ecoscore: {
            grade: p.ecoscore_grade || 'unknown',
            score: p.ecoscore_score || 0,
            hasDetailedData: !!(ecoscoreData?.adjustments),
            transportScore: ecoscoreData?.adjustments?.origins_of_ingredients?.value,
            packagingScore: ecoscoreData?.adjustments?.packaging?.value,
          },
          nutriscore: {
            grade: p.nutriscore_grade || 'unknown',
            score: p.nutriscore_score || 0,
          },
          novaGroup: p.nova_group || 0,
          ingredients: '',
          isNorwegian: true,
          raw: p,
        } as ProductData;
      });

    console.log(`✅ Fant ${norwegianProducts.length} lignende norske produkter`);

    // Cache results
    setCache(searchCache, cacheKey, norwegianProducts);
    return norwegianProducts;
  } catch (error) {
    console.error('Error searching similar products:', error);
    return [];
  }
}

// Fallback search by product name keywords - KUN NORSKE PRODUKTER
async function searchByNameKeywordsNorwegian(
  productName: string,
  excludeBarcode: string,
  limit: number
): Promise<ProductData[]> {
  try {
    // Extract meaningful keywords from product name
    const keywords = productName
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 2)
      .join(' ');

    if (!keywords) {
      return [];
    }

    // Søk i norsk database med Norway-filter
    const searchUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&search_terms=${encodeURIComponent(keywords)}&tagtype_0=countries&tag_contains_0=contains&tag_0=norway&sort_by=unique_scans_n&page_size=${limit * 3}&json=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Grønnest/1.0 (contact@gronnest.no)',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.products) {
      return [];
    }

    const norwegianProducts = data.products
      .filter((p: any) => p.product_name && p.code !== excludeBarcode)
      .filter((p: any) => isProductNorwegian(p)) // KUN norske produkter
      .slice(0, limit)
      .map((p: any) => {
        const ecoscoreData = p.ecoscore_data;
        const allergens = parseAllergenTags(p.allergens_tags);
        const traces = parseAllergenTags(p.traces_tags);
        return {
          barcode: p.code,
          name: normalizeNorwegianText(p.product_name || 'Ukjent'),
          brand: normalizeNorwegianText(p.brands || ''),
          imageUrl: p.image_small_url || p.image_url || '',
          category: p.categories?.split(',')[0]?.trim() || '',
          origin: p.origins || 'Norge',
          originTags: p.origins_tags || [],
          manufacturingPlaces: p.manufacturing_places || '',
          packaging: p.packaging || '',
          packagingTags: p.packaging_tags || [],
          packagingMaterials: p.packaging_materials_tags || [],
          packagingRecycling: p.packaging_recycling_tags || [],
          labels: p.labels?.split(',').map((l: string) => l.trim()) || [],
          labelTags: p.labels_tags || [],
          allergenInfo: {
            allergens,
            traces,
            hasAllergens: allergens.length > 0,
            hasTraces: traces.length > 0,
          },
          ecoscore: {
            grade: p.ecoscore_grade || 'unknown',
            score: p.ecoscore_score || 0,
            hasDetailedData: !!(ecoscoreData?.adjustments),
            transportScore: ecoscoreData?.adjustments?.origins_of_ingredients?.value,
            packagingScore: ecoscoreData?.adjustments?.packaging?.value,
          },
          nutriscore: {
            grade: p.nutriscore_grade || 'unknown',
            score: p.nutriscore_score || 0,
          },
          novaGroup: p.nova_group || 0,
          ingredients: '',
          isNorwegian: true,
          raw: p,
        } as ProductData;
      });

    return norwegianProducts;
  } catch (error) {
    console.error('Error in keyword search:', error);
    return [];
  }
}
