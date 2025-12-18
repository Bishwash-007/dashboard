import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useIsMobile } from "@/hooks/use-mobile";

type Listener = (event: MediaQueryListEvent) => void;

const listeners = new Set<Listener>();

const emitChange = () => {
  const event = { matches: window.innerWidth < 768 } as MediaQueryListEvent;
  listeners.forEach((listener) => listener(event));
};

beforeEach(() => {
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_event: string, listener: Listener) => {
        listeners.add(listener);
      },
      removeEventListener: (_event: string, listener: Listener) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => false,
    }))
  );
});

describe("useIsMobile", () => {
  it("reflects viewport breakpoint changes", async () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => expect(result.current).toBe(true));

    await act(async () => {
      window.innerWidth = 900;
      emitChange();
    });

    await waitFor(() => expect(result.current).toBe(false));
  });
});
