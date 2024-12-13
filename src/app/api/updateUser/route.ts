// app/api/updateUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, balance, totalEarned } = body;

    const { db } = await connectToDatabase();

    await db.collection('users').updateOne(
      { t_id: userId },
      {
        $set: {
          balance,
          totalEarned,
        },
      }
    );

    return NextResponse.json(
      { message: 'Updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    );
  }
}

// Add headers if needed
export const runtime = 'nodejs'; // Edge runtime
export const dynamic = 'force-dynamic'; // No caching
