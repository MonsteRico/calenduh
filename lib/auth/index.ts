import type { NextAuthOptions, Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "~/db/db";
import { dbUser } from "~/db/schema/auth";
import { DrizzleAdapter } from "~/lib/auth/drizzleAdapter";

declare module "next-auth" {}

export const authOptions: NextAuthOptions = {
    // @ts-expect-error
    adapter: DrizzleAdapter(db),
    session: {
        strategy: "database",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        // @ts-expect-error
        async session({ session, user }: { session: Session; user: dbUser }) {
            session.user = user;
            return session;
        },
    },
    pages: {
        signIn: "/signin",
    },
};
