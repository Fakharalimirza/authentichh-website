import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useI18n } from '../../i18n/I18nContext';
import { navItems, rmsUrl } from './navData';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const { theme, preference, changePreference } = useTheme();
  const { favorites } = useFavorites();
  const { locale, dir, setLocale } = useI18n();

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

  const toggleLang = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

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
    paddingBlock: 'var(--space-2)',
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
    <>
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
          <Link
            to="/admin/login"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              transition: 'color 150ms ease-out',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.target.style.color = scrolled ? 'var(--color-text)' : 'rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.target.style.color = scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.5)'}
          >
            Admin
          </Link>
          <a
            href={rmsUrl}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          <Link
            to="/favorites"
            aria-label="Saved properties"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              border: `1px solid ${scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.15)'}`,
              background: scrolled ? 'var(--color-surface-secondary)' : 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)',
              color: scrolled ? 'var(--color-text)' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              transition: 'all 150ms ease-out',
            }}
          >
            <Heart size={16} fill={favorites.length > 0 ? 'currentColor' : 'none'} />
            {favorites.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                padding: '0 3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
                borderRadius: 8,
              }}>
                {favorites.length}
              </span>
            )}
          </Link>
          <ThemeToggle preference={preference} changePreference={changePreference} scrolled={scrolled} />

          <button
            onClick={toggleLang}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.375rem 0.5rem',
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
            {locale === 'en' ? 'AR' : 'EN'}
          </button>

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
    </header>
      <MobileMenu menuOpen={menuOpen} scrolled={scrolled} isRTL={isRTL} closeMenu={closeMenu} locale={locale} setLocale={setLocale} />
    </>
  );
}
