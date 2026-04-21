import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Gone — debug endpoint removed.' }, { status: 410 });
}
