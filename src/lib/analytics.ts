/**
 * GrønnValg Analytics
 *
 * Lightweight, privacy-friendly analytics for tracking user behavior.
 * GDPR compliant - no personal data collected, no cookies used.
 *
 * To connect to Vercel Analytics later, run:
 * npm install @vercel/analytics
 * Then uncomment the Vercel integration below.
 */

// Event types for type safety
export type AnalyticsEvent =
  | 'scan_started'
  | 'scan_completed'
  | 'scan_failed'
  | 'product_viewed'
  | 'alternative_viewed'
  | 'filter_applied'
  | 'shopping_list_add'
  | 'shopping_list_remove'
  | 'comparison_started'
  | 'chat_opened'
  | 'chat_message_sent'
  | 'share_clicked'
  | 'page_view'
  | 'dark_mode_toggled'
  | 'score_info_viewed';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
}

// Configuration
const config: AnalyticsConfig = {
  enabled: typeof window !== 'undefined' && process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  // Add your analytics endpoint here if using a custom backend
  // endpoint: 'https://your-analytics-api.com/events'
};

// Session ID (anonymous, regenerated each session)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('gronnvalg_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('gronnvalg_session', sessionId);
  }
  return sessionId;
};

// Get anonymous device info (no fingerprinting)
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return {};

  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    platform: navigator.platform,
    online: navigator.onLine,
  };
};

/**
 * Track an analytics event
 * @param event - The event name
 * @param data - Optional event data
 */
export function trackEvent(event: AnalyticsEvent, data?: EventData): void {
  if (typeof window === 'undefined') return;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    url: window.location.pathname,
    ...data,
  };

  // Debug logging in development
  if (config.debug) {
    console.log('📊 Analytics:', event, data || '');
  }

  // Store locally for analytics dashboard
  storeEventLocally(payload);

  // Send to custom endpoint if configured
  if (config.enabled && config.endpoint) {
    sendToEndpoint(payload);
  }

  // Vercel Analytics integration (uncomment after npm install @vercel/analytics)
  // try {
  //   const { track } = await import('@vercel/analytics');
  //   track(event, data);
  // } catch (e) {
  //   // Vercel Analytics not installed
  // }
}

/**
 * Track a page view
 * @param pageName - Optional page name override
 */
export function trackPageView(pageName?: string): void {
  trackEvent('page_view', {
    page: pageName || (typeof window !== 'undefined' ? window.location.pathname : ''),
  });
}

// Store events locally for basic analytics
function storeEventLocally(payload: Record<string, unknown>): void {
  try {
    const stored = localStorage.getItem('gronnvalg_analytics');
    const events = stored ? JSON.parse(stored) : [];

    // Keep last 100 events
    events.push(payload);
    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem('gronnvalg_analytics', JSON.stringify(events));
  } catch (e) {
    // localStorage not available or quota exceeded
  }
}

// Send to custom analytics endpoint
function sendToEndpoint(payload: Record<string, unknown>): void {
  if (!config.endpoint) return;

  // Use sendBeacon for reliable delivery
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      config.endpoint,
      JSON.stringify(payload)
    );
  } else {
    // Fallback to fetch
    fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Get local analytics summary (for debugging/admin)
 */
export function getAnalyticsSummary(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('gronnvalg_analytics');
    const events = stored ? JSON.parse(stored) : [];

    // Count events by type
    const summary: Record<string, number> = {};
    events.forEach((e: { event: string }) => {
      summary[e.event] = (summary[e.event] || 0) + 1;
    });

    return summary;
  } catch (e) {
    return {};
  }
}

/**
 * Clear local analytics data
 */
export function clearAnalytics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gronnvalg_analytics');
  sessionStorage.removeItem('gronnvalg_session');
}

// Convenience functions for common events
export const analytics = {
  // Scanning
  scanStarted: () => trackEvent('scan_started'),
  scanCompleted: (barcode: string, score: number) =>
    trackEvent('scan_completed', { barcode, score }),
  scanFailed: (barcode: string, reason: string) =>
    trackEvent('scan_failed', { barcode, reason }),

  // Product interactions
  productViewed: (barcode: string, name: string) =>
    trackEvent('product_viewed', { barcode, productName: name }),
  alternativeViewed: (barcode: string) =>
    trackEvent('alternative_viewed', { barcode }),

  // Filters
  filterApplied: (filterType: string, value: boolean) =>
    trackEvent('filter_applied', { filterType, enabled: value }),

  // Shopping list
  shoppingListAdd: (itemName: string) =>
    trackEvent('shopping_list_add', { itemName }),
  shoppingListRemove: () =>
    trackEvent('shopping_list_remove'),

  // Comparison
  comparisonStarted: () => trackEvent('comparison_started'),

  // Chat
  chatOpened: () => trackEvent('chat_opened'),
  chatMessageSent: () => trackEvent('chat_message_sent'),

  // UI
  darkModeToggled: (enabled: boolean) =>
    trackEvent('dark_mode_toggled', { enabled }),
  scoreInfoViewed: () => trackEvent('score_info_viewed'),

  // Page views
  pageView: trackPageView,
};

export default analytics;
