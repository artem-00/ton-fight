import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>TON FIGHT</h1>
      <p>Mini App загружена!</p>
    </div>
  );
}

createRoot(document.getElementById('app')).render(<App />);