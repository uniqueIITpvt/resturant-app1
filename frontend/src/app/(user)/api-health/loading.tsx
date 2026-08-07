export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='bg-white shadow-sm rounded-lg animate-pulse'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>

            <div className='space-y-4'>
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className='bg-gray-50 rounded-lg p-4 flex items-center justify-between'
                >
                  <div className='space-y-2'>
                    <div className='h-5 bg-gray-200 rounded w-32'></div>
                    <div className='h-4 bg-gray-200 rounded w-48'></div>
                  </div>
                  <div className='h-6 w-6 bg-gray-200 rounded-full'></div>
                </div>
              ))}
            </div>

            <div className='mt-6 h-10 bg-gray-200 rounded w-24'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
