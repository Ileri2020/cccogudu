// @ts-nocheck
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

  const { name, username, email, password, contact, department } = body;
  if (!email || !password || !username) {
    return new NextResponse(JSON.stringify({ error: 'Email, username, and password are required' }), { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        username,
        email,
        password: hashedPassword,
        contact: contact || null,
        department: department || null,
        role: 'user',
      },
    });

    const { password: _password, ...safeUser } = user;
    const token = createAuthToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role });

    return new NextResponse(JSON.stringify({ ...safeUser, token }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create account', details: String(error?.message || error) }),
      { status: 500 }
    );
  }
}
