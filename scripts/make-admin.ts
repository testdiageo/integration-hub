import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function makeAdmin(email: string) {
  try {
    console.log(`Looking for user with email: ${email}...`);
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    
    if (user.isAdmin) {
      console.log(`✓ User is already an admin`);
      process.exit(0);
    }
    
    await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id));
    
    console.log(`✅ Successfully granted admin access to ${user.firstName} ${user.lastName}`);
    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run make-admin <email>');
  process.exit(1);
}

makeAdmin(email);
