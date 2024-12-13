'use client'

import { useEffect, useState } from 'react'
import Content from '@/components/Leaderboard/Content'
import { useUser } from '@/contexts/UserContext'
import MenuTemplate from "@/scenes/Menu";

interface User {
  _id: { $oid: string };
  t_id: string;
  t_name: string;
  balance: number;
  totalEarned: number;
  earnPerTap: number;
  energy: number;
  invitees: string[];
  isPremium: boolean;
  items: any[];
  referalLink: string;
  last_login_timestamp: string;
  walletAddress: string;
  avatar_url: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const { userData } = useUser();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leaderboard data
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        
        setLeaderboard(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1B2F31]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1B2F31] text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1B2F31] text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Not Logged In</h2>
          <p>Please log in to view the leaderboard</p>
        </div>
      </div>
    )
  }

  return(
    <MenuTemplate>
      <Content currentUser={userData} leaderboard={leaderboard} />
    </MenuTemplate>
  )
}
