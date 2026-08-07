import React from 'react';

type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * PageWrapper component that ensures correct spacing below the navbar
 * Use this component to wrap content in pages where the layout might
 * be collapsing with the navbar
 */
export default function PageWrapper({
  children,
  className = '',
}: PageWrapperProps) {
  return <div className={`pt-16 ${className}`}>{children}</div>;
}
