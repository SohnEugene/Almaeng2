import { useState, useEffect, useRef, useCallback } from "react";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import { useBluetoothContext } from "../contexts/BluetoothContext";
import scaleImg from "../assets/images/measurement.png";

const REFILL_STEPS = {
  WELCOME: "welcome",
  CONNECT_SCALE: "connect",
  EMPTY_CONTAINER: "empty",
  TARE_WEIGHT: "tare",
  FILL_PRODUCT: "fill",
};

export default function RefillStartPage({ onNext, onHome }) {
  const [step, setStep] = useState(REFILL_STEPS.WELCOME);
  const [stableWeight, setStableWeight] = useState(false);
  const [devWeight, setDevWeight] = useState(null);
  const weightRef = useRef(0);
  const productNameRef = useRef(null);

  const { session, setBottleWeight, setCombinedWeight, calculateTotalPrice } = useSession();
  const { weight: btWeight, isConnected, isConnecting, connect } = useBluetoothContext();

  const displayWeight = devWeight !== null ? devWeight : btWeight;
  const isScaleConnected = isConnected || devWeight !== null;

  // 개발용: 콘솔에서 무게를 설정할 수 있도록 전역 함수 노출
  useEffect(() => {
    // 전역 함수 추가
    window.setWeight = (weight) => {
      console.log(`🔧 [DEV] 무게를 ${weight}g로 설정합니다`);
      setDevWeight(weight);
    };

    window.resetWeight = () => {
      console.log("🔧 [DEV] 무게를 블루투스 값으로 초기화합니다");
      setDevWeight(null);
    };

    window.getCurrentStep = () => {
      console.log("🔧 [DEV] 현재 단계:", step);
      console.log("🔧 [DEV] 현재 무게:", displayWeight);
      console.log("🔧 [DEV] 공병 무게:", session.bottleWeight);
      console.log("🔧 [DEV] isConnected:", isConnected);
      return { step, weight: displayWeight, bottleWeight: session.bottleWeight, isConnected };
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
      delete window.setWeight;
      delete window.resetWeight;
      delete window.getCurrentStep;
    };
  }, [step, displayWeight, session.bottleWeight, isConnected]);

  // step 변경 시 로그
  useEffect(() => {
    console.log("Step changed to:", step);
    console.log("SessionContext:", session);
  }, [step, session]);

  // 시작 화면 자동 진행
  useEffect(() => {
    if (step === REFILL_STEPS.WELCOME) {
      const timer = setTimeout(() => {
        setStep(isScaleConnected ? REFILL_STEPS.EMPTY_CONTAINER : REFILL_STEPS.CONNECT_SCALE);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, isScaleConnected]);

  // 저울 연결 후 자동 진행
  useEffect(() => {
    if (isScaleConnected && step === REFILL_STEPS.CONNECT_SCALE) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    }
  }, [isScaleConnected, step]);

  // 무게 안정화 감지
  useEffect(() => {
    const threshold = step === REFILL_STEPS.FILL_PRODUCT ? session.bottleWeight : 0;
    const needsStability = step === REFILL_STEPS.EMPTY_CONTAINER || step === REFILL_STEPS.FILL_PRODUCT;

    if (!needsStability || displayWeight <= threshold) {
      setStableWeight(false);
      return;
    }

    if (weightRef.current !== displayWeight) {
      setStableWeight(false);
      weightRef.current = displayWeight;
    }

    const timer = setTimeout(() => setStableWeight(true), 1000);
    return () => clearTimeout(timer);
  }, [displayWeight, step, session.bottleWeight]);

  // 공병 무게 측정 완료
  const handleTareComplete = useCallback(() => {
    setBottleWeight(displayWeight);
    setStep(REFILL_STEPS.TARE_WEIGHT);
    setTimeout(() => setStep(REFILL_STEPS.FILL_PRODUCT), 3000);
  }, [displayWeight, setBottleWeight]);

  // 리필 완료
  const handleFillComplete = useCallback(() => {
    const fillWeight = displayWeight - session.bottleWeight;
    setCombinedWeight(displayWeight);
    calculateTotalPrice(fillWeight);
    if (onNext) onNext();
  }, [displayWeight, session.bottleWeight, setCombinedWeight, calculateTotalPrice, onNext]);

  // 제품명 폰트 크기 동적 조정
  useEffect(() => {
    if (!productNameRef.current || step !== REFILL_STEPS.FILL_PRODUCT) return;

    const adjustFontSize = () => {
      const element = productNameRef.current;

      // 뷰포트 너비에서 kiosk-content의 padding(64px * 2)을 뺀 값을 사용
      const availableWidth = window.innerWidth - (64 * 2);

      let fontSize = 72; // 최대 폰트 크기
      element.style.fontSize = `${fontSize}px`;

      // 텍스트가 사용 가능한 너비를 넘지 않을 때까지 폰트 크기 감소
      while (element.scrollWidth > availableWidth && fontSize > 24) {
        fontSize -= 2;
        element.style.fontSize = `${fontSize}px`;
      }

      console.log('🔧 [FontSize] 제품명:', session.selectedProduct?.name);
      console.log('🔧 [FontSize] 뷰포트 너비:', window.innerWidth);
      console.log('🔧 [FontSize] 사용 가능 너비:', availableWidth);
      console.log('🔧 [FontSize] 텍스트 너비:', element.scrollWidth);
      console.log('🔧 [FontSize] 최종 폰트 크기:', fontSize);
    };

    // 약간의 지연을 주어 DOM이 완전히 렌더링되도록 함
    setTimeout(adjustFontSize, 0);
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [step, session.selectedProduct?.name]);

  // 치트키: x 키로 단계별 시뮬레이션
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key.toLowerCase() !== "x") return;

      if (step === REFILL_STEPS.CONNECT_SCALE) {
        setDevWeight(50);
        setStep(REFILL_STEPS.EMPTY_CONTAINER);
      } else if (step === REFILL_STEPS.EMPTY_CONTAINER) {
        setDevWeight(50);
        handleTareComplete();
      } else if (step === REFILL_STEPS.FILL_PRODUCT) {
        let current = session.bottleWeight;
        const interval = setInterval(() => {
          current += 10;
          if (current >= 400) {
            current = 400;
            clearInterval(interval);
          }
          setDevWeight(current);
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, session.bottleWeight, handleTareComplete]);

  const ScaleDisplay = ({ showBottle = false }) => (
    <>
      <img className="scale-image" src={scaleImg} alt="저울" />
      <div className="refill-weight-display">
        현재 무게: {displayWeight}g
        {showBottle && ` (빈 병: ${session.bottleWeight}g)`}
      </div>
    </>
  );

  const calculatePrice = () => {
    const productWeight = displayWeight - session.bottleWeight;
    const productCost = (session.selectedProduct?.price || 0) * productWeight;
    const containerCost = session.purchaseContainer ? 500 : 0;
    return productCost + containerCost;
  };

  // 각 단계별 콘텐츠 렌더링
  const renderContent = () => {
    switch (step) {
      case REFILL_STEPS.WELCOME:
        return (
          <div className="kiosk-content-center">
            <h1 className="kiosk-title-light">
              지금부터
              <br />
              리필을 시작할게요
            </h1>
          </div>
        );

      case REFILL_STEPS.CONNECT_SCALE:
        return (
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">저울을 연결해주세요</h1>
              <div className="kiosk-subtitle-light">
                블루투스로 무게 데이터를 받아옵니다
              </div>
            </div>
            <ScaleDisplay />
            <Button
              variant="small"
              onClick={connect}
              disabled={isConnecting || isScaleConnected}
            >
              {isConnecting ? "연결 중..." : isScaleConnected ? "연결됨" : "저울 연결하기"}
            </Button>
          </div>
        );

      case REFILL_STEPS.EMPTY_CONTAINER:
        return (
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                빈 병을
                <br />
                저울에 올려주세요
              </h1>
              <div className="kiosk-subtitle-light">
                저울의 영점이 맞춰져 있는지 꼭 확인!
              </div>
            </div>
            <ScaleDisplay />
          </div>
        );

      case REFILL_STEPS.TARE_WEIGHT:
        return (
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                병의 무게는 {displayWeight}g이네요!
              </h1>
              <div className="kiosk-subtitle-light">
                이 값은 빼고 계산할게요.
              </div>
            </div>
          </div>
        );

      case REFILL_STEPS.FILL_PRODUCT:
        return (
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="product-name" ref={productNameRef}>
                {session.selectedProduct?.name}
              </h1>
              <h1 className="kiosk-title-light">
                를 리필하시고 저울에 올려주세요
              </h1>
            </div>
            <ScaleDisplay showBottle />
            {displayWeight > session.bottleWeight && (
              <div className="refill-price-preview">
                <div className="refill-price-calculation">
                  ₩{session.selectedProduct?.price}/g × ({displayWeight} -{" "}
                  {session.bottleWeight})g
                  {session.purchaseContainer && " + ₩500"} =
                </div>
                <div className="refill-price-total">
                  ₩{calculatePrice().toLocaleString()}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // 각 단계별 푸터 렌더링
  const renderFooter = () => {
    switch (step) {
      case REFILL_STEPS.EMPTY_CONTAINER:
        return (
          <Button
            variant="outlined"
            onClick={handleTareComplete}
            disabled={!stableWeight}
          >
            공병 무게 측정 완료
          </Button>
        );

      case REFILL_STEPS.FILL_PRODUCT:
        return (
          <Button
            variant="outlined"
            onClick={handleFillComplete}
            disabled={!stableWeight}
          >
            결제하기
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="kiosk-page-primary">
      <KioskHeader onHome={onHome} variant="light" />
      {renderContent()}
      <div className="kiosk-footer">{renderFooter()}</div>
    </div>
  );
}
