import { defineConfig } from '@prisma/config';
import type { ConfigMeta } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL as string,
    },
  },
} satisfies ConfigMeta);