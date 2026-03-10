import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 },
      );
    }

    console.log('[public-contact]', {
      name,
      email,
      messageLength: message.length,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Message received successfully.',
    });
  } catch (error) {
    console.error('Public contact submission failed', error);
    return NextResponse.json(
      { error: 'Unable to submit message right now.' },
      { status: 500 },
    );
  }
}

