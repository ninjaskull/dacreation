import { db, pool } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  try {
    const username = "admin";
    const password = "admin123";
    
    const hashedPassword = await hashPassword(password);
    
    await db.insert(users).values({
      username,
      password: hashedPassword,
    });
    
    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
