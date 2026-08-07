'use client';

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Calendar,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Client-only component for the realtime clock
function RealtimeClock() {
  const [dateTime, setDateTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format date to display
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateTime);

  // Format time to display
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(dateTime);

  // Only render on client-side to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className='h-[60px] sm:h-[65px] w-full flex justify-center items-center'>
        <div className='bg-white/10 backdrop-blur-sm rounded-xl py-2 sm:py-4 px-4 sm:px-8 shadow-lg'>
          <div className='animate-pulse bg-white/20 h-5 w-40 rounded'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='bg-white/10 backdrop-blur-sm rounded-xl py-2 sm:py-4 px-4 sm:px-8 shadow-lg inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm sm:text-base'>
        <div className='flex items-center gap-2 text-white'>
          <Calendar className='w-4 h-4 sm:w-6 sm:h-6' />
          <span className='text-base sm:text-lg font-medium'>{formattedDate}</span>
        </div>
        <div className='hidden sm:block h-8 w-px bg-white/30'></div>
        <div className='flex items-center gap-2 text-white'>
          <Clock className='w-4 h-4 sm:w-6 sm:h-6 animate-pulse' />
          <span className='text-base sm:text-lg font-medium tracking-wide font-mono'>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className='bg-white pt-16 sm:pt-16'>
      {/* Hero section with realtime clock */}
      <section className='relative h-[30vh] sm:h-[35vh] md:h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800'>
        <div className='absolute inset-0 z-0 bg-pattern opacity-10'></div>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6'>
            Contact Us
          </h1>
          <RealtimeClock />
          <p className='text-base sm:text-lg md:text-xl text-white/90 max-w-xl sm:max-w-2xl mx-auto mt-4 sm:mt-6 px-4'>
            We&apos;d love to hear from you. Reach out with any questions or
            feedback.
          </p>
        </div>
      </section>

      {/* Mobile menu toggle button */}
      <div className='fixed top-4 right-4 z-50 sm:hidden'>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className='p-2 bg-amber-600 text-white rounded-full shadow-lg'
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile navigation overlay */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 bg-black/80 z-40 sm:hidden flex flex-col items-center justify-center space-y-6 p-4'>
          <a
            href='#contact-info'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-white text-xl font-medium'
          >
            Contact Info
          </a>
          <a
            href='#message-form'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-white text-xl font-medium'
          >
            Send Message
          </a>
          <a
            href='#location'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-white text-xl font-medium'
          >
            Our Location
          </a>
          <a
            href='#faq'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-white text-xl font-medium'
          >
            FAQs
          </a>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className='mt-8 px-6 py-2 bg-amber-600 text-white rounded-lg'
          >
            Close Menu
          </button>
        </div>
      )}

      {/* Contact Information Section */}
      <section id='contact-info' className='py-12 sm:py-16 bg-amber-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4 sm:mb-6'>
                <Phone className='h-5 w-5 sm:h-6 sm:w-6 text-amber-700' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>Phone</h3>
              <p className='text-gray-700'>(555) 123-4567</p>
              <a
                href='tel:+15551234567'
                className='mt-3 sm:mt-4 text-amber-600 hover:text-amber-700 font-medium inline-flex items-center'
              >
                <Phone className='w-4 h-4 mr-1' />
                <span>Call Us</span>
              </a>
            </div>

            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4 sm:mb-6'>
                <Mail className='h-5 w-5 sm:h-6 sm:w-6 text-amber-700' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>Email</h3>
              <p className='text-gray-700'>info@uniquecafe.com</p>
              <a
                href='mailto:info@uniquecafe.com'
                className='mt-3 sm:mt-4 text-amber-600 hover:text-amber-700 font-medium inline-flex items-center'
              >
                <Mail className='w-4 h-4 mr-1' />
                <span>Send Email</span>
              </a>
            </div>

            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4 sm:mb-6'>
                <MapPin className='h-5 w-5 sm:h-6 sm:w-6 text-amber-700' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>Location</h3>
              <p className='text-gray-700'>
                123 Main Street
                <br />
                Anytown, CA 90210
              </p>
              <a
                href='https://maps.google.com/?q=123+Main+Street+Anytown+CA+90210'
                target='_blank'
                rel='noopener noreferrer'
                className='mt-3 sm:mt-4 text-amber-600 hover:text-amber-700 font-medium inline-flex items-center'
              >
                <MapPin className='w-4 h-4 mr-1' />
                <span>Get Directions</span>
              </a>
            </div>

            <div className='bg-white p-6 sm:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4 sm:mb-6'>
                <Clock className='h-5 w-5 sm:h-6 sm:w-6 text-amber-700' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>Hours</h3>
              <p className='text-gray-700'>
                Mon-Fri: 7AM - 10PM
                <br />
                Sat-Sun: 8AM - 11PM
              </p>
              <a
                href='#reservation'
                className='mt-3 sm:mt-4 text-amber-600 hover:text-amber-700 font-medium inline-flex items-center'
              >
                <Calendar className='w-4 h-4 mr-1' />
                <span>Make a Reservation</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form and Map Section */}
      <section className='py-12 sm:py-16'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
            {/* Contact Form */}
            <div id='message-form'>
              <div className='mb-6 sm:mb-8'>
                <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4'>
                  Get In Touch
                </span>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>
                  Send Us a Message
                </h2>
                <p className='text-base sm:text-lg text-gray-700'>
                  Have a question, feedback, or want to make a reservation? Fill
                  out the form below and we&apos;ll get back to you as soon as
                  possible.
                </p>
              </div>

              <form className='space-y-4 sm:space-y-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Name
                    </label>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      className='w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base'
                      placeholder='Your name'
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Email
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      className='w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base'
                      placeholder='Your email'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='phone'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    className='w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base'
                    placeholder='Your phone number'
                  />
                </div>

                <div>
                  <label
                    htmlFor='subject'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Subject
                  </label>
                  <select
                    id='subject'
                    name='subject'
                    className='w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base'
                    required
                  >
                    <option value=''>Select a subject</option>
                    <option value='reservation'>Reservation</option>
                    <option value='pizza'>Pizza Inquiry</option>
                    <option value='beverages'>Beverages Inquiry</option>
                    <option value='salads'>Salads Inquiry</option>
                    <option value='main-course'>Main Course Inquiry</option>
                    <option value='catering'>Catering Services</option>
                    <option value='feedback'>General Feedback</option>
                    <option value='other'>Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='message'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Message
                  </label>
                  <textarea
                    id='message'
                    name='message'
                    rows={4}
                    className='w-full p-2.5 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base'
                    placeholder='Your message'
                    required
                  ></textarea>
                </div>

                <div>
                  <button
                    type='submit'
                    className='inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors duration-200 text-sm sm:text-base'
                  >
                    <Send size={18} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Map */}
            <div id='location' className='order-first lg:order-last mb-8 lg:mb-0'>
              <div className='mb-6 sm:mb-8'>
                <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4'>
                  Our Location
                </span>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>
                  Find Us Here
                </h2>
                <p className='text-base sm:text-lg text-gray-700'>
                  We&apos;re conveniently located in the heart of downtown.
                  Plenty of parking available nearby.
                </p>
              </div>

              <div className='aspect-[4/3] rounded-xl overflow-hidden shadow-xl relative'>
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

              <div className='mt-4 sm:mt-6 space-y-3 sm:space-y-4'>
                <div className='flex items-start space-x-2'>
                  <MapPin className='h-5 w-5 text-amber-600 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-medium text-gray-900'>Address</h3>
                    <p className='text-gray-700 text-sm sm:text-base'>
                      123 Main Street, Anytown, CA 90210
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-2'>
                  <MessageSquare className='h-5 w-5 text-amber-600 mt-1 flex-shrink-0' />
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      Additional Information
                    </h3>
                    <p className='text-gray-700 text-sm sm:text-base'>
                      Parking available in the rear. Accessible entrance on the
                      south side of the building.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='py-12 sm:py-16 bg-gray-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-8 sm:mb-12'>
            <span className='inline-block py-1 px-3 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium tracking-wider uppercase mb-3 sm:mb-4'>
              Frequently Asked Questions
            </span>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>
              Common Questions
            </h2>
            <p className='text-base sm:text-lg text-gray-700 max-w-2xl sm:max-w-3xl mx-auto'>
              We&apos;ve compiled answers to questions we often receive from our
              guests.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto'>
            <div className='bg-white p-5 sm:p-6 rounded-xl shadow-sm'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3'>
                Do you take reservations?
              </h3>
              <p className='text-gray-700 text-sm sm:text-base'>
                Yes, we recommend making reservations, especially for dinner
                service and weekends. You can call us directly or use our online
                reservation system.
              </p>
            </div>

            <div className='bg-white p-5 sm:p-6 rounded-xl shadow-sm'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3'>
                What types of food do you offer?
              </h3>
              <p className='text-gray-700 text-sm sm:text-base'>
                Our menu features a variety of options including specialty
                pizzas, refreshing beverages, fresh salads, and delicious main
                courses. We focus on using high-quality, locally-sourced
                ingredients in all our dishes.
              </p>
            </div>

            <div className='bg-white p-5 sm:p-6 rounded-xl shadow-sm'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3'>
                Do you offer catering services?
              </h3>
              <p className='text-gray-700 text-sm sm:text-base'>
                Yes, we offer catering for events of all sizes. Please contact
                us at least 72 hours in advance to discuss menu options and
                availability.
              </p>
            </div>

            <div className='bg-white p-5 sm:p-6 rounded-xl shadow-sm'>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3'>
                Can you accommodate dietary restrictions?
              </h3>
              <p className='text-gray-700 text-sm sm:text-base'>
                Absolutely! We offer vegetarian, vegan, and gluten-free options.
                Please inform your server about any allergies or dietary needs
                when ordering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-12 sm:py-16 bg-amber-600 text-white'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6'>
            Ready to Experience Unique Café?
          </h2>
          <p className='text-base sm:text-xl max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8'>
            Join us for a memorable dining experience with delicious food,
            exceptional service, and a warm atmosphere.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
            <a
              href='tel:+15551234567'
              className='px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-amber-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm sm:text-base'
            >
              <span className='flex items-center justify-center gap-2'>
                <Phone className='w-4 h-4' />
                Call Now
              </span>
            </a>
            <a
              href='#reservation'
              className='px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition-colors duration-200 text-sm sm:text-base'
            >
              <span className='flex items-center justify-center gap-2'>
                <Calendar className='w-4 h-4' />
                Make a Reservation
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
