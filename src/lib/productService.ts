// Unified Product Service
// Combines data from multiple sources: Kassalapp, Matvaretabellen, Open Food Facts
// Provides fallback chain and data enrichment

import { ProductData, fetchProduct as fetchFromOpenFoodFacts } from './openfoodfacts';
import { fetchFromKassalapp, isNorwegianFromKassalapp, extractPackagingFromKassalapp, KassalappProduct } from './kassalapp';
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
  console.log('🔍 Fetching product from unified sources:', barcode);

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
    console.log('✅ Open Food Facts data found');
  }

  if (kassalappResult) {
    dataSources.kassalapp = true;
    console.log('✅ Kassalapp data found:', kassalappResult.name);
  }

  // If we don't have OFF data but have Kassalapp, convert Kassalapp to our format
  if (!baseProduct && kassalappProduct) {
    baseProduct = convertKassalappToProductData(kassalappProduct);
  }

  // Still no data? Return null
  if (!baseProduct) {
    console.log('❌ No product data found in any source');
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
      console.log('✅ Matvaretabellen match found:', matvaretabellenData.foodName);
    }
  } catch (error) {
    console.log('⚠️ Matvaretabellen lookup failed');
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
