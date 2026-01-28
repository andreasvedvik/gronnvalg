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

// Search for alternative products
export async function searchAlternatives(category: string, limit: number = 5): Promise<ProductData[]> {
  try {
    // Search for Norwegian products in the same category with good ecoscore
    const searchUrl = `https://no.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}&tagtype_1=countries&tag_contains_1=contains&tag_1=norway&sort_by=ecoscore_score&page_size=${limit}&json=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'GrønnValg/1.0 (contact@gronnvalg.no)',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    if (data.products && data.products.length > 0) {
      return data.products
        .filter((p: any) => p.ecoscore_grade && p.ecoscore_grade !== 'unknown')
        .slice(0, limit)
        .map((product: any) => ({
          barcode: product.code,
          name: product.product_name || 'Ukjent',
          brand: product.brands || '',
          imageUrl: product.image_small_url || '',
          category: product.categories?.split(',')[0]?.trim() || '',
          origin: product.origins || 'Norge',
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
          isNorwegian: true,
          raw: product,
        }));
    }

    return [];
  } catch (error) {
    console.error('Error searching alternatives:', error);
    return [];
  }
}
