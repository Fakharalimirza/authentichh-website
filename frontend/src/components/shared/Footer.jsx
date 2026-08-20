/**
 * @fileoverview Site-wide footer with links, social icons, and the AHF CRM portal button.
 */

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function Footer() {
  const { dir, t } = useI18n();
  const isRTL = dir === 'rtl';

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth <= 1023;

  const [openSections, setOpenSections] = useState({
    quickLinks: false,
    contact: false,
    legal: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close all accordions when resizing from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setOpenSections({ quickLinks: false, contact: false, legal: false });
    }
  }, [isMobile]);

  // Scroll opened accordion into view so all content is visible
  useEffect(() => {
    const openedId = Object.entries(openSections).find(([, val]) => val)?.[0];
    if (openedId) {
      const panel = document.getElementById(`footer-panel-${openedId}`);
      if (panel) {
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [openSections]);

  const chevronIcon = (isOpen) => (
    <svg
      className={`footer-chevron ${isOpen ? 'footer-chevron--open' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );

  const renderAccordionSection = (id, heading, content) => {
    const isOpen = openSections[id];
    return (
      <div className={`footer-accordion ${isOpen ? 'footer-accordion--open' : ''}`}>
        <button
          id={`footer-btn-${id}`}
          className="footer-accordion-header"
          onClick={() => toggleSection(id)}
          aria-expanded={isOpen}
          aria-controls={`footer-panel-${id}`}
          type="button"
        >
          <h3>{heading}</h3>
          {chevronIcon(isOpen)}
        </button>
        <div
          id={`footer-panel-${id}`}
          className="footer-accordion-content"
          role="region"
          aria-labelledby={`footer-btn-${id}`}
          style={{
            maxHeight: isOpen ? '500px' : '0',
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="footer-accordion-body">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
        <div>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <img
              src="/ahh white logo.webp"
              alt="Authentic Holiday Homes"
              style={{
                height: 36,
                width: 'auto',
                maxWidth: 200,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <p>
            {isRTL
              ? 'أوثنتيك هوليدي هومز تقدم منازل عطلات مُدارة بشكل احترافي وشقق فاخرة في أفضل مواقع دبي.'
              : 'Welcome to Authentic Holiday Homes Luxury Apartments. Redefining luxury in the heart of Dubai. We provide a community-feel atmosphere in a specialized environment.'}
          </p>
          <div className="social-links" style={{ justifyContent: 'center' }}>
            <a href="https://www.instagram.com/authenticuae/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1.5"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        {renderAccordionSection(
          'quickLinks',
          isRTL ? 'روابط سريعة' : 'Quick Links',
          <>
            {[
              { to: '/', label: 'Home', labelAr: 'الرئيسية' },
              { to: '/apartments', label: 'Apartments', labelAr: 'الشقق' },
              { to: '/about', label: 'About Us', labelAr: 'عننا' },
              { to: '/facilities', label: 'Facilities', labelAr: 'المرافق' },
              { to: '/list-your-property', label: 'List Your Property', labelAr: 'أضف عقارك' },
              { to: '/contact', label: 'Contact', labelAr: 'اتصل بنا' },
            ].map(item => (
              <Link key={item.to} to={item.to}>{isRTL ? item.labelAr : item.label}</Link>
            ))}
          </>
        )}

        {renderAccordionSection(
          'contact',
          isRTL ? 'اتصل بنا' : 'Contact',
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0', color: '#B7C0BB', fontSize: 13, lineHeight: 1.7 }}>
                  {isRTL ? 'مكتب A202 - سبورت سوسايتي مول - مردف - دبي' : 'Office A202 - Sport Society Mall - Mirdif - Dubai'}
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="tel:+97142866788">+971 4 286 6788</a>
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12" y2="18"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="tel:+971569969332">+971 56 996 9332</a>
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#25D366" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="https://wa.me/971569969332" target="_blank" rel="noopener noreferrer">{isRTL ? 'واتساب' : 'WhatsApp'}</a>
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="mailto:info@authenticholidayhomes.ae">info@authenticholidayhomes.ae</a>
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0', color: '#B7C0BB', fontSize: 13, lineHeight: 1.7 }}>
                  {isRTL
                    ? 'الإثنين - الجمعة: 10:00 صباحًا - 06:30 مساءً\nالسبت: 10:00 صباحًا - 03:00 مساءً\nالأحد: مغلق'
                    : 'Monday - Friday: 10:00 AM - 06:30 PM\nSaturday: 10:00 AM - 03:00 PM\nSunday: Off'}
                </td>
              </tr>
            </tbody>
          </table>
        )}

      {renderAccordionSection(
        'legal',
        isRTL ? 'قانوني' : 'Legal',
        <>
          {[
            { to: '/terms', label: 'Terms & Conditions', labelAr: 'الشروط والأحكام' },
            { to: '/privacy', label: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
          ].map(item => (
            <Link key={item.to} to={item.to}>{isRTL ? item.labelAr : item.label}</Link>
          ))}
        </>
      )}
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Authentic Holiday Homes. {isRTL ? 'جميع الحقوق محفوظة.' : 'All Rights Reserved.'}
      </div>
      </div>
    </footer>
  );
}
