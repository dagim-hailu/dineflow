'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const MobileFooter = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-12 pb-24 md:pb-12 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="text-[#F59E0B] font-medium text-xl mb-6">Company</h4>
          <nav className="flex flex-col space-y-4">
            <Link
              href="#about"
              className="hover:text-[#F59E0B] transition-colors min-h-[44px] flex items-center"
            >
              About Us
            </Link>
            <Link
              href="#contact"
              className="hover:text-[#F59E0B] transition-colors min-h-[44px] flex items-center"
            >
              Contact Us
            </Link>
            <Link
              href="#reservation"
              className="hover:text-[#F59E0B] transition-colors min-h-[44px] flex items-center"
            >
              Reservation
            </Link>
            <Link
              href="#privacy"
              className="hover:text-[#F59E0B] transition-colors min-h-[44px] flex items-center"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="text-[#F59E0B] font-medium text-xl mb-6">Contact</h4>
          <div className="flex flex-col space-y-4">
            <p className="flex items-center text-gray-300 min-h-[44px]">
              <MapPin className="w-5 h-5 mr-3 text-[#F59E0B]" />
              123 Street, New York, USA
            </p>
            <p className="flex items-center text-gray-300 min-h-[44px]">
              <Phone className="w-5 h-5 mr-3 text-[#F59E0B]" />
              <a href="tel:+0123456789">+012 345 67890</a>
            </p>
            <p className="flex items-center text-gray-300 min-h-[44px]">
              <Mail className="w-5 h-5 mr-3 text-[#F59E0B]" />
              <a href="mailto:info@example.com">info@example.com</a>
            </p>
          </div>

          <div className="flex space-x-2 mt-6">
            <a
              href="#"
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#F59E0B] hover:border-[#F59E0B] transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#F59E0B] hover:border-[#F59E0B] transition-all"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#F59E0B] hover:border-[#F59E0B] transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[#F59E0B] font-medium text-xl mb-6">Opening</h4>
          <div className="space-y-4 text-gray-300">
            <div>
              <h5 className="text-white font-medium">Monday - Saturday</h5>
              <p>09AM - 09PM</p>
            </div>
            <div>
              <h5 className="text-white font-medium">Sunday</h5>
              <p>10AM - 08PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Restoran. All Rights Reserved.</p>
      </div>
    </footer>
  );
};
