'use client';
import React, { useState, useEffect } from 'react';

export default function Spinner() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide spinner immediately after component mounts (like the original 1ms timeout)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      id="spinner"
      className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"
    >
      <div
        className="spinner-border text-primary"
        style={{ width: '3rem', height: '3rem' }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
