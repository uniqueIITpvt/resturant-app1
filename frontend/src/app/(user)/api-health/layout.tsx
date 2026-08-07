import Link from 'next/link';

export default function ApiHealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <Link href='/' className='text-xl font-bold text-gray-900'>
                  Shaahi Dashboard
                </Link>
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                <Link
                  href='/api-health'
                  className='border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                >
                  API Health
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
