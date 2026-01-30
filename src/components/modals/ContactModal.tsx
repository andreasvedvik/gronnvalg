'use client';

import { X, Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kontakt oss</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Har du spørsmål, tilbakemeldinger eller forslag? Vi vil gjerne høre fra deg!
          </p>

          <div className="space-y-4">
            <a
              href="mailto:hei@gronnvalg.no"
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">E-post</p>
                <p className="text-sm text-gray-500">hei@gronnvalg.no</p>
              </div>
            </a>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Om GrønnValg:</strong> Vi er et norsk team som ønsker å gjøre det enkelt å ta bærekraftige valg i hverdagen. Appen er gratis og samler ikke inn personlige data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
