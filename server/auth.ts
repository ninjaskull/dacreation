import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
      name?: string | null;
    }
  }
}

export function setupAuth(app: Express) {
  const PgSession = connectPgSimple(session);
  
  const isProduction = app.get("env") === "production";
  const sessionSecret = process.env.SESSION_SECRET || process.env.REPL_ID;
  
  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production. Please set a strong random secret.");
  }
  
  if (!sessionSecret) {
    console.warn("Warning: SESSION_SECRET not set. Using development fallback. Set SESSION_SECRET for production.");
  }
  
  const developmentOnlyFallback = `dev-${Date.now()}-${Math.random().toString(36)}`;
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret || developmentOnlyFallback,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    },
    store: new PgSession({
      pool: pool as any,
      tableName: 'session',
      createTableIfMissing: false,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await crypto.compare(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, { id: user.id, username: user.username, role: user.role, name: user.name });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, { id: user.id, username: user.username, role: user.role, name: user.name });
    } catch (err) {
      done(err);
    }
  });
}

export { crypto };
