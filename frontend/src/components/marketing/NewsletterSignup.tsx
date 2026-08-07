'use client';

import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setMessage('Thank you for subscribing to our newsletter!');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }, 1500);
  };

  return (
    <section className='py-16 bg-amber-600 text-white'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-4'>Stay Updated</h2>
          <p className='mb-8 max-w-2xl mx-auto'>
            Subscribe to our newsletter to receive exclusive offers, seasonal
            menu updates, and culinary event invitations.
          </p>

          <form
            onSubmit={handleSubmit}
            className='max-w-md mx-auto'
            role='form'
          >
            <div className='relative'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Your email address'
                className='w-full bg-white text-gray-800 px-4 py-3 pl-4 pr-12 rounded-md focus:outline-none'
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type='submit'
                className='absolute right-1 top-1/2 transform -translate-y-1/2 bg-amber-700 text-white p-2 rounded-md hover:bg-amber-800 transition-colors'
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? (
                  <div
                    data-testid='loading-spinner'
                    className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'
                  ></div>
                ) : status === 'success' ? (
                  <Check data-testid='success-icon' className='h-5 w-5' />
                ) : (
                  <Send className='h-5 w-5' />
                )}
              </button>
            </div>

            {message && (
              <div
                className={`mt-3 text-sm flex items-center justify-center ${
                  status === 'error' ? 'text-red-200' : 'text-white'
                }`}
              >
                {status === 'error' && <AlertCircle className='h-4 w-4 mr-1' />}
                {message}
              </div>
            )}
          </form>

          <p className='mt-6 text-sm opacity-80'>
            We respect your privacy and will never share your information with
            third parties.
          </p>
        </div>
      </div>
    </section>
  );
}
