'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaChevronDown,
  FaPinterest,
} from 'react-icons/fa';

// TypeScript interface for Navigator with connection property
interface NetworkInformation {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// We need this for proper TypeScript typing
type FetchPriorityType = 'high' | 'low' | 'auto';

export default function Hero() {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isImageLoaded] = useState(true); // Start with true to show image immediately
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [connectionSpeed, setConnectionSpeed] = useState<
    'slow' | 'medium' | 'fast'
  >('medium');

  // Define the full image URL for faster loading
  const fullImage =
    'https://i.vimeocdn.com/video/2004678484-5d3f84981c14fbdc007a0b74a31ad9240981e646138556d2b8637a7cb8f98b87-d';

  // Define the correct Vimeo video ID - make sure this is accurate
  const vimeoVideoId = '1075154908';

  // Detect connection speed
  useEffect(() => {
    // Check if Navigator API is available
    const nav = navigator as NavigatorWithConnection;
    if ('connection' in nav && nav.connection) {
      const connection = nav.connection;

      // Initial speed detection
      if (connection.effectiveType === '4g') {
        setConnectionSpeed('fast');
        setVideoQuality('1080p');
      } else if (connection.effectiveType === '3g') {
        setConnectionSpeed('medium');
        setVideoQuality('720p');
      } else {
        setConnectionSpeed('slow');
        setVideoQuality('540p');
      }

      // Listen for changes
      const updateConnectionSpeed = () => {
        if (connection.effectiveType === '4g') {
          setConnectionSpeed('fast');
          setVideoQuality('1080p');
        } else if (connection.effectiveType === '3g') {
          setConnectionSpeed('medium');
          setVideoQuality('720p');
        } else {
          setConnectionSpeed('slow');
          setVideoQuality('540p');
        }
      };

      connection.addEventListener('change', updateConnectionSpeed);
      return () =>
        connection.removeEventListener('change', updateConnectionSpeed);
    } else {
      // Fallback: measure download speed manually
      const startTime = Date.now();
      const testImage = document.createElement('img');
      testImage.src =
        'https://i.vimeocdn.com/video/2004678484-5d3f84981c14fbdc007a0b74a31ad9240981e646138556d2b8637a7cb8f98b87-d?quality=medium';
      testImage.onload = () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (duration < 300) {
          setConnectionSpeed('fast');
          setVideoQuality('1080p');
        } else if (duration < 1000) {
          setConnectionSpeed('medium');
          setVideoQuality('720p');
        } else {
          setConnectionSpeed('slow');
          setVideoQuality('540p');
        }
      };
    }
  }, []);

  // Handle visibility change to prevent blurring when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Preload the high-quality image in the background
  useEffect(() => {
    const preloadHighQualityImage = () => {
      // Choose image quality based on connection speed
      const imageQuality =
        connectionSpeed === 'slow'
          ? 'low'
          : connectionSpeed === 'medium'
          ? 'medium'
          : 'high';

      // Create image element using DOM API to avoid type errors
      const img = document.createElement('img');

      if ('fetchPriority' in img) {
        try {
          // Safely set fetchPriority if available
          (
            img as HTMLImageElement & { fetchPriority?: FetchPriorityType }
          ).fetchPriority = connectionSpeed === 'fast' ? 'high' : 'low';
        } catch (_) {
          // Ignore errors if browser doesn't support fetchPriority
        }
      }

      img.src = `${fullImage}?quality=${imageQuality}`;
    };

    // Start preloading after a short delay to prioritize initial render
    const timer = setTimeout(preloadHighQualityImage, 100);
    return () => clearTimeout(timer);
  }, [connectionSpeed, fullImage]);

  // Simulate loading progress for the custom loader
  useEffect(() => {
    if (isVideoPlaying) return;

    // Set initial progress based on connection speed
    const initialProgress =
      connectionSpeed === 'fast' ? 20 : connectionSpeed === 'medium' ? 10 : 5;
    setLoadingProgress(initialProgress);

    // Calculate total loading time based on connection speed
    const totalLoadingTime =
      connectionSpeed === 'slow'
        ? 2300
        : connectionSpeed === 'medium'
        ? 1800
        : 1300;

    // Set interval to update loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        // Accelerate progress as we get closer to 100%
        const increment = prev < 30 ? 1 : prev < 60 ? 2 : prev < 85 ? 3 : 4;

        const nextProgress = Math.min(prev + increment, 98);
        return nextProgress;
      });
    }, totalLoadingTime / 50); // Divide total time into small increments

    return () => clearInterval(interval);
  }, [connectionSpeed, isVideoPlaying]);

  // Listen for iframe loaded and playing state
  useEffect(() => {
    // Set video as playing after delay (backup in case iframe API doesn't work)
    const delayTime =
      connectionSpeed === 'slow'
        ? 2500
        : connectionSpeed === 'medium'
        ? 2000
        : 1500;

    const timer = setTimeout(() => {
      setLoadingProgress(100); // Complete the progress

      setTimeout(() => {
        setIsVideoPlaying(true);

        // Wait a bit longer before fading out the image completely
        setTimeout(() => {
          setIsVideoLoaded(true);
        }, 500);
      }, 200); // Short delay after progress reaches 100%
    }, delayTime);

    // Create a message listener for Vimeo iframe API (may not always work depending on domain restrictions)
    const handleMessage = (event: MessageEvent) => {
      try {
        // Check if message is from Vimeo
        if (!event.origin.includes('vimeo.com')) return;

        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Check for video play event
        if (data.event === 'play') {
          clearTimeout(timer); // Clear the backup timer
          setLoadingProgress(100); // Complete the progress
          setIsVideoPlaying(true);

          // Add a small delay before fading out the image to ensure video is visible
          setTimeout(() => {
            setIsVideoLoaded(true);
          }, 100);
        }
      } catch (_unused) {
        // Ignore JSON parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [connectionSpeed, isPageVisible]);

  // Handle video initialization when page becomes visible
  useEffect(() => {
    if (!isPageVisible) {
      // If page becomes invisible, reset video states
      setIsVideoLoaded(false);
      setIsVideoPlaying(false);
      setLoadingProgress(0);
    } else if (isPageVisible && !isVideoPlaying) {
      // When page becomes visible again, start the video loading process
      const delayTime =
        connectionSpeed === 'slow'
          ? 1500
          : connectionSpeed === 'medium'
          ? 1000
          : 500;

      const timer = setTimeout(() => {
        setIsVideoPlaying(true);

        // Fade out image after a short delay to ensure video is ready
        setTimeout(() => {
          setIsVideoLoaded(true);
        }, 800);
      }, delayTime);

      return () => clearTimeout(timer);
    }
  }, [isPageVisible, isVideoPlaying, connectionSpeed]);

  // Apply identical positioning to both image and video
  const applyPositioning = (
    element: HTMLElement,
    containerWidth: number,
    containerHeight: number
  ) => {
    // Use smaller scaling factor for slow connections to reduce processing demand
    const scaleFactor = connectionSpeed === 'slow' ? 1.05 : 1.1;
    const videoRatio = 16 / 9;
    const containerRatio = containerWidth / containerHeight;

    if (containerRatio > videoRatio) {
      // Container is wider than video aspect ratio - scale from width
      const newWidth = containerWidth * scaleFactor;
      const newHeight = newWidth / videoRatio;

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
      element.style.left = `${(containerWidth - newWidth) / 2}px`;
      element.style.top = `${(containerHeight - newHeight) / 2}px`;
    } else {
      // Container is taller than video aspect ratio - scale from height
      const newHeight = containerHeight * scaleFactor;
      const newWidth = newHeight * videoRatio;

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
      element.style.left = `${(containerWidth - newWidth) / 2}px`;
      element.style.top = `${(containerHeight - newHeight) / 2}px`;
    }
  };

  // Enhanced positioning for both image and video
  useEffect(() => {
    if (!videoContainerRef.current || !iframeRef.current || !imageRef.current)
      return;

    const handleResize = () => {
      const container = videoContainerRef.current;
      const iframe = iframeRef.current;
      const imageContainer = imageRef.current;

      if (!container || !iframe || !imageContainer) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Apply identical positioning to both elements
      applyPositioning(iframe, containerWidth, containerHeight);
      applyPositioning(imageContainer, containerWidth, containerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Also resize when video loads to ensure correct positioning
    const observer = new MutationObserver(handleResize);
    observer.observe(iframeRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [isImageLoaded, isVideoLoaded, connectionSpeed]);

  // Generate video parameters based on connection speed
  const getVideoParams = () => {
    // Define a type for video parameters
    type VideoParams = {
      autoplay: string;
      loop: string;
      autopause: string;
      muted: string;
      title: string;
      byline: string;
      portrait: string;
      controls: string;
      background: string;
      quality: string;
      dnt?: string;
      paused?: string;
      api?: string;
      player_id?: string;
    };

    // Base parameters
    const params: VideoParams = {
      autoplay: '1',
      loop: '1',
      autopause: '0',
      muted: '1',
      title: '0',
      byline: '0',
      portrait: '0',
      controls: '0',
      background: '1',
      quality: videoQuality,
      api: '1', // Enable JavaScript API
      player_id: 'hero-video', // Required for API messages
    };

    // For slow connections, adjust buffer size and playback settings
    if (connectionSpeed === 'slow') {
      params.dnt = '1'; // Do not track to reduce overhead
      // Lower quality already set in videoQuality state
    }

    // For paused state
    if (!isPageVisible) {
      params.paused = '1';
    }

    // Convert to URL parameters
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  };

  return (
    <section className='relative w-full h-screen overflow-hidden'>
      {/* Video container with better loading strategy */}
      <div
        ref={videoContainerRef}
        className='absolute inset-0 w-full h-full bg-black'
      >
        {/* Video container with matching positioning */}
        <div className='absolute inset-0 w-full h-full overflow-hidden'>
          <iframe
            ref={iframeRef}
            id='hero-video'
            src={`https://player.vimeo.com/video/${vimeoVideoId}?h=0e21db505b&${getVideoParams()}`}
            className={`absolute transition-opacity duration-1000 ease-in-out ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            allow='autoplay; fullscreen; picture-in-picture'
            loading={connectionSpeed === 'slow' ? 'lazy' : 'eager'}
            frameBorder='0'
            title='Background video'
            style={{
              filter: 'brightness(1.3) contrast(1.1)',
              position: 'absolute', // Will be dynamically positioned via JS
              zIndex: 5,
            }}
          ></iframe>
        </div>

        {/* Custom loader that appears until video plays */}
        {!isVideoPlaying && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-15 pointer-events-none'>
            <div className='flex flex-col items-center'>
              {/* Animation container */}
              <div className='w-20 h-20 mb-6 relative'>
                {/* Outer circle that pulses */}
                <div className='absolute inset-0 border-4 border-amber-500/50 rounded-full animate-ping-slow'></div>

                {/* Middle rotating circle */}
                <div className='absolute inset-0 border-t-4 border-r-4 border-amber-500 rounded-full animate-spin-slow'></div>

                {/* Inner stationary circle */}
                <div className='absolute inset-2 bg-amber-500 rounded-full flex items-center justify-center'>
                  {/* Play triangle */}
                  <div className='w-0 h-0 ml-1 border-t-[7px] border-b-[7px] border-t-transparent border-b-transparent border-l-[10px] border-l-white'></div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className='w-32 h-1.5 bg-white/20 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-amber-500 rounded-full transition-all duration-300 ease-out'
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>

              {/* Loading text */}
              <div className='mt-3 text-white/80 text-sm font-light tracking-widest uppercase'>
                Loading
              </div>
            </div>
          </div>
        )}

        {/* Placeholder image with absolute positioning for perfect alignment */}
        <div
          ref={imageRef}
          className={`absolute transition-opacity duration-1500 ease-in-out ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          } z-10`}
          style={{ position: 'absolute' }} // Will be dynamically positioned via JS
        >
          <Image
            src={fullImage}
            alt='Food background'
            fill
            priority={true} // Always priority for immediate loading
            quality={connectionSpeed === 'slow' ? 70 : 90}
            sizes='100vw'
            placeholder='blur'
            blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQYH/8QAIhAAAgEEAQQDAAAAAAAAAAAAAQIDAAQRBQYSITFBIlRh/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ANoZvnWew1jaXVpcG6jtpiZYTlCGOUYjJA7DJ8ggHR7AyKqe5nlvZS88xkkM8nUxJJP9O9DwP2mKBP/Z'
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(1.3) contrast(1.1)', // Match video filter
            }}
            unoptimized={true} // Always unoptimized for faster loading
          />
        </div>

        {/* Show connection speed indicator during development (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className='absolute top-2 left-2 z-50 bg-black/50 text-white px-2 py-1 text-xs rounded'>
            Connection: {connectionSpeed} | Quality: {videoQuality} | Video:{' '}
            {isVideoPlaying ? 'Playing' : 'Loading'} | Progress:{' '}
            {loadingProgress}%
          </div>
        )}

        {/* Lighter gradient overlay for better video visibility */}
        <div className='absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-transparent z-20'></div>
      </div>

      {/* Enhanced Phone Numbers with better styling and responsiveness */}
      <div className='absolute top-20 right-6 z-30'>
        <div className='bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10 shadow-lg'>
          <div className='space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3'>
            {/* Ghana Phone */}
            <a
              href='tel:630-614-4546'
              className='flex items-center gap-2 text-white hover:text-amber-300 transition-all duration-300 group'
              aria-label='Call Ghana phone number'
            >
              <div className='w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <FaPhone className='h-3.5 w-3.5 text-black' />
              </div>
              <div className='text-sm sm:text-base'>
                <div className='font-light text-xs text-amber-300'>Ghana</div>
                <div className='font-medium'>630-614-4546</div>
              </div>
            </a>

            {/* Divider for desktop */}
            <div className='hidden sm:block w-px h-10 bg-white/20'></div>

            {/* Texas Phone */}
            <a
              href='tel:469-960-3300'
              className='flex items-center gap-2 text-white hover:text-amber-300 transition-all duration-300 group'
              aria-label='Call Texas phone number'
            >
              <div className='w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <FaPhone className='h-3.5 w-3.5 text-black' />
              </div>
              <div className='text-sm sm:text-base'>
                <div className='font-light text-xs text-amber-300'>Texas</div>
                <div className='font-medium'>469-960-3300</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Always Visible Social Media Icons */}
      <div className='absolute right-6 bottom-50 z-40'>
        {/* Social Media Icons Container */}
        <div className='flex flex-col gap-4 p-3 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/10'>
          {/* Facebook */}
          <a
            href='https://www.facebook.com/ShaahiBiryani/#'
            target='_blank'
            rel='noopener noreferrer'
            className='w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#1877F2]/50'
            aria-label='Visit our Facebook page'
          >
            <FaFacebookF className='w-5 h-5' />
          </a>

          {/* Instagram */}
          <a
            href='https://www.instagram.com/shaahibiryani/'
            target='_blank'
            rel='noopener noreferrer'
            className='w-11 h-11 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-600/50'
            aria-label='Visit our Instagram page'
          >
            <FaInstagram className='w-5 h-5' />
          </a>

          {/* Twitter/X */}
          <a
            href='https://www.pinterest.com/mmahkri/shaahi-biryani/'
            target='_blank'
            rel='noopener noreferrer'
            className='w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-gray-800/50'
            aria-label='Visit our Twitter page'
          >
            <FaPinterest className='w-5 h-5' />
          </a>

          {/* TikTok */}
          <a
            href='https://tiktok.com'
            target='_blank'
            rel='noopener noreferrer'
            className='w-11 h-11 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-[#FF0050]/50'
            aria-label='Visit our TikTok page'
            style={{
              background:
                'linear-gradient(90deg, #25F4EE, #000000, #FE2C55, #000000, #25F4EE)',
            }}
          >
            <FaTiktok className='w-5 h-5' />
          </a>

          {/* YouTube */}
          <a
            href='https://www.youtube.com/watch?v=zIqi-R0_aHA'
            target='_blank'
            rel='noopener noreferrer'
            className='w-11 h-11 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-600/50'
            aria-label='Visit our YouTube channel'
          >
            <FaYoutube className='w-5 h-5' />
          </a>
        </div>
      </div>

      {/* Main title and button - Fixed position at bottom left with good margin */}
      <div className='absolute bottom-51 left-6 sm:left-10 z-30 text-left'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider mb-5 drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)]'>
          WE ARE OPEN!
        </h1>

        <div>
          <Link
            href='/menu'
            className='inline-block border-3 border-white rounded-full text-white text-base sm:text-lg md:text-xl font-semibold tracking-wide py-2 sm:py-3 px-6 sm:px-8 md:px-10 
                     hover:bg-white/30 transition-colors duration-300 
                     drop-shadow-[0_3px_4px_rgba(0,0,0,0.9)]
                     bg-black/30 backdrop-blur-sm
                     animate-pulse-subtle'
          >
            ORDER NOW
          </Link>
        </div>
      </div>

      {/* Animated Scroll Down Indicator */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-center'>
        <div className='flex flex-col items-center'>
          <span className='text-white text-sm uppercase tracking-widest mb-2 font-light'>
            Scroll Down
          </span>
          <div className='w-8 h-12 rounded-full border-2 border-white/60 flex justify-center p-1'>
            <div className='w-1.5 h-1.5 bg-white rounded-full animate-scroll-down'></div>
          </div>
          <div className='mt-2'>
            <FaChevronDown className='w-4 h-4 text-white animate-bounce' />
          </div>
        </div>
      </div>
    </section>
  );
}
