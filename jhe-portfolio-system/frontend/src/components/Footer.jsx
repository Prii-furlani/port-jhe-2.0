import React from 'react';
import { Globe } from 'lucide-react';

const LinkedinIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="home-footer-grid">
        <div className="home-footer-brand">
          <div className="bg-white/95 px-3 py-2 rounded-lg inline-block shadow-sm mb-2">
            <img src="/logo.png" alt="JHE Engenharia" className="h-10 w-auto object-contain" />
          </div>
          <p className="home-footer-brand-desc">
            Precisão técnica e inovação em engenharia consultiva para grandes infraestruturas.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href="https://www.linkedin.com/company/jhe-engenharia"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
            <a
              href="https://www.jhe.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Website Oficial"
            >
              <Globe size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
