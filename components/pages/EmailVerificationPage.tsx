
import React from 'react';
import type { Page } from '../../types';
import { MailIcon, CheckIcon, WarningIcon } from '../icons';

export const EmailVerificationPage: React.FC<{
  status: 'prompt' | 'success' | 'invalid' | 'expired';
  setCurrentPage: (page: Page) => void;
}> = ({ status, setCurrentPage }) => {
  const messages = {
    prompt: {
      icon: <MailIcon className="w-16 h-16 text-cla-gold mx-auto mb-4" />,
      title: 'Please Verify Your Email',
      text: 'Thank you for signing up! We have sent a verification link to your email address. Please check your inbox (and spam folder) to activate your account.',
      buttonText: 'Back to Home',
      buttonAction: () => setCurrentPage('home'),
    },
    success: {
      icon: <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />,
      title: 'Verification Successful!',
      text: 'Your email has been successfully verified. You can now log in to your account.',
      buttonText: 'Go to Login',
      buttonAction: () => setCurrentPage('login'),
    },
    invalid: {
      icon: <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />,
      title: 'Verification Failed',
      text: 'The verification link is invalid. Please try signing up again or contact support if the problem persists.',
      buttonText: 'Back to Home',
      buttonAction: () => setCurrentPage('home'),
    },
    expired: {
      icon: <WarningIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />,
      title: 'Link Expired',
      text: 'The verification link has expired. Please try to log in again to receive a new verification link.',
      buttonText: 'Go to Login',
      buttonAction: () => setCurrentPage('login'),
    }
  };

  const currentMessage = messages[status];

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center p-8 bg-cla-surface dark:bg-cla-surface-dark rounded-lg shadow-xl max-w-md mx-auto">
            {currentMessage.icon}
            <h1 className="text-3xl font-bold text-cla-text dark:text-cla-text-dark mb-2">{currentMessage.title}</h1>
            <p className="text-cla-text-muted dark:text-cla-text-muted-dark mb-6">
                {currentMessage.text}
            </p>
            <button onClick={currentMessage.buttonAction} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker">
                {currentMessage.buttonText}
            </button>
        </div>
    </div>
  );
};