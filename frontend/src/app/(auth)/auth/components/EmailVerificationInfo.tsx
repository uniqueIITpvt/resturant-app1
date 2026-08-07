import { Mail, Info } from 'lucide-react';

interface EmailVerificationInfoProps {
  email?: string;
}

export default function EmailVerificationInfo({
  email,
}: EmailVerificationInfoProps) {
  return (
    <div className='bg-blue-50 border-l-4 border-blue-400 p-4 mb-6'>
      <div className='flex'>
        <div className='flex-shrink-0'>
          <Info className='h-5 w-5 text-blue-400' />
        </div>
        <div className='ml-3'>
          <p className='text-sm text-blue-700 font-medium'>
            Verification Required
          </p>
          <p className='text-sm text-blue-700 mt-1'>
            A 6-digit OTP will be sent to your email
            {email ? ` (${email})` : ''} for verification.
          </p>
          <div className='mt-2 flex items-center text-sm text-blue-700'>
            <Mail className='h-4 w-4 mr-1' />
            <span>Please check your inbox and spam folder.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
