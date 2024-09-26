import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.AUTH_DRIZZLE_URL) {
    console.log('🔴 Cannot find database url');
  }

export default defineConfig({
  dialect: "postgresql", 
  dbCredentials: {
    url: process.env.AUTH_DRIZZLE_URL || '',
  },
  schema: "./db/schema.ts",
  out: "./db/drizzle",
});