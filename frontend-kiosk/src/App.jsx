// src/App.jsx
import { useState } from 'react';
import { connectScale } from './hooks/scale';

export default function App() {
  const [weight, setWeight] = useState(0);

  const handleConnect = () => {
    connectScale(setWeight);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>BLE Scale Monitor</h1>
      <button onClick={handleConnect}>Connect to Scale</button>
      <div style={{ marginTop: 20 }}>Current weight: <strong>{weight}</strong></div>
    </div>
  );
}
