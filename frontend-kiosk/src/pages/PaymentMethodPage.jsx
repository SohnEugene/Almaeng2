// src/pages/PaymentMethodPage.jsx
import { useState } from 'react';
import styles from '../styles/pages.module.css';
import kakaoPayButton from '../assets/images/btn_send_regular.png';
import { preparePayment } from '../services/api';

const PAYMENT_METHODS = {
  SIMPLE: 'simple',
};

export default function PaymentMethodPage({ onNext, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onNext();
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
            className={styles.paymentMethodKakaoButton}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.SIMPLE)}
          >
            <img
              src={kakaoPayButton}
              alt="카카오페이로 결제하기"
              className={styles.paymentMethodKakaoImage}
            />
          </button>
        </div>

        <div className={styles.paymentMethodFooter}>
          <div className={styles.paymentMethodLogo}>ALMAENG</div>
        </div>
      </div>
    </div>
  );
}
