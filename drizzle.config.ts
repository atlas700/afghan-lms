import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
