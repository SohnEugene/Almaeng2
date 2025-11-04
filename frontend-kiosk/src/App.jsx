// src/App.jsx
import { useScale } from './hooks/scale';

export default function App() {
  const { weight, isConnected, isConnecting, error, deviceName, connect, disconnect } = useScale();

  return (
    <div style={{ padding: 20 }}>
      <h1>BLE Scale Monitor</h1>

      <div style={{ marginBottom: 20 }}>
        {!isConnected ? (
          <button onClick={connect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect to Scale'}
          </button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 20 }}>
          Error: {error}
        </div>
      )}

      <div>
        Status: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
      </div>

      {deviceName && (
        <div style={{ marginTop: 10 }}>
          Device: <strong>{deviceName}</strong>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        Current weight: <strong>{weight}</strong>
      </div>
    </div>
  );
}
