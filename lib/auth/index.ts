import DiscordProvider from "next-auth/providers/discord";
import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "~/lib/auth/drizzleAdapter";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    // @ts-expect-error
    adapter: DrizzleAdapter(db),
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ token, session, user }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }
                
            return session;
        },
        async jwt({ token, user }) {
            const [dbUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, token.email || ""))
                .limit(1);

            if (!dbUser) {
                if (user) {
                    token.id = user?.id;
                }
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
        },
    },
};
