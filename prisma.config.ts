
import "dotenv/config"; // Ensure environment variables are loaded
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // Path to your schema file
  // Optional: configure migrations path if different from default
   migrations: {
     seed: "prisma/seed.ts",
   },
  datasource: {
    url: env("DATABASE_URL"), // Use 'url' here for the CLI
    // Optional: add shadowDatabaseUrl here if you use one
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
