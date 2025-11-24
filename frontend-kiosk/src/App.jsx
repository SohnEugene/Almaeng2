// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback } from "react";

import HomePage from "./pages/HomePage";
import ProductSelectionPage from "./pages/ProductSelectionPage";
import ContainerCheckPage from "./pages/ContainerCheckPage";
import ContainerPurchasePage from "./pages/ContainerPurchasePage";
import RefillPage from "./pages/RefillPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import PaymentCompletePage from "./pages/PaymentCompletePage";
import ManagementPage from "./pages/ManagementPage";

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

const KIOSK_ORDER = [
  "home",
  "product",
  "container",
  "containerPurchase",
  "refill",
  "paymentMethod",
  "paymentProcessing",
  "paymentComplete",
];



// 키오스크 메인 플로우 컴포넌트
function KioskFlow() {
  const [currentPage, setCurrentPage] = useState("home");
  const { resetSession } = useSession();

  // 페이지 전환 핸들러
  const goToPage = useCallback((page) => setCurrentPage(page), []);

  const resetToHome = useCallback(() => {
    resetSession();
    setCurrentPage("home");
  }, [resetSession]);
  
  const goToNextPage = useCallback(() => {
    const nextIndex = KIOSK_ORDER.indexOf(currentPage) + 1;
    if (nextIndex < KIOSK_ORDER.length) setCurrentPage(KIOSK_ORDER[nextIndex]);
  }, [currentPage]);

  // 페이지 맵 정의
  const pages = {
    home: (
      <HomePage 
        onNext={goToNextPage} 
      />
    ),
    product: (
      <ProductSelectionPage 
        onNext={goToNextPage} 
        onHome={resetToHome} 
      />
    ),
    container: (
      <ContainerCheckPage
        onHasContainer={() => goToPage("refill")}
        onNoContainer={() => goToPage("containerPurchase")}
        onHome={resetToHome}
      />
    ),
    containerPurchase: (
      <ContainerPurchasePage
        onNext={() => goToPage("refill")}
        onHome={resetToHome}
      />
    ),
    refill: (
      <RefillPage
        onNext={goToNextPage}
        onHome={resetToHome}
      />
    ),
    paymentMethod: (
      <PaymentMethodPage 
        onNext={goToNextPage} 
        onHome={resetToHome} 
      />
    ),
    paymentProcessing: (
      <PaymentProcessingPage 
        onNext={goToNextPage} 
        onHome={resetToHome} 
      />
    ),
    paymentComplete: (
      <PaymentCompletePage 
        onHome={resetToHome} 
      />),
  };

  return <main className="kiosk-shell">{pages[currentPage]}</main>;
}