// Matvaretabellen API Integration
// Norwegian Food Composition Table from Mattilsynet
// API docs: https://www.matvaretabellen.no/api/

export interface MatvareNutrient {
  nutrientId: string;
  value: number;
  sourceId: string;
}

export interface Matvare {
  foodId: string;
  foodName: string;
  latinName?: string;
  foodGroupId: string;
  energyKj?: number;
  energyKcal?: number;
  ediblePart?: number;
  langualCodes?: string[];
  constituents: MatvareNutrient[];
  portions?: {
    portionName: string;
    portionUnit: string;
    quantity: number;
  }[];
}

export interface MatvareGroup {
  foodGroupId: string;
  foodGroupName: string;
  parentFoodGroupId?: string;
}

export interface NutrientDefinition {
  nutrientId: string;
  nutrientName: string;
  nutrientNameEn?: string;
  unit: string;
  decimals: number;
  euroFIRComponentId?: string;
}

// Cache for Matvaretabellen
const foodCache = new Map<string, Matvare>();
const foodGroupsCache: MatvareGroup[] = [];
const nutrientsCache: NutrientDefinition[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (data updates annually)

const API_BASE = 'https://www.matvaretabellen.no/api';

/**
 * Fetch all food items from Matvaretabellen
 */
export async function fetchAllFoods(): Promise<Matvare[]> {
  try {
    const response = await fetch(`${API_BASE}/nb/foods.json`);
    if (!response.ok) {
      console.error('Matvaretabellen foods API error:', response.status);
      return [];
    }
    const data = await response.json();

    // Cache individually
    if (Array.isArray(data)) {
      data.forEach((food: Matvare) => {
        foodCache.set(food.foodId, food);
        // Also cache by name for fuzzy matching
        foodCache.set(food.foodName.toLowerCase(), food);
      });
    }

    return data;
  } catch (error) {
    console.error('Matvaretabellen fetch error:', error);
    return [];
  }
}

/**
 * Fetch food groups
 */
export async function fetchFoodGroups(): Promise<MatvareGroup[]> {
  if (foodGroupsCache.length > 0 && Date.now() - lastFetchTime < CACHE_TTL) {
    return foodGroupsCache;
  }

  try {
    const response = await fetch(`${API_BASE}/nb/foodgroups.json`);
    if (!response.ok) return [];
    const data = await response.json();
    foodGroupsCache.push(...data);
    lastFetchTime = Date.now();
    return data;
  } catch (error) {
    console.error('Matvaretabellen groups error:', error);
    return [];
  }
}

/**
 * Fetch nutrient definitions
 */
export async function fetchNutrients(): Promise<NutrientDefinition[]> {
  if (nutrientsCache.length > 0 && Date.now() - lastFetchTime < CACHE_TTL) {
    return nutrientsCache;
  }

  try {
    const response = await fetch(`${API_BASE}/nb/nutrients.json`);
    if (!response.ok) return [];
    const data = await response.json();
    nutrientsCache.push(...data);
    return data;
  } catch (error) {
    console.error('Matvaretabellen nutrients error:', error);
    return [];
  }
}

/**
 * Find a food item by fuzzy name matching
 */
export async function findFoodByName(searchName: string): Promise<Matvare | null> {
  // Ensure we have foods loaded
  if (foodCache.size === 0) {
    await fetchAllFoods();
  }

  const searchLower = searchName.toLowerCase();

  // Try exact match first
  const exact = foodCache.get(searchLower);
  if (exact) return exact;

  // Try partial match
  const entries = Array.from(foodCache.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, food] = entries[i];
    if (typeof key === 'string' && key.includes(searchLower)) {
      return food;
    }
    if (food.foodName.toLowerCase().includes(searchLower)) {
      return food;
    }
  }

  // Try matching individual words
  const searchWords = searchLower.split(/\s+/);
  const foods = Array.from(foodCache.values());
  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    const foodWords = food.foodName.toLowerCase().split(/\s+/);
    const matches = searchWords.filter(sw =>
      foodWords.some((fw: string) => fw.includes(sw) || sw.includes(fw))
    );
    if (matches.length >= Math.ceil(searchWords.length / 2)) {
      return food;
    }
  }

  return null;
}

/**
 * Extract key nutrients in a standardized format
 */
export interface StandardizedNutrients {
  energyKcal: number;
  energyKj: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugars: number;
  fiber: number;
  salt: number;
  sodium: number;
}

export function extractStandardNutrients(food: Matvare): StandardizedNutrients {
  const getNutrient = (id: string): number => {
    const nutrient = food.constituents.find(c => c.nutrientId === id);
    return nutrient?.value ?? 0;
  };

  // Common nutrient IDs in Matvaretabellen
  // These may need verification against actual API response
  return {
    energyKcal: food.energyKcal || getNutrient('Ener') || 0,
    energyKj: food.energyKj || getNutrient('EnerKJ') || 0,
    protein: getNutrient('Prot') || 0,
    fat: getNutrient('Fat') || 0,
    saturatedFat: getNutrient('Satfa') || 0,
    carbohydrates: getNutrient('Carboh') || 0,
    sugars: getNutrient('Sugar') || 0,
    fiber: getNutrient('Fiber') || 0,
    salt: getNutrient('Salt') || getNutrient('Na') * 2.5 / 1000 || 0, // Convert sodium to salt
    sodium: getNutrient('Na') || 0,
  };
}

/**
 * Calculate a simple health score based on Matvaretabellen data
 * Returns 0-100 score
 */
export function calculateMatvareHealthScore(food: Matvare): number {
  const nutrients = extractStandardNutrients(food);

  let score = 50; // Base score

  // Protein is good (up to +15)
  if (nutrients.protein > 0) {
    score += Math.min(15, nutrients.protein / 2);
  }

  // Fiber is good (up to +15)
  if (nutrients.fiber > 0) {
    score += Math.min(15, nutrients.fiber * 3);
  }

  // Too much sugar is bad (up to -20)
  if (nutrients.sugars > 10) {
    score -= Math.min(20, (nutrients.sugars - 10) * 2);
  }

  // Too much saturated fat is bad (up to -15)
  if (nutrients.saturatedFat > 5) {
    score -= Math.min(15, (nutrients.saturatedFat - 5) * 2);
  }

  // Too much salt is bad (up to -10)
  if (nutrients.salt > 1.5) {
    score -= Math.min(10, (nutrients.salt - 1.5) * 5);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get Nutri-Score style grade from Matvaretabellen nutrients
 */
export function getNutriScoreGrade(food: Matvare): 'A' | 'B' | 'C' | 'D' | 'E' {
  const score = calculateMatvareHealthScore(food);

  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'E';
}
