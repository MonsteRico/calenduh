import type { Config } from "drizzle-kit";
export default {
    schema: "./lib/schema.ts",
    dbCredentials: {
        uri: process.env.DATABASE_URL as string,
    },
    driver: "mysql2",
} satisfies Config;
