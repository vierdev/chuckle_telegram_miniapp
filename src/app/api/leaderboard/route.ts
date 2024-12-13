import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Get all users sorted by totalEarned in descending order
    const users = await db
      .collection('users')
      .find({})
      .sort({ totalEarned: -1 })
      .limit(100) // Limit to top 100 users
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
