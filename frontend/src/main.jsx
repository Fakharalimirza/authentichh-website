import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { I18nProvider } from './i18n/I18nContext';
import { ToastProvider } from './components/public/Toast';
import './styles/tokens.css';
import './styles/shared.css';
import './styles/public/public-components.css';
import './styles/public/public-pages.css';

const root = document.getElementById('root');

// Prevent flash of wrong theme
const stored = localStorage.getItem('ahf-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);
document.documentElement.style.colorScheme = theme;

if (root) {
  root.style.display = 'contents';
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HelmetProvider>
          <ThemeProvider>
            <I18nProvider>
              <ToastProvider>
                <FavoritesProvider>
                  <App />
                </FavoritesProvider>
              </ToastProvider>
            </I18nProvider>
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
