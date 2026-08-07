'use client';

import React from 'react';
import Link from 'next/link';

interface LoginErrorMessageProps {
  message?: string;
  showSignUp?: boolean;
}

const LoginErrorMessage: React.FC<LoginErrorMessageProps> = ({
  message = 'No user found with the provided credentials.',
  showSignUp = true
}) => {
  return (
    <div className="p-4 rounded-md my-4 border bg-red-50 text-red-800 border-red-200">
      <p>{message}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        <Link 
          href="/auth/forgot-password" 
          className="text-sm font-medium text-red-800 underline hover:opacity-80"
        >
          Reset password
        </Link>
        
        {showSignUp && (
          <Link 
            href="/auth/register" 
            className="text-sm font-medium text-red-800 underline hover:opacity-80"
          >
            Create an account
          </Link>
        )}
      </div>
    </div>
  );
};

export default LoginErrorMessage; 