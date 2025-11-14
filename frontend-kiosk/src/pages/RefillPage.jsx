// src/pages/RefillStartPage.jsx
import { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import styles from "../styles/pages.module.css";
import { useSession } from "../contexts/SessionContext";
import { useBluetoothContext } from "../contexts/BluetoothContext";

// 리필 단계
const REFILL_STEPS = {
  WELCOME: "welcome", // 온보딩 시작
  CONNECT_SCALE: "connect", // 저울 연결
  EMPTY_CONTAINER: "empty", // 빈 병을 올리세요
  TARE_WEIGHT: "tare", // 병 무게 측정 완료
  FILL_PRODUCT: "fill", // 샴푸를 담은 병을 올리세요
  MEASURING: "measuring", // 무게 인식 중
  COMPLETE: "complete", // 최종 가격 및 결제
};

export default function RefillStartPage({ onNext, onReset }) {
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
    console.log("📍 Step changed to:", step);
    console.log("📦 SessionContext:", session);
  }, [step, session]);

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
    setTimeout(() => setStep(REFILL_STEPS.FILL_PRODUCT), 2000);
  };

  // 리필 완료
  const handleFillComplete = () => {
    const fillWeight = weight - session.bottleWeight;
    setCombinedWeight(weight);
    calculateTotalPrice(fillWeight);
    setStep(REFILL_STEPS.COMPLETE);
  };

  // 초기 화면으로 돌아가기 (세션 초기화)
  const handleBackToHome = () => {
    resetSession();
    if (onReset) onReset();
  };

  // ===================== 렌더링 =====================
  if (step === REFILL_STEPS.WELCOME) {
    return (
      <div className={styles.refillStartContainer} onClick={handleWelcomeNext}>
        <div className={styles.refillStartMainText}>
          지금부터
          <br />
          리필을 시작할게요
        </div>
      </div>
    );
  }

  if (step === REFILL_STEPS.CONNECT_SCALE) {
    return (
      <div className={styles.refillContainer}>
        <div className={styles.refillHeader}>
          <button
            className={styles.refillBackButton}
            onClick={handleBackToHome}
          >
            ← 초기 화면
          </button>
        </div>
        <div className={styles.refillContent}>
          <div className={styles.refillMainText}>저울과 연결해주세요</div>
          {error && (
            <div className={styles.refillSubText} style={{ color: "red" }}>
              ⚠️ {error}
            </div>
          )}
          {deviceName && (
            <div className={styles.refillSubText}>연결됨: {deviceName}</div>
          )}
          <img className={styles.refillIcon} src="scale.png" alt="저울" />
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
      </div>
    );
  }

  return (
    <div className={styles.refillContainer}>
      <div className={styles.refillHeader}>
        <button className={styles.refillBackButton} onClick={handleBackToHome}>
          ← 초기 화면
        </button>
      </div>

      <div className={styles.refillContent}>
        {step === REFILL_STEPS.EMPTY_CONTAINER && (
          <>
            <div className={styles.refillMainText}>
              빈 병을
              <br />
              저울에 올려주세요
            </div>
            <div className={styles.refillSubText}>
              빈 병의 무게를 먼저 잴게요
            </div>
            <div className={styles.refillSubText}>
              저울의 영점이 맞춰져 있는지 꼭 확인!
            </div>
            <div className={styles.refillIcon}>⚖️</div>
            <div className={styles.refillWeightDisplay}>
              현재 무게: {weight}g
            </div>
            <Button onClick={handleTareComplete} disabled={!stableWeight}>
              무게 측정 완료
            </Button>
          </>
        )}

        {step === REFILL_STEPS.TARE_WEIGHT && (
          <>
            <div className={styles.refillMainText}>
              병의 무게는
              <br />
              {session.bottleWeight}g이네요!
            </div>
            <div className={styles.refillSubText}>이 값은 빼고 계산할게요</div>
            <div className={styles.refillIconWithBottle}>
              <div className={styles.refillBottle}>🧴</div>
              <div className={styles.refillScale}>⚖️</div>
            </div>
          </>
        )}

        {step === REFILL_STEPS.FILL_PRODUCT && (
          <>
            <div className={styles.refillMainText}>
              이제 제품을 리필하시고
              <br />
              병을 다시 올려주세요
            </div>
            <div className={styles.refillIconWithBottle}>
              <div className={styles.refillBottle}>🧴</div>
              <div className={styles.refillScale}>⚖️</div>
            </div>
            <div className={styles.refillWeightDisplay}>
              현재 무게: {weight}g (빈 병: {session.bottleWeight}g)
            </div>
            <Button onClick={handleFillComplete} disabled={!stableWeight}>
              리필 완료
            </Button>
          </>
        )}

        {step === REFILL_STEPS.MEASURING && (
          <>
            <div className={styles.refillMainText}>무게 인식 중...</div>
            <div className={styles.refillIconWithBottle}>
              <div className={styles.refillBottle}>🧴</div>
              <div className={styles.refillScale}>⚖️</div>
            </div>
          </>
        )}

        {step === REFILL_STEPS.COMPLETE && (
          <>
            <div className={styles.refillPrice}>
              <div className={styles.refillPriceLabel}>현재 가격</div>
              <div className={styles.refillPriceValue}>
                {session.totalPrice.toLocaleString()}원
              </div>
              <div className={styles.refillPriceDetail}>
                {session.selectedProduct?.brand} {session.selectedProduct?.name}
                <br />₩{session.selectedProduct?.price}/g × {session.weight}g =
                ₩
                {(
                  session.selectedProduct?.price * session.weight
                ).toLocaleString()}
                {session.purchaseContainer && (
                  <>
                    <br />
                    공병 구매: ₩500
                  </>
                )}
              </div>
            </div>
            <div className={styles.refillBottleImage}>🧴</div>
            <Button onClick={onNext}>결제하기</Button>
          </>
        )}
      </div>
    </div>
  );
}
