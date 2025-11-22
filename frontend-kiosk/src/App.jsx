// src/App.jsx
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import ProductSelectionPage from "./pages/ProductSelectionPage";
import ContainerCheckPage from "./pages/ContainerCheckPage";
import ContainerPurchasePage from "./pages/ContainerPurchasePage";
import RefillPage from "./pages/RefillPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import PaymentCompletePage from "./pages/PaymentCompletePage";
import ManagementPage from "./pages/ManagementPage";
import { useBluetooth } from "./hooks/useBluetooth";
import { BluetoothProvider } from "./contexts/BluetoothContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";

export default function App() {
  return (
    <BrowserRouter>
      <BluetoothProvider>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<KioskFlow />} />
            <Route path="/manage" element={<ManagementPage />} />
          </Routes>
        </SessionProvider>
      </BluetoothProvider>
    </BrowserRouter>
  );
}

// 키오스크 메인 플로우 컴포넌트
function KioskFlow() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("home");
  const { resetSession } = useSession();

  // BLE 관련 상태와 함수 (커스텀 훅)
  const {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
  } = useBluetooth();

  // 페이지 전환 핸들러
  const goToNextPage = () => {
    const order = [
      "home",
      "product",
      "container",
      "container_purchase",
      "refill",
      "payment_method",
      "payment_processing",
      "payment_complete",
      "ble_monitor",
    ];
    const nextIndex = order.indexOf(currentPage) + 1;
    if (nextIndex < order.length) setCurrentPage(order[nextIndex]);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const resetToHome = () => {
    console.log("🏠 resetToHome 호출됨 - 세션 초기화");
    resetSession();
    setCurrentPage("home");
  };

  // 페이지 맵 정의
  const pages = {
    home: <HomePage onNext={goToNextPage} />,
    product: (
      <ProductSelectionPage onNext={goToNextPage} onHome={resetToHome} />
    ),
    container: (
      <ContainerCheckPage
        onHasContainer={() => goToPage("refill")}
        onNoContainer={() => goToPage("container_purchase")}
        onHome={resetToHome}
      />
    ),
    container_purchase: (
      <ContainerPurchasePage
        onYes={() => goToPage("refill")}
        onNo={() => goToPage("refill")}
        onHome={resetToHome}
      />
    ),
    refill: (
      <RefillPage
        onNext={goToNextPage}
        onReset={resetToHome}
        onHome={resetToHome}
      />
    ),
    payment_method: (
      <PaymentMethodPage onNext={goToNextPage} onHome={resetToHome} />
    ),
    payment_processing: (
      <PaymentProcessingPage onNext={goToNextPage} onHome={resetToHome} />
    ),
    payment_complete: <PaymentCompletePage onReset={resetToHome} />,
    ble_monitor: (
      <BleMonitorPage
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
        deviceName={deviceName}
        weight={weight}
        connect={connect}
        disconnect={disconnect}
        onReset={resetToHome}
      />
    ),
  };

  return <main className="kiosk-shell">{pages[currentPage]}</main>;
}

// BLE 모니터 화면을 별도 컴포넌트로 분리
function BleMonitorPage({
  isConnected,
  isConnecting,
  error,
  deviceName,
  weight,
  connect,
  disconnect,
  onReset,
}) {
  return (
    <div style={{ padding: 20 }}>
      <h1>BLE Scale Monitor</h1>

      <div style={{ marginBottom: 20 }}>
        {!isConnected ? (
          <button onClick={connect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect to Scale"}
          </button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <div>
        Status: <strong>{isConnected ? "Connected" : "Disconnected"}</strong>
      </div>

      {deviceName && (
        <div style={{ marginTop: 10 }}>
          Device: <strong>{deviceName}</strong>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        Current weight: <strong>{weight}</strong>
      </div>

      <button onClick={onReset} style={{ marginTop: 20 }}>
        처음으로 돌아가기
      </button>
    </div>
  );
}
