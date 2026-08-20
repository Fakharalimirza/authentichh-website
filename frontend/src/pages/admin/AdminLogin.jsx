import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/public/Button';
import '../../styles/admin/admin.css';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const { theme, changePreference } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem('adminRememberEmail') === 'true'
  );
  const [showPassword, setShowPassword] = useState(false);

  const cardRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('adminSavedEmail');
    if (savedEmail && remember) {
      setEmail(savedEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted.current && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
    mounted.current = true;
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      setError('');
      try {
        await login(email, password);
        if (remember) {
          localStorage.setItem('adminRememberEmail', 'true');
          localStorage.setItem('adminSavedEmail', email);
        } else {
          localStorage.removeItem('adminRememberEmail');
          localStorage.removeItem('adminSavedEmail');
        }
        navigate('/admin');
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please check your credentials and try again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, login, navigate, loading]
  );

  return (
    <div className="admin-login-container">
      <button
        type="button"
        onClick={() => changePreference(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="admin-login-theme-toggle"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="admin-login-card" ref={cardRef}>
        <div className="admin-login-brand">
          <img
            src={theme === 'dark' ? '/ahh white logo.webp' : '/ahh black logo.png'}
            alt="Authentic Holiday Homes"
            className="admin-login-logo"
          />
        </div>

        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Login</h1>
          <p className="admin-login-subtitle">
            Sign in to manage your properties
          </p>
        </div>

        {error && (
          <div className="admin-error-message" role="alert">
            <span className="admin-error-icon" aria-hidden="true">!</span>
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-field">
            <label className="admin-input-label" htmlFor="login-email">Email</label>
            <div className="input-field">
              <span className="input-prefix">
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                className="input-element input-md"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-input-label" htmlFor="login-password">Password</label>
            <div className="input-field">
              <span className="input-prefix">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                className="input-element input-md"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-suffix admin-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="admin-login-options">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="admin-checkbox"
                disabled={loading}
              />
              <span className="admin-checkbox-text">Remember me</span>
            </label>
            <a
              href="#"
              className="admin-forgot-link"
              onClick={(e) => e.preventDefault()}
              tabIndex={loading ? -1 : 0}
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            icon={!loading ? <LogIn size={18} /> : undefined}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="admin-login-footer">
          <span aria-hidden="true">&copy;</span>
          {new Date().getFullYear()} Authentic Holiday Homes
        </p>
      </div>
    </div>
  );
}
