// GrønnScore Calculation Logic
// Combines sustainability (eco) and health scores with Norwegian context

import { ProductData } from './openfoodfacts';

export interface GrønnScoreResult {
  total: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  breakdown: {
    ecoscore: { score: number; label: string; description: string };
    transport: { score: number; label: string; description: string };
    norwegian: { score: number; label: string; description: string };
    packaging: { score: number; label: string; description: string };
    certifications: { score: number; label: string; description: string };
  };
  healthScore: {
    total: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    nutriscore: string;
    nova: number;
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

function getEcoscoreValue(grade: string): number {
  const grades: Record<string, number> = {
    'a': 100,
    'b': 80,
    'c': 60,
    'd': 40,
    'e': 20,
    'unknown': 50,
  };
  return grades[grade.toLowerCase()] || 50;
}

function getTransportScore(origin: string, isNorwegian: boolean): { score: number; description: string } {
  const originLower = origin.toLowerCase();

  if (isNorwegian || originLower.includes('norge') || originLower.includes('norway')) {
    return { score: 100, description: 'Norskprodusert - minimal transport' };
  }

  for (const country of CLOSE_COUNTRIES) {
    if (originLower.includes(country)) {
      return { score: 80, description: 'Nærområde (Norden) - kort transport' };
    }
  }

  for (const country of EU_COUNTRIES) {
    if (originLower.includes(country)) {
      return { score: 50, description: 'Europa - moderat transport' };
    }
  }

  // Check for far-away origins
  const farOrigins = ['peru', 'chile', 'brazil', 'argentina', 'south africa', 'australia', 'new zealand', 'china', 'india', 'thailand', 'vietnam'];
  for (const far of farOrigins) {
    if (originLower.includes(far)) {
      return { score: 20, description: 'Lang transport (10,000+ km)' };
    }
  }

  return { score: 40, description: 'Ukjent opprinnelse' };
}

function getCertificationScore(labels: string[]): { score: number; found: string[] } {
  const found: string[] = [];
  let bonus = 0;

  for (const label of labels) {
    const labelLower = label.toLowerCase();
    for (const cert of NORWEGIAN_CERTIFICATIONS) {
      if (labelLower.includes(cert)) {
        found.push(label);
        bonus += 10;
      }
    }
  }

  return {
    score: Math.min(100, 50 + bonus), // Base 50, +10 per certification, max 100
    found,
  };
}

function getPackagingScore(packaging: string): { score: number; description: string } {
  const packLower = packaging.toLowerCase();

  // Good packaging
  if (packLower.includes('glass') || packLower.includes('paper') || packLower.includes('cardboard') || packLower.includes('kartong')) {
    return { score: 90, description: 'Resirkulerbar emballasje (glass/papir)' };
  }

  // Recyclable plastic
  if (packLower.includes('recyclable') || packLower.includes('resirkulerbar') || packLower.includes('pet')) {
    return { score: 70, description: 'Resirkulerbar plast' };
  }

  // Generic plastic
  if (packLower.includes('plastic') || packLower.includes('plast')) {
    return { score: 40, description: 'Plastemballasje' };
  }

  // Mixed or unknown
  return { score: 50, description: 'Ukjent emballasje' };
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

export function calculateGrønnScore(product: ProductData): GrønnScoreResult {
  // 1. Base ecoscore (40% weight)
  const ecoscoreValue = getEcoscoreValue(product.ecoscore.grade);

  // 2. Transport score (25% weight)
  const transport = getTransportScore(product.origin, product.isNorwegian);

  // 3. Norwegian bonus (15% weight)
  const norwegianScore = product.isNorwegian ? 100 : 30;
  const norwegianDesc = product.isNorwegian ? 'Norskprodusert!' : 'Importert produkt';

  // 4. Packaging score (10% weight)
  const packaging = getPackagingScore(product.packaging);

  // 5. Certifications (10% weight)
  const certs = getCertificationScore(product.labels);

  // Calculate weighted total
  const total = Math.round(
    ecoscoreValue * 0.40 +
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

  return {
    total,
    grade,
    breakdown: {
      ecoscore: {
        score: ecoscoreValue,
        label: 'Miljøpåvirkning',
        description: `Eco-Score: ${product.ecoscore.grade.toUpperCase()}`,
      },
      transport: {
        score: transport.score,
        label: 'Transport',
        description: transport.description,
      },
      norwegian: {
        score: norwegianScore,
        label: 'Norsk',
        description: norwegianDesc,
      },
      packaging: {
        score: packaging.score,
        label: 'Emballasje',
        description: packaging.description,
      },
      certifications: {
        score: certs.score,
        label: 'Sertifiseringer',
        description: certs.found.length > 0 ? certs.found.join(', ') : 'Ingen kjente sertifiseringer',
      },
    },
    healthScore,
  };
}

// Get color class based on score
export function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-lime-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}

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
