// Unified Product Service
// Combines data from multiple sources: Kassalapp, Matvaretabellen, Open Food Facts
// Provides fallback chain and data enrichment

import { ProductData, fetchProduct as fetchFromOpenFoodFacts, searchProducts as searchOpenFoodFacts } from './openfoodfacts';
import { fetchFromKassalapp, searchKassalapp, isNorwegianFromKassalapp, extractPackagingFromKassalapp, KassalappProduct } from './kassalapp';
import { findFoodByName, extractStandardNutrients, getNutriScoreGrade, Matvare } from './matvaretabellen';

export interface DataSources {
  kassalapp: boolean;
  openFoodFacts: boolean;
  matvaretabellen: boolean;
}

export interface EnrichedProductData extends ProductData {
  dataSources: DataSources;
  kassalappData?: KassalappProduct;
  matvaretabellenData?: Matvare;
  priceInfo?: {
    lowestPrice: number;
    store: string;
    currency: string;
  };
}

/**
 * Fetch product from all available sources and merge data
 * Priority: Kassalapp (Norwegian-specific) → Open Food Facts → Matvaretabellen (enrichment)
 */
export async function fetchProductUnified(barcode: string): Promise<EnrichedProductData | null> {
  const dataSources: DataSources = {
    kassalapp: false,
    openFoodFacts: false,
    matvaretabellen: false,
  };

  // Try all sources in parallel for speed
  const [kassalappResult, offResult] = await Promise.all([
    fetchFromKassalapp(barcode).catch(() => null),
    fetchFromOpenFoodFacts(barcode).catch(() => null),
  ]);

  // Start with Open Food Facts as base (most structured for our needs)
  let baseProduct = offResult;
  let kassalappProduct = kassalappResult;

  if (offResult) {
    dataSources.openFoodFacts = true;
  }

  if (kassalappResult) {
    dataSources.kassalapp = true;
  }

  // If we don't have OFF data but have Kassalapp, convert Kassalapp to our format
  if (!baseProduct && kassalappProduct) {
    baseProduct = convertKassalappToProductData(kassalappProduct);
  }

  // Still no data? Return null
  if (!baseProduct) {
    return null;
  }

  // Enrich with Kassalapp data if available
  if (kassalappProduct && baseProduct) {
    baseProduct = enrichWithKassalapp(baseProduct, kassalappProduct);
  }

  // Try to enrich with Matvaretabellen nutritional data
  let matvaretabellenData: Matvare | null = null;
  try {
    // Search by product name
    const searchName = baseProduct.name.split(' ').slice(0, 2).join(' '); // First 2 words
    matvaretabellenData = await findFoodByName(searchName);
    if (matvaretabellenData) {
      dataSources.matvaretabellen = true;
      baseProduct = enrichWithMatvaretabellen(baseProduct, matvaretabellenData);
    }
  } catch {
    // Matvaretabellen lookup failed - continue without enrichment
  }

  // Build enriched product
  const enrichedProduct: EnrichedProductData = {
    ...baseProduct,
    dataSources,
    kassalappData: kassalappProduct || undefined,
    matvaretabellenData: matvaretabellenData || undefined,
  };

  // Add price info if available
  if (kassalappProduct?.store_prices?.length) {
    const sorted = [...kassalappProduct.store_prices].sort((a, b) => a.price.current - b.price.current);
    enrichedProduct.priceInfo = {
      lowestPrice: sorted[0].price.current,
      store: sorted[0].store.name,
      currency: 'NOK',
    };
  }

  return enrichedProduct;
}

/**
 * Convert Kassalapp product to our ProductData format
 */
function convertKassalappToProductData(kp: KassalappProduct): ProductData {
  const packaging = extractPackagingFromKassalapp(kp);
  const isNorwegian = isNorwegianFromKassalapp(kp);

  // Extract nutrition in Open Food Facts format
  const getNutrient = (code: string): number => {
    const n = kp.nutrition?.find(n => n.code.toLowerCase() === code.toLowerCase());
    return n?.amount || 0;
  };

  return {
    barcode: kp.ean,
    name: kp.name,
    brand: kp.brand || kp.vendor || '',
    imageUrl: kp.image || '',
    category: kp.category?.[0]?.name || 'Ukjent kategori',
    origin: isNorwegian ? 'Norge' : '',
    originTags: [],
    manufacturingPlaces: '',
    packaging: packaging.material,
    packagingTags: [packaging.material],
    packagingMaterials: [packaging.material],
    packagingRecycling: [],
    labels: [],
    labelTags: [],
    ecoscore: {
      grade: 'unknown',
      score: 0,
      hasDetailedData: false,
    },
    nutriscore: {
      grade: 'unknown',
      score: 0,
    },
    novaGroup: 0,
    ingredients: kp.ingredients || '',
    isNorwegian,
    allergenInfo: {
      allergens: [],
      traces: [],
      hasAllergens: false,
      hasTraces: false,
    },
    raw: kp as any,
  };
}

