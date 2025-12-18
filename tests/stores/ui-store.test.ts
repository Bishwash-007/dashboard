import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";

import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types/api";

const product: Product = {
  _id: "p1",
  name: "Phone",
  variants: [{ price: 1, stock: 1 }],
};

beforeEach(() => {
  useUiStore.setState({
    isSidebarOpen: true,
    productDrawer: {
      isOpen: false,
      mode: "create",
      product: null,
    },
  });
});

describe("useUiStore", () => {
  it("toggles sidebar visibility", () => {
    expect(useUiStore.getState().isSidebarOpen).toBe(true);

    act(() => useUiStore.getState().setSidebarOpen(false));
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it("opens drawer for existing product", () => {
    act(() => useUiStore.getState().openProductDrawer({ product }));
    const state = useUiStore.getState().productDrawer;

    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe("update");
    expect(state.product).toEqual(product);
  });

  it("closes drawer and resets state", () => {
    act(() => useUiStore.getState().openProductDrawer({ product }));
    act(() => useUiStore.getState().closeProductDrawer());

    expect(useUiStore.getState().productDrawer).toEqual({
      isOpen: false,
      mode: "create",
      product: null,
    });
  });
});
