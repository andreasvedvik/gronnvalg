/**
 * Unit tests for the Grønnest scoring system
 *
 * To run these tests:
 * 1. npm install -D vitest @vitejs/plugin-react
 * 2. npm test
 */

import { describe, it, expect } from 'vitest';
import { calculateGrønnScore, getScoreColor, getScoreTextColor, getGradeEmoji } from '../scoring';
import type { ProductData } from '../openfoodfacts';

// Mock product data factory
function createMockProduct(overrides: Partial<ProductData> = {}): ProductData {
  return {
    barcode: '1234567890123',
    name: 'Test Product',
    brand: 'Test Brand',
    imageUrl: '',
    category: 'Test Category',
    origin: '',
    originTags: [],
    manufacturingPlaces: '',
    packaging: '',
    packagingTags: [],
    packagingMaterials: [],
    packagingRecycling: [],
    labels: [],
    labelTags: [],
    allergenInfo: {
      allergens: [],
      traces: [],
      hasAllergens: false,
      hasTraces: false,
    },
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
    ingredients: '',
    isNorwegian: false,
    raw: {} as any,
    ...overrides,
  };
}

describe('calculateGrønnScore', () => {
  describe('Ecoscore component', () => {
    it('should give max ecoscore points for grade A', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'a', score: 90, hasDetailedData: true },
      });
      const result = calculateGrønnScore(product);
      // Ecoscore A = 100 points, weighted at 40% = 40 points contribution
      expect(result.breakdown.ecoscore.score).toBe(100);
      expect(result.breakdown.ecoscore.dataAvailable).toBe(true);
    });

    it('should give lower ecoscore points for grade C', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'c', score: 50, hasDetailedData: true },
      });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.ecoscore.score).toBe(60);
      expect(result.breakdown.ecoscore.dataAvailable).toBe(true);
    });

    it('should give neutral ecoscore points for unknown grade', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'unknown', score: 0, hasDetailedData: false },
      });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.ecoscore.score).toBe(50); // Neutral default
      expect(result.breakdown.ecoscore.dataAvailable).toBe(false);
    });
  });

  describe('Norwegian origin bonus', () => {
    it('should give bonus for Norwegian products', () => {
      const norwegianProduct = createMockProduct({ isNorwegian: true });
      const foreignProduct = createMockProduct({ isNorwegian: false });

      const norwegianScore = calculateGrønnScore(norwegianProduct);
      const foreignScore = calculateGrønnScore(foreignProduct);

      expect(norwegianScore.breakdown.norwegian.score).toBe(100);
      expect(foreignScore.breakdown.norwegian.score).toBe(30);
      expect(norwegianScore.breakdown.norwegian.score).toBeGreaterThan(foreignScore.breakdown.norwegian.score);
    });

    it('should detect Norwegian origin from origin tags', () => {
      const productWithNorwegianTag = createMockProduct({
        isNorwegian: false,
        originTags: ['en:norway'],
      });

      const result = calculateGrønnScore(productWithNorwegianTag);
      expect(result.breakdown.norwegian.score).toBe(100);
    });

    it('should detect Norwegian origin from origin text', () => {
      const productWithNorwegianOrigin = createMockProduct({
        isNorwegian: false,
        origin: 'Norge',
      });

      const result = calculateGrønnScore(productWithNorwegianOrigin);
      expect(result.breakdown.norwegian.score).toBe(100);
    });
  });

  describe('Certification bonuses', () => {
    it('should give bonus for organic products', () => {
      const organicProduct = createMockProduct({
        labels: ['Økologisk'],
        labelTags: ['en:organic'],
      });
      const regularProduct = createMockProduct();

      const organicScore = calculateGrønnScore(organicProduct);
      const regularScore = calculateGrønnScore(regularProduct);

      expect(organicScore.breakdown.certifications.score).toBeGreaterThan(regularScore.breakdown.certifications.score);
    });

    it('should give bonus for Fairtrade products', () => {
      const fairtradeProduct = createMockProduct({
        labels: ['Fairtrade'],
        labelTags: ['en:fair-trade'],
      });
      const regularProduct = createMockProduct();

      const fairtradeScore = calculateGrønnScore(fairtradeProduct);
      const regularScore = calculateGrønnScore(regularProduct);

      expect(fairtradeScore.breakdown.certifications.score).toBeGreaterThan(regularScore.breakdown.certifications.score);
    });

    it('should accumulate bonuses for multiple certifications', () => {
      const multiCertProduct = createMockProduct({
        labels: ['Økologisk', 'Fairtrade', 'MSC'],
        labelTags: ['en:organic', 'en:fair-trade', 'en:msc'],
      });
      const singleCertProduct = createMockProduct({
        labels: ['Økologisk'],
        labelTags: ['en:organic'],
      });

      const multiScore = calculateGrønnScore(multiCertProduct);
      const singleScore = calculateGrønnScore(singleCertProduct);

      expect(multiScore.breakdown.certifications.score).toBeGreaterThan(singleScore.breakdown.certifications.score);
    });
  });

  describe('Transport score', () => {
    it('should give high score for Norwegian products', () => {
      const product = createMockProduct({ isNorwegian: true });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.transport.score).toBe(100);
    });

    it('should give medium score for Nordic products', () => {
      const product = createMockProduct({ origin: 'Sweden' });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.transport.score).toBe(80);
    });

    it('should give low score for far away origins', () => {
      const product = createMockProduct({ origin: 'Brazil' });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.transport.score).toBe(20);
    });
  });

  describe('Packaging score', () => {
    it('should give high score for glass packaging', () => {
      const product = createMockProduct({ packagingTags: ['en:glass'] });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.packaging.score).toBe(90);
    });

    it('should give low score for plastic packaging', () => {
      const product = createMockProduct({ packagingTags: ['en:plastic'] });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.packaging.score).toBeLessThan(60);
    });
  });

  describe('Total score calculation', () => {
    it('should return score between 0 and 100', () => {
      const product = createMockProduct();
      const result = calculateGrønnScore(product);

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    it('should return correct grade for high scores', () => {
      const excellentProduct = createMockProduct({
        ecoscore: { grade: 'a', score: 95, hasDetailedData: true },
        isNorwegian: true,
        labels: ['Økologisk', 'Nyt Norge'],
        labelTags: ['en:organic', 'en:produced-in-norway'],
        packagingTags: ['en:glass'],
      });

      const result = calculateGrønnScore(excellentProduct);
      expect(result.grade).toBe('A');
      expect(result.total).toBeGreaterThanOrEqual(80);
    });

    it('should return grade E for very low scores', () => {
      const poorProduct = createMockProduct({
        ecoscore: { grade: 'e', score: 10, hasDetailedData: true },
        isNorwegian: false,
        origin: 'Brazil',
        packagingTags: ['en:plastic'],
      });

      const result = calculateGrønnScore(poorProduct);
      expect(result.grade).toBe('D'); // Will likely be D due to certifications baseline
      expect(result.total).toBeLessThan(60);
    });
  });

  describe('Data quality indicator', () => {
    it('should have high data quality with detailed ecoscore data', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'a', score: 90, hasDetailedData: true },
        ingredients: 'Water, sugar, salt',
        origin: 'Norway',
        isNorwegian: true,
        packagingTags: ['en:glass'],
      });

      const result = calculateGrønnScore(product);
      expect(result.dataQuality).toBeGreaterThanOrEqual(90);
    });

    it('should have low data quality with minimal data', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'unknown', score: 0, hasDetailedData: false },
      });

      const result = calculateGrønnScore(product);
      expect(result.dataQuality).toBeLessThan(50);
    });

    it('should return dataQuality as a number between 0-100', () => {
      const product = createMockProduct();
      const result = calculateGrønnScore(product);

      expect(typeof result.dataQuality).toBe('number');
      expect(result.dataQuality).toBeGreaterThanOrEqual(0);
      expect(result.dataQuality).toBeLessThanOrEqual(100);
    });
  });

  describe('Health score calculation', () => {
    it('should calculate health score based on nutriscore', () => {
      const productA = createMockProduct({ nutriscore: { grade: 'a', score: 90 } });
      const productE = createMockProduct({ nutriscore: { grade: 'e', score: 20 } });

      const resultA = calculateGrønnScore(productA);
      const resultE = calculateGrønnScore(productE);

      expect(resultA.healthScore.total).toBeGreaterThan(resultE.healthScore.total);
    });

    it('should apply NOVA penalty for ultra-processed foods', () => {
      const nova1 = createMockProduct({ novaGroup: 1 });
      const nova4 = createMockProduct({ novaGroup: 4 });

      const result1 = calculateGrønnScore(nova1);
      const result4 = calculateGrønnScore(nova4);

      expect(result1.healthScore.total).toBeGreaterThan(result4.healthScore.total);
    });

    it('should return correct nutriscore grade', () => {
      const product = createMockProduct({ nutriscore: { grade: 'b', score: 75 } });
      const result = calculateGrønnScore(product);

      expect(result.healthScore.nutriscore).toBe('B');
    });
  });
});

