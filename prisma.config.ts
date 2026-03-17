import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Đây là nơi Prisma 7 tìm URL để chạy Migrate/Generate
    url: process.env.DATABASE_URL,
  },
});
