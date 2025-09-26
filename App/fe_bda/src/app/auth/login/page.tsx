"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

declare global {
  namespace google {
    namespace accounts {
      namespace id {
        function initialize(config: object): void;
        function prompt(callback: (notification: any) => void): void;
        function renderButton(element: HTMLElement, config: object): void;
      }
    }
  }
}

type GoogleOneTapResponse = {
  credential: string;
};

const LoginPage = () => {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();

  // This useEffect handles the redirection after successful login
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // This useEffect handles the Google One-Tap setup
useEffect(() => {
  // Ensure the Google Identity Services library is loaded
if (typeof window.google !== 'undefined' && window.google.accounts) {
    // 👇 Determine the Identity Provider URL from the environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      callback: async (response: GoogleOneTapResponse) => {
        // This is the callback function that receives the credential
        const googleIdToken = response.credential;
        if (googleIdToken) {
          try {
            await loginWithGoogle(googleIdToken);
          } catch (error) {
            console.error('Login failed:', error);
          }
        }
      },
      // 👇 ADDED: Set the Identity Provider URL for FedCM
      identity_provider: API_URL, 
      cancel_on_tap_outside: false,
    });
    
    // Render the One-Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // ... (rest of the code for button)
      }
    });
}
}, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md text-center">
        <div className="flex justify-center mb-6">
        <Image
          src="/next.svg"
          alt="BDA Logo"
          width={120}
          height={26}
          style={{ width: 'auto', height: 'auto' }} // Add this style to satisfy the warning
          priority
        />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign in to BDA</h1>
        {/* This div will be replaced by the Google Sign-in button */}
        <div id="signInDiv"></div>
        <p className="mt-4 text-sm text-gray-600">
          Or, if the button does not appear, try again.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;