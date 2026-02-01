'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, Loader2, ImageIcon, RotateCcw, Search } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { extractTextFromImage, extractProductKeywords, buildSearchQuery, initOCR } from '@/lib/imageRecognition';
import { searchProducts, ProductData } from '@/lib/openfoodfacts';

interface ImageScannerProps {
  onSelectProduct: (barcode: string) => void;
  onClose: () => void;
}

type ScanState = 'camera' | 'captured' | 'processing' | 'results';

export default function ImageScanner({ onSelectProduct, onClose }: ImageScannerProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState<string>('');
  const [showManualSearch, setShowManualSearch] = useState(false);

  const texts = {
    nb: {
      title: 'Ta bilde av produktet',
      instructions: 'Hold kameraet mot produktets forside',
      tip: 'Tips: Krever tydelig bilde med lesbar tekst. Fungerer best på produkter med synlig produktnavn.',
      capture: 'Ta bilde',
      retake: 'Ta nytt bilde',
      processing: 'Analyserer bilde...',
      extractingText: 'Leser tekst...',
      searching: 'Søker etter produkter...',
      foundProducts: 'Fant {count} produkter',
      noResults: 'Ingen produkter funnet.',
      selectProduct: 'Velg riktig produkt:',
      extractedKeywords: 'Gjenkjent tekst:',
      cameraError: 'Kunne ikke starte kameraet',
      tryBarcode: 'Prøv å skanne strekkoden i stedet',
      manualSearch: 'Søk manuelt',
      searchPlaceholder: 'Skriv produktnavn...',
      search: 'Søk',
      noTextFound: 'Kunne ikke lese tekst fra bildet. Prøv igjen med bedre lys og fokus.',
      tryManual: 'Eller søk manuelt:',
    },
    en: {
      title: 'Take a photo of the product',
      instructions: 'Point the camera at the front of the product',
      tip: 'Tip: Requires a clear image with readable text. Works best on products with visible product names.',
      capture: 'Take photo',
      retake: 'Retake photo',
      processing: 'Analyzing image...',
      extractingText: 'Reading text...',
      searching: 'Searching for products...',
      foundProducts: 'Found {count} products',
      noResults: 'No products found.',
      selectProduct: 'Select the correct product:',
      extractedKeywords: 'Recognized text:',
      cameraError: 'Could not start camera',
      tryBarcode: 'Try scanning the barcode instead',
      manualSearch: 'Search manually',
      searchPlaceholder: 'Type product name...',
      search: 'Search',
      noTextFound: 'Could not read text from image. Try again with better lighting and focus.',
      tryManual: 'Or search manually:',
    },
  };

  const t = texts[language] || texts.nb;

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Pre-initialize OCR for faster processing
        initOCR().catch(() => {});
      } catch {
        setError(t.cameraError);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [t.cameraError]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    setScanState('captured');
  }, []);

  // Process captured image
  const processImage = useCallback(async () => {
    if (!capturedImage) return;

    setScanState('processing');
    setError(null);
    setShowManualSearch(false);

    try {
      // Extract text from image
      const text = await extractTextFromImage(capturedImage);
      setExtractedText(text);

      // Get keywords from text
      const keywords = extractProductKeywords(text);

      if (keywords.length === 0) {
        setError(t.noTextFound);
        setShowManualSearch(true);
        setScanState('captured');
        return;
      }

      // Try different search strategies
      let results: ProductData[] = [];

      // Strategy 1: Full query with first 5 keywords
      const query = buildSearchQuery(keywords);
      results = await searchProducts(query, 10);

      // Strategy 2: If no results, try with just first 3 keywords
      if (results.length === 0 && keywords.length > 3) {
        results = await searchProducts(keywords.slice(0, 3).join(' '), 10);
      }

      // Strategy 3: If still no results, try individual keywords
      if (results.length === 0) {
        for (const keyword of keywords.slice(0, 3)) {
          if (keyword.length > 3) {
            results = await searchProducts(keyword, 5);
            if (results.length > 0) break;
          }
        }
      }

      if (results.length === 0) {
        setManualQuery(keywords.slice(0, 3).join(' '));
        setShowManualSearch(true);
        setError(t.noResults);
        setScanState('captured');
        return;
      }

      setSearchResults(results);
      setScanState('results');
    } catch (err) {
      setShowManualSearch(true);
      setError(t.noResults);
      setScanState('captured');
    }
  }, [capturedImage, t.noResults, t.noTextFound]);

  // Manual search
  const handleManualSearch = useCallback(async () => {
    if (!manualQuery.trim()) return;

    setScanState('processing');
    setError(null);

    try {
      const results = await searchProducts(manualQuery.trim(), 10);

      if (results.length === 0) {
        setError(t.noResults);
        setScanState('captured');
        return;
      }

      setSearchResults(results);
      setScanState('results');
    } catch {
      setError(t.noResults);
      setScanState('captured');
    }
  }, [manualQuery, t.noResults]);

  // Reset to camera
  const resetToCamera = useCallback(() => {
    setCapturedImage(null);
    setExtractedText('');
    setSearchResults([]);
    setError(null);
    setScanState('camera');
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <button
          onClick={onClose}
          className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {scanState === 'processing' ? t.processing : t.title}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        {/* Camera view */}
        {scanState === 'camera' && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 border-4 border-white/50 rounded-2xl" />
            </div>
            <div className="absolute bottom-28 left-0 right-0 text-center px-4">
              <p className="text-white text-lg font-medium">{t.instructions}</p>
              <p className="text-gray-300 text-xs mt-2 max-w-xs mx-auto">{t.tip}</p>
            </div>
          </>
        )}

        {/* Captured image preview */}
        {(scanState === 'captured' || scanState === 'processing') && capturedImage && (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
            {scanState === 'processing' && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                <p className="text-white">{t.extractingText}</p>
              </div>
            )}
          </div>
        )}

        {/* Search results */}
        {scanState === 'results' && (
          <div className="w-full h-full bg-gray-900 overflow-auto p-4 pt-20">
            <p className="text-green-400 text-sm mb-2">
              {t.foundProducts.replace('{count}', String(searchResults.length))}
            </p>

            {extractedText && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">{t.extractedKeywords}</p>
                <p className="text-gray-300 text-sm">
                  {extractProductKeywords(extractedText).join(', ')}
                </p>
              </div>
            )}

            <p className="text-white font-medium mb-3">{t.selectProduct}</p>

            <div className="space-y-2">
              {searchResults.map((product) => (
                <button
                  key={product.barcode}
                  onClick={() => onSelectProduct(product.barcode)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium truncate">{product.name}</p>
                    <p className="text-gray-400 text-sm truncate">{product.brand}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message and manual search */}
        {error && scanState === 'captured' && (
          <div className="absolute bottom-24 left-4 right-4 space-y-3">
            <div className="p-4 bg-red-500/90 rounded-xl text-white text-center">
              {error}
            </div>

            {/* Show extracted text if available */}
            {extractedText && (
              <div className="p-3 bg-gray-800/90 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">{t.extractedKeywords}</p>
                <p className="text-white text-sm">{extractProductKeywords(extractedText).join(', ') || '(ingen tekst funnet)'}</p>
              </div>
            )}

            {/* Manual search input */}
            {showManualSearch && (
              <div className="p-3 bg-gray-800/90 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">{t.tryManual}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <button
                    onClick={handleManualSearch}
                    disabled={!manualQuery.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {t.search}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 p-4">
        {scanState === 'camera' && (
          <button
            onClick={capturePhoto}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            {t.capture}
          </button>
        )}

        {scanState === 'captured' && (
          <div className="flex gap-3">
            <button
              onClick={resetToCamera}
              className="flex-1 py-4 bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              {t.retake}
            </button>
            <button
              onClick={processImage}
              className="flex-1 py-4 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t.searching.split('...')[0]}
            </button>
          </div>
        )}

        {scanState === 'results' && (
          <button
            onClick={resetToCamera}
            className="w-full py-4 bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {t.retake}
          </button>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
