import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

localStorage.removeItem('token');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring can be added later if needed
