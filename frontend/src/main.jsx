import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress known third-party warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Suppress SVG attribute warnings from compiled libraries
  if (
    args[0]?.includes?.('attribute') ||
    args[0]?.includes?.('Expected length') ||
    args[0]?.includes?.('width="auto"') ||
    args[0]?.includes?.('height="auto"')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  // Suppress warnings about unrecognized features
  if (
    args[0]?.includes?.('web-share') ||
    args[0]?.includes?.('x-rtb-fingerprint-id') ||
    args[0]?.includes?.('Unrecognized feature')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
