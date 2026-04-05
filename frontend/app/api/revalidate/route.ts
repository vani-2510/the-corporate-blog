import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { secret, paths } = await req.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    if (!Array.isArray(paths)) {
      return NextResponse.json({ error: 'paths must be an array' }, { status: 400 });
    }

    for (const path of paths) {
      if (typeof path === 'string') revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