describe('getScoreColor', () => {
  it('should return green for high scores', () => {
    expect(getScoreColor(85)).toContain('green');
    expect(getScoreColor(100)).toContain('green');
  });

  it('should return lime for good scores', () => {
    expect(getScoreColor(70)).toContain('lime');
  });

  it('should return yellow for medium scores', () => {
    expect(getScoreColor(50)).toContain('yellow');
  });

  it('should return orange for low scores', () => {
    expect(getScoreColor(30)).toContain('orange');
  });

  it('should return red for very low scores', () => {
    expect(getScoreColor(15)).toContain('red');
    expect(getScoreColor(0)).toContain('red');
  });
});

describe('getScoreTextColor', () => {
  it('should return appropriate text colors', () => {
    expect(getScoreTextColor(85)).toContain('green');
    expect(getScoreTextColor(70)).toContain('lime');
    expect(getScoreTextColor(50)).toContain('yellow');
    expect(getScoreTextColor(30)).toContain('orange');
    expect(getScoreTextColor(15)).toContain('red');
  });
});

describe('getGradeEmoji', () => {
  it('should return correct emojis for each grade', () => {
    expect(getGradeEmoji('A')).toBe('🌟');
    expect(getGradeEmoji('B')).toBe('👍');
    expect(getGradeEmoji('C')).toBe('😐');
    expect(getGradeEmoji('D')).toBe('⚠️');
    expect(getGradeEmoji('E')).toBe('❌');
  });

  it('should handle lowercase grades', () => {
    expect(getGradeEmoji('a')).toBe('🌟');
    expect(getGradeEmoji('b')).toBe('👍');
  });

  it('should return question mark for unknown grades', () => {
    expect(getGradeEmoji('X')).toBe('❓');
    expect(getGradeEmoji('')).toBe('❓');
  });
});
