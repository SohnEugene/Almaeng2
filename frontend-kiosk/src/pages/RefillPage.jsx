// src/pages/RefillStartPage.jsx
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';
import { useSession } from '../contexts/SessionContext';
import { useBluetooth } from '../hooks/useBluetooth';

// 리필 단계
const REFILL_STEPS = {
  WELCOME: 'welcome',           // 온보딩 시작
  CONNECT_SCALE: 'connect',     // 저울 연결
  EMPTY_CONTAINER: 'empty',     // 빈 병을 올리세요
  TARE_WEIGHT: 'tare',          // 병 무게 측정 완료
  FILL_PRODUCT: 'fill',         // 샴푸를 담은 병을 올리세요
  MEASURING: 'measuring',       // 무게 인식 중
  COMPLETE: 'complete',         // 최종 가격 및 결제
};

export default function RefillStartPage({ onNext, onReset }) {
  const [step, setStep] = useState(REFILL_STEPS.WELCOME);

  const { session, setBottleWeight, setCombinedWeight, calculateTotalPrice, resetSession } = useSession();
  const { weight, isConnected, isConnecting, error, deviceName, connect, disconnect } = useBluetooth();

  // 시작 화면에서 저울 연결 단계로
  const handleWelcomeNext = () => {
    setStep(REFILL_STEPS.CONNECT_SCALE);
  };

  // 저울 연결 완료 후 다음 단계로
  useEffect(() => {
    if (isConnected && step === REFILL_STEPS.CONNECT_SCALE) {
      setStep(REFILL_STEPS.EMPTY_CONTAINER);
    }
  }, [isConnected, step]);

  // 빈 병 무게 측정 완료
  const handleTareComplete = () => {
    setBottleWeight(weight);
    setStep(REFILL_STEPS.TARE_WEIGHT);
    setTimeout(() => {
      setStep(REFILL_STEPS.FILL_PRODUCT);
    }, 2000); // 2초 후 다음 단계
  };

  // 무게 변화 감지
  useEffect(() => {
    if (step === REFILL_STEPS.FILL_PRODUCT && weight > session.bottleWeight + 10) {
      // 무게가 증가하면 측정 중으로 변경
      setStep(REFILL_STEPS.MEASURING);
    }

    if (step === REFILL_STEPS.MEASURING) {
      // 무게가 안정화되면 (1초간 변화 없으면) 완료로 변경
      const timer = setTimeout(() => {
        setCombinedWeight(weight);
        calculateTotalPrice(session.weight);
        setStep(REFILL_STEPS.COMPLETE);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [weight, step, session.bottleWeight, session.weight, setCombinedWeight, calculateTotalPrice]);

  // 초기 화면으로 돌아가기 (세션 초기화)
  const handleBackToHome = () => {
    console.log('🔄 버튼 클릭됨!');
    console.log('resetSession:', resetSession);
    console.log('onReset:', onReset);

    resetSession();
    console.log('세션 초기화 완료');

    if (onReset) {
      onReset();
      console.log('홈으로 이동');
    }
  };

  // 온보딩 화면
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

  // 저울 연결 화면
  if (step === REFILL_STEPS.CONNECT_SCALE) {
    return (
      <div className={styles.refillContainer}>
        <div className={styles.refillHeader}>
          <button className={styles.refillBackButton} onClick={handleBackToHome}>
            ← 초기 화면
          </button>
        </div>
        <div className={styles.refillContent}>
          <div className={styles.refillMainText}>
            저울과 연결해주세요
          </div>
          {error && (
            <div className={styles.refillSubText} style={{ color: 'red' }}>
              ⚠️ {error}
            </div>
          )}
          {deviceName && (
            <div className={styles.refillSubText}>
              연결됨: {deviceName}
            </div>
          )}
          <div className={styles.refillIcon}>⚖️</div>
          <Button onClick={connect} disabled={isConnecting || isConnected}>
            {isConnecting ? '연결 중...' : isConnected ? '연결됨' : '저울 연결하기'}
          </Button>
        </div>
      </div>
    );
  }

  // 메인 리필 화면 (단계 2-6)
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
            <div className={styles.refillSubText}>빈 병의 무게를 먼저 잴게요</div>
            <div className={styles.refillIcon}>⚖️</div>
            <div className={styles.refillWeightDisplay}>
             현재 무게: {weight}g
            </div>
            <Button onClick={handleTareComplete}>무게 측정 완료</Button>
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
                <br />
                ₩{session.selectedProduct?.price}/g × {session.weight}g = ₩{session.totalPrice.toLocaleString()}
              </div>
            </div>
            <div className={styles.refillBottleImage}>🧴</div>
            <Button onClick={onNext}>결제하기</Button>
            <div className={styles.refillHint}>
              더 담고 싶다면 다시 저울에 올려주세요
            </div>
          </>
        )}
      </div>
    </div>
  );
}
