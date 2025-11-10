import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure PostgreSQL session store
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60, // 1 week in seconds
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("[REGISTER] Starting registration for username:", req.body.username);
      
      // Validate required fields
      if (!req.body.username || !req.body.password) {
        console.log("[REGISTER] Missing required fields");
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check for existing user
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("[REGISTER] Username already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check for existing email if provided
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail?.(req.body.email);
        if (existingEmail) {
          console.log("[REGISTER] Email already exists:", req.body.email);
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Whitelist only safe fields - prevent privilege escalation
      const safeUserData = {
        username: req.body.username,
        password: await hashPassword(req.body.password),
        email: req.body.email || null,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
        // Force safe defaults for protected fields
        subscriptionStatus: "free",
        isAdmin: false,
      };

      console.log("[REGISTER] Creating user in database...");
      const user = await storage.createUser(safeUserData as any);
      console.log("[REGISTER] User created successfully with ID:", user.id);

      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;

      // Log the user in immediately after registration
      console.log("[REGISTER] Logging user in...");
      req.login(user, (err) => {
        if (err) {
          console.error("[REGISTER] Login after registration failed:", err);
          return res.status(500).json({ 
            message: "Account created but login failed. Please try logging in manually.",
            userId: user.id 
          });
        }
        console.log("[REGISTER] Registration and login successful");
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("[REGISTER] Registration error:", err);
      // Send detailed error message
      res.status(500).json({ 
        message: err instanceof Error ? err.message : "Registration failed. Please try again." 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("[LOGIN] Attempting login for username:", req.body.username);
    
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("[LOGIN] Authentication error:", err);
        return res.status(500).json({ message: "Authentication error occurred" });
      }
      
      if (!user) {
        console.log("[LOGIN] Authentication failed for username:", req.body.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("[LOGIN] Login session error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        console.log("[LOGIN] Login successful for user ID:", user.id);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req: any, res, next) => {
    try {
      const user = req.user as SelectUser;
      
      // Clean up data for free users before logging out
      if (user && user.subscriptionStatus === 'free') {
        console.log(`[LOGOUT] Cleaning up data for free user: ${user.username}`);
        
        // Import the subscription policy service dynamically to avoid circular dependency
        const { SubscriptionPolicyService } = await import('./services/subscriptionPolicyService.js');
        
        const cleanup = await SubscriptionPolicyService.deleteAllUserData(user.id);
        console.log(
          `[LOGOUT] Cleanup complete: ${cleanup.projectsDeleted} projects, ${cleanup.filesDeleted} files deleted`
        );
      }
      
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    } catch (error) {
      console.error('[LOGOUT] Error during cleanup:', error);
      // Still log out the user even if cleanup fails
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const requirePaidSubscription: RequestHandler = (req, res, next) => {
  const user = req.user as SelectUser;
  if (!user || (user.subscriptionStatus === "free")) {
    return res.status(403).json({ message: "Paid subscription required" });
  }
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as SelectUser;
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
