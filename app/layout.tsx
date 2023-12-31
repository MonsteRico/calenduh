import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Toaster } from "~/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { redirect } from 'next/navigation'
import getServerAuthSession from "~/lib/getServerAuthSession";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Calenduh",
    description: "A better calendar app. Duh.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
        // redirect to /api/auth/signin
        redirect("/api/auth/signin");
    }
    return (
        <html suppressHydrationWarning lang="en">
            <body className={inter.className}>
                <Toaster richColors />
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        {children}
                    </ThemeProvider>
            </body>
        </html>
    );
}
