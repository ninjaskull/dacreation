import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let connectionString = process.env.postgresql || process.env.DATABASE_URL;

if (connectionString && connectionString.startsWith('//')) {
  connectionString = 'postgresql:' + connectionString;
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

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
