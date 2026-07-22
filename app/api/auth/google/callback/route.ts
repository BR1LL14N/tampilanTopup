import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  let siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).trim().replace(/\/+$/, '');

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login?error=Google+login+canceled`);
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const redirectUri = `${siteUrl}/api/auth/google/callback`;

    // 1. Exchange auth code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData);
      const errDetail = tokenData.error_description || tokenData.error || 'Gagal autentikasi Google';
      return NextResponse.redirect(`${siteUrl}/auth/login?error=${encodeURIComponent(errDetail)}`);
    }

    // 2. Fetch user profile from Google API
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    if (!profile.email) {
      return NextResponse.redirect(`${siteUrl}/auth/login?error=Email+Google+tidak+ditemukan`);
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || profile.given_name || email.split('@')[0];

    // 3. Find or Create User in Database
    const provider = process.env.DB_PROVIDER || 'mysql';
    const userTable = provider === 'supabase' ? 'user_profiles' : 'users';

    const existingUsers = await executeQuery(
      `SELECT * FROM ${userTable} WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    let userObj: any = null;

    if (existingUsers && existingUsers.length > 0) {
      userObj = existingUsers[0];
    } else {
      // Create new user in DB
      const newUserId = crypto.randomUUID();
      const role = 'user';
      const dummyPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      if (provider === 'supabase') {
        await executeQuery(
          `INSERT INTO user_profiles (id, email, name, role) VALUES ($1, $2, $3, $4)`,
          [newUserId, email, name, role]
        );
      } else {
        await executeQuery(
          `INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)`,
          [newUserId, name, email, dummyPassword, role]
        );
      }

      userObj = { id: newUserId, email, name, role };
    }

    // 4. Sign JWT Token & Set Cookie
    const token = signToken({
      id: userObj.id,
      email: userObj.email,
      name: userObj.name || name,
      role: userObj.role || 'user',
    });

    const response = NextResponse.redirect(`${siteUrl}/dashboard`);
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${siteUrl}/auth/login?error=${encodeURIComponent(err.message)}`);
  }
}
