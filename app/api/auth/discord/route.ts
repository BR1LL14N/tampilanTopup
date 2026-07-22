import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Discord Client ID belum diatur di .env" }, { status: 400 });
  }

  let siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).trim().replace(/\/+$/, '');
  const redirectUri = `${siteUrl}/api/auth/discord/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
  });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  return NextResponse.redirect(discordAuthUrl);
}
