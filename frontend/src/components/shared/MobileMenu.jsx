import { Link, NavLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { navItems, rmsUrl } from './navData';
import { useFavorites } from '../../context/FavoritesContext';

export default function MobileMenu({ menuOpen, scrolled, isRTL, closeMenu, locale, setLocale }) {
  const { favorites } = useFavorites();
  if (!menuOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: scrolled ? 'var(--header-height-scrolled)' : 'var(--header-height)',
      insetInlineStart: 0,
      insetInlineEnd: 0,
      bottom: 0,
      background: 'var(--color-surface)',
      zIndex: 9999,
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
      <Link
        to="/favorites"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '0.875rem 1rem',
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          transition: 'all 150ms ease-out',
        }}
        onClick={closeMenu}
      >
        <Heart size={16} fill={favorites.length > 0 ? 'currentColor' : 'none'} />
        {isRTL ? 'المفضلة' : 'Saved'}
        {favorites.length > 0 && (
          <span style={{
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-primary)',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1,
            borderRadius: 9,
          }}>
            {favorites.length}
          </span>
        )}
      </Link>
      <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-3) 0' }} />
      <Link
        to="/admin/login"
        style={{
          padding: '0.875rem 1rem',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          transition: 'color 150ms ease-out',
        }}
        onClick={closeMenu}
      >
        Admin
      </Link>
      <a
        href={rmsUrl}
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
      <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-3) 0' }} />
      <button
        onClick={() => { setLocale(locale === 'en' ? 'ar' : 'en'); closeMenu(); }}
        style={{
          padding: '0.875rem 1rem',
          fontSize: 'var(--text-base)',
          fontWeight: 500,
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          textAlign: isRTL ? 'right' : 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          width: '100%',
        }}
      >
        {locale === 'en' ? 'العربية' : 'English'}
      </button>
    </div>
  );
}
