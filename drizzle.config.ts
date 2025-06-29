import { defineConfig } from "drizzle-kit";
import { DB_PATH } from "./src/db/path";

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
});
