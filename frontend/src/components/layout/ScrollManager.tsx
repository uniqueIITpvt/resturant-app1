'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollManager() {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Enable browser's scroll restoration for refreshes
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto';
    }

    // Only scroll to top on route changes (not on initial load/refresh)
    if (!isInitialLoad.current && pathname !== lastPathname.current) {
      window.scrollTo(0, 0);
    }

    lastPathname.current = pathname;
    isInitialLoad.current = false;
  }, [pathname]);

  useEffect(() => {
    // Prevent unwanted focus scrolling that might cause footer jumping
    const preventFocusScroll = (e: FocusEvent) => {
      if (
        e.target &&
        e.target instanceof HTMLElement &&
        isInitialLoad.current
      ) {
        // Only prevent focus scrolling on initial load, not during user interaction
        const originalScrollIntoView = e.target.scrollIntoView;
        e.target.scrollIntoView = () => {}; // Temporarily disable

        // Restore after a short delay
        setTimeout(() => {
          if (e.target instanceof HTMLElement) {
            e.target.scrollIntoView = originalScrollIntoView;
          }
        }, 1000);
      }
    };

    // Only add focus prevention on initial page load
    if (isInitialLoad.current) {
      document.addEventListener('focus', preventFocusScroll, true);

      // Remove the event listener after page is fully loaded
      const timer = setTimeout(() => {
        document.removeEventListener('focus', preventFocusScroll, true);
      }, 2000);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('focus', preventFocusScroll, true);
      };
    }
  }, []);

  return null;
}
