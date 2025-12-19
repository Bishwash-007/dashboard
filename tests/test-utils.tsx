import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { renderHook, type RenderHookOptions } from "@testing-library/react";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function createQueryClientWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

export function renderHookWithClient<Result, Props>(
  callback: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props>
) {
  const client = createTestQueryClient();
  const wrapper = createQueryClientWrapper(client);
  const result = renderHook(callback, { wrapper, ...options });

  return {
    client,
    ...result,
  };
}
