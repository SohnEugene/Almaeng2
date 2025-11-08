// src/pages/RefillStartPage.jsx
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';
import { useSession } from '../contexts/SessionContext';
import { getMockProducts } from '../services/api';

// 리필 단계
const REFILL_STEPS = {
  WELCOME: 'welcome',           // 온보딩 시작
  EMPTY_CONTAINER: 'empty',     // 빈 병을 올리세요
  TARE_WEIGHT: 'tare',          // 병 무게 측정 완료
  FILL_PRODUCT: 'fill',         // 샴푸를 담은 병을 올리세요
  MEASURING: 'measuring',       // 무게 인식 중
  COMPLETE: 'complete',         // 최종 가격 및 결제
};

// Mock: 개발용 - 실제 블루투스 대신 사용
const USE_MOCK = true;

export default function RefillStartPage({ onNext, onReset }) {
  const [step, setStep] = useState(REFILL_STEPS.WELCOME);
  const [containerWeight, setContainerWeight] = useState(0);
  const [productWeight, setProductWeight] = useState(0);

  // Mock 무게 (개발용)
  const [mockWeight, setMockWeight] = useState(0);

  const { session, selectProduct, setWeight, calculateTotalPrice, resetSession } = useSession();

  // Mock: 개발 환경에서 기본 제품 설정
  useEffect(() => {
    if (USE_MOCK && !session.selectedProduct) {
      const mockProducts = getMockProducts();
      selectProduct(mockProducts[0]); // 첫 번째 제품 선택
      console.log('🎯 개발용 기본 제품 설정:', mockProducts[0]);
    }
  }, []);

  /**
   * 블루투스로부터 무게 정보를 가져오는 함수
   * @returns {number} 무게 (gram)
   */
  const getWeightFromBluetooth = () => {
    // TODO: 실제 블루투스 연결 시 useBluetooth() 훅 사용
    // const { weight } = useBluetooth();
    // return weight;

    // Mock: 임시로 50g 리턴
    return 50;
  };

  // Mock 모드일 때는 mockWeight 사용, 아니면 블루투스에서 가져옴
  const weight = USE_MOCK ? mockWeight : getWeightFromBluetooth();

  // 시작 화면에서 다음 단계로
  const handleWelcomeNext = () => {
    setStep(REFILL_STEPS.EMPTY_CONTAINER);
  };

  // 빈 병 무게 측정 완료
  const handleTareComplete = () => {
    const currentWeight = weight || 50; // Mock: 기본값 50g
    setContainerWeight(currentWeight);
    setStep(REFILL_STEPS.TARE_WEIGHT);
    setTimeout(() => {
      setStep(REFILL_STEPS.FILL_PRODUCT);
    }, 2000); // 2초 후 다음 단계
  };

  // Mock: 무게 시뮬레이션 (개발용)
  const simulateEmptyContainer = () => {
    const emptyWeight = Math.floor(Math.random() * 30) + 30; // 30-60g
    setMockWeight(emptyWeight);
  };

  const simulateWeightIncrease = () => {
    const fillWeight = Math.floor(Math.random() * 200) + 100; // 100-300g
    setMockWeight(containerWeight + fillWeight);
  };

  // 무게 변화 감지
  useEffect(() => {
    if (step === REFILL_STEPS.FILL_PRODUCT && weight > containerWeight + 10) {
      // 무게가 증가하면 측정 중으로 변경
      setStep(REFILL_STEPS.MEASURING);
    }

    if (step === REFILL_STEPS.MEASURING) {
      // 무게가 안정화되면 (1초간 변화 없으면) 완료로 변경
      const timer = setTimeout(() => {
        const netWeight = weight - containerWeight;
        setProductWeight(netWeight);
        setWeight(netWeight);
        calculateTotalPrice(netWeight);
        setStep(REFILL_STEPS.COMPLETE);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [weight, step, containerWeight, setWeight, calculateTotalPrice]);

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
            {USE_MOCK && (
              <Button onClick={simulateEmptyContainer} style={{ marginBottom: '10px' }}>
                [개발용] 빈 병 올리기
              </Button>
            )}
            <Button onClick={handleTareComplete}>무게 측정 완료</Button>
          </>
        )}

        {step === REFILL_STEPS.TARE_WEIGHT && (
          <>
            <div className={styles.refillMainText}>
              병의 무게는
              <br />
              {containerWeight}g이네요!
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
            {USE_MOCK && (
              <div style={{ marginTop: '20px' }}>
                <Button onClick={simulateWeightIncrease}>
                  [개발용] 무게 증가 시뮬레이션
                </Button>
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  현재 무게: {mockWeight}g (빈 병: {containerWeight}g)
                </div>
              </div>
            )}
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
                ₩{session.selectedProduct?.price}/g × {productWeight}g = ₩{session.totalPrice.toLocaleString()}
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