/**
 * Enrich ProductData with Kassalapp-specific data
 */
function enrichWithKassalapp(product: ProductData, kp: KassalappProduct): ProductData {
  const packaging = extractPackagingFromKassalapp(kp);
  const isNorwegian = isNorwegianFromKassalapp(kp);

  return {
    ...product,
    // Prefer Kassalapp name if more detailed
    name: kp.name.length > product.name.length ? kp.name : product.name,
    brand: product.brand || kp.brand || kp.vendor || '',
    imageUrl: product.imageUrl || kp.image || '',
    ingredients: product.ingredients || kp.ingredients || '',
    // Use Kassalapp Norwegian detection if OFF didn't find it
    isNorwegian: product.isNorwegian || isNorwegian,
    origin: product.origin || (isNorwegian ? 'Norge' : ''),
    // Enrich packaging if missing
    packaging: product.packaging || packaging.material,
    packagingTags: product.packagingTags.length > 0 ? product.packagingTags : [packaging.material],
    packagingMaterials: product.packagingMaterials.length > 0 ? product.packagingMaterials : [packaging.material],
  };
}

/**
 * Enrich ProductData with Matvaretabellen nutritional data
 */
function enrichWithMatvaretabellen(product: ProductData, mv: Matvare): ProductData {
  const nutrients = extractStandardNutrients(mv);
  const calculatedGrade = getNutriScoreGrade(mv);

  // Only update nutriscore if we don't have one
  if (product.nutriscore.grade === 'unknown') {
    return {
      ...product,
      nutriscore: {
        grade: calculatedGrade,
        score: nutrients.energyKcal, // Store energy for reference
      },
    };
  }

  return product;
}

/**
 * Get data quality score based on sources available
 */
export function calculateDataQualityBonus(sources: DataSources): number {
  let bonus = 0;
  if (sources.kassalapp) bonus += 20; // Norwegian-specific data
  if (sources.openFoodFacts) bonus += 10; // Global structured data
  if (sources.matvaretabellen) bonus += 10; // Official Norwegian nutrition
  return bonus;
}

/**
 * Convert Kassalapp product to ProductData (exported version)
 */
export function kassalappToProductData(kp: KassalappProduct): ProductData {
  const packaging = extractPackagingFromKassalapp(kp);
  const isNorwegian = isNorwegianFromKassalapp(kp);

  // Parse allergens from Kassalapp format
  const allergens = kp.allergens
    ?.filter(a => a.contains === 'YES')
    .map(a => a.display_name) || [];
  const traces = kp.allergens
    ?.filter(a => a.contains === 'MAY_CONTAIN')
    .map(a => a.display_name) || [];

  return {
    barcode: kp.ean,
    name: kp.name,
    brand: kp.brand || kp.vendor || '',
    imageUrl: kp.image || '',
    category: kp.category?.[0]?.name || 'Ukjent kategori',
    origin: isNorwegian ? 'Norge' : '',
    originTags: [],
    manufacturingPlaces: '',
    packaging: packaging.material,
    packagingTags: [packaging.material],
    packagingMaterials: [packaging.material],
    packagingRecycling: [],
    labels: [],
    labelTags: [],
    ecoscore: {
      grade: 'unknown',
      score: 0,
      hasDetailedData: false,
    },
    nutriscore: {
      grade: 'unknown',
      score: 0,
    },
    novaGroup: 0,
    ingredients: kp.ingredients || '',
    isNorwegian,
    allergenInfo: {
      allergens,
      traces,
      hasAllergens: allergens.length > 0,
      hasTraces: traces.length > 0,
    },
    raw: kp as any,
  };
}

