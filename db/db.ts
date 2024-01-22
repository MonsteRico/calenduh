import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import * as schema from "./schema/main";
import * as authSchema from "./schema/auth";
// create the connection
const connection = connect({
    url: process.env.DATABASE_URL as string,
});

export const db = drizzle(connection, { schema: { ...authSchema, ...schema } });
export type DbClient = typeof db;
