import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-mitsuru-2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Generates a signed JWT token for a user session.
 */
export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token. Returns user payload if valid, otherwise null.
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return null;
  }
}

/**
 * Hashes a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Extracts and verifies the current logged-in user from the auth_token cookie.
 * Compatible with server components and API routes.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Validates if the current session belongs to an administrator.
 */
export async function verifyAdmin(): Promise<boolean> {
  const provider = process.env.DB_PROVIDER || "mysql";
  if (provider === "supabase") {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return profile?.role === "admin";
    } catch {
      return false;
    }
  } else {
    const user = await getCurrentUser();
    return user?.role === "admin";
  }
}
