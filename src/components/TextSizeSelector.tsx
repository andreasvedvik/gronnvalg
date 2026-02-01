'use client';

import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

type TextSize = 'normal' | 'large' | 'xl';

const TEXT_SIZE_KEY = 'gronnest-textsize';

export default function TextSizeSelector() {
  const { language } = useLanguage();
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    nb: {
      normal: 'Normal',
      large: 'Stor',
      xl: 'Ekstra stor',
      label: 'Tekststørrelse',
    },
    en: {
      normal: 'Normal',
      large: 'Large',
      xl: 'Extra large',
      label: 'Text size',
    },
  };

  const tx = labels[language] || labels.nb;

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null;
    if (saved && ['normal', 'large', 'xl'].includes(saved)) {
      setTextSize(saved);
      applyTextSize(saved);
    }
  }, []);

  const applyTextSize = (size: TextSize) => {
    const html = document.documentElement;
    html.classList.remove('text-size-normal', 'text-size-large', 'text-size-xl');
    html.classList.add(`text-size-${size}`);
  };

  const handleChange = (size: TextSize) => {
    setTextSize(size);
    applyTextSize(size);
    localStorage.setItem(TEXT_SIZE_KEY, size);
    setIsOpen(false);
  };

  const sizes: { value: TextSize; label: string; preview: string }[] = [
    { value: 'normal', label: tx.normal, preview: 'Aa' },
    { value: 'large', label: tx.large, preview: 'Aa' },
    { value: 'xl', label: tx.xl, preview: 'Aa' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
        aria-label={tx.label}
        title={tx.label}
      >
        <Type className="w-6 h-6 text-green-600 dark:text-green-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-14 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50 min-w-[160px]">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 font-medium">
              {tx.label}
            </p>
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleChange(size.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  textSize === size.value
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: size.value === 'normal' ? '14px' : size.value === 'large' ? '18px' : '22px',
                  }}
                >
                  {size.preview}
                </span>
                <span className="text-sm">{size.label}</span>
                {textSize === size.value && (
                  <span className="ml-auto text-green-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
