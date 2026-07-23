import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [dir, setDir] = useState(() => document.documentElement.dir || 'ltr');
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

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDir(document.documentElement.dir || 'ltr');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

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
              : 'Authentic Holiday Homes offers professionally managed holiday homes and luxury apartments in prime Dubai locations.'}
          </p>
          <div className="social-links" style={{ justifyContent: 'center' }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
                  {isRTL ? 'دبي، الإمارات العربية المتحدة' : 'Dubai, United Arab Emirates'}
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="tel:+971500000000">+971 50 000 0000</a>
                </td>
              </tr>
              <tr>
                <td style={{ width: 36, verticalAlign: 'middle', padding: '5px 14px 5px 0' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.498 14.382c-.3-.15-1.767-.867-2.04-.966-.273-.1-.473-.15-.673.15-.2.3-.767.966-.94 1.164-.173.2-.346.22-.646.07-.3-.15-1.273-.47-2.424-1.49-.896-.8-1.5-1.78-1.676-2.08-.176-.3-.02-.46.132-.61.134-.134.3-.35.45-.524.15-.174.2-.3.3-.5.1-.2.05-.37-.025-.52-.075-.15-.673-1.62-.923-2.22-.242-.584-.487-.486-.67-.494-.173-.007-.372-.01-.57-.01-.2 0-.52.074-.792.372-.272.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.08 3.18 5.04 4.16.704.234 1.253.373 1.68.478.706.174 1.35.15 1.858.09.57-.067 1.767-.722 2.016-1.42.25-.698.25-1.297.174-1.42-.075-.124-.275-.2-.575-.35z"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </td>
                <td style={{ verticalAlign: 'middle', padding: '5px 0' }}>
                  <a href="https://wa.me/971500000000" target="_blank" rel="noopener noreferrer">{isRTL ? 'واتساب' : 'WhatsApp'}</a>
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
