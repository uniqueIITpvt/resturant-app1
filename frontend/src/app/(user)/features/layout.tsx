import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Features - Unique Café',
  description:
    'Explore the powerful features of our restaurant website designed to enhance your online presence and delight your customers.',
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='pt-16'>{children}</div>;
}
