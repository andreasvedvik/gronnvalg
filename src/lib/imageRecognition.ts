/**
 * Image Recognition Service
 * Uses Tesseract.js for OCR to extract text from product images
 */

import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Initialize the Tesseract worker (call once on app load for faster subsequent scans)
 */
export async function initOCR(): Promise<void> {
  if (worker) return;

  worker = await createWorker('nor+eng', 1, {
    // Use CDN for faster loading
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
  });
}

/**
 * Extract text from an image using OCR
 */
export async function extractTextFromImage(imageData: string | HTMLCanvasElement | Blob): Promise<string> {
  // Ensure worker is initialized
  if (!worker) {
    await initOCR();
  }

  if (!worker) {
    throw new Error('Failed to initialize OCR worker');
  }

  const result = await worker.recognize(imageData);
  return result.data.text;
}

/**
 * Clean and extract product-relevant keywords from OCR text
 */
export function extractProductKeywords(ocrText: string): string[] {
  // Clean up the text
  const cleaned = ocrText
    .toLowerCase()
    .replace(/[^\wæøåa-z\s]/gi, ' ') // Remove special chars, keep Norwegian letters
    .replace(/\s+/g, ' ')
    .trim();

  // Split into words
  const words = cleaned.split(' ').filter(word => word.length > 2);

  // Common words to ignore (Norwegian and English)
  const stopWords = new Set([
    'og', 'med', 'for', 'fra', 'til', 'den', 'det', 'som', 'kan', 'har', 'var',
    'and', 'with', 'for', 'from', 'the', 'that', 'can', 'has', 'was',
    'innhold', 'ingredients', 'næringsinnhold', 'nutrition', 'oppbevares',
    'store', 'best', 'før', 'see', 'net', 'netto', 'vekt', 'weight',
    'produced', 'produsert', 'norway', 'norge', 'made', 'laget',
  ]);

  // Filter out stop words and very short words
  const keywords = words.filter(word =>
    !stopWords.has(word) &&
    word.length > 2 &&
    !/^\d+$/.test(word) // Remove pure numbers
  );

  // Return unique keywords, max 10
  return Array.from(new Set(keywords)).slice(0, 10);
}

/**
 * Build a search query from extracted keywords
 */
export function buildSearchQuery(keywords: string[]): string {
  // Take the first 5 most relevant keywords
  return keywords.slice(0, 5).join(' ');
}

/**
 * Cleanup the worker when done
 */
export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
