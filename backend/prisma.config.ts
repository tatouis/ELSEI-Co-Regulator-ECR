import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("POSTGRES_URL_NON_POOLING"),
  },
  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
});
