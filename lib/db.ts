import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import * as schema from "./mainSchema";
// create the connection
const connection = connect({
    url: process.env.DATABASE_URL as string,
});

export const db = drizzle(connection, { schema });
export type DbClient = typeof db;