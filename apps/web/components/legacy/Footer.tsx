import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <div
      className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn"
      data-wow-delay="0.1s"
    >
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">
              Company
            </h4>
            <Link className="btn btn-link" href="/about">
              About Us
            </Link>
            <Link className="btn btn-link" href="/contact">
              Contact Us
            </Link>
            <Link className="btn btn-link" href="/booking">
              Reservation
            </Link>
            <a className="btn btn-link" href="#">
              Privacy Policy
            </a>
            <a className="btn btn-link" href="#">
              Terms & Condition
            </a>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">
              Contact
            </h4>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3"></i>Addis Ababa Ethiopia
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3"></i>
              <a href="tel:+251943303466">+251 943 303 466</a>
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3"></i>
              <a href="mailto:kmemsolution@gmail.com">kmemsolution@gmail.com</a>
            </p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href="">
                <i className="fab fa-twitter"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="">
                <i className="fab fa-youtube"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">
              Opening
            </h4>
            <h5 className="text-light fw-normal">Monday - Saturday</h5>
            <p>09AM - 09PM</p>
            <h5 className="text-light fw-normal">Sunday</h5>
            <p>10AM - 08PM</p>
          </div>
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">
              Newsletter
            </h4>
            <p>Dolor amet sit justo amet elitr clita ipsum elitr est.</p>
            <div className="position-relative mx-auto" style={{ maxWidth: '400px' }}>
              <input
                className="form-control border-primary w-100 py-3 ps-4 pe-5"
                type="text"
                placeholder="Your email"
              />
              <button
                type="button"
                className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
              >
                SignUp
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy;{' '}
              <a className="border-bottom" href="#">
                ቅመም Solution
              </a>
              , All Right Reserved. Designed By{' '}
              <a
                className="border-bottom"
                href="https://liyonays.github.io/Kmem_Solution/index.html"
              >
                YonasA
              </a>
              <br />
              <br />
              Distributed By{' '}
              <a
                className="border-bottom"
                href="https://liyonays.github.io/Kmem_Solution/index.html"
                target="_blank"
                rel="noreferrer"
              >
                ቅመም Solution
              </a>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link href="/">Home</Link>
                <a href="#">Cookies</a>
                <a href="#">Help</a>
                <a href="#">FQAs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
