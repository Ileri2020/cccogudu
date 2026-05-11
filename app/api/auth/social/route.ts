import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createAuthToken } from '../auth-utils';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    body = await req.json();
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body) {
    return new NextResponse(JSON.stringify({ error: 'Missing request body' }), { status: 400 });
  }

  const { email, name, username, avatarUrl, providerId, provider } = body;

  if (!email) {
    return new NextResponse(JSON.stringify({ error: 'Email is required for social login' }), { status: 400 });
  }

  try {
    // 1. Check if user already exists by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // User exists, update provider details if they are new or missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          providerid: providerId || user.providerid,
          avatarUrl: avatarUrl || user.avatarUrl,
          name: name || user.name,
        },
      });
    } else {
      // 2. Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          username: username || email.split('@')[0] + Math.floor(Math.random() * 1000),
          avatarUrl,
          providerid: providerId,
          role: 'user',
        },
      });
    }

    const { password: _password, ...safeUser } = user;
    const token = createAuthToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role });

    return new NextResponse(JSON.stringify({ ...safeUser, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('SOCIAL AUTH ERROR:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to authenticate with social provider', details: String(error?.message || error) }),
      { status: 500 }
    );
  }
}
