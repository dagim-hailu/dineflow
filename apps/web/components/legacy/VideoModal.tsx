'use client';
import React, { useState } from 'react';

interface VideoModalProps {
  videoUrl: string;
}

export default function VideoModal({ videoUrl }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="col-md-6">
        <div className="video">
          <button type="button" className="btn-play" onClick={() => setIsOpen(true)}>
            <span></span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-0">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Youtube Video
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="ratio ratio-16x9">
                  <iframe
                    className="embed-responsive-item"
                    src={`${videoUrl}?autoplay=1&modestbranding=1&showinfo=0`}
                    id="video"
                    allowFullScreen
                    allow="autoplay"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
