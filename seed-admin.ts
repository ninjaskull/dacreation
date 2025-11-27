import { storage } from "./server/storage";
import { crypto } from "./server/auth";

async function seedAdmin() {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await crypto.hash("admin123");
    const user = await storage.createUser({
      username: "admin",
      password: hashedPassword,
    });

    console.log("Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("User ID:", user.id);
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
  process.exit(0);
}

seedAdmin();
