import type { Config } from "drizzle-kit";
export default {
    schema: "./db/schema",
    dbCredentials: {connectionString: process.env.DATABASE_URL as string},
    driver: "pg",
} satisfies Config;
