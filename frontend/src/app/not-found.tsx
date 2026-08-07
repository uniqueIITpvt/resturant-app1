'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Home, Coffee, Utensils } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className='flex flex-col items-center'>
      <div className='relative animate-bounce mb-4'>
        <Utensils className='h-20 w-20 text-amber-500' />
        <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
          <span className='text-2xl font-bold'>404</span>
        </div>
      </div>
      <Coffee className='h-12 w-12 text-amber-600 animate-pulse' />
    </div>
  ),
});

// Define animation data directly in the file
const notFoundAnimationData = {
  // The animation data remains the same, just directly included here
  v: '5.9.6',
  fr: 29.9700012207031,
  ip: 0,
  op: 180.00000733155,
  w: 800,
  h: 600,
  nm: '404 Error Animation',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: '404 Text',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 0,
              s: [0],
            },
            {
              t: 20.0000008146167,
              s: [100],
            },
          ],
        },
        r: {
          a: 1,
          k: [
            {
              i: { x: [0.5], y: [1] },
              o: { x: [0.5], y: [0] },
              t: 0,
              s: [10],
            },
            {
              t: 25.0000010182709,
              s: [0],
            },
          ],
        },
        p: {
          a: 1,
          k: [
            {
              i: { x: 0.667, y: 1 },
              o: { x: 0.333, y: 0 },
              t: 0,
              s: [400, 260, 0],
              to: [0, 0, 0],
              ti: [0, 0, 0],
            },
            {
              i: { x: 0.667, y: 1 },
              o: { x: 0.333, y: 0 },
              t: 40,
              s: [400, 240, 0],
              to: [0, 0, 0],
              ti: [0, 0, 0],
            },
            {
              i: { x: 0.667, y: 1 },
              o: { x: 0.333, y: 0 },
              t: 80,
              s: [400, 260, 0],
              to: [0, 0, 0],
              ti: [0, 0, 0],
            },
            {
              i: { x: 0.667, y: 1 },
              o: { x: 0.333, y: 0 },
              t: 120,
              s: [400, 240, 0],
              to: [0, 0, 0],
              ti: [0, 0, 0],
            },
            {
              t: 160.000006516934,
              s: [400, 260, 0],
            },
          ],
        },
        s: {
          a: 1,
          k: [
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 0,
              s: [110, 110, 100],
            },
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 20,
              s: [100, 100, 100],
            },
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 90,
              s: [100, 100, 100],
            },
            {
              i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
              o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
              t: 95,
              s: [105, 105, 100],
            },
            {
              t: 100.000004073084,
              s: [100, 100, 100],
            },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'st',
              c: { a: 0, k: [0.95, 0.65, 0.16, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 12 },
              lc: 2,
              lj: 2,
              bm: 0,
              d: [
                { n: 'd', v: { a: 0, k: 8 } },
                { n: 'g', v: { a: 0, k: 8 } },
              ],
              nm: 'Stroke',
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.98, 0.75, 0.18, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0,
              nm: 'Fill',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: 'Group 1',
        },
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ],
                  o: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0],
                  ],
                  v: [
                    [-120, 0],
                    [-70, -100],
                    [-20, 0],
                    [20, -100],
                    [70, 0],
                    [120, -100],
                  ],
                  c: false,
                },
              },
              nm: 'Path 1',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.95, 0.65, 0.16, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 18 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'Stroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: '404 Shape',
        },
      ],
      ip: 0,
      op: 180.00000733155,
      st: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Plate Shape',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 10,
              s: [0],
            },
            {
              t: 30.0000012219251,
              s: [100],
            },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [400, 390, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [
                    [82.843, 0],
                    [0, 0],
                    [0, 20.711],
                    [-82.843, 0],
                    [0, -20.711],
                  ],
                  o: [
                    [-82.843, 0],
                    [0, -20.711],
                    [0, 0],
                    [82.843, 0],
                    [0, 20.711],
                  ],
                  v: [
                    [0, 37.5],
                    [0, 37.5],
                    [-150, 0],
                    [0, -37.5],
                    [150, 0],
                  ],
                  c: true,
                },
              },
              nm: 'Path 1',
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.95, 0.65, 0.16, 0.2] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0,
              nm: 'Fill',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.95, 0.65, 0.16, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 3 },
              lc: 2,
              lj: 2,
              bm: 0,
              d: [
                { n: 'd', v: { a: 0, k: 10 } },
                { n: 'g', v: { a: 0, k: 10 } },
              ],
              nm: 'Stroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: 'Plate',
        },
      ],
      ip: 0,
      op: 180.00000733155,
      st: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Food Icon',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 20,
              s: [0],
            },
            {
              t: 40.0000016292334,
              s: [100],
            },
          ],
        },
        r: {
          a: 1,
          k: [
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 40,
              s: [-10],
            },
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 60,
              s: [5],
            },
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 80,
              s: [0],
            },
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 120,
              s: [-5],
            },
            {
              i: { x: [0.667], y: [1] },
              o: { x: [0.333], y: [0] },
              t: 140,
              s: [5],
            },
            {
              t: 160.000006516934,
              s: [0],
            },
          ],
        },
        p: { a: 0, k: [400, 340, 0] },
        s: { a: 0, k: [80, 80, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [
                    [8.284, 0],
                    [0, 8.284],
                    [-8.284, 0],
                    [0, -8.284],
                  ],
                  o: [
                    [-8.284, 0],
                    [0, -8.284],
                    [8.284, 0],
                    [0, 8.284],
                  ],
                  v: [
                    [0, 15],
                    [-15, 0],
                    [0, -15],
                    [15, 0],
                  ],
                  c: true,
                },
              },
              nm: 'Path 1',
            },
            {
              ty: 'fl',
              c: { a: 0, k: [0.98, 0.75, 0.18, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0,
              nm: 'Fill',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: 'Burger Top',
        },
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  i: [
                    [0, 0],
                    [0, 0],
                  ],
                  o: [
                    [0, 0],
                    [0, 0],
                  ],
                  v: [
                    [-30, 0],
                    [30, 0],
                  ],
                  c: false,
                },
              },
              nm: 'Path 1',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.95, 0.65, 0.16, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 8 },
              lc: 2,
              lj: 2,
              bm: 0,
              nm: 'Stroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 20] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
            },
          ],
          nm: 'Burger Bottom',
        },
      ],
      ip: 0,
      op: 180.00000733155,
      st: 0,
    },
  ],
  markers: [],
};

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLottie, setShowLottie] = useState(true);

  useEffect(() => {
    // Create staggered animation effect when component mounts
    setIsLoaded(true);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center p-4'>
      <div
        className={`max-w-lg w-full transition-all duration-700 ease-out transform ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        {/* Animation container with fixed height */}
        <div className='w-full h-64 sm:h-80 relative flex items-center justify-center'>
          {showLottie ? (
            <div className='lottie-container w-full h-full'>
              <Suspense
                fallback={
                  <div className='flex flex-col items-center'>
                    <div className='relative animate-bounce mb-4'>
                      <Utensils className='h-20 w-20 text-amber-500' />
                      <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
                        <span className='text-2xl font-bold'>404</span>
                      </div>
                    </div>
                    <Coffee className='h-12 w-12 text-amber-600 animate-pulse' />
                  </div>
                }
              >
                <Lottie
                  animationData={notFoundAnimationData}
                  loop={true}
                  className='w-full h-full'
                  onError={() => setShowLottie(false)}
                />
              </Suspense>
            </div>
          ) : (
            /* SVG Fallback Animation */
            <div className='flex flex-col items-center'>
              <div className='relative animate-bounce mb-4'>
                <Utensils className='h-20 w-20 text-amber-500' />
                <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
                  <span className='text-2xl font-bold'>404</span>
                </div>
              </div>
              <Coffee className='h-12 w-12 text-amber-600 animate-pulse' />
            </div>
          )}
        </div>

        <div className='text-center px-6 py-8'>
          <h1
            className={`text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-transparent bg-clip-text mb-2 transition-all duration-700 delay-200 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            Oops! Page Not Found
          </h1>

          <p
            className={`text-gray-600 mb-8 transition-all duration-700 delay-300 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            The page you&apos;re looking for seems to have gone on a lunch
            break. Let&apos;s get you back to something delicious.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <Link
              href='/'
              className='flex items-center justify-center gap-2 px-6 py-3 bg-white text-amber-600 border-2 border-amber-500 font-medium rounded-lg hover:bg-amber-50 transition-colors shadow-md hover:shadow-lg group'
            >
              <Home className='w-5 h-5 transition-transform group-hover:-translate-y-1' />
              <span>Go Home</span>
            </Link>

            <Link
              href='/menu'
              className='flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg group'
            >
              <span>Explore Our Menu</span>
              <ArrowLeft className='w-5 h-5 rotate-180 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
