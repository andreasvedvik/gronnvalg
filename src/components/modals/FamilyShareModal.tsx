'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Users, Share2, QrCode, Copy, Check, Link2, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/lib/i18n';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  isSupabaseConfigured,
  createSharedList,
  getSharedListByCode,
  updateSharedList,
  subscribeToSharedList,
  SharedList,
  SharedListItem,
} from '@/lib/supabase';

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
  imageUrl?: string;
}

interface FamilyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onSyncItems?: (items: ShoppingItem[]) => void;
}

type ViewState = 'menu' | 'create' | 'join' | 'connected';

export default function FamilyShareModal({
  isOpen,
  onClose,
  items,
  onSyncItems,
}: FamilyShareModalProps) {
  const { language } = useLanguage();
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  const [viewState, setViewState] = useState<ViewState>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [connectedList, setConnectedList] = useState<SharedList | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const texts = {
    nb: {
      title: 'Familie-deling',
      description: 'Del handlelisten med familien din',
      notConfigured: 'Familie-deling er ikke aktivert ennå. Kontakt utvikleren.',
      createNew: 'Opprett delt liste',
      createDesc: 'Del handlelisten med en unik kode',
      joinExisting: 'Bli med i liste',
      joinDesc: 'Skriv inn koden du har fått',
      creating: 'Oppretter...',
      shareCodeLabel: 'Din delekode:',
      shareCodeHelp: 'Del denne koden med familien din',
      orScanQR: 'Eller skann QR-koden:',
      copyLink: 'Kopier lenke',
      copied: 'Kopiert!',
      enterCode: 'Skriv inn 6-tegns kode',
      join: 'Bli med',
      joining: 'Kobler til...',
      connected: 'Koblet til!',
      connectedTo: 'Du er koblet til',
      syncStatus: 'Endringer synkroniseres automatisk',
      disconnect: 'Koble fra',
      invalidCode: 'Ugyldig kode. Prøv igjen.',
      back: 'Tilbake',
    },
    en: {
      title: 'Family Sharing',
      description: 'Share the shopping list with your family',
      notConfigured: 'Family sharing is not enabled yet. Contact the developer.',
      createNew: 'Create shared list',
      createDesc: 'Share your list with a unique code',
      joinExisting: 'Join existing list',
      joinDesc: 'Enter the code you received',
      creating: 'Creating...',
      shareCodeLabel: 'Your share code:',
      shareCodeHelp: 'Share this code with your family',
      orScanQR: 'Or scan the QR code:',
      copyLink: 'Copy link',
      copied: 'Copied!',
      enterCode: 'Enter 6-character code',
      join: 'Join',
      joining: 'Connecting...',
      connected: 'Connected!',
      connectedTo: 'You are connected to',
      syncStatus: 'Changes sync automatically',
      disconnect: 'Disconnect',
      invalidCode: 'Invalid code. Try again.',
      back: 'Back',
    },
  };

  const t = texts[language] || texts.nb;

  // Check if Supabase is configured
  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());

    // Load saved connection from localStorage
    const savedConnection = localStorage.getItem('gronnest-family-list');
    if (savedConnection) {
      try {
        const parsed = JSON.parse(savedConnection);
        setConnectedList(parsed);
        setShareCode(parsed.share_code);
        setViewState('connected');
      } catch {
        // Invalid saved data
      }
    }
  }, []);

  // Subscribe to real-time updates when connected
  useEffect(() => {
    if (!connectedList) return;

    const unsubscribe = subscribeToSharedList(connectedList.id, (updatedList) => {
      setConnectedList(updatedList);
      // Convert to local format and sync
      const syncedItems: ShoppingItem[] = updatedList.items.map((item: SharedListItem) => ({
        id: item.id,
        name: item.name,
        checked: item.checked,
        barcode: item.barcode,
        imageUrl: item.imageUrl,
      }));
      onSyncItems?.(syncedItems);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connectedList, onSyncItems]);

  // Create a new shared list
  const handleCreateList = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sharedItems: SharedListItem[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        checked: item.checked,
        barcode: item.barcode,
        imageUrl: item.imageUrl,
        addedAt: new Date().toISOString(),
      }));

      const list = await createSharedList('Handleliste', sharedItems);

      if (list) {
        setConnectedList(list);
        setShareCode(list.share_code);
        setViewState('connected');
        localStorage.setItem('gronnest-family-list', JSON.stringify(list));
      } else {
        setError('Kunne ikke opprette liste');
      }
    } catch {
      setError('Noe gikk galt');
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  // Join an existing shared list
  const handleJoinList = useCallback(async () => {
    if (joinCode.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const list = await getSharedListByCode(joinCode);

      if (list) {
        setConnectedList(list);
        setShareCode(list.share_code);
        setViewState('connected');
        localStorage.setItem('gronnest-family-list', JSON.stringify(list));

        // Sync items from the shared list
        const syncedItems: ShoppingItem[] = list.items.map((item: SharedListItem) => ({
          id: item.id,
          name: item.name,
          checked: item.checked,
          barcode: item.barcode,
          imageUrl: item.imageUrl,
        }));
        onSyncItems?.(syncedItems);
      } else {
        setError(t.invalidCode);
      }
    } catch {
      setError(t.invalidCode);
    } finally {
      setIsLoading(false);
    }
  }, [joinCode, onSyncItems, t.invalidCode]);

  // Disconnect from shared list
  const handleDisconnect = useCallback(() => {
    setConnectedList(null);
    setShareCode('');
    setViewState('menu');
    localStorage.removeItem('gronnest-family-list');
  }, []);

  // Copy share link
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}?familyCode=${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareCode]);

  // Sync local changes to shared list
  useEffect(() => {
    if (!connectedList || items.length === 0) return;

    const syncTimeout = setTimeout(async () => {
      const sharedItems: SharedListItem[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        checked: item.checked,
        barcode: item.barcode,
        imageUrl: item.imageUrl,
        addedAt: new Date().toISOString(),
      }));

      await updateSharedList(connectedList.id, sharedItems);
    }, 500); // Debounce

    return () => clearTimeout(syncTimeout);
  }, [items, connectedList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              {t.title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Not configured warning */}
          {!isConfigured && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">{t.notConfigured}</p>
              </div>
            </div>
          )}

          {/* Menu view */}
          {viewState === 'menu' && isConfigured && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.description}</p>

              <button
                onClick={() => setViewState('create')}
                className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t.createNew}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.createDesc}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewState('join')}
                className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t.joinExisting}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.joinDesc}</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Create view */}
          {viewState === 'create' && (
            <div className="text-center">
              {isLoading ? (
                <div className="py-8">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">{t.creating}</p>
                </div>
              ) : (
                <button
                  onClick={handleCreateList}
                  className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  {t.createNew}
                </button>
              )}

              <button
                onClick={() => setViewState('menu')}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                {t.back}
              </button>
            </div>
          )}

          {/* Join view */}
          {viewState === 'join' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.enterCode}
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-green-500 focus:outline-none"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleJoinList}
                disabled={joinCode.length !== 6 || isLoading}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.joining}
                  </>
                ) : (
                  t.join
                )}
              </button>

              <button
                onClick={() => { setViewState('menu'); setError(null); setJoinCode(''); }}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700"
              >
                {t.back}
              </button>
            </div>
          )}

          {/* Connected view */}
          {viewState === 'connected' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.connected}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.syncStatus}</p>

              {/* Share code display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t.shareCodeLabel}</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
                  {shareCode}
                </p>
                <p className="text-xs text-gray-400 mt-2">{t.shareCodeHelp}</p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}?familyCode=${shareCode}`}
                  size={150}
                  level="M"
                />
              </div>

              <p className="text-xs text-gray-400 mb-4">{t.orScanQR}</p>

              {/* Copy link button */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t.copied : t.copyLink}
              </button>

              {/* Disconnect button */}
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-500 hover:text-red-600"
              >
                {t.disconnect}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
