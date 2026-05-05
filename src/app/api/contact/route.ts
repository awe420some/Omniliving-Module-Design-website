import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, interest, message } = body;

    // Validation
    if (!firstName || typeof firstName !== 'string') {
      return NextResponse.json(
        { error: 'Vorname ist erforderlich' },
        { status: 400 },
      );
    }

    if (!lastName || typeof lastName !== 'string') {
      return NextResponse.json(
        { error: 'Nachname ist erforderlich' },
        { status: 400 },
      );
    }

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

    await db.contactSubmission.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        interest: interest || null,
        message: message || null,
      },
    });

    return NextResponse.json(
      { message: 'Nachricht erfolgreich gesendet!' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 },
    );
  }
}
