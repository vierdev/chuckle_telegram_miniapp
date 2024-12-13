import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { userId, itemType } = await request.json();
    
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Get user data
    const user = await usersCollection.findOne({ t_id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize items if not exists
    if (!user.items) {
      user.items = {
        tapStrength: 0,
        recoverSpeed: 0,
        energyLevel: 0
      };
    }

    // Calculate current level and cost
    const currentLevel = user.items[itemType] || 0;
    
    if (currentLevel >= 10) {
      return NextResponse.json({ error: 'Max level reached' }, { status: 400 });
    }

    // Calculate cost with level scaling (increases by 20% each level)
    const baseCost = 2000;
    const cost = Math.floor(baseCost * Math.pow(1.2, currentLevel));

    // Check if user has enough balance
    if (user.balance < cost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update stats based on item type
    const updates: any = {
      balance: user.balance - cost,
      [`items.${itemType}`]: currentLevel + 1
    };

    if (itemType === 'tapStrength') {
      updates.earnPerTap = (user.earnPerTap || 1) + 1;
    } else if (itemType === 'energyLevel') {
      updates.energy = (user.energy || 500) + 500;
    }
    // recoverSpeed is handled in the energy recovery system

    // Update user
    await usersCollection.updateOne(
      { t_id: userId },
      { $set: updates }
    );

    // Get updated user data
    const updatedUser = await usersCollection.findOne({ t_id: userId });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Shop purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}