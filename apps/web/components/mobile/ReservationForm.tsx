'use client';

import React from 'react';
import { Button } from 'components/ui/button';

export const ReservationForm = () => {
  return (
    <div className="w-full bg-[#0F172A] p-6 md:p-12 rounded-none md:rounded-2xl mt-12 md:mt-24 shadow-2xl">
      <div className="text-center md:text-left mb-8">
        <h5 className="text-[#F59E0B] font-medium tracking-wider uppercase mb-2">Reservation</h5>
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
          Book A Table Online
        </h2>
      </div>

      <form className="space-y-4 md:space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="relative">
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="relative">
            <input
              type="email"
              id="email"
              placeholder="Your Email"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="relative">
            <input
              type="datetime-local"
              id="datetime"
              placeholder="Date & Time"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all placeholder:text-gray-400 appearance-none"
            />
          </div>
          <div className="relative">
            <select
              id="people"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all appearance-none"
            >
              <option value="1" className="text-gray-900">
                1 Person
              </option>
              <option value="2" className="text-gray-900">
                2 People
              </option>
              <option value="3" className="text-gray-900">
                3 People
              </option>
              <option value="4" className="text-gray-900">
                4+ People
              </option>
            </select>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="message"
            placeholder="Special Request"
            rows={4}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] transition-all placeholder:text-gray-400 resize-none"
          ></textarea>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#F59E0B] hover:bg-yellow-500 text-white py-6 text-xl font-bold rounded-xl shadow-xl min-h-[56px] mt-4"
        >
          Book Now
        </Button>
      </form>
    </div>
  );
};
