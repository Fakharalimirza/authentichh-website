import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const RMS_URL = 'https://rms.authenticholidayhomes.ae';

const navItems = [
  { path: '/', label: 'Home', labelAr: 'الرئيسية' },
  { path: '/apartments', label: 'Apartments', labelAr: 'الشقق' },
  { path: '/about', label: 'About Us', labelAr: 'عننا' },
  { path: '/facilities', label: 'Facilities', labelAr: 'المرافق' },
  { path: '/list-your-property', label: 'List Your Property', labelAr: 'أضف عقارك' },
  { path: '/contact', label: 'Contact', labelAr: 'اتصل بنا' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [dir, setDir] = useState(() => document.documentElement.dir || 'ltr');
  const navigate = useNavigate();
  const { theme, preference, changePreference } = useTheme();

  const isRTL = dir === 'rtl';
  const isMobile = windowWidth <= 1023;
  const isTablet = windowWidth > 639 && windowWidth <= 1023;
  const logoHeight = isMobile ? 36 : isTablet ? 40 : 44;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleDir = () => {
    const newDir = isRTL ? 'ltr' : 'rtl';
    setDir(newDir);
    document.documentElement.dir = newDir;
    localStorage.setItem('ahf-dir', newDir);
  };

  useEffect(() => {
    const saved = localStorage.getItem('ahf-dir');
    if (saved === 'rtl' || saved === 'ltr') {
      setDir(saved);
      document.documentElement.dir = saved;
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const headerStyle = {
    position: 'fixed',
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: 360,
    height: scrolled ? 'var(--header-height-scrolled)' : 'var(--header-height)',
    background: scrolled
      ? 'var(--color-surface)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
    transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  const innerStyle = {
    maxWidth: 'var(--max-width)',
    margin: '0 auto',
    paddingInline: 'var(--space-6)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    textDecoration: 'none',
    color: scrolled ? 'var(--color-text)' : 'white',
    transition: 'color 250ms ease-out',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  };

  const navLinkStyle = (isActive) => ({
    padding: '0.5rem 0.875rem',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: scrolled ? (isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)') : (isActive ? 'white' : 'rgba(255,255,255,0.75)'),
    borderRadius: 'var(--radius-md)',
    transition: 'all 150ms ease-out',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    background: isActive ? (scrolled ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.12)') : 'transparent',
  });

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <Link to="/" style={logoStyle} onClick={closeMenu}>
          <img
            src="/ahh white logo.webp"
            alt="Authentic Holiday Homes"
            style={{
              display: !scrolled || theme === 'dark' ? 'block' : 'none',
              height: logoHeight,
              width: 'auto',
              maxWidth: 180,
              objectFit: 'contain',
            }}
          />
          <img
            src="/ahh black logo.png"
            alt="Authentic Holiday Homes"
            style={{
              display: scrolled && theme === 'light' ? 'block' : 'none',
              height: logoHeight,
              width: 'auto',
              maxWidth: 180,
              objectFit: 'contain',
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav style={{
          ...navStyle,
          display: isMobile ? 'none' : 'flex',
        }} className="desktop-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => navLinkStyle(isActive)}
              onClick={closeMenu}
            >
              {isRTL ? item.labelAr : item.label}
            </NavLink>
          ))}
          <a
            href={RMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.5rem 1rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'white',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all 150ms ease-out',
              whiteSpace: 'nowrap',
              marginInlineStart: 'var(--space-2)',
            }}
            onMouseEnter={e => e.target.style.background = 'var(--color-primary-hover)'}
            onMouseLeave={e => e.target.style.background = 'var(--color-primary)'}
          >
            RMS Login
          </a>
        </nav>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {/* Theme */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: 2,
            background: scrolled ? 'var(--color-surface-secondary)' : 'rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <button
              onClick={() => changePreference('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                border: 'none',
                background: preference === 'light' ? (scrolled ? 'var(--color-surface)' : 'rgba(255,255,255,0.2)') : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                color: scrolled ? (preference === 'light' ? 'var(--color-text)' : 'var(--color-text-muted)') : (preference === 'light' ? 'white' : 'rgba(255,255,255,0.5)'),
                transition: 'all 150ms ease-out',
              }}
              aria-label="Light mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </button>
            <button
              onClick={() => changePreference('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                border: 'none',
                background: preference === 'dark' ? (scrolled ? 'var(--color-surface)' : 'rgba(255,255,255,0.2)') : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                color: scrolled ? (preference === 'dark' ? 'var(--color-text)' : 'var(--color-text-muted)') : (preference === 'dark' ? 'white' : 'rgba(255,255,255,0.5)'),
                transition: 'all 150ms ease-out',
              }}
              aria-label="Dark mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>
          </div>

          {/* Language */}
          <button
            onClick={toggleDir}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '0.375rem 0.625rem',
              height: 34,
              border: `1px solid ${scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.15)'}`,
              background: scrolled ? 'var(--color-surface-secondary)' : 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: scrolled ? 'var(--color-text)' : 'rgba(255,255,255,0.8)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              transition: 'all 150ms ease-out',
            }}
            aria-label="Toggle language"
          >
            {isRTL ? 'EN' : 'AR'}
          </button>

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: isMobile ? 'flex' : 'none',
              flexDirection: 'column',
              gap: 5,
              padding: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              transition: 'background 150ms ease-out',
            }}
            onMouseEnter={e => e.currentTarget.style.background = scrolled ? 'var(--color-surface-secondary)' : 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: 22,
              height: 2,
              background: scrolled ? 'var(--color-text)' : 'white',
              borderRadius: 2,
              transition: 'all 250ms ease-out',
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
            }} />
            <span style={{
              width: 22,
              height: 2,
              background: scrolled ? 'var(--color-text)' : 'white',
              borderRadius: 2,
              transition: 'all 250ms ease-out',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              width: 22,
              height: 2,
              background: scrolled ? 'var(--color-text)' : 'white',
              borderRadius: 2,
              transition: 'all 250ms ease-out',
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
            }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: scrolled ? 'var(--header-height-scrolled)' : 'var(--header-height)',
          insetInlineStart: 0,
          insetInlineEnd: 0,
          bottom: 0,
          background: 'var(--color-surface)',
          zIndex: 350,
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-4)',
          gap: 'var(--space-1)',
          animation: 'fadeIn 200ms ease-out',
          overflowY: 'auto',
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                padding: '0.875rem 1rem',
                fontSize: 'var(--text-base)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 150ms ease-out',
              })}
              onClick={closeMenu}
            >
              {isRTL ? item.labelAr : item.label}
            </NavLink>
          ))}
          <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-3) 0' }} />
          <a
            href={RMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.875rem 1rem',
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'white',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              textAlign: 'center',
              marginTop: 'var(--space-2)',
            }}
            onClick={closeMenu}
          >
            RMS Login
          </a>
        </div>
      )}
    </header>
  );
}
