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
  };
  /** Health-related scores (Nutri-Score and NOVA) */
  healthScore: {
    total: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    nutriscore: string;
    nova: number;
    dataAvailable: boolean;
  };
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
  const hasPET = allTags.some(t => t.includes('pet') || t.includes('pp') || t.includes('hdpe'));
  const hasPlastic = allTags.some(t => t.includes('plastic'));

  // Return based on best material found
  if (hasGlass) {
    return { score: 90, description: 'Glassemballasje (resirkulerbar)', available: true, source: 'packaging_tags' };
  }
  if (hasPaper) {
    return { score: 85, description: 'Papir/kartong (resirkulerbar)', available: true, source: 'packaging_tags' };
  }
  if (hasMetal) {
    const metalScore = isRecyclable ? 80 : 75;
    return { score: metalScore, description: 'Metallemballasje (resirkulerbar)', available: true, source: 'packaging_tags' };
  }
  if (hasPET && isRecyclable) {
    return { score: 70, description: 'PET-plast (resirkulerbar)', available: true, source: 'packaging_tags' };
  }
  if (hasPlastic) {
    const plasticScore = isRecyclable ? 55 : 40;
    return { score: plasticScore, description: isRecyclable ? 'Plast (delvis resirkulerbar)' : 'Plastemballasje', available: true, source: 'packaging_tags' };
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
  // 1. Base ecoscore (40% weight)
  const ecoscore = getEcoscoreValue(product.ecoscore.grade);

  // 2. Transport score (25% weight) - uses multiple data sources
  const transport = getTransportScore(product);

  // 3. Norwegian indicator (15% weight)
  // We check multiple sources for Norwegian origin
  const norwegianKnown = product.isNorwegian ||
    product.origin.toLowerCase().includes('norge') ||
    product.originTags.some(t => t.includes('norway'));
  const norwegianScore = norwegianKnown ? 100 : 30;
  const norwegianDesc = norwegianKnown
    ? 'Norskprodusert! 🇳🇴'
    : transport.available
      ? 'Ikke norskprodusert'
      : 'Opprinnelse ukjent - antatt importert';

  // 4. Packaging score (10% weight) - uses structured tags + ecoscore data
  const packaging = getPackagingScore(product);

  // 5. Certifications (10% weight) - uses structured label tags
  const certs = getCertificationScore(product);

  // Calculate data quality (how much real data do we have?)
  const dataPoints = [
    { available: ecoscore.available, weight: 40 },
    { available: transport.available, weight: 25 },
    { available: norwegianKnown || transport.available, weight: 15 },
    { available: packaging.available, weight: 10 },
    { available: true, weight: 10 }, // Certifications always "available" (empty is still data)
  ];
  const dataQuality = Math.round(
    dataPoints.reduce((sum, d) => sum + (d.available ? d.weight : 0), 0)
  );

  // Calculate weighted total
  const total = Math.round(
    ecoscore.score * 0.40 +
    transport.score * 0.25 +
    norwegianScore * 0.15 +
    packaging.score * 0.10 +
    certs.score * 0.10
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
    },
    healthScore: {
      ...healthScore,
      dataAvailable: product.nutriscore.grade.toLowerCase() !== 'unknown',
    },
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
