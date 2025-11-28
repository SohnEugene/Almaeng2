// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";

import HomePage from "./pages/HomePage";
import ProductSelectionPage from "./pages/ProductSelectionPage";
import ContainerCheckPage from "./pages/ContainerCheckPage";
import ContainerPurchasePage from "./pages/ContainerPurchasePage";
import RefillPage from "./pages/RefillPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import PaymentCompletePage from "./pages/PaymentCompletePage";
import ManagementPage from "./pages/ManagementPage";
import { SoundProvider, useSound } from "./contexts/SoundContext";

import { BluetoothProvider } from "./contexts/BluetoothContext";
import { SessionProvider, useSession } from "./contexts/SessionContext";

export default function App() {
  return (
    <BrowserRouter>
      <BluetoothProvider>
        <SessionProvider>
          <SoundProvider>
            <Routes>
              <Route path="/" element={<KioskFlow />} />
              <Route path="/manage" element={<ManagementPage />} />
            </Routes>
          </SoundProvider>
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

// 페이지별 사운드 맵핑
const PAGE_SOUNDS = {
  product: "REFILL_START",
  paymentComplete: "QR_PRODUCT_CHECK",
  container: "CONTAINER_CHECK",
  // containerPurchase, paymentMethod 등은 사운드 없음
};

// 키오스크 메인 플로우 컴포넌트
function KioskFlow() {
  const [currentPage, setCurrentPage] = useState("home");
  const { resetSession } = useSession();
  const { playSound } = useSound();

  // 전체화면 모드 진입
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        // 전체화면 API 지원 확인
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          console.log("✅ [Fullscreen] 전체화면 모드 활성화");
        }
      } catch (err) {
        console.warn("⚠️ [Fullscreen] 전체화면 모드 진입 실패:", err);
      }
    };

    // 사용자 인터랙션 후 전체화면 진입
    const handleInteraction = () => {
      enterFullscreen();
      // 한 번만 실행하도록 이벤트 리스너 제거
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    // 클릭 또는 터치 이벤트 대기
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // 페이지 전환 핸들러
  const goToPage = useCallback((page) => {
    // 페이지 전환 시 해당 페이지의 사운드 자동 재생
    const soundId = PAGE_SOUNDS[page];
    if (soundId) {
      playSound(soundId);
    }
    setCurrentPage(page);
  }, [playSound]);

  const resetToHome = useCallback(() => {
    resetSession();
    setCurrentPage("home");
  }, [resetSession]);

  const goToNextPage = useCallback(() => {
    const nextIndex = KIOSK_ORDER.indexOf(currentPage) + 1;
    if (nextIndex < KIOSK_ORDER.length) {
      const nextPage = KIOSK_ORDER[nextIndex];
      // 다음 페이지의 사운드 자동 재생
      const soundId = PAGE_SOUNDS[nextPage];
      if (soundId) {
        playSound(soundId);
      }
      setCurrentPage(nextPage);
    }
  }, [currentPage, playSound]);

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