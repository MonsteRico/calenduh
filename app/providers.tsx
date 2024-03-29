"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </NextThemesProvider>
    );
}
