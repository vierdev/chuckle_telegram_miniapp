// app/api/register-wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, t_id } = await request.json();

    // Validate the wallet address
    if (!validateWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Validate t_id
    if (!t_id) {
      return NextResponse.json({ error: 'Missing t_id' }, { status: 400 });
    }

    // Connect to the database
    const { db } = await connectToDatabase();

    // Update the user document
    const result = await db.collection('users').updateOne(
      { t_id: t_id },
      { $set: { walletAddress: walletAddress } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Wallet address already set or no changes made' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Wallet registered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error registering wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function validateWalletAddress(address: string): boolean {
  // This is a basic validation. You might want to use a more robust method.
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}