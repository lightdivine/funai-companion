import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// Force load the .env file explicitly so process.env isn't undefined
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});