import { NextResponse } from 'next/server';

/**
 * Newsletter signup.
 *
 * Deliberately unconfigured. Set NEWSLETTER_ENDPOINT (and optionally
 * NEWSLETTER_TOKEN) to your provider's subscribe URL and this forwards to it.
 * Until then it answers 501 and the form tells the visitor the truth rather
 * than showing a confirmation for a list they were never added to.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ message: 'Malformed request.' }, { status: 400 });
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ message: 'That email does not look right.' }, { status: 400 });
  }

  const endpoint = process.env.NEWSLETTER_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { message: 'Newsletter provider not connected yet — see README.' },
      { status: 501 },
    );
  }

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEWSLETTER_TOKEN
          ? { Authorization: `Bearer ${process.env.NEWSLETTER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ email }),
    });

    if (!upstream.ok) {
      return NextResponse.json({ message: 'That did not go through. Try again?' }, { status: 502 });
    }
    return NextResponse.json({ message: "You're on the list." });
  } catch {
    return NextResponse.json({ message: 'That did not go through. Try again?' }, { status: 502 });
  }
}
