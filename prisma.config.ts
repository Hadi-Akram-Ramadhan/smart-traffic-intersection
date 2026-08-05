import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI/migration uses direct connection (session mode pooler)
    // Runtime queries go through the pg adapter using DATABASE_URL (transaction mode)
    url: env("DIRECT_URL"),
  },
});
