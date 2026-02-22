import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global reset — matches our void background
document.documentElement.style.cssText = 'margin:0;padding:0;background:#0a0e14;';
document.body.style.cssText = 'margin:0;padding:0;background:#0a0e14;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
