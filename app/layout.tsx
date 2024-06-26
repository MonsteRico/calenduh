import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import "./TimePicker.css";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Calenduh",
    description: "A better calendar app. Duh.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
        <html
            style={{
                overscrollBehavior: "none",
            }}
            suppressHydrationWarning
            lang="en"
        >
            <body className={inter.className + "overflow-hidden"}>
                <Toaster richColors />
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html></ClerkProvider>
    );
}
