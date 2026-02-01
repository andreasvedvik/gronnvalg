/**
 * GrønnScore - Environmental Scoring Algorithm for Norwegian Products
 *
 * This module implements the GrønnScore algorithm, a composite sustainability
 * scoring system designed specifically for Norwegian consumers. It combines
 * multiple environmental factors to provide a comprehensive assessment of
 * a product's environmental impact.
 *
 * ## Scoring Components (Weighted)
 *
 * 1. **Eco-Score (40%)**: Official environmental impact score from Open Food Facts
 *    - Based on lifecycle assessment (LCA)
 *    - Grades: A (best) to E (worst)
 *
 * 2. **Transport (25%)**: Distance the product traveled to reach Norway
 *    - Norwegian products: 100 points
 *    - Nordic countries: 80 points
 *    - EU countries: 50 points
 *    - Overseas: 20 points
 *
 * 3. **Norwegian Origin (15%)**: Bonus for locally produced products
 *    - Norwegian: 100 points
 *    - Imported: 30 points
 *
 * 4. **Packaging (10%)**: Environmental impact of packaging
 *    - Glass/Paper: 85-90 points
 *    - Metal: 75-80 points
 *    - Recyclable plastic: 55-70 points
 *    - Non-recyclable plastic: 40 points
 *
 * 5. **Certifications (10%)**: Environmental and ethical certifications
 *    - Each certification adds 10 points
 *    - Base: 50, Max: 100
 *
 * ## Grade Thresholds
 * - A: 80-100 (Excellent)
 * - B: 60-79 (Good)
 * - C: 40-59 (Average)
 * - D: 20-39 (Poor)
 * - E: 0-19 (Very Poor)
 *
 * @module scoring
 * @author Grønnest Team
 * @version 1.0.0
 */

import { ProductData } from './openfoodfacts';

/**
 * Represents a single component of the score breakdown
 * @interface ScoreBreakdownItem
 */
