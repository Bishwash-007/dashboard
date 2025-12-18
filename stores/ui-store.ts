"use client";

import { create } from "zustand";

import type { Product } from "@/types/api";

type ProductDrawerState = {
  isOpen: boolean;
  mode: "create" | "update";
  product: Product | null;
};

type UiState = {
  isSidebarOpen: boolean;
  productDrawer: ProductDrawerState;
  setSidebarOpen: (open: boolean) => void;
  openProductDrawer: (payload?: { product?: Product | null }) => void;
  closeProductDrawer: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  productDrawer: {
    isOpen: false,
    mode: "create",
    product: null,
  },
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  openProductDrawer: ({ product } = {}) =>
    set({
      productDrawer: {
        isOpen: true,
        mode: product ? "update" : "create",
        product: product ?? null,
      },
    }),
  closeProductDrawer: () =>
    set({
      productDrawer: {
        isOpen: false,
        mode: "create",
        product: null,
      },
    }),
}));
