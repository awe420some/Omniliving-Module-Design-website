import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' },
        { status: 400 },
      );
    }

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Diese E-Mail ist bereits angemeldet' },
        { status: 200 },
      );
    }

    await db.newsletter.create({
      data: { email },
    });

    return NextResponse.json(
      { message: 'Erfolgreich angemeldet!' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 },
    );
  }
}
