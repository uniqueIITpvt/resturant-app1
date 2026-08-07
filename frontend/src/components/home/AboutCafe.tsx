import Image from 'next/image';
import { FC } from 'react';

const AboutCafe: FC = () => {
  return (
    <section className='relative py-16 md:py-24 bg-white overflow-hidden'>
      {/* Background pattern decoration */}
      <div className='absolute -top-24 -right-24 w-96 h-96 md:w-[600px] md:h-[600px] bg-amber-50 rounded-full opacity-50 mix-blend-multiply'></div>
      <div className='absolute -bottom-24 -left-24 w-96 h-96 md:w-[600px] md:h-[600px] bg-amber-50 rounded-full opacity-50 mix-blend-multiply'></div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='text-center mb-16'>
          <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-sm font-medium tracking-wider uppercase mb-4'>
            Our Story
          </span>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6'>
            About Shaahi Biryani
          </h2>
          <div className='w-24 h-1 bg-amber-500 mx-auto'></div>
        </div>

        <div className='grid md:grid-cols-2 gap-12 items-center'>
          {/* Left column (image gallery) */}
          <div className='relative'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='aspect-square overflow-hidden rounded-lg shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300'>
                <Image
                  src='/cafe-1.png'
                  alt='Café ambiance'
                  width={400}
                  height={400}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='aspect-square overflow-hidden rounded-lg shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 mt-8'>
                <Image
                  src='/cafe-2.avif'
                  alt='Our chef'
                  width={400}
                  height={400}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='aspect-square overflow-hidden rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300'>
                <Image
                  src='/cafe-3.jpg'
                  alt='Coffee preparation'
                  width={400}
                  height={400}
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='aspect-square overflow-hidden rounded-lg shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8'>
                <Image
                  src='/cafe-4.jpg'
                  alt='Signature dish'
                  width={400}
                  height={400}
                  className='w-full h-full object-cover'
                />
              </div>
            </div>

            {/* Coffee stain decoration */}
            <div className='absolute -bottom-12 -right-12 w-24 h-24 opacity-10'>
              <svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M50,0 C77.6142,0 100,22.3858 100,50 C100,77.6142 77.6142,100 50,100 C22.3858,100 0,77.6142 0,50 C0,22.3858 22.3858,0 50,0 Z M50,10 C27.9086,10 10,27.9086 10,50 C10,72.0914 27.9086,90 50,90 C72.0914,90 90,72.0914 90,50 C90,27.9086 72.0914,10 50,10 Z'
                  fill='#7C3AED'
                />
              </svg>
            </div>
          </div>

          {/* Right column (text content) */}
          <div className='flex flex-col space-y-6'>
            <p className='text-lg text-gray-700 leading-relaxed'>
              Founded in 2017, Shaahi Biryani was born from a passion for creating
              extraordinary culinary experiences. Our vision was simple: create
              a space where food, atmosphere, and service come together to offer
              a complete sensory experience.
            </p>

            <blockquote className='pl-4 border-l-4 border-amber-500 italic text-lg text-gray-600'>
              &ldquo;We believe dining should engage all your senses - taste,
              sight, smell, touch, and sound - to create memories that
              last.&rdquo;
            </blockquote>

            <p className='text-lg text-gray-700 leading-relaxed'>
              Our team of skilled chefs combines traditional techniques with
              innovative approaches, using only the freshest, locally-sourced
              ingredients to craft dishes that tell a story with every bite.
            </p>

            <div className='grid grid-cols-2 gap-6 mt-6'>
              <div className='flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-amber-50 transition-colors duration-300'>
                <div className='w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-3'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
                    />
                  </svg>
                </div>
                <h3 className='font-bold text-gray-900 mb-1'>
                  Locally Sourced
                </h3>
                <p className='text-sm text-gray-600 text-center'>
                  We partner with local farmers for the freshest ingredients
                </p>
              </div>

              <div className='flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-amber-50 transition-colors duration-300'>
                <div className='w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 mb-3'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z'
                    />
                  </svg>
                </div>
                <h3 className='font-bold text-gray-900 mb-1'>Handcrafted</h3>
                <p className='text-sm text-gray-600 text-center'>
                  Every dish is made with care and attention to detail
                </p>
              </div>
            </div>

            <div className='flex items-center pt-6'>
              <div className='flex -space-x-2'>
                <Image
                  src='/chef-1.jpg'
                  alt='Chef'
                  width={48}
                  height={48}
                  className='rounded-full border-2 border-white'
                />
                <Image
                  src='/chef-1.jpg'
                  alt='Chef'
                  width={48}
                  height={48}
                  className='rounded-full border-2 border-white'
                />
                <Image
                  src='/chef-1.jpg'
                  alt='Chef'
                  width={48}
                  height={48}
                  className='rounded-full border-2 border-white'
                />
              </div>
              <p className='ml-4 text-sm font-medium text-gray-700'>
                Meet our team of passionate culinary experts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCafe;
