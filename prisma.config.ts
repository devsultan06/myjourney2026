// Prisma 7 configuration
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    // Use DIRECT_URL for migrations/db push (no connection pooling)
    url: process.env.DIRECT_URL!,
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");
      // Use DIRECT_URL for migrations
      const pool = new Pool({ connectionString: process.env.DIRECT_URL });
      return new PrismaPg(pool);
    },
  },
});
