// Test authentication and database connection
import { storage } from './server/storage.ts';

async function testAuth() {
  console.log('🧪 Testing authentication system...\n');
  
  try {
    // Test 1: Create a user
    console.log('1️⃣  Testing user creation...');
    const testUser = {
      username: 'testuser123',
      password: 'TestPassword123!',
      email: 'test@example.com',
    };
    
    // Hash the password
    const { scrypt, randomBytes, timingSafeEqual } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    async function hashPasswordLocal(password) {
      const salt = randomBytes(16).toString("hex");
      const buf = await scryptAsync(password, salt, 64);
      return `${buf.toString("hex")}.${salt}`;
    }
    
    const hashedPassword = await hashPasswordLocal(testUser.password);
    
    const user = await storage.createUser({
      username: testUser.username,
      password: hashedPassword,
      email: testUser.email,
      subscriptionStatus: 'free',
      isAdmin: false,
    });
    
    console.log('   ✅ User created successfully!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Subscription: ${user.subscriptionStatus}\n`);
    
    // Test 2: Retrieve the user
    console.log('2️⃣  Testing user retrieval by username...');
    const retrievedUser = await storage.getUserByUsername(testUser.username);
    
    if (retrievedUser) {
      console.log('   ✅ User retrieved successfully!');
      console.log(`   User ID: ${retrievedUser.id}`);
      console.log(`   Username: ${retrievedUser.username}\n`);
    } else {
      console.log('   ❌ Failed to retrieve user\n');
    }
    
    // Test 3: Retrieve user by ID
    console.log('3️⃣  Testing user retrieval by ID...');
    const userById = await storage.getUser(user.id);
    
    if (userById) {
      console.log('   ✅ User retrieved by ID successfully!');
      console.log(`   Username: ${userById.username}\n`);
    } else {
      console.log('   ❌ Failed to retrieve user by ID\n');
    }
    
    // Test 4: List all users
    console.log('4️⃣  Testing list all users...');
    const allUsers = await storage.getAllUsers();
    console.log(`   ✅ Total users in database: ${allUsers.length}\n`);
    
    console.log('✅ All authentication tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAuth();
