'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 45);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path ? 'nav-item nav-link active' : 'nav-item nav-link';
  };

  const isDropdownActive = (paths: string[]) => {
    return paths.includes(pathname)
      ? 'nav-link dropdown-toggle active'
      : 'nav-link dropdown-toggle';
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-dark bg-dark px-4 px-lg-5 py-3 py-lg-0 ${isSticky ? 'sticky-top shadow-sm' : ''}`}
    >
      <Link href="/" className="navbar-brand p-0">
        <h1 className="text-primary m-0">
          <i className="fa fa-utensils me-3"></i>Restoran
        </h1>
        {/* <img src="img/logo.png" alt="Logo"> */}
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="fa fa-bars"></span>
      </button>
      <div
        className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}
        id="navbarCollapse"
      >
        <div className="navbar-nav ms-auto py-0 pe-4">
          <Link href="/" className={isActive('/')}>
            Home
          </Link>
          <Link href="/about" className={isActive('/about')}>
            About
          </Link>
          <Link href="/service" className={isActive('/service')}>
            Service
          </Link>
          <Link href="/menu" className={isActive('/menu')}>
            Menu
          </Link>
          <div
            className="nav-item dropdown"
            onMouseEnter={() => window.innerWidth >= 992 && setIsDropdownOpen(true)}
            onMouseLeave={() => window.innerWidth >= 992 && setIsDropdownOpen(false)}
          >
            <a
              href="#"
              className={isDropdownActive(['/booking', '/team', '/testimonial', '/admin'])}
              onClick={(e) => {
                e.preventDefault();
                if (window.innerWidth < 992) setIsDropdownOpen(!isDropdownOpen);
              }}
              aria-expanded={isDropdownOpen ? 'true' : 'false'}
            >
              Pages
            </a>
            <div className={`dropdown-menu m-0 ${isDropdownOpen ? 'show' : ''}`}>
              <Link href="/booking" className="dropdown-item">
                Booking
              </Link>
              <Link href="/team" className="dropdown-item">
                Our Team
              </Link>
              <Link href="/testimonial" className="dropdown-item">
                Testimonial
              </Link>
              <a href="/adminE.html" className="dropdown-item">
                Admin
              </a>
            </div>
          </div>
          <Link href="/contact" className={isActive('/contact')}>
            Contact
          </Link>
        </div>
        <Link href="/booking" className="btn btn-primary py-2 px-4">
          Book A Table
        </Link>
      </div>
    </nav>
  );
}
