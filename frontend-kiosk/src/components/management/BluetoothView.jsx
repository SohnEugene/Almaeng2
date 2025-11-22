export default function BluetoothView({
  isConnected,
  isConnecting,
  deviceName,
  weight,
  error,
  onConnect,
  onDisconnect,
}) {
  return (
    <section className="management-panel">
      <div className="subpage-header">
        <div>
          <h2>블루투스 저울 연결</h2>
          <p className="panel-description">
            무게 측정을 위한 블루투스 저울을 연결하세요.
          </p>
        </div>
      </div>

      <div className="management-subpanel">
        <div className="bluetooth-status">
          <div className="status-info">
            <p className="device-name">
              {isConnected
                ? `연결됨: ${deviceName || "저울"}`
                : "저울이 연결되지 않았습니다"}
            </p>
            <p className="current-weight">
              {isConnected ? `${weight} g` : "—"}
            </p>
          </div>
          {error && <div className="error-message">⚠️ {error}</div>}
          <button
            type="button"
            className={isConnected ? "btn-danger" : "btn-primary"}
            onClick={isConnected ? onDisconnect : onConnect}
            disabled={isConnecting}
          >
            {isConnected
              ? "연결 해제"
              : isConnecting
                ? "연결 중..."
                : "저울 연결"}
          </button>
        </div>
      </div>
    </section>
  );
}
