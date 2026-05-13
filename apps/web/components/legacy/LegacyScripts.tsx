'use client';
import { useEffect } from 'react';

export default function LegacyScripts() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load jQuery and plugins logic if needed, but since they are loaded via <Script> in layout,
      // we just need to initialize them here.

      const initPlugins = () => {
        const $ = (window as any).jQuery;
        if (!$) return;

        // Initiate the wowjs
        if ((window as any).WOW) {
          new (window as any).WOW().init();
        }

        // Facts counter
        if ($.fn.counterUp) {
          $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000,
          });
        }

        // Testimonials carousel
        if ($.fn.owlCarousel) {
          $('.testimonial-carousel').owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            center: true,
            margin: 24,
            dots: true,
            loop: true,
            nav: false,
            responsive: {
              0: {
                items: 1,
              },
              768: {
                items: 2,
              },
              992: {
                items: 3,
              },
            },
          });
        }
      };

      // Check if jQuery is loaded, if not, wait a bit
      if ((window as any).jQuery) {
        initPlugins();
      } else {
        const interval = setInterval(() => {
          if ((window as any).jQuery) {
            initPlugins();
            clearInterval(interval);
          }
        }, 100);
        // Clear interval after 5 seconds to prevent infinite loop
        setTimeout(() => clearInterval(interval), 5000);
      }
    }
  }, []);

  return null;
}
