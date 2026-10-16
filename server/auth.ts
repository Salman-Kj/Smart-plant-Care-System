import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { pool } from "./db";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);
const PgSession = connectPgSimple(session);

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
  const sessionStore = new PgSession({
    pool,
    createTableIfMissing: true,
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "smart-plant-care-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((req, _res, next) => {
    if (req.isAuthenticated() && req.user && req.session) {
      (req.session as { role?: string }).role = (req.user as User).role;
    }
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return { hashPassword, comparePasswords };
}

function getRole(req: Request) {
  if (req.user && (req.user as User).role) {
    return (req.user as User).role;
  }
  if (req.session && (req.session as any).role) {
    return (req.session as any).role as string;
  }
  return null;
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session) {
    const role = getRole(req);
    (req.session as { role?: string }).role = role ?? undefined;
  }
  next();
}

export function requireGardener(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const role = getRole(req);
  if (role !== "gardener" && role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const role = getRole(req);
  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
