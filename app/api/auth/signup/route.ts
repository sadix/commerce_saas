import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log('Signup request body:', body);

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Checking if user exists with email:', email);
    /* const existing = await prisma.user.findFirst({
      where: { email: email },
    });  */

    const existing = await prisma.user.findFirst({
      where: { email },
    });
    
    console.log('Existing user:', existing);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    //console.log('Hashing password for user:', email);

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user with hashed password:', hashedPassword);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    

    console.log('User created:', user);
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}