import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, userId, points } = body;

    if (!taskId || !userId || !points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Add task to completed_tasks collection
    await db.collection('completed_tasks').insertOne({
      taskId,
      userId: new ObjectId(userId),
      completedAt: new Date(),
    });

    // Update user's balance
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { 
          balance: points,
          totalEarned: points 
        } 
      }
    );

    return NextResponse.json(
      { message: 'Task claimed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}