import type { Config } from "drizzle-kit";
export default {
    schema: "./db/schema",
    dbCredentials: {
        uri: process.env.DATABASE_URL as string,
    },
    driver: "mysql2",
} satisfies Config;
