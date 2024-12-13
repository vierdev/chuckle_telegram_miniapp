'use client';

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

interface InviteCodeInputProps {
  onCodeComplete: (code: string) => void;
  onReset?: () => void;
}

function InviteCodeInput({ onCodeComplete, onReset }: InviteCodeInputProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isComplete = code.every(char => char !== '');
    if (isComplete) {
      onCodeComplete(code.join(''));
    }
  }, [code, onCodeComplete]);

  const handleInput = (value: string) => {
    if (onReset) onReset();
    if (/^[a-zA-Z0-9]$/.test(value)) {
      if (currentIndex < 6) {
        const newCode = [...code];
        newCode[currentIndex] = value.toUpperCase();
        setCode(newCode);
        setCurrentIndex(prev => Math.min(prev + 1, 5));
      }
    }
  };

  const handleBackspace = () => {
    if (onReset) onReset();
    const newCode = [...code];
    if (currentIndex === 5 && code[5] !== '') {
      newCode[5] = '';
    } else if (currentIndex > 0) {
      newCode[currentIndex - 1] = '';
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
    setCode(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      handleBackspace();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      handleInput(value[value.length - 1]);
    }
    e.target.value = '';
  };

  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <div className="relative" onClick={focusInput}>
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        className="opacity-0 absolute top-0 left-0 w-px h-px"
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <div className="flex gap-2">
        {code.map((char, index) => (
          <div
            key={index}
            className={`w-[36px] h-[48px] bg-[#567980] flex items-center justify-center text-white text-2xl font-bold
              ${index === currentIndex ? 'border-2 border-yellow-400' : ''}`}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopView() {
  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-2xl font-bold mb-8">
        Please run the app on mobile device
      </h1>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG 
          value="https://t.me/chuckletapbot"
          size={200}
          level="H"
        />
      </div>
    </div>
  );
}

function MainContent() {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [verifiedCode, setVerifiedCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const isMobileDevice = () => /Mobi|Android/i.test(navigator.userAgent);
  const searchParams = useSearchParams();
  const { userData, setUserData } = useUser();

  const [isMobileView, setIsMobileView] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      setIsMobileView(isMobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const checkInviteAndSavedCode = async () => {
      const id = searchParams.get('id');
      const invite = searchParams.get('invite');
      setIsVerifying(true);
      
      if (!id) {
        console.error('No ID provided');
        return;
      }

      try {
        const response = await fetch(`/api/user?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUserData(userData);

        if(invite){
          try {
            const saveResponse = await fetch('/api/saveCode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userData.t_id,
                code: "000000"
              }),
            });
    
            if (!saveResponse.ok) {
              throw new Error('Failed to save code');
            }
            router.push('/play');
          } catch (error) {
            console.error('Error saving code:', error);
          }
        }

        if ((userData && userData.savedCode)) {
          router.push('/play');
        }
        else{
          setIsVerifying(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    checkInviteAndSavedCode();
  }, [searchParams, router, setUserData]);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.disableVerticalSwipes();
      window.Telegram.WebApp.isVerticalSwipesEnabled = false;
    }
  }, []);

  const handleCodeComplete = (code: string) => {
    setInputCode(code);
    setIsComplete(true);
  };

  const handleSubmit = async () => {
    if (!isComplete || isLoading || !inputCode) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verifyCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: inputCode,
          userId: userData?.t_id
        }),
      });
  
      const data = await response.json();
  
      if (!data.success) {
        setError(data.message);
        setIsComplete(false);
        return;
      }
      setVerifiedCode(inputCode);
      
      if (userData?.t_id) {
        try {
          const saveResponse = await fetch('/api/saveCode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userData.t_id,
              code: inputCode
            }),
          });
  
          if (!saveResponse.ok) {
            throw new Error('Failed to save code');
          }
        } catch (error) {
          console.error('Error saving code:', error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/play');
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
      setIsComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  // If not mobile device, show desktop view
  // if (!isMobileView) {
  //   return <DesktopView />;
  // }
  
  return (
    <div className="w-full min-h-screen h-full flex items-center justify-center p-4 bg-[#1C1C1E]">
      <div className="relative w-full max-w-md mx-auto">
        <div 
          className="absolute inset-0 w-full bg-[#569CAA] border-[3px] border-black"
          style={{
            transform: 'rotate(-4deg) translate(4px, -24px)',
          }}
        />
        <div 
          className="relative w-full min-h-[500px] bg-[#B6DCE4] border-[3px] border-black"
          style={{
            backgroundImage: 'url(/frame.png)',
            backgroundPosition: 'top center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Background decorations */}
          <div className="absolute left-0 top-0">
            <Image
              src="/back/left-top.svg"
              alt="Left Top Decoration"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
          <div className="absolute right-0 top-0">
            <Image
              src="/back/right-top.svg"
              alt="Right Top Decoration"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>
          <div className="absolute left-0 bottom-0">
            <Image
              src="/back/left-bottom.svg"
              alt="Left Bottom Decoration"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col items-center pt-5">
            <Image
              src="/back/icon.svg"
              alt="Airdrop"
              width={50}
              height={50}
              className="object-contain"
            />
            
            <h1 className="mt-[60px] text-[24px] font-bold leading-[29.21px] text-black">
              Early Access Airdrop
            </h1>
            
            <p className="mt-3 text-base font-normal leading-[18.95px] text-black">
              Enter your invite code to claim your airdrop
            </p>

            {!isVerifying ? (
              <div className="mt-[100px] flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#569CAA] border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-black font-medium">Verifying code...</p>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <InviteCodeInput 
                    onCodeComplete={handleCodeComplete}
                    onReset={() => setError('')}
                  />
                </div>

                {error && (
                  <p className="mt-2 text-red-500 font-medium text-center">
                    {error}
                  </p>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={!isComplete || isLoading}
                  className={`mt-[120px] px-6 py-3 flex items-center gap-2 text-xl font-bold
                    transition-all duration-200 transform active:scale-95
                    ${isComplete 
                      ? 'bg-[#569CAA] text-white hover:bg-[#4a8795] cursor-pointer' 
                      : 'bg-[#8BA1A5] text-gray-300 cursor-not-allowed'
                    }
                    ${isLoading ? 'animate-pulse' : ''}
                  `}
                >
                  {isLoading ? 'Processing...' : 'Submit'}
                  <ArrowRight size={20} />
                </button>

                <button 
                  onClick={() => router.back()} 
                  className="mt-3 mb-16 text-base font-bold leading-[19.47px] hover:opacity-70 transition-opacity text-black"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-[#1C1C1E]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#569CAA]" />
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
