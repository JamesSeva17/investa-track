import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMsg = "Critical Failure: Mount target #root not found in DOM.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Vaultify OS: React successfully mounted.");
} catch (error) {
  console.error("React Mounting Error:", error);
  // Re-throw so the window boundary in index.html picks it up
  throw error;
}