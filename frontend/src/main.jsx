import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import './styles/tokens.css';
import './styles/components.css';
import './styles/global.css';

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
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
