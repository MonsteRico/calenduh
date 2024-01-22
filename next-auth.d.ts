import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { dbUser } from "./db/schema/auth";

type UserId = string;

declare module "next-auth/jwt" {
    interface JWT {
        id: UserId;
    }
}

declare module "next-auth" {
    interface Session {
        user: dbUser;
    }
}
