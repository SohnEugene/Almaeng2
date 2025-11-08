// src/App.jsx
import { useState } from 'react';
import HomePage from './pages/HomePage';
import ProductSelectionPage from './pages/ProductSelectionPage';
import ContainerCheckPage from './pages/ContainerCheckPage';
import ContainerPurchasePage from './pages/ContainerPurchasePage';
import RefillPage from './pages/RefillPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import PaymentProcessingPage from './pages/PaymentProcessingPage';
import PaymentCompletePage from './pages/PaymentCompletePage';
import { useBluetooth } from './hooks/useBluetooth';
import { SessionProvider } from './contexts/SessionContext';

// 페이지를 의미 있는 상수로 정의
const PAGES = {
  HOME: 'home',
  PRODUCT: 'product',
  CONTAINER: 'container',
  CONTAINER_PURCHASE: 'container_purchase',
  REFILL: 'refill',
  PAYMENT_METHOD: 'payment_method',
  PAYMENT_PROCESSING: 'payment_processing',
  PAYMENT_COMPLETE: 'payment_complete',
  BLE_MONITOR: 'ble_monitor',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);

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
      PAGES.HOME,
      PAGES.PRODUCT,
      PAGES.CONTAINER,
      PAGES.CONTAINER_PURCHASE,
      PAGES.REFILL,
      PAGES.PAYMENT_METHOD,
      PAGES.PAYMENT_PROCESSING,
      PAGES.PAYMENT_COMPLETE,
      PAGES.BLE_MONITOR,
    ];
    const nextIndex = order.indexOf(currentPage) + 1;
    if (nextIndex < order.length) setCurrentPage(order[nextIndex]);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const resetToHome = () => {
    console.log('🏠 App.jsx resetToHome 호출됨');
    console.log('현재 페이지:', currentPage);
    console.log('HOME으로 이동:', PAGES.HOME);
    setCurrentPage(PAGES.HOME);
    console.log('setCurrentPage 호출 완료');
  };

  // 페이지 맵 정의
  const pages = {
    [PAGES.HOME]: <HomePage onNext={goToNextPage} />,
    [PAGES.PRODUCT]: <ProductSelectionPage onNext={goToNextPage} />,
    [PAGES.CONTAINER]: (
      <ContainerCheckPage
        onHasContainer={() => goToPage(PAGES.REFILL)}
        onNoContainer={() => goToPage(PAGES.CONTAINER_PURCHASE)}
      />
    ),
    [PAGES.CONTAINER_PURCHASE]: (
      <ContainerPurchasePage
        onYes={() => goToPage(PAGES.REFILL)}
        onNo={() => goToPage(PAGES.REFILL)}
      />
    ),
    [PAGES.REFILL]: <RefillPage onNext={goToNextPage} onReset={resetToHome} />,
    [PAGES.PAYMENT_METHOD]: (
      <PaymentMethodPage
        onNext={goToNextPage}
        onBack={() => goToPage(PAGES.REFILL)}
      />
    ),
    [PAGES.PAYMENT_PROCESSING]: (
      <PaymentProcessingPage onNext={goToNextPage} />
    ),
    [PAGES.PAYMENT_COMPLETE]: (
      <PaymentCompletePage onReset={resetToHome} />
    ),
    [PAGES.BLE_MONITOR]: (
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

  return (
    <SessionProvider>
      <div>{pages[currentPage]}</div>
    </SessionProvider>
  );
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
            {isConnecting ? 'Connecting...' : 'Connect to Scale'}
          </button>
        ) : (
          <button onClick={disconnect}>Disconnect</button>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

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

      <button onClick={onReset} style={{ marginTop: 20 }}>
        처음으로 돌아가기
      </button>
    </div>
  );
}
