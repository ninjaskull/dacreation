import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function initDatabase() {
  try {
    console.log("Creating tables...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        guest_count INTEGER NOT NULL,
        location TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        contact_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("Tables created successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
