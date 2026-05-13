'use client';
import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <a
      href="#"
      className={`btn btn-lg btn-primary btn-lg-square back-to-top ${isVisible ? 'd-flex' : 'd-none'}`}
      onClick={scrollToTop}
      style={{
        display: isVisible ? 'flex' : 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s',
      }}
    >
      <i className="bi bi-arrow-up"></i>
    </a>
  );
}
