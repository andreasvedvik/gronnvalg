'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus trap hook for modal accessibility
 * Traps focus within a container element when active
 * @param isActive - Whether the focus trap is active
 * @param onEscape - Optional callback when Escape key is pressed
 */
export function useFocusTrap(isActive: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }, []);

  // Handle keydown for focus trapping and Escape
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle Escape key
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements, onEscape]);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element to restore later
    previousActiveElement.current = document.activeElement;

    // Focus the first focusable element or the container itself
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure the modal is fully rendered
      requestAnimationFrame(() => {
        focusableElements[0].focus();
      });
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previousActiveElement.current && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, getFocusableElements, handleKeyDown]);

  return containerRef;
}

export default useFocusTrap;