export interface ScoreBreakdownItem {
  /** Numeric score from 0-100 */
  score: number;
  /** Human-readable label for this component */
  label: string;
  /** Detailed description of the score */
  description: string;
  /** Whether real data was available for this component */
  dataAvailable: boolean;
  /** Confidence level in the score accuracy */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * CO₂ footprint estimate for a product
 * @interface CO2Estimate
 */
export interface CO2Estimate {
  /** Estimated grams of CO₂ per 100g of product */
  gramsPerUnit: number;
  /** Category used for estimation */
  category: string;
  /** Whether this is plant-based (lower impact) */
  isPlantBased: boolean;
  /** Confidence level */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable description */
  description: string;
}

/**
 * Complete result from the GrønnScore calculation
 * @interface GrønnScoreResult
 */
export interface GrønnScoreResult {
  /** Total weighted score from 0-100 */
  total: number;
  /** Letter grade from A (best) to E (worst) */
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  /** Percentage of data points that had real data (0-100) */
  dataQuality: number;
  /** Breakdown of individual scoring components */
  breakdown: {
    ecoscore: ScoreBreakdownItem;
    transport: ScoreBreakdownItem;
    norwegian: ScoreBreakdownItem;
    packaging: ScoreBreakdownItem;
    certifications: ScoreBreakdownItem;
    plantBased: ScoreBreakdownItem;
  };
  /** Health-related scores (Nutri-Score and NOVA) */
  healthScore: {
    total: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    nutriscore: string;
    nova: number;
    dataAvailable: boolean;
  };
  /** Estimated CO₂ footprint */
  co2Estimate: CO2Estimate;
}

// Norwegian certifications we recognize
const NORWEGIAN_CERTIFICATIONS = [
  'nyt norge',
  'debio',
  'svanemerket',
  'nordic swan',
  'eu organic',
  'økologisk',
  'msc',
  'asc',
  'fairtrade',
  'rainforest alliance',
];

// Countries considered "close" for transport scoring
const CLOSE_COUNTRIES = ['norway', 'norge', 'sweden', 'sverige', 'denmark', 'danmark', 'finland'];
const EU_COUNTRIES = ['germany', 'france', 'netherlands', 'spain', 'italy', 'poland', 'belgium'];

// ===== CO₂ ESTIMATES (grams per 100g of product) =====
// Based on lifecycle assessment data from scientific studies
const CO2_ESTIMATES: Record<string, { co2: number; label: string }> = {
  // Animal products (high impact)
  'beef': { co2: 2500, label: 'Storfekjøtt' },
  'lamb': { co2: 2400, label: 'Lammekjøtt' },
  'cheese': { co2: 1100, label: 'Ost' },
  'pork': { co2: 720, label: 'Svinekjøtt' },
  'chicken': { co2: 450, label: 'Kylling' },
  'fish': { co2: 400, label: 'Fisk' },
  'eggs': { co2: 320, label: 'Egg' },
  'milk': { co2: 130, label: 'Melk' },
  'yogurt': { co2: 150, label: 'Yoghurt' },
  'butter': { co2: 1200, label: 'Smør' },
  'cream': { co2: 350, label: 'Fløte' },
  // Plant products (low impact)
  'vegetables': { co2: 40, label: 'Grønnsaker' },
  'fruits': { co2: 50, label: 'Frukt' },
  'legumes': { co2: 70, label: 'Belgfrukter' },
  'beans': { co2: 70, label: 'Bønner' },
  'lentils': { co2: 60, label: 'Linser' },
  'tofu': { co2: 200, label: 'Tofu' },
  'bread': { co2: 80, label: 'Brød' },
  'rice': { co2: 270, label: 'Ris' },
  'pasta': { co2: 120, label: 'Pasta' },
  'oats': { co2: 60, label: 'Havre' },
  'nuts': { co2: 30, label: 'Nøtter' },
  'plantmilk': { co2: 40, label: 'Plantemelk' },
  // Processed/drinks
  'chocolate': { co2: 340, label: 'Sjokolade' },
  'coffee': { co2: 1700, label: 'Kaffe' },
  'soda': { co2: 50, label: 'Brus' },
  'juice': { co2: 80, label: 'Juice' },
  'beer': { co2: 60, label: 'Øl' },
  'wine': { co2: 120, label: 'Vin' },
};

// Keywords for detecting plant-based products
const PLANT_BASED_KEYWORDS = [
  'vegan', 'vegansk', 'plant-based', 'plantebasert', 'vegetar',
  'tofu', 'seitan', 'tempeh', 'soya', 'soy', 'oat', 'havre',
  'almond', 'mandel', 'cashew', 'coconut', 'kokos', 'rice milk',
  'oatly', 'alpro', 'naturli', 'hälsans kök', 'quorn',
  'beyond', 'impossible', 'planted', 'redefine', 'v-label'
];

// Keywords for detecting animal products
const ANIMAL_KEYWORDS = [
  'beef', 'biff', 'steak', 'kjøtt', 'meat', 'pork', 'svin', 'bacon',
  'chicken', 'kylling', 'lamb', 'lam', 'fish', 'fisk', 'salmon', 'laks',
  'shrimp', 'reke', 'milk', 'melk', 'cheese', 'ost', 'butter', 'smør',
  'cream', 'fløte', 'egg', 'yogurt', 'yoghurt', 'ham', 'skinke'
];

/**
 * Detects if a product is plant-based
 */
function isPlantBased(product: ProductData): { isPlantBased: boolean; confidence: 'high' | 'medium' | 'low' } {
  const searchText = [
    product.name,
    product.category,
    product.ingredients,
    ...product.labels
  ].join(' ').toLowerCase();

  // Check for explicit plant-based labels
  const hasPlantLabel = PLANT_BASED_KEYWORDS.some(kw => searchText.includes(kw));
  const hasAnimalKeyword = ANIMAL_KEYWORDS.some(kw => searchText.includes(kw));

  if (hasPlantLabel && !hasAnimalKeyword) {
    return { isPlantBased: true, confidence: 'high' };
  }
  if (hasAnimalKeyword) {
    return { isPlantBased: false, confidence: 'high' };
  }
  // Check category
  const categoryLower = product.category.toLowerCase();
  if (categoryLower.includes('vegetable') || categoryLower.includes('fruit') ||
      categoryLower.includes('grønnsak') || categoryLower.includes('frukt')) {
    return { isPlantBased: true, confidence: 'medium' };
  }

  return { isPlantBased: false, confidence: 'low' };
}

/**
 * Estimates CO₂ footprint based on product category
 */
function estimateCO2(product: ProductData): CO2Estimate {
  const searchText = [product.name, product.category, product.ingredients].join(' ').toLowerCase();
  const plantStatus = isPlantBased(product);

  // Try to match specific categories
  for (const [key, data] of Object.entries(CO2_ESTIMATES)) {
    if (searchText.includes(key)) {
      return {
        gramsPerUnit: data.co2,
        category: data.label,
        isPlantBased: plantStatus.isPlantBased,
        confidence: 'medium',
        description: `~${data.co2}g CO₂/100g (${data.label})`
      };
    }
  }

  // Fallback based on plant-based status
  if (plantStatus.isPlantBased) {
    return {
      gramsPerUnit: 80,
      category: 'Plantebasert',
      isPlantBased: true,
      confidence: 'low',
      description: '~80g CO₂/100g (plantebasert, estimert)'
    };
  }

  return {
    gramsPerUnit: 300,
    category: 'Ukjent',
    isPlantBased: false,
    confidence: 'low',
    description: '~300g CO₂/100g (gjennomsnitt, estimert)'
  };
}

/**
 * Calculates plant-based bonus score
 */
function getPlantBasedScore(product: ProductData): { score: number; description: string; isPlantBased: boolean } {
  const status = isPlantBased(product);

  if (status.isPlantBased && status.confidence === 'high') {
    return { score: 100, description: 'Plantebasert produkt 🌱', isPlantBased: true };
  }
  if (status.isPlantBased && status.confidence === 'medium') {
    return { score: 90, description: 'Sannsynlig plantebasert 🌿', isPlantBased: true };
  }
  // Animal products get lower scores based on impact
  const searchText = [product.name, product.category].join(' ').toLowerCase();
  if (searchText.includes('beef') || searchText.includes('biff') || searchText.includes('storfekjøtt')) {
    return { score: 20, description: 'Storfekjøtt (høyt klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('lamb') || searchText.includes('lam')) {
    return { score: 25, description: 'Lammekjøtt (høyt klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('cheese') || searchText.includes('ost')) {
    return { score: 40, description: 'Ost (moderat klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('pork') || searchText.includes('svin')) {
    return { score: 50, description: 'Svinekjøtt (moderat klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('chicken') || searchText.includes('kylling')) {
    return { score: 60, description: 'Kylling (lavere klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('fish') || searchText.includes('fisk')) {
    return { score: 65, description: 'Fisk (moderat klimaavtrykk)', isPlantBased: false };
  }
  if (searchText.includes('milk') || searchText.includes('melk') ||
      searchText.includes('yogurt') || searchText.includes('yoghurt')) {
    return { score: 55, description: 'Meieriprodukter', isPlantBased: false };
  }

  return { score: 50, description: 'Ukjent kategori', isPlantBased: false };
}

function getEcoscoreValue(grade: string): { score: number; available: boolean; description: string } {
  const gradeLower = grade.toLowerCase();
  const grades: Record<string, number> = {
    'a': 100,
    'b': 80,
    'c': 60,
    'd': 40,
    'e': 20,
  };

  // Check if we have real data
  if (grades[gradeLower] !== undefined) {
    return {
      score: grades[gradeLower],
      available: true,
      description: `Eco-Score: ${grade.toUpperCase()} (verifisert)`,
    };
  }

  // No real data - be transparent about it
  return {
    score: 50, // Neutral default
    available: false,
    description: 'Eco-Score ikke tilgjengelig - nøytral verdi brukt',
  };
}

function getTransportScore(product: ProductData): { score: number; description: string; available: boolean; source: string } {
  // First, check if we have detailed ecoscore transport data
  if (product.ecoscore.transportScore !== undefined) {
    // Ecoscore transport adjustment is typically -15 to +15, convert to 0-100
    const adjustedScore = Math.max(0, Math.min(100, 50 + (product.ecoscore.transportScore * 3)));
    return {
      score: Math.round(adjustedScore),
      description: `Transport (fra Eco-Score data)`,
      available: true,
      source: 'ecoscore_data'
    };
  }

  // Check multiple origin sources
  const originSources = [
    product.origin,
    product.manufacturingPlaces,
    ...product.originTags.map(t => t.replace('en:', '').replace(/-/g, ' ')),
  ].filter(Boolean);

  const allOrigins = originSources.join(' ').toLowerCase();

  if (product.isNorwegian || allOrigins.includes('norge') || allOrigins.includes('norway')) {
    return { score: 100, description: 'Norskprodusert - minimal transport', available: true, source: 'origin' };
  }

  for (const country of CLOSE_COUNTRIES) {
    if (allOrigins.includes(country)) {
      const countryName = country.charAt(0).toUpperCase() + country.slice(1);
      return { score: 80, description: `Fra ${countryName} - kort transport`, available: true, source: 'origin' };
    }
  }

  for (const country of EU_COUNTRIES) {
    if (allOrigins.includes(country)) {
      const countryName = country.charAt(0).toUpperCase() + country.slice(1);
      return { score: 50, description: `Fra ${countryName} (Europa) - moderat transport`, available: true, source: 'origin' };
    }
  }

  // Check for far-away origins
  const farOrigins = ['peru', 'chile', 'brazil', 'brasil', 'argentina', 'south africa', 'australia', 'new zealand', 'china', 'india', 'thailand', 'vietnam', 'indonesia', 'malaysia', 'mexico', 'usa', 'united states'];
  for (const far of farOrigins) {
    if (allOrigins.includes(far)) {
      const farName = far.charAt(0).toUpperCase() + far.slice(1);
      return { score: 20, description: `Lang transport fra ${farName}`, available: true, source: 'origin' };
    }
  }

  // Check if we have ANY origin info at all
  if (originSources.length > 0 && originSources[0].length > 0) {
    return { score: 50, description: `Opprinnelse: ${originSources[0].slice(0, 25)}`, available: true, source: 'origin' };
  }

  // Unknown - be transparent
  return { score: 50, description: 'Opprinnelse ukjent - nøytral verdi brukt', available: false, source: 'none' };
}

function getCertificationScore(product: ProductData): { score: number; found: string[]; source: string } {
  const found: string[] = [];
  let bonus = 0;

  // Check structured label tags first (more reliable)
  const certificationTags: Record<string, string> = {
    'en:organic': 'Økologisk',
    'en:eu-organic': 'EU Økologisk',
    'en:norwegian-certified-organic': 'Debio',
    'en:fair-trade': 'Fairtrade',
    'en:fairtrade-international': 'Fairtrade',
    'en:rainforest-alliance': 'Rainforest Alliance',
    'en:msc': 'MSC (bærekraftig fiske)',
    'en:asc': 'ASC (bærekraftig oppdrett)',
    'en:nordic-swan': 'Svanemerket',
    'en:produced-in-norway': 'Nyt Norge',
    'en:nutriscore': '', // Skip nutriscore as certification
  };

  for (const tag of product.labelTags) {
    const tagLower = tag.toLowerCase();
    if (certificationTags[tagLower] && certificationTags[tagLower] !== '') {
      if (!found.includes(certificationTags[tagLower])) {
        found.push(certificationTags[tagLower]);
        bonus += 10;
      }
    }
    // Also check for partial matches in tags
    for (const cert of NORWEGIAN_CERTIFICATIONS) {
      if (tagLower.includes(cert.replace(' ', '-')) && !found.some(f => f.toLowerCase().includes(cert))) {
        found.push(cert.charAt(0).toUpperCase() + cert.slice(1));
        bonus += 10;
      }
    }
  }

  // Also check free-text labels
  for (const label of product.labels) {
    const labelLower = label.toLowerCase();
    for (const cert of NORWEGIAN_CERTIFICATIONS) {
      if (labelLower.includes(cert) && !found.some(f => f.toLowerCase().includes(cert))) {
        found.push(label);
        bonus += 10;
      }
    }
  }

  // Determine source
  const source = found.length > 0
    ? (product.labelTags.length > 0 ? 'label_tags' : 'labels_text')
    : 'none';

  return {
    score: Math.min(100, 50 + bonus), // Base 50, +10 per certification, max 100
    found: Array.from(new Set(found)), // Remove duplicates
    source,
  };
}

function getPackagingScore(product: ProductData): { score: number; description: string; available: boolean; source: string } {
  // First check if we have ecoscore packaging data
  if (product.ecoscore.packagingScore !== undefined) {
    // Ecoscore packaging adjustment is typically -15 to +15, convert to 0-100
    const adjustedScore = Math.max(0, Math.min(100, 50 + (product.ecoscore.packagingScore * 3)));
    return {
      score: Math.round(adjustedScore),
      description: `Emballasje (fra Eco-Score data)`,
      available: true,
      source: 'ecoscore_data'
    };
  }

  // Check structured packaging tags (more reliable)
  const allTags = [...product.packagingTags, ...product.packagingMaterials, ...product.packagingRecycling]
    .map(t => t.toLowerCase().replace('en:', ''));
  const recyclingTags = product.packagingRecycling.map(t => t.toLowerCase());

  // Check for recyclable indicators
  const isRecyclable = recyclingTags.some(t =>
    t.includes('recycle') || t.includes('returnable') || t.includes('deposit')
  );

  // Check materials from tags
  const hasGlass = allTags.some(t => t.includes('glass'));
  const hasPaper = allTags.some(t => t.includes('paper') || t.includes('cardboard') || t.includes('carton'));
  const hasMetal = allTags.some(t => t.includes('aluminium') || t.includes('steel') || t.includes('metal') || t.includes('tin'));

  // Specific plastic types (better differentiation)
  const hasPET = allTags.some(t => t.includes('pet') || t.includes('polyethylene-terephthalate') || t.includes('01-pet'));
  const hasHDPE = allTags.some(t => t.includes('hdpe') || t.includes('02-hdpe') || t.includes('high-density'));
  const hasPP = allTags.some(t => t.includes('-pp') || t.includes('05-pp') || t.includes('polypropylene'));
  const hasLDPE = allTags.some(t => t.includes('ldpe') || t.includes('04-ldpe') || t.includes('low-density'));
  const hasPS = allTags.some(t => t.includes('-ps') || t.includes('06-ps') || t.includes('polystyrene'));
  const hasPVC = allTags.some(t => t.includes('pvc') || t.includes('03-pvc'));
  const hasOtherPlastic = allTags.some(t => t.includes('plastic') || t.includes('07-other'));

  // Return based on best material found
  if (hasGlass) {
    return { score: 90, description: 'Glass (100% resirkulerbar ♻️)', available: true, source: 'packaging_tags' };
  }
  if (hasPaper) {
    return { score: 85, description: 'Papir/kartong (resirkulerbar ♻️)', available: true, source: 'packaging_tags' };
  }
  if (hasMetal) {
    const metalScore = isRecyclable ? 80 : 75;
    return { score: metalScore, description: 'Metall/aluminium (resirkulerbar ♻️)', available: true, source: 'packaging_tags' };
  }

  // Plastic types with specific scores and descriptions
  if (hasPET) {
    const score = isRecyclable ? 70 : 55;
    return { score, description: `PET (#1) - ${isRecyclable ? 'Pant/resirkulerbar ♻️' : 'Bør resirkuleres'}`, available: true, source: 'packaging_tags' };
  }
  if (hasHDPE) {
    const score = isRecyclable ? 68 : 50;
    return { score, description: `HDPE (#2) - ${isRecyclable ? 'Resirkulerbar ♻️' : 'Kan resirkuleres'}`, available: true, source: 'packaging_tags' };
  }
  if (hasPP) {
    const score = isRecyclable ? 60 : 45;
    return { score, description: `PP (#5) - ${isRecyclable ? 'Delvis resirkulerbar' : 'Begrenset resirkulering'}`, available: true, source: 'packaging_tags' };
  }
  if (hasLDPE) {
    return { score: 40, description: 'LDPE (#4) - Mykplast (vanskelig å resirkulere)', available: true, source: 'packaging_tags' };
  }
  if (hasPVC) {
    return { score: 25, description: 'PVC (#3) - ⚠️ Problematisk plast', available: true, source: 'packaging_tags' };
  }
  if (hasPS) {
    return { score: 30, description: 'PS (#6) - ⚠️ Vanskelig å resirkulere', available: true, source: 'packaging_tags' };
  }
  if (hasOtherPlastic) {
    return { score: 35, description: 'Blandet plast (#7) - Ikke resirkulerbar', available: true, source: 'packaging_tags' };
  }

  // Fall back to free-text packaging field
  const packLower = product.packaging.toLowerCase();
  if (!product.packaging || product.packaging.trim() === '') {
    return { score: 50, description: 'Emballasje ukjent - nøytral verdi brukt', available: false, source: 'none' };
  }

  // Parse free text
  if (packLower.includes('glass')) {
    return { score: 90, description: 'Glassemballasje', available: true, source: 'packaging_text' };
  }
  if (packLower.includes('paper') || packLower.includes('cardboard') || packLower.includes('kartong') || packLower.includes('papir')) {
    return { score: 85, description: 'Papir/kartong', available: true, source: 'packaging_text' };
  }
  if (packLower.includes('can') || packLower.includes('boks') || packLower.includes('aluminium') || packLower.includes('metal')) {
    return { score: 75, description: 'Metallemballasje', available: true, source: 'packaging_text' };
  }
  if (packLower.includes('pet') || packLower.includes('recyclable') || packLower.includes('resirkulerbar')) {
    return { score: 70, description: 'Resirkulerbar plast', available: true, source: 'packaging_text' };
  }
  if (packLower.includes('plastic') || packLower.includes('plast')) {
    return { score: 40, description: 'Plastemballasje', available: true, source: 'packaging_text' };
  }

  // Has some info but can't categorize
  return { score: 50, description: `Emballasje: ${product.packaging.slice(0, 25)}`, available: true, source: 'packaging_text' };
}

function calculateHealthScore(product: ProductData): { total: number; grade: 'A' | 'B' | 'C' | 'D' | 'E'; nutriscore: string; nova: number } {
  let score = 50; // Base score

  // Nutriscore contribution (40%)
  const nutriscoreValues: Record<string, number> = {
    'a': 100,
    'b': 80,
    'c': 60,
    'd': 40,
    'e': 20,
    'unknown': 50,
  };
  const nutriscoreScore = nutriscoreValues[product.nutriscore.grade.toLowerCase()] || 50;
  score = score * 0.6 + nutriscoreScore * 0.4;

  // NOVA group penalty (processing level)
  const novaPenalty: Record<number, number> = {
    1: 0,   // Unprocessed
    2: -5,  // Processed culinary ingredients
    3: -10, // Processed foods
    4: -20, // Ultra-processed
  };
  score += novaPenalty[product.novaGroup] || 0;

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'E';
  if (score >= 80) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 40) grade = 'C';
  else if (score >= 20) grade = 'D';
  else grade = 'E';

  return {
    total: score,
    grade,
    nutriscore: product.nutriscore.grade.toUpperCase(),
    nova: product.novaGroup,
  };
}

/**
 * Calculates the GrønnScore for a product
 *
 * This is the main entry point for the scoring algorithm. It takes a product
 * and returns a comprehensive score result including the total score, grade,
 * data quality indicator, and detailed breakdown of all components.
 *
 * @param product - Product data from Open Food Facts API
 * @returns Complete GrønnScore result with breakdown and health scores
 *
 * @example
 * ```typescript
 * const product = await fetchProduct('7038010009457');
 * const score = calculateGrønnScore(product);
 *
 * console.log(`Total: ${score.total}/100`);
 * console.log(`Grade: ${score.grade}`);
 * console.log(`Data Quality: ${score.dataQuality}%`);
 * console.log(`Ecoscore: ${score.breakdown.ecoscore.score}`);
 * ```
 */
export function calculateGrønnScore(product: ProductData): GrønnScoreResult {
  // 1. Base ecoscore (35% weight - reduced to make room for plant-based)
  const ecoscore = getEcoscoreValue(product.ecoscore.grade);

  // 2. Transport score (20% weight)
  const transport = getTransportScore(product);

  // 3. Norwegian indicator (15% weight)
  const norwegianKnown = product.isNorwegian ||
    product.origin.toLowerCase().includes('norge') ||
    product.originTags.some(t => t.includes('norway'));
  const norwegianScore = norwegianKnown ? 100 : 30;
  const norwegianDesc = norwegianKnown
    ? 'Norskprodusert! 🇳🇴'
    : transport.available
      ? 'Ikke norskprodusert'
      : 'Opprinnelse ukjent - antatt importert';

  // 4. Packaging score (10% weight)
  const packaging = getPackagingScore(product);

  // 5. Certifications (5% weight - reduced)
  const certs = getCertificationScore(product);

  // 6. NEW: Plant-based bonus (15% weight) - rewards lower climate impact
  const plantBased = getPlantBasedScore(product);

  // 7. NEW: CO₂ estimate
  const co2Estimate = estimateCO2(product);

  // Calculate data quality
  const dataPoints = [
    { available: ecoscore.available, weight: 35 },
    { available: transport.available, weight: 20 },
    { available: norwegianKnown || transport.available, weight: 15 },
    { available: packaging.available, weight: 10 },
    { available: true, weight: 5 },
    { available: true, weight: 15 }, // Plant-based detection always available
  ];
  const dataQuality = Math.round(
    dataPoints.reduce((sum, d) => sum + (d.available ? d.weight : 0), 0)
  );

  // Calculate weighted total (new weights)
  const total = Math.round(
    ecoscore.score * 0.35 +
    transport.score * 0.20 +
    norwegianScore * 0.15 +
    packaging.score * 0.10 +
    certs.score * 0.05 +
    plantBased.score * 0.15
  );

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'E';
  if (total >= 80) grade = 'A';
  else if (total >= 60) grade = 'B';
  else if (total >= 40) grade = 'C';
  else if (total >= 20) grade = 'D';
  else grade = 'E';

  // Calculate health score
  const healthScore = calculateHealthScore(product);

  // Determine confidence based on data quality
  const getConfidence = (available: boolean): 'high' | 'medium' | 'low' => {
    if (available) return 'high';
    return 'low';
  };

  return {
    total,
    grade,
    dataQuality,
    breakdown: {
      ecoscore: {
        score: ecoscore.score,
        label: 'Miljøpåvirkning',
        description: ecoscore.description,
        dataAvailable: ecoscore.available,
        confidence: getConfidence(ecoscore.available),
      },
      transport: {
        score: transport.score,
        label: 'Transport',
        description: transport.description,
        dataAvailable: transport.available,
        confidence: getConfidence(transport.available),
      },
      norwegian: {
        score: norwegianScore,
        label: 'Norsk',
        description: norwegianDesc,
        dataAvailable: norwegianKnown || transport.available,
        confidence: norwegianKnown ? 'high' : (transport.available ? 'medium' : 'low'),
      },
      packaging: {
        score: packaging.score,
        label: 'Emballasje',
        description: packaging.description,
        dataAvailable: packaging.available,
        confidence: getConfidence(packaging.available),
      },
      certifications: {
        score: certs.score,
        label: 'Sertifiseringer',
        description: certs.found.length > 0 ? certs.found.join(', ') : 'Ingen kjente sertifiseringer',
        dataAvailable: true,
        confidence: 'high',
      },
      plantBased: {
        score: plantBased.score,
        label: 'Klimavalg',
        description: plantBased.description,
        dataAvailable: true,
        confidence: plantBased.isPlantBased ? 'high' : 'medium',
      },
    },
    healthScore: {
      ...healthScore,
      dataAvailable: product.nutriscore.grade.toLowerCase() !== 'unknown',
    },
    co2Estimate,
  };
}

/**
 * Returns a Tailwind CSS background color class based on the score
 *
 * @param score - Numeric score from 0-100
 * @returns Tailwind CSS class for background color
 *
 * @example
 * ```tsx
 * <div className={getScoreColor(85)}>Score</div> // bg-green-500
 * ```
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Returns a Tailwind CSS text color class based on the score
 *
 * @param score - Numeric score from 0-100
 * @returns Tailwind CSS class for text color
 */
export function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-lime-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Returns an emoji representing the grade
 *
 * @param grade - Letter grade (A-E)
 * @returns Emoji corresponding to the grade
 *
 * @example
 * ```tsx
 * <span>{getGradeEmoji('A')}</span> // 🌟
 * ```
 */
export function getGradeEmoji(grade: string): string {
  const emojis: Record<string, string> = {
    'A': '🌟',
    'B': '👍',
    'C': '😐',
    'D': '⚠️',
    'E': '❌',
  };
  return emojis[grade.toUpperCase()] || '❓';
}
