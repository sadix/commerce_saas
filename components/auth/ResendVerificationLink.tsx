'use client'
import { Button } from '@/components/ui/Button';
import {useState} from 'react';

export function ResendVerificationEmailLink({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    // Implementation for resending verification email
    try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend verification email');
      }
        setIsLoading(false);
       if (response.ok) {
        // Show a success message or notification to the user and redirect to the login page when ok is pressed
        alert('Verification email sent successfully. Please check your inbox.');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to resend verification email. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button className='w-full' onClick={handleResend} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Resend verification email'}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};