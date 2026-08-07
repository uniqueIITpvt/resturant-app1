'use client';

import {
  MapPin,
  Phone,
  Clock,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Calendar,
  ExternalLink,
  Globe,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

export default function ContactInfo() {
  return (
    <section className='py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-amber-50/30 to-white'>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-[15%] w-64 h-64 bg-amber-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-amber-400 rounded-full opacity-40"></div>
        <div className="absolute bottom-40 right-[10%] w-8 h-8 bg-amber-300 rounded-full opacity-30"></div>
      </div>
      
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-2xl mx-auto text-center mb-16'>
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs tracking-wider uppercase mb-3">
            <MessageSquare className="inline-block w-3.5 h-3.5 mr-2" />
            Get In Touch
          </span>
          
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Visit Our Restaurant</span>
          </h2>
          
          <p className='text-gray-600 md:text-lg'>
            We&apos;d love to welcome you to our restaurant. Here&apos;s
            everything you need to know to find us and get in touch.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto'>
          {/* Location Card */}
          <div className='bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-gradient-to-r from-amber-500 to-amber-400 p-3.5 rounded-full mb-6 text-white shadow-lg'>
                <MapPin className='h-7 w-7' />
              </div>
              
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Our Location
              </h3>
              
              <div className="w-12 h-1 bg-amber-200 rounded-full mb-4"></div>
              
              <div className='text-gray-600 mb-6 space-y-1'>
                <p className="font-medium">123 Gourmet Avenue</p>
                <p>Culinary District</p>
                <p>Foodie City, FC 12345</p>
              </div>
              
              <Link
                href='https://maps.google.com'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center px-5 py-2.5 rounded-full bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors duration-300 group'
              >
                <span>Get Directions</span>
                <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Hours Card */}
          <div className='bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-gradient-to-r from-amber-500 to-amber-400 p-3.5 rounded-full mb-6 text-white shadow-lg'>
                <Clock className='h-7 w-7' />
              </div>
              
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Opening Hours
              </h3>
              
              <div className="w-12 h-1 bg-amber-200 rounded-full mb-4"></div>
              
              <div className='text-gray-600 space-y-3 mb-6 w-full'>
                <div className='flex justify-between w-full border-b border-gray-100 pb-2'>
                  <span className='font-medium'>Monday - Friday</span>
                  <span className="bg-amber-50 px-2.5 py-0.5 rounded-full text-amber-700 text-sm">8:00 AM - 10:00 PM</span>
                </div>
                <div className='flex justify-between w-full border-b border-gray-100 pb-2'>
                  <span className='font-medium'>Saturday</span>
                  <span className="bg-amber-50 px-2.5 py-0.5 rounded-full text-amber-700 text-sm">9:00 AM - 11:00 PM</span>
                </div>
                <div className='flex justify-between w-full pb-2'>
                  <span className='font-medium'>Sunday</span>
                  <span className="bg-amber-50 px-2.5 py-0.5 rounded-full text-amber-700 text-sm">10:00 AM - 9:00 PM</span>
                </div>
              </div>
              
              <Link
                href='/reservation'
                className='inline-flex items-center px-5 py-2.5 rounded-full bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors duration-300 group'
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>Make a Reservation</span>
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Contact Card */}
          <div className='bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full'>
            <div className='flex flex-col items-center text-center'>
              <div className='bg-gradient-to-r from-amber-500 to-amber-400 p-3.5 rounded-full mb-6 text-white shadow-lg'>
                <Phone className='h-7 w-7' />
              </div>
              
              <h3 className='text-xl font-bold text-gray-900 mb-4'>
                Contact Us
              </h3>
              
              <div className="w-12 h-1 bg-amber-200 rounded-full mb-4"></div>
              
              <div className='text-gray-600 space-y-4 mb-6 w-full'>
                <a 
                  href='tel:+1234567890' 
                  className='flex items-center justify-center p-3 rounded-lg hover:bg-amber-50 transition-colors duration-300 group'
                >
                  <Phone className='h-5 w-5 mr-3 text-amber-500' />
                  <span className="group-hover:text-amber-700 transition-colors duration-300">(123) 456-7890</span>
                </a>
                
                <a 
                  href='mailto:info@restaurant.com' 
                  className='flex items-center justify-center p-3 rounded-lg hover:bg-amber-50 transition-colors duration-300 group'
                >
                  <Mail className='h-5 w-5 mr-3 text-amber-500' />
                  <span className="group-hover:text-amber-700 transition-colors duration-300">info@restaurant.com</span>
                </a>
                
                <a 
                  href='https://www.restaurant.com' 
                  className='flex items-center justify-center p-3 rounded-lg hover:bg-amber-50 transition-colors duration-300 group'
                >
                  <Globe className='h-5 w-5 mr-3 text-amber-500' />
                  <span className="group-hover:text-amber-700 transition-colors duration-300">www.restaurant.com</span>
                </a>
              </div>
              
              <div className='flex space-x-4 mt-2'>
                <a 
                  href='#' 
                  aria-label="Facebook"
                  className='bg-white p-3 rounded-full shadow-sm text-gray-500 hover:text-amber-600 hover:shadow transition-all duration-300'
                >
                  <Facebook className='h-5 w-5' />
                </a>
                <a 
                  href='#' 
                  aria-label="Instagram"
                  className='bg-white p-3 rounded-full shadow-sm text-gray-500 hover:text-amber-600 hover:shadow transition-all duration-300'
                >
                  <Instagram className='h-5 w-5' />
                </a>
                <a 
                  href='#' 
                  aria-label="Twitter"
                  className='bg-white p-3 rounded-full shadow-sm text-gray-500 hover:text-amber-600 hover:shadow transition-all duration-300'
                >
                  <Twitter className='h-5 w-5' />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section - Optional */}
        <div className="mt-16 max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d741.9760976965966!2d-88.07895663040048!3d41.93790579580941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fac8f4f1b9435%3A0x88d66ca23d986bd4!2sShaahi%20Biryani!5e0!3m2!1sen!2sin!4v1746440445536!5m2!1sen!2sin" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
            title="Shaahi Biryani Location Map"
            className="w-full"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
