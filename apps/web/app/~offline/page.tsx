'use client';

import { useEffect } from 'react';

export default function OfflinePage() {
  useEffect(() => {
    // Pre-warm retry button
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#F8FAFC',
      }}
    >
      {/* Animated disconnected icon */}
      <div style={{ marginBottom: '2rem', animation: 'pulse 2s ease-in-out infinite' }}>
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Wifi signal bars with slash */}
          <circle cx="48" cy="48" r="46" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M48 64a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#F59E0B" fillOpacity="0.9" />
          <path
            d="M36 54c3.3-3.3 7.8-5.3 12-5.3 1.5 0 2.9.2 4.3.6"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          <path
            d="M26 45c3.5-3.5 7.8-6.1 12.5-7.5"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />
          {/* Slash line */}
          <line
            x1="22"
            y1="22"
            x2="74"
            y2="74"
            stroke="#EF4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          textAlign: 'center',
          letterSpacing: '-0.025em',
          color: '#F8FAFC',
        }}
      >
        You&apos;re offline
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: '1rem',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: '22rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        You seem to be offline — check your connection and try again.
      </p>

      {/* Retry button */}
      <button
        id="retry-btn"
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: '#F59E0B',
          color: '#0F172A',
          fontWeight: 700,
          fontSize: '0.9375rem',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.1s',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D97706';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F59E0B';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        }}
      >
        Try again
      </button>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.97); }
        }
      `}</style>
    </div>
  );
}
