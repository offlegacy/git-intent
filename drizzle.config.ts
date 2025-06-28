import { defineConfig } from "drizzle-kit";

const DB_PATH = process.env.DB_PATH || "intents.db";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
