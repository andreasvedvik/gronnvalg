'use client';

import { Leaf } from 'lucide-react';

export default function WelcomeCard() {
  return (
    <div className="mx-6 mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
          <Leaf className="w-8 h-8 text-green-500" strokeWidth={2} />
        </div>
        <h2 className="text-title text-gray-900 dark:text-white mb-2">
          Velkommen til GrønnValg!
        </h2>
        <p className="text-body text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Skann produkter for å se bærekraft-score og finne grønnere norske alternativer.
        </p>
      </div>
    </div>
  );
}
