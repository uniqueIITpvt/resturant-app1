import AboutCafe from '@/components/home/AboutCafe';
import MenuHighlights from '@/components/home/MenuHighlights';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Testimonials from '@/components/home/Testimonials';
import ContactInfo from '@/components/home/ContactInfo';
import Hero from '@/components/home/Hero';
import EventOffers from '@/components/marketing/EventOffers';
import ProductsShowcase from '@/components/products/ProductsShowcase';
import InstagramReels from '@/components/marketing/InstagramReels';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';

export default function Home() {
  return (
    <main>
      <Hero />
      <div className='pt-16'>
        <EventOffers />
        <MenuHighlights />
        <ProductsShowcase />
        <FeaturedProducts />
        <InstagramReels />
        <Testimonials />
        <AboutCafe />
        <ContactInfo />
        <NewsletterSignup />
      </div>
      {/* Other homepage sections can be added below */}
    </main>
  );
}
