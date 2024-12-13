'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { SnackbarProvider } from 'notistack';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');
const manifestUrl = '/tonconnect-manifest.json';

interface UserData {
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
  twitter_username: string
}

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  mount: number;
  setMount: (value: number) => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [mount, setMount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mount');
      if (saved) {
        const parsedValue = parseInt(saved, 10);
        // Return 500 if the parsed value is NaN, otherwise use the parsed value
        return isNaN(parsedValue) ? 500 : parsedValue;
      }
      // If no saved value, use userData?.energy or default to 500
      return (500 + (userData?.items[2] || 0) * 500) || 500;
    }
    return 500;
  });
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?id=${userData?.t_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  }, [userData]);

  useEffect(() => {
    // Ensure we're not storing NaN
    const mountValue = isNaN(mount) ? 500 : mount;
    localStorage.setItem('mount', mountValue.toString());
  }, [mount]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let lastUpdate = Date.now();

    if (userData) {
      const now = Date.now();
      const savedLastUpdate = localStorage.getItem('lastUpdate');
      if (savedLastUpdate) {
        const timePassed = Math.floor((now - parseInt(savedLastUpdate, 10)) / 1000);
        if (timePassed > 0) {
          setMount(prev => {
            const prevValue = isNaN(prev) ? 500 : prev;
            const newMount = Math.min(prevValue + timePassed * (1 + (userData.items[1] || 0)), (500 + (userData?.items[2] || 0) * 500));
            return newMount;
          });
        }
      }

      intervalId = setInterval(() => {
        setMount(prevMount => {
          const prevValue = isNaN(prevMount) ? 500 : prevMount;
          if (prevValue < (500 + (userData?.items[2] || 0) * 500)) {
            return prevValue + (1 + (userData.items[1] || 0));
          }
          return prevValue;
        });
        lastUpdate = Date.now();
        localStorage.setItem('lastUpdate', lastUpdate.toString());
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        localStorage.setItem('lastUpdate', lastUpdate.toString());
      }
    };
  }, [userData]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <UserContext.Provider value={{ userData, setUserData, mount, setMount, refreshUserData }}>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </UserContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useUser() {
  console.log("contextcreate");

  const context = useContext(UserContext);
  console.log("context:", context);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
