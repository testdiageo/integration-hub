#!/usr/bin/env node
/**
 * Generate hashed password for admin user
 * This script uses the same hashing method as the application (scrypt)
 */

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Default admin password - change this!
const adminPassword = process.argv[2] || "Admin@123456";

console.log("Generating admin password hash...\n");
console.log("Password:", adminPassword);
console.log("\nGenerating hash...\n");

hashPassword(adminPassword).then(hash => {
  console.log("✓ Password hashed successfully!");
  console.log("\nHashed password:");
  console.log(hash);
  console.log("\n\nSQL INSERT Statement:");
  console.log("----------------------");
  console.log(`
INSERT INTO users (
  username, 
  password, 
  email, 
  first_name, 
  last_name, 
  subscription_status, 
  subscription_tier,
  is_admin, 
  created_at, 
  updated_at
) VALUES (
  'admin',
  '${hash}',
  'admin@integrationhub.com',
  'Admin',
  'User',
  'monthly',
  'annual',
  true,
  NOW(),
  NOW()
);
`);
  console.log("\n✓ Copy the SQL statement above and run it in your PostgreSQL database!");
  console.log("\n📝 Login Credentials:");
  console.log("   Username: admin");
  console.log(`   Password: ${adminPassword}`);
  console.log("\n⚠️  Make sure to change the password after first login!");
}).catch(err => {
  console.error("Error generating hash:", err);
  process.exit(1);
});
