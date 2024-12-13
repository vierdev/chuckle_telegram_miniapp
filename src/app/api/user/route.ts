// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const t_id = searchParams.get('id');

  if (!t_id) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ t_id });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
