'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    datetime: '',
    people: '1',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reservation Details:', formData);
    // Formatting with date-fns example before submitting if needed
    if (formData.datetime) {
      const formattedDate = format(new Date(formData.datetime), 'MMMM do, yyyy h:mm a');
      console.log('Formatted Date:', formattedDate);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="col-md-6 bg-dark d-flex align-items-center">
      <div className="p-5 wow fadeInUp" data-wow-delay="0.2s">
        <h5 className="section-title ff-secondary text-start text-primary fw-normal">
          Reservation
        </h5>
        <h1 className="text-white mb-4">Book A Table Online</h1>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <label htmlFor="name">Your Name</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label htmlFor="email">Your Email</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="datetime-local"
                  className="form-control"
                  id="datetime"
                  placeholder="Date & Time"
                  value={formData.datetime}
                  onChange={handleChange}
                />
                <label htmlFor="datetime">Date & Time</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-floating">
                <select
                  className="form-select"
                  id="people"
                  value={formData.people}
                  onChange={handleChange}
                >
                  <option value="1">People 1</option>
                  <option value="2">People 2</option>
                  <option value="3">People 3</option>
                </select>
                <label htmlFor="people">No Of People</label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-floating">
                <textarea
                  className="form-control"
                  placeholder="Special Request"
                  id="message"
                  style={{ height: '100px' }}
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
                <label htmlFor="message">Special Request</label>
              </div>
            </div>
            <div className="col-12">
              <button className="btn btn-primary w-100 py-3" type="submit">
                Book Now
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
