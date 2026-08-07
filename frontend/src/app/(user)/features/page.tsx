'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function FeaturesShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Technology stack information
  const technologies = [
    {
      name: 'Next.js 15',
      description:
        'Latest React framework with server components and app router',
    },
    {
      name: 'React 19',
      description: 'Modern UI library with hooks and functional components',
    },
    {
      name: 'TypeScript',
      description: 'Type-safe JavaScript for better developer experience',
    },
    {
      name: 'Tailwind CSS 4',
      description: 'Utility-first CSS framework for rapid UI development',
    },
    {
      name: 'Heroicons & Lucide',
      description: 'Beautiful icon libraries for consistent UI elements',
    },
    {
      name: 'Framer Motion',
      description: 'Animation library for smooth UI transitions',
    },
    { name: 'Axios', description: 'HTTP client for secure API requests' },
  ];

  // Features data with detailed steps and tech used for each feature
  const features = [
    {
      id: 'hero',
      title: 'Engaging Hero Section',
      description:
        'Captivate visitors with our stunning hero section featuring beautiful imagery, clear branding, and prominent call-to-action buttons to drive conversions.',
      screenshot: '/screenshots/hero-section.jpg',
      link: '/',
      techUsed: [
        'Next.js Image Optimization',
        'Tailwind CSS Gradients',
        'CSS Transitions',
      ],
      steps: [
        'Attention-grabbing high-resolution background image that sets the tone for your brand',
        'Clear restaurant branding with logo and name prominently displayed',
        'Compelling tagline that communicates your unique value proposition',
        'Strategic call-to-action buttons for ordering and menu viewing',
        'Responsive design that looks beautiful on all devices',
      ],
    },
    {
      id: 'menu',
      title: 'Interactive Menu',
      description:
        'Browse our extensive menu with filtering options, beautiful food photography, and detailed descriptions to help customers find exactly what they want.',
      screenshot: '/screenshots/menu-page.jpg',
      link: '/menu',
      techUsed: [
        'React State Management',
        'Dynamic Filtering',
        'CSS Grid Layout',
        'TypeScript Interfaces',
      ],
      steps: [
        'Category-based filtering to help customers navigate your menu easily',
        'Search functionality to find specific dishes quickly',
        'High-quality food photography that showcases each dish',
        'Detailed descriptions including ingredients, spice levels, and allergens',
        'Price and portion information clearly displayed',
        'Option to add items directly to cart from the menu page',
      ],
    },
    {
      id: 'ordering',
      title: 'Seamless Ordering',
      description:
        'Our streamlined checkout process makes it easy for customers to place orders with customization options and secure payment processing.',
      screenshot: '/screenshots/checkout-page.jpg',
      link: '/checkout',
      techUsed: [
        'React Context API',
        'Form Validation',
        'Secure Payment Integration',
        'Order State Management',
      ],
      steps: [
        'Intuitive item customization (special instructions, ingredient modifications, etc.)',
        'Easy cart management with ability to add, remove, or change quantities',
        'Clear order summary showing all items, modifications, and total cost',
        'Multiple delivery options (pickup, delivery, scheduled orders)',
        'Integrated secure payment processing with multiple payment methods',
        'Order confirmation with estimated preparation and delivery times',
      ],
    },
    {
      id: 'profiles',
      title: 'Customer Profiles',
      description:
        'Users can create accounts to track order history, save favorite items, and enjoy a personalized experience with faster checkout.',
      screenshot: '/screenshots/profile-page.jpg',
      link: '/profile',
      techUsed: [
        'JWT Authentication',
        'Persistent Storage',
        'Custom Hooks',
        'Route Protection',
      ],
      steps: [
        'Simple registration and login process with social media integration',
        'Saved addresses for faster delivery checkout',
        'Order history with ability to reorder previous meals',
        'Favorite items list for quick access to preferred dishes',
        'Saved payment methods for one-click checkout',
        'Profile customization with dietary preferences and allergen information',
      ],
    },
    {
      id: 'dashboard',
      title: 'Admin Dashboard',
      description:
        'Powerful admin controls to manage menu items, track orders, analyze sales data, and optimize your restaurant operations.',
      screenshot: '/screenshots/dashboard.jpg',
      link: '/dashboard',
      techUsed: [
        'Role-Based Access Control',
        'Data Visualization',
        'Real-time Updates',
        'Form Handling',
      ],
      steps: [
        'Real-time order management with status updates and notifications',
        'Menu editor to add, remove, or modify items and pricing',
        'Inventory management to track ingredient levels and popular items',
        'Customer database with ordering history and preferences',
        'Sales analytics with customizable reports and insights',
        'Staff management with role-based access controls',
      ],
    },
    {
      id: 'responsive',
      title: 'Fully Responsive Design',
      description:
        'The website adapts beautifully to all devices, ensuring a great user experience whether customers visit from desktop, tablet, or mobile.',
      screenshot: '/screenshots/responsive-design.jpg',
      link: '/',
      techUsed: [
        'Tailwind Responsive Classes',
        'Mobile-First Approach',
        'Media Queries',
        'Flexible Layout System',
      ],
      steps: [
        'Optimized layouts for desktop, tablet, and mobile devices',
        'Touch-friendly interface elements for mobile users',
        'Fast loading times across all devices and connection speeds',
        'Consistent branding and user experience across all screen sizes',
        'Mobile-specific features such as click-to-call and location-based services',
        'Accessibility features that ensure everyone can use your website',
      ],
    },
    {
      id: 'tech-stack',
      title: 'Modern Technology Stack',
      description:
        'Our project is built with cutting-edge technologies that ensure performance, security, and maintainability.',
      screenshot: '/screenshots/responsive-design.jpg',
      link: '/',
      techUsed: technologies.map((tech) => tech.name),
      steps: technologies.map((tech) => `${tech.name}: ${tech.description}`),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentFeature = features[currentSlide];

  return (
    <main className='py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6'>
          Project <span className='text-amber-500'>Overview</span>
        </h1>
        <p className='max-w-3xl mx-auto text-xl text-gray-600 mb-8'>
          A comprehensive look at our restaurant website&apos;s features and the
          cutting-edge technologies that power them.
        </p>

        {/* Slide indicator */}
        <div className='flex justify-center gap-2 mb-8'>
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-amber-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Current slide */}
      <div className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-12'>
        <div className='flex flex-col lg:flex-row'>
          {/* Image section */}
          <div className='w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-100'>
            <div className='aspect-[4/3] relative'>
              <Image
                src={currentFeature.screenshot}
                alt={currentFeature.title}
                fill
                className='object-cover'
              />
              <div className='absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-amber-700'>
                Slide {currentSlide + 1} of {features.length}
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className='w-full lg:w-1/2 p-6 md:p-8 lg:p-10'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 mb-4'>
              {currentFeature.title}
            </h2>
            <p className='text-lg text-gray-600 mb-6'>
              {currentFeature.description}
            </p>

            {/* Technologies used */}
            <div className='mb-6'>
              <h3 className='text-xl font-semibold mb-3 text-gray-800'>
                Technologies Used:
              </h3>
              <div className='flex flex-wrap gap-2'>
                {currentFeature.techUsed.map((tech, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm'
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Step by step details */}
            <div className='mb-8'>
              <h3 className='text-xl font-semibold mb-4 text-gray-800'>
                Key Features & Implementation:
              </h3>
              <ul className='space-y-3'>
                {currentFeature.steps.map((step, index) => (
                  <li key={index} className='flex items-start gap-3'>
                    <span className='flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium'>
                      {index + 1}
                    </span>
                    <span className='text-gray-700'>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA button - Only show for non-tech-stack slides */}
            {currentFeature.id !== 'tech-stack' && (
              <Link
                href={currentFeature.link}
                className='inline-flex items-center text-white bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg font-medium transition-colors duration-300'
              >
                View this feature
                <ArrowRightIcon className='ml-2 h-5 w-5' />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className='flex justify-between items-center'>
        <button
          onClick={prevSlide}
          className='flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors duration-300'
        >
          <ArrowLeftIcon className='h-5 w-5' />
          <span className='font-medium'>Previous Slide</span>
        </button>

        <button
          onClick={nextSlide}
          className='flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors duration-300'
        >
          <span className='font-medium'>Next Slide</span>
          <ArrowRightIcon className='h-5 w-5' />
        </button>
      </div>

      {/* Call to action */}
      <div className='bg-amber-50 rounded-2xl p-8 sm:p-12 text-center mt-16'>
        <h2 className='text-3xl font-bold mb-6'>
          Ready to see these features in action?
        </h2>
        <p className='text-lg text-gray-600 mb-8 max-w-3xl mx-auto'>
          Schedule a personalized demo to explore how our website can help grow
          your restaurant business.
        </p>
        <Link
          href='/contact'
          className='inline-block px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-all duration-300'
        >
          Request a Demo
        </Link>
      </div>
    </main>
  );
}