// Common Norwegian grocery items for fallback suggestions
const COMMON_GROCERY_ITEMS: { name: string; category: string; keywords: string[] }[] = [
  // Fruits
  { name: 'Banan', category: 'Frukt', keywords: ['banan', 'bananer'] },
  { name: 'Eple', category: 'Frukt', keywords: ['eple', 'epler', 'apple'] },
  { name: 'Appelsin', category: 'Frukt', keywords: ['appelsin', 'appelsiner', 'orange'] },
  { name: 'Pære', category: 'Frukt', keywords: ['pære', 'pærer'] },
  { name: 'Druer', category: 'Frukt', keywords: ['druer', 'drue', 'vindrue'] },
  { name: 'Jordbær', category: 'Frukt', keywords: ['jordbær', 'jordbærer', 'strawberry'] },
  { name: 'Blåbær', category: 'Frukt', keywords: ['blåbær', 'blueberry'] },
  { name: 'Bringebær', category: 'Frukt', keywords: ['bringebær', 'raspberry'] },
  { name: 'Kiwi', category: 'Frukt', keywords: ['kiwi'] },
  { name: 'Mango', category: 'Frukt', keywords: ['mango'] },
  { name: 'Ananas', category: 'Frukt', keywords: ['ananas', 'pineapple'] },
  { name: 'Sitron', category: 'Frukt', keywords: ['sitron', 'lemon'] },
  { name: 'Lime', category: 'Frukt', keywords: ['lime'] },
  { name: 'Avokado', category: 'Frukt', keywords: ['avokado', 'avocado'] },
  // Vegetables
  { name: 'Paprika', category: 'Grønnsaker', keywords: ['paprika', 'pepper'] },
  { name: 'Tomat', category: 'Grønnsaker', keywords: ['tomat', 'tomater', 'tomato'] },
  { name: 'Agurk', category: 'Grønnsaker', keywords: ['agurk', 'cucumber'] },
  { name: 'Gulrot', category: 'Grønnsaker', keywords: ['gulrot', 'gulrøtter', 'carrot'] },
  { name: 'Løk', category: 'Grønnsaker', keywords: ['løk', 'onion'] },
  { name: 'Hvitløk', category: 'Grønnsaker', keywords: ['hvitløk', 'garlic'] },
  { name: 'Brokkoli', category: 'Grønnsaker', keywords: ['brokkoli', 'broccoli'] },
  { name: 'Blomkål', category: 'Grønnsaker', keywords: ['blomkål', 'cauliflower'] },
  { name: 'Spinat', category: 'Grønnsaker', keywords: ['spinat', 'spinach'] },
  { name: 'Salat', category: 'Grønnsaker', keywords: ['salat', 'lettuce'] },
  { name: 'Potet', category: 'Grønnsaker', keywords: ['potet', 'poteter', 'potato'] },
  { name: 'Squash', category: 'Grønnsaker', keywords: ['squash', 'zucchini'] },
  { name: 'Aubergine', category: 'Grønnsaker', keywords: ['aubergine', 'eggplant'] },
  { name: 'Mais', category: 'Grønnsaker', keywords: ['mais', 'corn'] },
  { name: 'Erter', category: 'Grønnsaker', keywords: ['erter', 'peas'] },
  // Dairy
  { name: 'Melk', category: 'Meieri', keywords: ['melk', 'milk'] },
  { name: 'Ost', category: 'Meieri', keywords: ['ost', 'cheese'] },
  { name: 'Smør', category: 'Meieri', keywords: ['smør', 'butter'] },
  { name: 'Yoghurt', category: 'Meieri', keywords: ['yoghurt', 'yogurt'] },
  { name: 'Rømme', category: 'Meieri', keywords: ['rømme', 'sour cream'] },
  { name: 'Fløte', category: 'Meieri', keywords: ['fløte', 'cream'] },
  { name: 'Egg', category: 'Meieri', keywords: ['egg', 'eggs'] },
  // Bread
  { name: 'Brød', category: 'Bakevarer', keywords: ['brød', 'bread'] },
  { name: 'Rundstykker', category: 'Bakevarer', keywords: ['rundstykker', 'rolls'] },
  { name: 'Knekkebrød', category: 'Bakevarer', keywords: ['knekkebrød', 'crispbread'] },
  // Meat
  { name: 'Kylling', category: 'Kjøtt', keywords: ['kylling', 'chicken'] },
  { name: 'Kjøttdeig', category: 'Kjøtt', keywords: ['kjøttdeig', 'ground beef', 'mince'] },
  { name: 'Bacon', category: 'Kjøtt', keywords: ['bacon'] },
  { name: 'Skinke', category: 'Kjøtt', keywords: ['skinke', 'ham'] },
  { name: 'Laks', category: 'Fisk', keywords: ['laks', 'salmon'] },
  { name: 'Torsk', category: 'Fisk', keywords: ['torsk', 'cod'] },
  // Pantry
  { name: 'Ris', category: 'Kolonial', keywords: ['ris', 'rice'] },
  { name: 'Pasta', category: 'Kolonial', keywords: ['pasta', 'spaghetti'] },
  { name: 'Mel', category: 'Kolonial', keywords: ['mel', 'flour'] },
  { name: 'Sukker', category: 'Kolonial', keywords: ['sukker', 'sugar'] },
  { name: 'Salt', category: 'Kolonial', keywords: ['salt'] },
  { name: 'Pepper', category: 'Kolonial', keywords: ['pepper'] },
  { name: 'Olje', category: 'Kolonial', keywords: ['olje', 'oil'] },
  { name: 'Kaffe', category: 'Drikke', keywords: ['kaffe', 'coffee'] },
  { name: 'Te', category: 'Drikke', keywords: ['te', 'tea'] },
  { name: 'Juice', category: 'Drikke', keywords: ['juice', 'appelsinjuice'] },
];

