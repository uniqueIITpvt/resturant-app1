import Image from 'next/image';
import { Coffee, Award, Users, Clock, MapPin } from 'lucide-react';
import AboutCafe from '@/components/home/AboutCafe';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Unique Café',
  description:
    'Learn about our story, our team, and our commitment to quality food and exceptional service.',
};

export default function AboutPage() {
  return (
    <main className='bg-white pt-16'>
      {/* Hero section */}
      <section className='relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <Image
            src='/cafe-interior.jpg'
            alt='Unique Café Interior'
            fill
            className='object-cover brightness-50'
            priority
          />
        </div>
        <div className='container mx-auto px-4 relative z-10 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
            About U
          </h1>
          <p className='text-xl text-white/90 max-w-2xl mx-auto'>
            Crafting culinary experiences that delight all your senses
          </p>
        </div>
      </section>

      {/* Our Story section (using AboutCafe component) */}
      <AboutCafe />

      {/* Our Values section */}
      <section className='py-16 bg-amber-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-sm font-medium tracking-wider uppercase mb-4'>
              What We Stand For
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Our Core Values
            </h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              At Unique Café, our values guide everything we do - from how we
              source ingredients to how we serve our guests.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300'>
              <div className='w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6'>
                <Coffee className='h-8 w-8 text-amber-700' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Quality First
              </h3>
              <p className='text-gray-700'>
                We never compromise on quality. From ingredients to service,
                excellence is our standard.
              </p>
            </div>

            <div className='bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300'>
              <div className='w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6'>
                <Users className='h-8 w-8 text-amber-700' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Community
              </h3>
              <p className='text-gray-700'>
                We&apos;re more than a restaurant - we&apos;re a gathering place
                where connections are made and celebrated.
              </p>
            </div>

            <div className='bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300'>
              <div className='w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6'>
                <Award className='h-8 w-8 text-amber-700' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Innovation
              </h3>
              <p className='text-gray-700'>
                We balance tradition with innovation, constantly evolving our
                menu while respecting culinary heritage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-sm font-medium tracking-wider uppercase mb-4'>
              The People Behind the Food
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Meet Our Team
            </h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              Our passionate team of culinary professionals work together to
              create unforgettable dining experiences.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Team Member 1 */}
            <div className='group'>
              <div className='relative overflow-hidden rounded-xl mb-4'>
                <Image
                  src='/chef-1.jpg'
                  alt='Executive Chef'
                  width={300}
                  height={400}
                  className='w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end'>
                  <div className='p-4 w-full text-white'>
                    <p className='text-sm'>
                      With 15 years of experience in fine dining, Michael brings
                      creativity and precision to every dish.
                    </p>
                  </div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Michael Chen</h3>
              <p className='text-amber-600 font-medium'>Executive Chef</p>
            </div>

            {/* Team Member 2 */}
            <div className='group'>
              <div className='relative overflow-hidden rounded-xl mb-4'>
                <Image
                  src='/chef-4.jpg'
                  alt='Pastry Chef'
                  width={300}
                  height={400}
                  className='w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end'>
                  <div className='p-4 w-full text-white'>
                    <p className='text-sm'>
                      Sarah&apos;s intricate pastry work has won awards and
                      delighted customers with unique flavor combinations.
                    </p>
                  </div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Sarah Johnson</h3>
              <p className='text-amber-600 font-medium'>Pastry Chef</p>
            </div>

            {/* Team Member 3 */}
            <div className='group'>
              <div className='relative overflow-hidden rounded-xl mb-4'>
                <Image
                  src='/chef-4.jpg'
                  alt='Head Barista'
                  width={300}
                  height={400}
                  className='w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end'>
                  <div className='p-4 w-full text-white'>
                    <p className='text-sm'>
                      David is passionate about coffee and has trained in
                      specialty brewing techniques from around the world.
                    </p>
                  </div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>
                David Rodriguez
              </h3>
              <p className='text-amber-600 font-medium'>Head Barista</p>
            </div>

            {/* Team Member 4 */}
            <div className='group'>
              <div className='relative overflow-hidden rounded-xl mb-4'>
                <Image
                  src='/chef-4.jpg'
                  alt='Restaurant Manager'
                  width={300}
                  height={400}
                  className='w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-300'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end'>
                  <div className='p-4 w-full text-white'>
                    <p className='text-sm'>
                      Emma ensures our service is as exceptional as our food,
                      focusing on creating memorable guest experiences.
                    </p>
                  </div>
                </div>
              </div>
              <h3 className='text-xl font-bold text-gray-900'>Emma Taylor</h3>
              <p className='text-amber-600 font-medium'>Restaurant Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-sm font-medium tracking-wider uppercase mb-4'>
                Come By &amp; Say Hello
              </span>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                Visit Our Café
              </h2>
              <p className='text-lg text-gray-700 mb-8'>
                We&apos;d love to welcome you to Unique Café. Join us for a
                meal, a coffee, or just to say hello.
              </p>

              <div className='space-y-4'>
                <div className='flex items-start'>
                  <MapPin className='h-6 w-6 text-amber-600 mt-1 mr-3 flex-shrink-0' />
                  <div>
                    <h3 className='font-bold text-gray-900'>Location</h3>
                    <p className='text-gray-700'>
                      123 Main Street, Anytown, CA 90210
                    </p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <Clock className='h-6 w-6 text-amber-600 mt-1 mr-3 flex-shrink-0' />
                  <div>
                    <h3 className='font-bold text-gray-900'>Hours</h3>
                    <p className='text-gray-700'>
                      Monday - Friday: 7:00 AM - 10:00 PM
                    </p>
                    <p className='text-gray-700'>
                      Saturday - Sunday: 8:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-8'>
                <Link  href='/contact'
                  className='inline-flex items-center px-6 py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors duration-200'>  Contact Us</Link>
               
              </div>
            </div>

            <div className='relative'>
              <div className='aspect-[4/3] rounded-xl overflow-hidden shadow-xl'>
                <iframe
                  src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789012345678!2d-118.32462734867732!3d34.09781502112843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDA1JzUyLjEiTiAxMTjCsDE5JzI4LjciVw!5e0!3m2!1sen!2sus!4v1660000000000!5m2!1sen!2sus'
                  width='100%'
                  height='100%'
                  style={{ border: 0 }}
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                  className='absolute inset-0'
                  title='Unique Café Location'
                  aria-label='Google Map showing the location of Unique Café'
                ></iframe>
              </div>
              <div className='absolute -bottom-6 -left-6 h-32 w-32 bg-amber-500 rounded-full opacity-10'></div>
              <div className='absolute -top-6 -right-6 h-32 w-32 bg-amber-500 rounded-full opacity-10'></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-sm font-medium tracking-wider uppercase mb-4'>
              What People Say
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Customer Testimonials
            </h2>
            <p className='text-lg text-gray-700 max-w-3xl mx-auto'>
              We&apos;re honored to be a part of our customers&apos; special
              moments and everyday lives.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-gray-50 p-8 rounded-xl'>
              <div className='flex items-center mb-4'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className='w-5 h-5 text-amber-500'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-700 mb-6 italic'>
                &quot;The atmosphere is charming, and the food is consistently
                excellent. The staff goes above and beyond to make you feel
                welcome.&quot;
              </p>
              <div className='flex items-center'>
                <div className='mr-4 w-12 h-12 rounded-full overflow-hidden'>
                  <Image
                    src='/customer-1.jpg'
                    alt='Customer'
                    width={48}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>Jennifer P.</h4>
                  <p className='text-sm text-gray-600'>Regular Customer</p>
                </div>
              </div>
            </div>

            <div className='bg-gray-50 p-8 rounded-xl'>
              <div className='flex items-center mb-4'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className='w-5 h-5 text-amber-500'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-700 mb-6 italic'>
                &quot;As a coffee enthusiast, I can say that Unique Café serves
                some of the best specialty coffee I&apos;ve had. Their pastries
                are also amazing!&quot;
              </p>
              <div className='flex items-center'>
                <div className='mr-4 w-12 h-12 rounded-full overflow-hidden'>
                  <Image
                    src='/customer-2.jpg'
                    alt='Customer'
                    width={48}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>Marcus T.</h4>
                  <p className='text-sm text-gray-600'>Coffee Blogger</p>
                </div>
              </div>
            </div>

            <div className='bg-gray-50 p-8 rounded-xl'>
              <div className='flex items-center mb-4'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className='w-5 h-5 text-amber-500'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                ))}
              </div>
              <p className='text-gray-700 mb-6 italic'>
                &quot;We hosted our anniversary dinner here and the staff made
                it so special. The food was exquisite and the service
                impeccable.&quot;
              </p>
              <div className='flex items-center'>
                <div className='mr-4 w-12 h-12 rounded-full overflow-hidden'>
                  <Image
                    src='/customer-3.jpg'
                    alt='Customer'
                    width={48}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <h4 className='font-bold text-gray-900'>Sarah & John</h4>
                  <p className='text-sm text-gray-600'>Private Event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
