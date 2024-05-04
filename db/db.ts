import * as schema from "./schema/main";
import { NeonQueryFunction, neon } from "@neondatabase/serverless";
import * as authSchema from "./schema/auth";
import { drizzle } from "drizzle-orm/neon-http";
// create the connection
const connection = neon(process.env.DATABASE_URL as string) as NeonQueryFunction<boolean, boolean>;

export const db = drizzle(connection, { schema: { ...authSchema, ...schema } });
export type DbClient = typeof db;
