import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString || connectionString.trim() === '') {
  console.warn('NEON_DATABASE_URL is not set, falling back to DATABASE_URL');
  connectionString = process.env.DATABASE_URL;
}

if (!connectionString || connectionString.trim() === '') {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  
  if (PGHOST && PGUSER && PGDATABASE) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
    console.log('Constructed DATABASE_URL from individual PG* environment variables');
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?\n" +
      "Please check your Replit workspace's Database tab to ensure the database is properly configured."
    );
  }
}

if (process.env.NEON_DATABASE_URL) {
  console.log('Using custom NEON_DATABASE_URL');
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
