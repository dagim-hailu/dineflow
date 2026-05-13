'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((curr) => (curr + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="w-full shrink-0 px-2 sm:px-4 md:w-1/2 lg:w-1/3">
              <blockquote className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md h-full bg-primary text-primary-foreground group hover:scale-[1.02]">
                <p className="text-sm italic text-primary-foreground/90">
                  Dolor et eos labore, stet justo sed est sed. Diam sed sed dolor stet amet eirmod
                  eos labore diam.
                </p>
                <footer className="mt-4 flex items-center gap-3">
                  <img
                    src={`/img/testimonial-${num}.jpg`}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-primary-foreground">Client name</p>
                    <p className="text-xs text-primary-foreground/80">Guest</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-3 w-3 rounded-full transition-all duration-300 ring-2 ring-transparent ring-offset-2 ring-offset-background',
              current === i ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/50',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
