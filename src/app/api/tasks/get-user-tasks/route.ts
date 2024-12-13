// app/api/tasks/get-user-tasks/route.ts
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get userId from searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const completedTasks = await db
      .collection('completed_tasks')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    return NextResponse.json(completedTasks, { status: 200 });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
