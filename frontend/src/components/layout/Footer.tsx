'use client';

import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Utensils,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-gray-900 text-gray-200'>
      {/* Main Footer */}
      <div className='container mx-auto px-4 pt-16 pb-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* About */}
          <div className='space-y-4'>
            <div className='flex items-center mb-4'>
              <Utensils className='h-6 w-6 text-amber-500 mr-2' />
              <h2 className='text-xl font-bold text-white'>Restaurant</h2>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed'>
              We are dedicated to providing an exceptional dining experience
              with the finest ingredients and impeccable service in a warm and
              inviting atmosphere.
            </p>
            <div className='flex space-x-4 pt-2'>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-gray-800 p-2 rounded-full hover:bg-amber-600 transition-colors duration-300'
                aria-label='Facebook'
              >
                <Facebook className='h-5 w-5' />
              </a>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-gray-800 p-2 rounded-full hover:bg-amber-600 transition-colors duration-300'
                aria-label='Instagram'
              >
                <Instagram className='h-5 w-5' />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-gray-800 p-2 rounded-full hover:bg-amber-600 transition-colors duration-300'
                aria-label='Twitter'
              >
                <Twitter className='h-5 w-5' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4'>
              Quick Links
            </h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/menu'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>Our Menu</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/reservation'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>Reservations</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/gallery'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>Gallery</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy-policy'
                  className='text-gray-400 hover:text-amber-500 transition-colors flex items-center'
                >
                  <ChevronRight className='h-4 w-4 mr-1' />
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className='text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4'>
              Contact Us
            </h3>
            <ul className='space-y-3'>
              <li className='flex items-start'>
                <MapPin className='h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0' />
                <span className='text-gray-400'>
                  123 Gourmet Avenue
                  <br />
                  Culinary District
                  <br />
                  Foodie City, FC 12345
                </span>
              </li>
              <li className='flex items-center'>
                <Phone className='h-5 w-5 text-amber-500 mr-2 flex-shrink-0' />
                <a
                  href='tel:+1234567890'
                  className='text-gray-400 hover:text-amber-500 transition-colors'
                >
                  (123) 456-7890
                </a>
              </li>
              <li className='flex items-center'>
                <Mail className='h-5 w-5 text-amber-500 mr-2 flex-shrink-0' />
                <a
                  href='mailto:info@restaurant.com'
                  className='text-gray-400 hover:text-amber-500 transition-colors'
                >
                  info@restaurant.com
                </a>
              </li>
              <li className='flex items-start'>
                <Clock className='h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0' />
                <div className='text-gray-400'>
                  <p>Mon-Fri: 8:00 AM - 10:00 PM</p>
                  <p>Sat: 9:00 AM - 11:00 PM</p>
                  <p>Sun: 10:00 AM - 9:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Order Information */}
          <div>
            <h3 className='text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4'>
              Order Online
            </h3>
            <p className='text-gray-400 mb-4'>
              Enjoy our delicious meals from the comfort of your home. Order now
              for pickup or delivery.
            </p>
            <Link
              href='/order'
              className='bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md inline-flex items-center transition-colors duration-300'
            >
              <ShoppingBag className='h-5 w-5 mr-2' />
              Order Now
            </Link>
            <div className='mt-6'>
              <p className='text-sm text-gray-500 mb-2'>We accept:</p>
              <div className='flex items-center space-x-3'>
                <div className='bg-gray-800 p-1 rounded'>
                  <CreditCard className='h-8 w-8 text-gray-300' />
                </div>
                <div className='flex space-x-1'>
                  <span className='h-6 w-10 bg-blue-800 rounded'></span>
                  <span className='h-6 w-10 bg-red-600 rounded'></span>
                  <span className='h-6 w-10 bg-green-600 rounded'></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className='border-t border-gray-800'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm'>
              &copy; {currentYear} Restaurant. All rights reserved.
            </p>
            <div className='flex mt-4 md:mt-0 space-x-6'>
              <Link
                href='/terms'
                className='text-gray-400 hover:text-amber-500 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-gray-400 hover:text-amber-500 text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/sitemap'
                className='text-gray-400 hover:text-amber-500 text-sm'
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
