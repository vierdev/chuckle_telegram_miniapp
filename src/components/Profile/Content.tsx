import React, { useState } from "react";
import CartoonBox from "@/components/Common/CartoonBox";
import Header from "@/components/Header/Header";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { useSnackbar } from "notistack";

const Content: React.FC = () => {
  const { userData, refreshUserData } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [copying, setCopying] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Function to copy referral link
  const copyToClipboard = async () => {
    if (!userData?.referalLink || copying) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(userData.referalLink);
      enqueueSnackbar('Referral link copied to clipboard!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback copy method
      const textarea = document.createElement('textarea');
      textarea.value = userData.referalLink;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        enqueueSnackbar('Referral link copied to clipboard!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
        });
      } catch (err) {
        enqueueSnackbar('Failed to copy referral link', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
        });
      }
      document.body.removeChild(textarea);
    } finally {
      setCopying(false);
    }
  };
  const validateWalletAddress = (address: string) => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaAddressRegex.test(address);
  };

  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setWalletAddress(address);
    setIsValidAddress(validateWalletAddress(address));
  };

  const handleWalletAction = async () => {
    if (!isValidAddress) {
      enqueueSnackbar('Please enter a valid Solana wallet address', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
      });
      return;
    }

    if (!userData?.t_id) {
      enqueueSnackbar('User ID not found', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
      });
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch('/api/register-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, t_id: userData.t_id }),
      });

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar('Wallet updated successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
        });
        await refreshUserData();
      } else {
        throw new Error(data.error || 'Failed to update wallet');
      }
    } catch (error : any) {
      console.error('Wallet update error:', error);
      enqueueSnackbar(error.message || 'Failed to update wallet', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }, autoHideDuration: 3000
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-6rem)] p-4 bg-[#1B2F31] mx-8 my-4 border-2 border-black shadow-lg text-white overflow-y-scroll">
      <Header />

      <CartoonBox
        width={"100%"}
        height={"3.5rem"}
        backgroundColor="#335056"
        borderColor="#569CAA"
        className="my-2 sm:my-4"
        contentClass="flex items-center justify-between"
      >
        <div className="p-4">
          <span className="text-xs sm:text-sm text-gray-400 leading-none">
            Your invitation earnings:
          </span>
          <h2 className="text-md sm:text-2xl font-normal leading-none">
            {userData?.totalEarned || 0}pts
          </h2>
        </div>
        <Image
          src="/assets/Profile/earnings-add-icon.png"
          alt="Add Earnings Icon"
          width={64}
          height={64}
          className="absolute -right-0 top-1/4 transform -translate-y-1/2 w-16 h-16"
        />
      </CartoonBox>

      <CartoonBox
        width={"100%"}
        height={"1.7rem"}
        backgroundColor="#569CAA"
        borderColor="black"
        className={`w-full mb-2 cursor-pointer transition-opacity duration-200 ${
          copying ? 'opacity-75' : 'opacity-100'
        }`}
        contentClass="flex items-center justify-center"
        onClick={copyToClipboard}
      >
        <Image 
          src="/assets/Profile/copy-icon.svg" 
          alt="Link Icon" 
          width={16} 
          height={16} 
          className={`w-4 h-4 mr-1 ${copying ? 'animate-pulse' : ''}`}
        />
        <span className="text-md mt-[3px]">
          {copying ? 'Copying...' : 'Copy referral link'}
        </span>
      </CartoonBox>

      <div className="w-full bg-[#FAB757] border-b-8 border-[#8D5908]">
        <div className="p-2 sm:p-4">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/Profile/airdrop-icon.png"
              alt="Airdrop Icon"
              width={48}
              height={56}
              className="w-8 h-10 sm:w-12 sm:h-14"
            />
            <div>
              <h2 className="text-xl font-semibold text-black">Airdrop</h2>
              <p className="text-sm text-black tracking-wider max-w-[180px]">
                Complete tasks and do daily logs for rewards
              </p>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter your Solana wallet address"
              value={walletAddress}
              onChange={handleWalletAddressChange}
              className={`w-full p-2 mb-2 rounded ${
                userData?.walletAddress ? 'bg-gray-200 text-gray-700' : 'text-black'
              }`}
              disabled={isRegistering}
            />
            <CartoonBox
              backgroundColor="#000"
              borderColor="transparent"
              className={`w-full cursor-pointer transition-transform duration-200 ${
                isValidAddress && !isRegistering ? 'bg-opacity-100' : 'bg-opacity-50'
              } hover:scale-[1.02] active:scale-[0.98]`}
              onClick={handleWalletAction}
            >
              <div className="sm:py-2 flex items-center justify-center gap-2">
                <span className="text-white text-md mt-1">
                  {isRegistering ? 'Updating...' : (userData?.walletAddress ? 'Change wallet' : 'Register wallet')}
                </span>
                <Image 
                  src="/assets/Profile/wallet-icon.svg" 
                  alt="Wallet Icon" 
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
            </CartoonBox>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;