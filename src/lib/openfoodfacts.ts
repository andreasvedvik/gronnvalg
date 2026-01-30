// Open Food Facts API Integration

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands: string;
  image_url: string;
  image_small_url: string;
  categories: string;
  countries_tags: string[];
  origins: string;
  packaging: string;
  labels: string;
  ecoscore_grade: string;
  ecoscore_score: number;
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
  packaging: string;
  labels: string[];
  ecoscore: {
    grade: string;
    score: number;
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
        const isNorwegian =
          product.countries_tags?.includes('en:norway') ||
          product.origins?.toLowerCase().includes('norge') ||
          product.origins?.toLowerCase().includes('norway') ||
          product.labels?.toLowerCase().includes('nyt norge');

        return {
          barcode: product.code,
          name: product.product_name || product.product_name_no || 'Ukjent produkt',
          brand: product.brands || 'Ukjent merke',
          imageUrl: product.image_url || product.image_small_url || '',
          category: product.categories?.split(',')[0]?.trim() || 'Ukjent kategori',
          origin: product.origins || (isNorwegian ? 'Norge' : 'Ukjent'),
          packaging: product.packaging || '',
          labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
          ecoscore: {
            grade: product.ecoscore_grade || 'unknown',
            score: product.ecoscore_score || 0,
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
      }
    }

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

// Search for alternative products - ONLY truly Norwegian products
export async function searchAlternatives(category: string, limit: number = 5): Promise<ProductData[]> {
  try {
    // Search for products in the same category, fetch more to filter for Norwegian
    const searchUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&tagtype_1=countries&tag_contains_1=contains&tag_1=norway&sort_by=ecoscore_score&page_size=${limit * 4}&json=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'GrønnValg/1.0 (contact@gronnvalg.no)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (data.products && data.products.length > 0) {
      return data.products
        // Only include products with known ecoscore
        .filter((p: any) => p.ecoscore_grade && p.ecoscore_grade !== 'unknown')
        // Only include truly Norwegian products (produced in Norway)
        .filter((p: any) => isProductNorwegian(p))
        .slice(0, limit)
        .map((product: any) => {
          const isNorwegian = isProductNorwegian(product);
          return {
            barcode: product.code,
            name: product.product_name || 'Ukjent',
            brand: product.brands || '',
            imageUrl: product.image_small_url || '',
            category: product.categories?.split(',')[0]?.trim() || '',
            origin: product.origins || (isNorwegian ? 'Norge' : 'Ukjent'),
            packaging: product.packaging || '',
            labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
            ecoscore: {
              grade: product.ecoscore_grade || 'unknown',
              score: product.ecoscore_score || 0,
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
    }

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
          return {
            barcode: product.code,
            name: product.product_name || 'Ukjent',
            brand: product.brands || '',
            imageUrl: product.image_small_url || product.image_url || '',
            category: product.categories?.split(',')[0]?.trim() || '',
            origin: product.origins || (isNorwegian ? 'Norge' : 'Ukjent'),
            packaging: product.packaging || '',
            labels: product.labels?.split(',').map((l: string) => l.trim()) || [],
            ecoscore: {
              grade: product.ecoscore_grade || 'unknown',
              score: product.ecoscore_score || 0,
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
