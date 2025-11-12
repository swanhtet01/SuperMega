import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export async function authenticateUser(username: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Map username to user ID (test-supervisor -> test-supervisor)
  const userId = username.startsWith('test-') ? username : `test-${username}`;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  
  // For test users, password is always 'test123'
  // In production, you'd check hashed passwords
  if (password === 'test123') {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
  
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
