import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_me";

export async function registerReporter(username: string, email: string, password: string) {
  // Check if any reporter exists (only one allowed)
  const count = db.prepare("SELECT COUNT(*) as count FROM reporters").get() as any;
  if (count.count > 0) {
    throw new Error("Reporter already registered. Only one reporter allowed.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const stmt = db.prepare("INSERT INTO reporters (username, email, password) VALUES (?, ?, ?)");
  return stmt.run(username, email, hashedPassword);
}

export async function loginReporter(email: string, password: string) {
  const reporter = db.prepare("SELECT * FROM reporters WHERE email = ?").get(email) as any;
  if (!reporter) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, reporter.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ id: reporter.id, email: reporter.email }, JWT_SECRET, { expiresIn: "7d" });
  return { token, reporter: { id: reporter.id, username: reporter.username, email: reporter.email } };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
