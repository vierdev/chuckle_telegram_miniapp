import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = "mongodb+srv://lightningdev722:sjW86eKb4TttfzQr@cluster0.rq0edjh.mongodb.net";

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json();

    console.log(code, userId);
    
    if (!code || !userId) {
      return NextResponse.json(
        { success: false, message: 'Code and userId are required' },
        { status: 400 }
      );
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const database = client.db("chuckle");
      const collection = database.collection("passcodes");

      // Use a session for transaction
      const session = client.startSession();

      try {
        await session.withTransaction(async () => {
          // Find and update in one atomic operation
          const result = await collection.findOneAndUpdate(
            { 
              code: code,
              isUsed: false // Additional check to prevent race conditions
            },
            {
              $set: {
                isUsed: true,
                usedAt: new Date(),
                usedBy: userId
              }
            },
            {
              session,
              returnDocument: 'before' // Get the document before update
            }
          );

          console.log(result);

          if (!result) {
            // Check if the code exists at all
            const codeExists = await collection.findOne({ code: code });
            
            if (!codeExists) {
              throw new Error('Invalid invite code');
            } else if (codeExists.isUsed) {
              throw new Error('This code has already been used');
            } else {
              throw new Error('Code verification failed');
            }
          }
        });

        return NextResponse.json(
          { 
            success: true, 
            message: 'Code verified and marked as used successfully'
          },
          { status: 200 }
        );

      } catch (error: any) {
        return NextResponse.json(
          { 
            success: false, 
            message: error.message || 'Verification failed'
          },
          { status: 400 }
        );
      } finally {
        await session.endSession();
      }

    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
