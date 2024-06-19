"use client";

import { SignInButton } from "@clerk/nextjs";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 shadow-md bg-accent rounded-lg">
                <h2 className="text-3xl font-bold text-center text-card-foreground">Sign In to Calenduh</h2>
                <p className="text-sm text-center text-card-foreground">
                    The cleanest calendar app you&apos;ve ever used. No bloat. Duh.
                </p>
                <div className="space-y-4">
                    <SignInButton />
                </div>
            </div>
        </div>
    );
}
