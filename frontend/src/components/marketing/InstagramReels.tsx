'use client';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Instagram,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';

const reelVideos = [
  {
    id: 1,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167004/Whether_it_s_corporate_events_weddings_or_intimate_gatherings_we_re_here_to_cater_to_your_needs_Make_your_next_event_unforgettable.Visit_shaahibiryani.com_or_follow_us_shaahibiryani_explore_biryani_foodporn_eylvje.mp4',
    caption: 'Catering services for all your events',
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
  {
    id: 2,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167004/LGBT_Let_s_get_biryani_tonight_explore_foodporn_biryani_finedine_indianrestaurant_kebabs_indiancuisines_dxfouk.mp4',
    caption: "Let's Get Biryani Tonight",
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
  {
    id: 3,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167003/Quality_taste_and_experience_all_in_one_Stay_tuned_for_something_exciting_Your_eyes_aren_t_ready_for_this_explore_kebabs_foodporn_biryani_finedine_planofoodie_texaseats_indianrestaurant_gra_dmsxua.mp4',
    caption: 'Quality, taste, and experience all in one',
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
  {
    id: 4,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167003/Hey_Texas_the_wait_is_over_Shaahi_Biryani_is_opening_in_Plano_this_Saturday_April_6th_at_2-30_PM_...._explore_texas_planodesa%C3%BAde_planofoodie_texasfoodie_biryani_pakistanifood_halal_grandopening_v7rorf.mp4',
    caption: 'Grand opening in Plano, Texas',
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
  {
    id: 5,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167003/At_Shaahi_Biryani_we_don_t_just_serve_food_we_serve_memories_infused_with_rich_spices_and_tradition._explore_shaahi_biryani_usfoodie_foodporn_indianrestaurant_finedine_kebabs_glendale_planotexas_cz3smx.mp4',
    caption: "We don't just serve food, we serve memories",
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
  {
    id: 6,
    videoUrl:
      'https://res.cloudinary.com/dyonhzqqv/video/upload/v1746167002/Let_your_tastebuds_travel_Only_at_Shaahi_Biryani_...._explore_biryani_kebabs_indianrestaurant_foodporn_grandopening_foodie_dining_catering_events_indianstyle_aroma_shaahi_texas_chicago_a7qkev.mp4',
    caption: 'Let your tastebuds travel',
    instagramLink: 'https://www.instagram.com/shaahibiryani/',
  },
];

const InstagramReels = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Update video state when isPlaying changes
  useEffect(() => {
    if (videoRefs.current[currentIndex]) {
      if (isPlaying) {
        videoRefs.current[currentIndex]
          ?.play()
          .catch((e) => console.log('Video play error:', e));
      } else {
        videoRefs.current[currentIndex]?.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  // Update video mute state
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  useEffect(() => {
    // Initialize videoRefs array with the correct length
    if (videoRefs.current.length !== reelVideos.length) {
      videoRefs.current = Array(reelVideos.length).fill(null);
    }

    // Set all videos to the current muted state
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });

    // Play the current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          if (isPlaying) {
            video.play().catch((e) => console.log('Video play error:', e));
          }
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex, isPlaying, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reelVideos.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + reelVideos.length) % reelVideos.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Function to determine carousel item position
  const getCarouselItemPosition = (index: number) => {
    const diff = (index - currentIndex + reelVideos.length) % reelVideos.length;

    if (diff === 0) return 'center'; // Current item
    if (diff === 1) return 'right'; // Right adjacent item
    if (diff === reelVideos.length - 1) return 'left'; // Left adjacent item
    return 'hidden'; // Other items
  };

  return (
    <section className='py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative'>
      {/* Decorative elements */}
      <div className='absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-amber-50 to-transparent opacity-60'></div>
      <div className='absolute top-0 left-0 w-40 h-40 bg-amber-100 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2'></div>
      <div className='absolute top-10 right-10 w-60 h-60 bg-pink-100 rounded-full filter blur-3xl opacity-20'></div>

      <div className='container mx-auto px-4 relative'>
        {/* Stylized Header */}
        <div className='flex flex-col items-center mb-16 relative'>
          <div className='absolute -top-12 w-full'>
            <div className='w-32 h-1 bg-gradient-to-r from-amber-400 to-pink-500 mx-auto rounded-full'></div>
          </div>

          <div className='relative'>
            <span className='absolute -top-5 left-1/2 transform -translate-x-1/2 text-5xl text-amber-100 font-bold opacity-30 whitespace-nowrap'>
              @SHAAHIBIRYANI
            </span>
            <h2 className='text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-red-500 to-pink-600 mb-4 text-center relative'>
              Savor the Experience
            </h2>
          </div>

          <div className='flex items-center gap-3 bg-gradient-to-r from-amber-50 to-pink-50 p-3 px-5 rounded-full shadow-sm'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-600 flex items-center justify-center shadow-md'>
              <Instagram className='h-4 w-4 text-white' />
            </div>
            <p className='text-lg font-medium text-gray-700'>
              Our <span className='text-amber-600 font-semibold'>Stories</span>{' '}
              bring flavors to life
            </p>
          </div>

          <div className='mt-4 flex gap-1'>
            {['Authentic', 'Flavorful', 'Memorable'].map((word, i) => (
              <span
                key={i}
                className='text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-500 shadow-sm'
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Instagram Stories Style Layout */}
        <div className='relative w-full max-w-[1200px] mx-auto'>
          <div className='relative flex justify-center items-center w-full h-[650px] perspective-[1500px]'>
            {/* Grid pattern background */}
            <div className='absolute inset-0 bg-gray-900 grid grid-cols-12 grid-rows-12 opacity-10 z-0'>
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className='border-[0.5px] border-white/20'></div>
              ))}
            </div>

            {/* Reels Cards */}
            {reelVideos.map((reel, index) => {
              const position = getCarouselItemPosition(index);

              // Skip rendering completely hidden cards for performance
              if (position === 'hidden') return null;

              let positionClasses = '';
              let zIndex = 10;
              let opacity = 1;
              let transform = '';

              switch (position) {
                case 'center':
                  positionClasses = 'origin-center';
                  zIndex = 30;
                  transform = 'rotateY(0deg) translateZ(0) scale(1)';
                  break;
                case 'left':
                  positionClasses = 'origin-right';
                  zIndex = 20;
                  opacity = 0.7;
                  transform = 'rotateY(15deg) translateX(-65%) scale(0.85)';
                  break;
                case 'right':
                  positionClasses = 'origin-left';
                  zIndex = 20;
                  opacity = 0.7;
                  transform = 'rotateY(-15deg) translateX(65%) scale(0.85)';
                  break;
              }

              return (
                <div
                  key={reel.id}
                  className={`absolute rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700 ${positionClasses}`}
                  style={{
                    zIndex,
                    opacity,
                    transform,
                    width: '320px',
                    height: '600px',
                    backgroundColor: '#fff',
                    border: '12px solid #000',
                    borderRadius: '40px',
                  }}
                >
                  {/* Phone frame header */}
                  <div className='absolute top-0 left-0 right-0 h-[40px] bg-black z-10 flex justify-center items-end pb-1'>
                    <div className='w-[30%] h-[15px] bg-gray-800 rounded-b-2xl'></div>
                  </div>

                  {/* Content area */}
                  <div className='relative w-full h-full pt-[40px] bg-gray-100 overflow-hidden'>
                    {/* Video container with hover state tracking */}
                    <div
                      className='w-full h-full relative group'
                      onMouseEnter={() =>
                        position === 'center' && setIsHovering(true)
                      }
                      onMouseLeave={() =>
                        position === 'center' && setIsHovering(false)
                      }
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        className='w-full h-full object-cover'
                        src={reel.videoUrl}
                        loop
                        playsInline
                        controls={false}
                      />

                      {/* Video controls - Only show on center card when hovering */}
                      {position === 'center' && (
                        <div
                          className={`absolute bottom-20 left-0 right-0 flex justify-center items-center gap-4 z-20 transition-opacity duration-300 ${
                            isHovering ? 'opacity-100' : 'opacity-0'
                          }`}
                          role='group'
                          aria-label='Video controls'
                        >
                          <button
                            onClick={togglePlay}
                            className='w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110'
                            aria-label={
                              isPlaying ? 'Pause video' : 'Play video'
                            }
                          >
                            {isPlaying ? (
                              <Pause className='h-6 w-6 text-white' />
                            ) : (
                              <Play className='h-6 w-6 text-white ml-1' />
                            )}
                          </button>

                          <button
                            onClick={toggleMute}
                            className='w-14 h-14 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110'
                            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                          >
                            {isMuted ? (
                              <VolumeX className='h-6 w-6 text-white' />
                            ) : (
                              <Volume2 className='h-6 w-6 text-white' />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Caption overlay */}
                      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
                        <p className='text-white font-medium text-sm'>
                          {reel.caption}
                        </p>
                        <a
                          href={reel.instagramLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-white/90 hover:text-white text-xs mt-2'
                          title='View on Instagram'
                        >
                          <Instagram className='h-3 w-3' />
                          <span>View on Instagram</span>
                          <ExternalLink className='h-2 w-2' />
                        </a>
                      </div>

                      {/* Instagram story header */}
                      <div className='absolute top-0 left-0 right-0 px-3 py-3 bg-gradient-to-b from-black/50 to-transparent flex items-center'>
                        <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-600 p-[2px]'>
                          <div className='w-full h-full rounded-full bg-white p-[2px]'>
                            <div className='w-full h-full rounded-full bg-gray-800 flex items-center justify-center'>
                              <Instagram className='w-4 h-4 text-white' />
                            </div>
                          </div>
                        </div>
                        <div className='ml-2 text-white text-xs font-semibold'>
                          @shaahibiryani
                        </div>
                        {/* <div className="ml-auto text-white text-xs opacity-75">1h</div> */}
                      </div>

                      {/* Story progress bars */}
                      <div className='absolute top-0 left-0 right-0 flex gap-1 p-1'>
                        {reelVideos.map((_, i) => (
                          <div
                            key={i}
                            className={`h-[3px] rounded-full flex-1 ${
                              i === currentIndex ? 'bg-white' : 'bg-white/30'
                            }`}
                          ></div>
                        ))}
                      </div>

                      {/* "Next" button on center card */}
                      {position === 'center' && (
                        <button
                          onClick={nextSlide}
                          className='absolute right-4 bottom-[80px] w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg z-20'
                          aria-label='Next story'
                        >
                          <ArrowRight className='h-6 w-6 text-gray-800' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Navigation buttons outside the frame */}
            <button
              onClick={prevSlide}
              className='absolute left-5 md:left-10 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md z-40'
              aria-label='Previous reel'
            >
              <ArrowLeft className='h-6 w-6' />
            </button>

            <button
              onClick={nextSlide}
              className='absolute right-5 md:right-10 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-md z-40'
              aria-label='Next reel'
            >
              <ArrowRight className='h-6 w-6' />
            </button>
          </div>

          {/* Indicator Dots */}
          <div className='flex justify-center mt-8 gap-2'>
            {reelVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 w-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-amber-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Creative Footer CTA Section */}
        <div className='mt-20 relative'>
          <div className='absolute -top-10 w-full overflow-hidden'>
            <div className='flex justify-center'>
              <div className='w-40 h-40 bg-amber-100 rounded-full opacity-20 -mt-20 filter blur-3xl'></div>
            </div>
          </div>

          <div className='max-w-4xl mx-auto bg-gradient-to-r from-amber-50 via-white to-pink-50 rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden'>
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-200 to-pink-200 rounded-full filter blur-3xl opacity-20 -mt-20 -mr-20'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 bg-amber-100 rounded-full filter blur-3xl opacity-20 -mb-20 -ml-20'></div>

            {/* Text content */}
            <div className='relative text-center mb-8'>
              <h3 className='text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-700'>
                Join Our Culinary Journey
              </h3>

              <div className='flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 text-gray-600 mb-8'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-amber-400'></div>
                  <p>Exclusive Offers</p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-amber-400'></div>
                  <p>Behind-the-Scenes Content</p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-amber-400'></div>
                  <p>Special Event Announcements</p>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <div className='flex flex-col items-center'>
              <a
                href='https://www.instagram.com/shaahibiryani/'
                target='_blank'
                rel='noopener noreferrer'
                className='group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-amber-500 to-pink-600 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-amber-200 group-hover:from-amber-500 group-hover:to-pink-600'
                title='View on Instagram'
              >
                <span className='relative flex items-center gap-2 rounded-md bg-white px-6 py-3.5 transition-all duration-300 ease-in-out group-hover:bg-opacity-0'>
                  <Instagram className='h-5 w-5 text-amber-600 group-hover:text-white transition-colors' />
                  <span className='font-semibold text-lg group-hover:text-white transition-colors'>
                    Follow @shaahibiryani
                  </span>
                </span>
              </a>

              <p className='mt-6 text-gray-500 text-sm max-w-sm text-center'>
                Join our community of{' '}
                <span className='text-amber-600 font-semibold'>10,000+</span>{' '}
                food lovers who never miss a delicious update!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;
