'use client';

import { create } from 'zustand';

type ModalType =
  | 'scanner'
  | 'scoreInfo'
  | 'shoppingList'
  | 'comparison'
  | 'contact'
  | 'chat'
  | null;

interface UIState {
  // Modal state
  activeModal: ModalType;
  showFilters: boolean;
  isScrolled: boolean;

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleFilters: () => void;
  setIsScrolled: (scrolled: boolean) => void;

  // Convenience methods
  isModalOpen: (modal: ModalType) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeModal: null,
  showFilters: false,
  isScrolled: false,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  setIsScrolled: (scrolled) => set({ isScrolled: scrolled }),

  isModalOpen: (modal) => get().activeModal === modal,
}));
