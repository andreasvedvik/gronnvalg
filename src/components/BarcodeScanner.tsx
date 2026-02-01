'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X, Loader2, FlashlightOff, Flashlight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// Trigger haptic feedback on supported devices
const triggerHapticFeedback = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    // Short vibration pattern for scan success
    navigator.vibrate([50, 30, 50]);
  }
};

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isLoading }: BarcodeScannerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        // Check if component is still mounted before proceeding
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Dynamically import zxing for barcode scanning
        const { BrowserMultiFormatReader } = await import('@zxing/browser');

        // Check again after async import
        if (!isMounted) {
          stream?.getTracks().forEach((track) => track.stop());
          return;
        }

        const codeReader = new BrowserMultiFormatReader();
        scannerRef.current = codeReader;

        // Start continuous scanning
        if (videoRef.current) {
          codeReader.decodeFromVideoElement(videoRef.current, (result) => {
            if (result) {
              const barcode = result.getText();
              triggerHapticFeedback(); // Haptic feedback on scan success
              onScan(barcode);
            }
          });
        }
      } catch {
        if (isMounted) {
          setHasCamera(false);
          setError(`${t.couldNotStartCamera}. ${t.tryManualInput}.`);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;

      // Cleanup - stop the barcode scanner
      if (scannerRef.current) {
        try {
          scannerRef.current.reset();
        } catch {
          // Scanner may already be stopped
        }
        scannerRef.current = null;
      }

      // Cleanup - stop camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [onScan, t]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <button
          onClick={onClose}
          aria-label={t.close}
          className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {isLoading ? t.searching : t.scanBarcode}
        </div>
      </div>

      {/* Camera View */}
      {hasCamera ? (
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scan Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-72 h-44">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-green-400 rounded-br-xl" />

              {/* Scanning line */}
              <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-green-400 animate-pulse" />

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                  <Loader2 className="w-12 h-12 text-green-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-32 left-0 right-0 text-center px-4">
            <p className="text-white text-lg font-medium">
              {t.placeBarcode}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {t.scanningAuto}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-white mb-4">{error || t.cameraNotAvailable}</p>
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div className="bg-gray-900 p-4">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={t.orEnterManually}
            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-green-500 focus:outline-none"
            inputMode="numeric"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || isLoading}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.search}
          </button>
        </form>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