// Search common grocery items locally
function searchCommonGroceries(query: string, limit: number = 10): ProductData[] {
  const queryLower = query.toLowerCase().trim();

  const matches = COMMON_GROCERY_ITEMS
    .filter(item =>
      item.keywords.some(kw => kw.includes(queryLower) || queryLower.includes(kw)) ||
      item.name.toLowerCase().includes(queryLower)
    )
    .slice(0, limit)
    .map((item, index) => ({
      barcode: `local-${item.name.toLowerCase().replace(/\s/g, '-')}-${index}`,
      name: item.name,
      brand: item.category,
      imageUrl: '',
      category: item.category,
      origin: 'Norge',
      originTags: [],
      manufacturingPlaces: '',
      packaging: '',
      packagingTags: [],
      packagingMaterials: [],
      packagingRecycling: [],
      labels: [],
      labelTags: [],
      ecoscore: { grade: 'unknown', score: 0, hasDetailedData: false },
      nutriscore: { grade: 'unknown', score: 0 },
      novaGroup: 1, // Fresh produce is unprocessed
      ingredients: '',
      isNorwegian: true,
      allergenInfo: { allergens: [], traces: [], hasAllergens: false, hasTraces: false },
      raw: {} as any,
    } as ProductData));

  return matches;
}

/**
 * Unified search function - prioritizes Kassalapp (Norwegian stores) over Open Food Facts
 * This gives products from: REMA, Kiwi, Meny, SPAR, Coop, Bunnpris, Joker, 7-Eleven, etc.
 */
export async function searchProductsUnified(query: string, limit: number = 15): Promise<ProductData[]> {
  if (!query || query.length < 2) return [];

  try {
    // Search all sources in parallel (including common groceries as fallback)
    const [kassalappResults, offResults] = await Promise.all([
      searchKassalapp(query, limit).catch(() => []),
      searchOpenFoodFacts(query, limit).catch(() => []), // Increased limit
    ]);

    // Convert Kassalapp results to ProductData
    const kassalappProducts = kassalappResults.map(kp => kassalappToProductData(kp));

    // Combine: Kassalapp first (Norwegian store products), then OFF
    const seenBarcodes = new Set<string>();
    const seenNames = new Set<string>();
    const combined: ProductData[] = [];

    // Add Kassalapp products first (these are definitely in Norwegian stores)
    for (const product of kassalappProducts) {
      if (!seenBarcodes.has(product.barcode)) {
        seenBarcodes.add(product.barcode);
        seenNames.add(product.name.toLowerCase());
        combined.push(product);
      }
    }

    // Add Open Food Facts products (might have more eco data)
    for (const product of offResults) {
      if (!seenBarcodes.has(product.barcode)) {
        seenBarcodes.add(product.barcode);
        seenNames.add(product.name.toLowerCase());
        combined.push(product);
      }
    }

    // If we got few or no results, add common grocery suggestions
    if (combined.length < 5) {
      const commonMatches = searchCommonGroceries(query, limit - combined.length);
      for (const product of commonMatches) {
        // Only add if we don't already have something with a similar name
        const nameLower = product.name.toLowerCase();
        if (!seenNames.has(nameLower)) {
          seenNames.add(nameLower);
          combined.push(product);
        }
      }
    }

    return combined.slice(0, limit);
  } catch {
    // Fallback to common groceries + Open Food Facts
    const commonMatches = searchCommonGroceries(query, Math.floor(limit / 2));
    const offResults = await searchOpenFoodFacts(query, limit).catch(() => []);
    return [...commonMatches, ...offResults].slice(0, limit);
  }
}
