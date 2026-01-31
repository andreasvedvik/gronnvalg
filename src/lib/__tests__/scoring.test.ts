/**
 * Unit tests for the Grønnest scoring system
 *
 * To run these tests:
 * 1. Install Vitest: npm install -D vitest @vitejs/plugin-react
 * 2. Add to package.json: "test": "vitest"
 * 3. Run: npm test
 */

import { describe, it, expect } from 'vitest';
import { calculateGrønnScore, getScoreGrade, getScoreColor, getScoreTextColor } from '../scoring';
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
      expect(result.breakdown.ecoscore).toBe(40); // Max ecoscore is 40 points
    });

    it('should give lower ecoscore points for grade C', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'c', score: 50, hasDetailedData: true },
      });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.ecoscore).toBeLessThan(30);
    });

    it('should give minimum ecoscore points for unknown grade', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'unknown', score: 0, hasDetailedData: false },
      });
      const result = calculateGrønnScore(product);
      expect(result.breakdown.ecoscore).toBe(20); // Default for unknown
    });
  });

  describe('Norwegian origin bonus', () => {
    it('should give bonus for Norwegian products', () => {
      const norwegianProduct = createMockProduct({ isNorwegian: true });
      const foreignProduct = createMockProduct({ isNorwegian: false });

      const norwegianScore = calculateGrønnScore(norwegianProduct);
      const foreignScore = calculateGrønnScore(foreignProduct);

      expect(norwegianScore.breakdown.origin).toBeGreaterThan(foreignScore.breakdown.origin);
    });

    it('should give extra bonus for Nyt Norge label', () => {
      const nytNorgeProduct = createMockProduct({
        isNorwegian: true,
        labels: ['Nyt Norge'],
        labelTags: ['en:produced-in-norway'],
      });
      const norwegianProduct = createMockProduct({ isNorwegian: true });

      const nytNorgeScore = calculateGrønnScore(nytNorgeProduct);
      const norwegianScore = calculateGrønnScore(norwegianProduct);

      expect(nytNorgeScore.breakdown.origin).toBeGreaterThanOrEqual(norwegianScore.breakdown.origin);
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

      expect(organicScore.breakdown.certifications).toBeGreaterThan(regularScore.breakdown.certifications);
    });

    it('should give bonus for Fairtrade products', () => {
      const fairtadeProduct = createMockProduct({
        labels: ['Fairtrade'],
        labelTags: ['en:fairtrade'],
      });
      const regularProduct = createMockProduct();

      const fairtradeScore = calculateGrønnScore(fairtadeProduct);
      const regularScore = calculateGrønnScore(regularProduct);

      expect(fairtradeScore.breakdown.certifications).toBeGreaterThan(regularScore.breakdown.certifications);
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
      });

      const result = calculateGrønnScore(excellentProduct);
      expect(result.grade).toBe('A');
      expect(result.total).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Data quality indicator', () => {
    it('should have high confidence with detailed ecoscore data', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'a', score: 90, hasDetailedData: true },
        ingredients: 'Water, sugar, salt',
        origin: 'Norway',
      });

      const result = calculateGrønnScore(product);
      expect(result.dataQuality).toBe('high');
    });

    it('should have low confidence with minimal data', () => {
      const product = createMockProduct({
        ecoscore: { grade: 'unknown', score: 0, hasDetailedData: false },
      });

      const result = calculateGrønnScore(product);
      expect(result.dataQuality).toBe('low');
    });
  });
});

describe('getScoreGrade', () => {
  it('should return A for scores 80-100', () => {
    expect(getScoreGrade(100)).toBe('A');
    expect(getScoreGrade(80)).toBe('A');
  });

  it('should return B for scores 60-79', () => {
    expect(getScoreGrade(79)).toBe('B');
    expect(getScoreGrade(60)).toBe('B');
  });

  it('should return C for scores 40-59', () => {
    expect(getScoreGrade(59)).toBe('C');
    expect(getScoreGrade(40)).toBe('C');
  });

  it('should return D for scores 20-39', () => {
    expect(getScoreGrade(39)).toBe('D');
    expect(getScoreGrade(20)).toBe('D');
  });

  it('should return E for scores 0-19', () => {
    expect(getScoreGrade(19)).toBe('E');
    expect(getScoreGrade(0)).toBe('E');
  });
});

describe('getScoreColor', () => {
  it('should return green for high scores', () => {
    expect(getScoreColor(85)).toContain('green');
  });

  it('should return red for low scores', () => {
    expect(getScoreColor(15)).toContain('red');
  });
});

describe('getScoreTextColor', () => {
  it('should return appropriate text colors', () => {
    expect(getScoreTextColor(85)).toContain('green');
    expect(getScoreTextColor(15)).toContain('red');
  });
});
