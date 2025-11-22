// src/pages/RefillStartPage.jsx
import { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import { useBluetoothContext } from "../contexts/BluetoothContext";
import scaleImg from "../assets/images/measurement.png";

// 리필 단계
const REFILL_STEPS = {
  WELCOME: "welcome", // 온보딩 시작
  CONNECT_SCALE: "connect", // 저울 연결
  EMPTY_CONTAINER: "empty", // 빈 병을 올리세요
  TARE_WEIGHT: "tare", // 병 무게 측정 완료
  FILL_PRODUCT: "fill", // 샴푸를 담은 병을 올리세요
  // COMPLETE: "complete", // (제거됨) 실시간 가격 표시로 대체
};

export default function RefillStartPage({ onNext, onReset, onHome }) {
  const [step, setStep] = useState(REFILL_STEPS.WELCOME);
  const [stableWeight, setStableWeight] = useState(false);
  const weightRef = useRef(0);

  const {
    session,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    resetSession,
  } = useSession();
  const {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
  } = useBluetoothContext();

  // step 변경 시 SessionContext 상태 출력
  useEffect(() => {
    console.log("Step changed to:", step);
    console.log("SessionContext:", session);
  }, [step, session]);

  useEffect(() => {
    if (step === REFILL_STEPS.WELCOME) {
      const timer = setTimeout(() => {
        handleWelcomeNext();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // 시작 화면에서 다음 단계로 (저울 연결 상태 확인)
  const handleWelcomeNext = () => {
    if (isConnected) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    } else {
      setStep(REFILL_STEPS.CONNECT_SCALE);
    }
  };

  // 저울 연결 완료 후 다음 단계로
  useEffect(() => {
    if (isConnected && step === REFILL_STEPS.CONNECT_SCALE) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    }
  }, [isConnected, step]);

  // 무게 안정화 감지 (1초 동안 변화 없으면 stableWeight true)
  useEffect(() => {
    let timer;

    if (step === REFILL_STEPS.EMPTY_CONTAINER) {
      if (weight > 0) {
        if (weightRef.current !== weight) {
          setStableWeight(false);
          weightRef.current = weight;
        }
        timer = setTimeout(() => setStableWeight(true), 1000);
      } else {
        setStableWeight(false);
      }
    }

    if (step === REFILL_STEPS.FILL_PRODUCT) {
      if (weight > session.bottleWeight) {
        if (weightRef.current !== weight) {
          setStableWeight(false);
          weightRef.current = weight;
        }
        timer = setTimeout(() => setStableWeight(true), 1000);
      } else {
        setStableWeight(false);
      }
    }

    return () => clearTimeout(timer);
  }, [weight, step, session.bottleWeight]);

  // 공병 무게 완료
  const handleTareComplete = () => {
    setBottleWeight(weight);
    setStep(REFILL_STEPS.TARE_WEIGHT);
    setTimeout(() => setStep(REFILL_STEPS.FILL_PRODUCT), 3000);
  };

  // 리필 완료
  const handleFillComplete = () => {
    const fillWeight = weight - session.bottleWeight;
    setCombinedWeight(weight);
    calculateTotalPrice(fillWeight);
    // COMPLETE 단계를 건너뛰고 바로 다음 페이지(결제)로 이동
    if (onNext) onNext();
  };

  // ===================== 렌더링 =====================
  if (step === REFILL_STEPS.WELCOME) {
    return (
      <div className="kiosk-page-primary" style={{ cursor: "default" }}>
        <div className="kiosk-content-center">
          <h1 className="kiosk-title-light">
            지금부터
            <br />
            리필을 시작할게요
          </h1>
        </div>
      </div>
    );
  }
  if (step === REFILL_STEPS.CONNECT_SCALE) {
    return (
      <div className="kiosk-page-primary">
        <KioskHeader onHome={onHome} variant="light" />
        <div className="kiosk-content">
          <div className="kiosk-content-header">
            <h1 className="kiosk-title-light">저울을 연결해주세요</h1>
            <div className="kiosk-subtitle-light">
              블루투스로 무게 데이터를 받아옵니다
            </div>
          </div>
          <img src={scaleImg} className="scale-image" alt="저울" />
          <Button
            variant="small"
            onClick={connect}
            disabled={isConnecting || isConnected}
          >
            {isConnecting
              ? "연결 중..."
              : isConnected
                ? "연결됨"
                : "저울 연결하기"}
          </Button>
        </div>
        <div className="kiosk-footer"></div>
      </div>
    );
  }

  return (
    <div className="kiosk-page-primary">
      <KioskHeader onHome={onHome} variant="light" />

      {step === REFILL_STEPS.EMPTY_CONTAINER && (
        <>
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
            <img className="scale-image" src={scaleImg} />
            <div className="refillWeightDisplay">현재 무게: {weight}g</div>
          </div>
          <div className="kiosk-footer">
            <Button
              variant="outlined"
              onClick={handleTareComplete}
              disabled={!stableWeight}
            >
              무게 측정 완료
            </Button>
          </div>
        </>
      )}

      {step === REFILL_STEPS.TARE_WEIGHT && (
        <>
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                병의 무게는 {session.bottleWeight}g이네요!
              </h1>
              <div className="kiosk-subtitle-light">
                이 값은 빼고 계산할게요.
              </div>
            </div>
          </div>
        </>
      )}

      {step === REFILL_STEPS.FILL_PRODUCT && (
        <>
          <div className="kiosk-content">
            <div className="kiosk-content-header">
              <h1 className="kiosk-title-light">
                이제 제품을 리필하시고
                <br />
                병을 다시 올려주세요
              </h1>
            </div>
            <img className="scale-image" src={scaleImg} />
            <div className="refillWeightDisplay">
              현재 무게: {weight}g (빈 병: {session.bottleWeight}g)
            </div>
            {weight > session.bottleWeight && (
              <div className="refillPricePreview">
                <div className="refillPriceCalculation">
                  ₩{session.selectedProduct?.price}/g × ({weight} -{" "}
                  {session.bottleWeight})g
                  {session.purchaseContainer && " + ₩500"}
                  &nbsp;=&nbsp;
                </div>
                <div className="refillPriceTotal">
                  ₩
                  {(
                    (session.selectedProduct?.price || 0) *
                      (weight - session.bottleWeight) +
                    (session.purchaseContainer ? 500 : 0)
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </div>
          <div className="kiosk-footer">
            <Button
              variant="outlined"
              onClick={handleFillComplete}
              disabled={!stableWeight}
            >
              결제하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
