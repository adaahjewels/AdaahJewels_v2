import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--color-brand-900)', color: 'var(--color-neutral-300)' }}>
      {/* Top decorative border */}
      <div style={{ height: '3px', background: 'linear-gradient(to right, var(--color-brand-600), var(--color-gold-500), var(--color-brand-600))' }} />

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center rounded-xl overflow-hidden"
                style={{ width: '40px', height: '35px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <img
                  src="/LOGO%20(2).jpg"
                  alt="Adaah Jewels"
                  style={{ width: '36px', height: '31px', objectFit: 'contain' }}
                />
              </div>
              <h3 className="font-display font-bold text-xl" style={{ color: 'var(--color-cream-100)' }}>
                Adaah Jewels
              </h3>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-neutral-400)' }}>
              Beautiful, lightweight artificial jewellery crafted with love in India.
              Timeless craft, modern grace.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                {
                  label: 'Facebook',
                  path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                },
                {
                  label: 'Instagram',
                  path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-neutral-400)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-brand-600)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'var(--color-neutral-400)';
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-brand-300)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/products', label: 'All Products' },
                { to: '/about',    label: 'About Us' },
                { to: '/contact',  label: 'Contact' },
                { to: '/faq',      label: 'FAQ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="transition-colors duration-200 hover:text-cream-100"
                    style={{ color: 'var(--color-neutral-400)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-brand-300)' }}>
              Customer Service
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/shipping', label: 'Shipping Policy' },
                { to: '/privacy',  label: 'Privacy Policy' },
                { to: '/terms',    label: 'Terms & Conditions' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="transition-colors duration-200 hover:text-cream-100"
                    style={{ color: 'var(--color-neutral-400)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-brand-300)' }}>
              Get In Touch
            </h4>
            <ul className="space-y-3 text-sm mb-6" style={{ color: 'var(--color-neutral-400)' }}>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brand-400)' }} />
                <span>Indore, Madhya Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand-400)' }} />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand-400)' }} />
                <span>adaahjewelss@gmail.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-brand-300)' }}>
                Newsletter
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--color-cream-100)',
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: 'var(--color-brand-500)', color: 'white' }}
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-neutral-500)' }}
        >
          <p>© 2026 Adaah Jewels. All rights reserved. Made with <span style={{ color: 'var(--color-gold-500)' }}>♥</span> in India</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/320px-UPI-Logo-vector.svg.png"
              alt="UPI"
              className="h-5 opacity-70"
            />
            <span style={{ color: 'var(--color-neutral-600)' }}>UPI · Credit Card · Debit Card · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
