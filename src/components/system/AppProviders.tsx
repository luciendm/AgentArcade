import type { PropsWithChildren } from "react";

/**
 * Global application providers (intentionally minimal).
 * This template avoids choosing a global state / data library for you.
 * Add providers here only when your app truly needs them (e.g. QueryClientProvider, AuthProvider, ThemeProvider, i18n, etc.).
 *
 * Example (pseudo‑code when you add something):
 *   const queryClient = new QueryClient();
 *   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
 */
export function AppProviders({ children }: PropsWithChildren) {
  return children;
}

export default AppProviders;
