"use server"
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createAuthToken } from '../auth-utils';

const prisma = new PrismaClient();





export async function POST(req: NextRequest) {
  let body = null;
  try {
    body = await req.json();
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return new NextResponse(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const { password: _password, ...safeUser } = user;
    const token = createAuthToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role });

    return new NextResponse(JSON.stringify({ ...safeUser, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to login', details: String(error?.message || error) }),
      { status: 500 }
    );
  }
}



