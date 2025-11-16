// src/pages/PaymentMethodPage.jsx
import { useState } from 'react';
import styles from '../styles/pages.module.css';
import kakaoPayImage from '../assets/images/kakaopay.png';
import tossPayImage from '../assets/images/tosspay.png';
import { useSession } from '../contexts/SessionContext';
import Button from '../components/Button';

const PAYMENT_METHODS = {
  KAKAO: 'kakaopay',
  TOSS: 'tosspay',
};

export default function PaymentMethodPage({ onNext, onBack }) {
  const { setPaymentMethod } = useSession();
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  const handleNext = () => {
    if (selectedMethod) {
      onNext();
    }
  };

  return (
    <div className={styles.paymentMethodContainer}>
      <div className={styles.paymentMethodHeader}>
        <button className={styles.paymentMethodBackButton} onClick={onBack}>
          ←
        </button>
      </div>

      <div className={styles.paymentMethodContent}>
        <h1 className={styles.paymentMethodTitle}>결제 수단</h1>

        <div className={styles.paymentMethodOptions}>
          {/* 카카오페이 결제 */}
          <button
            className={`${styles.paymentMethodButton} ${
              selectedMethod === PAYMENT_METHODS.KAKAO ? styles.paymentMethodButtonSelected : ''
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.KAKAO)}
          >
            <div className={styles.paymentMethodButtonContent}>
              <img
                src={kakaoPayImage}
                alt="카카오페이"
                className={styles.paymentMethodImage}
              />
              <span className={styles.paymentMethodButtonText}>카카오페이</span>
            </div>
            {selectedMethod === PAYMENT_METHODS.KAKAO && (
              <span className={styles.paymentMethodCheckmark}>✓</span>
            )}
          </button>

          {/* 토스페이 결제 */}
          <button
            className={`${styles.paymentMethodButton} ${
              selectedMethod === PAYMENT_METHODS.TOSS ? styles.paymentMethodButtonSelected : ''
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.TOSS)}
          >
            <div className={styles.paymentMethodButtonContent}>
              <img
                src={tossPayImage}
                alt="토스페이"
                className={styles.paymentMethodImage}
              />
              <span className={styles.paymentMethodButtonText}>토스페이</span>
            </div>
            {selectedMethod === PAYMENT_METHODS.TOSS && (
              <span className={styles.paymentMethodCheckmark}>✓</span>
            )}
          </button>
        </div>

        <div className={styles.paymentMethodActions}>
          <Button
            variant="primary"
            size="large"
            onClick={handleNext}
            disabled={!selectedMethod}
          >
            다음
          </Button>
        </div>

        <div className={styles.paymentMethodFooter}>
          <div className={styles.paymentMethodLogo}>ALMAENG</div>
        </div>
      </div>
    </div>
  );
}
