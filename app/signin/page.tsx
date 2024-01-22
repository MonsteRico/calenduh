"use client";

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
                    <Button
                        onClick={() => {
                            signIn("discord", { callbackUrl: "/" });
                        }}
                        className="w-full"
                        variant="default"
                    >
                        <FontAwesomeIcon icon={faDiscord} className="mr-2 h-5 w-5" />
                        Sign in with Discord
                    </Button>
                    {/* <Button className="w-full" variant="outline">
            <FacebookIcon className="mr-2 h-5 w-5" />
            Sign in with Facebook
          </Button>
          <Button className="w-full" variant="outline">
            <TwitterIcon className="mr-2 h-5 w-5" />
            Sign in with Twitter
          </Button> */}
                </div>
                {/* <div className="relative">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="m@example.com" required type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" required type="password" />
          </div>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
        */}
            </div>
        </div>
    );
}
