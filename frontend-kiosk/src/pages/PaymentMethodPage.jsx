// src/pages/PaymentMethodPage.jsx
import { useState } from 'react';
import styles from '../styles/pages.module.css';

const PAYMENT_METHODS = {
  CARD: 'card',
  SIMPLE: 'simple',
};

export default function PaymentMethodPage({ onNext, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    // 결제 수단 선택 후 바로 다음 단계로
    setTimeout(() => {
      onNext();
    }, 300);
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
          {/* 카드 결제 */}
          <button
            className={`${styles.paymentMethodOption} ${
              selectedMethod === PAYMENT_METHODS.CARD ? styles.selected : ''
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.CARD)}
          >
            <div className={styles.paymentMethodIcon}>💳</div>
            <div className={styles.paymentMethodLabel}>카드 결제</div>
          </button>

          {/* 간편 결제 */}
          <button
            className={`${styles.paymentMethodOption} ${
              selectedMethod === PAYMENT_METHODS.SIMPLE ? styles.selected : ''
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.SIMPLE)}
          >
            <div className={styles.paymentMethodSimpleIcons}>
              <div className={styles.paymentMethodSimpleIcon} style={{ backgroundColor: '#03C75A' }}>
                N Pay
              </div>
              <div className={styles.paymentMethodSimpleIcon} style={{ backgroundColor: '#FEE500', color: '#000' }}>
                K Pay
              </div>
              <div className={styles.paymentMethodSimpleIcon} style={{ backgroundColor: '#1428A0' }}>
                S Pay
              </div>
            </div>
            <div className={styles.paymentMethodLabel}>간편 결제</div>
          </button>
        </div>

        <div className={styles.paymentMethodFooter}>
          <div className={styles.paymentMethodLogo}>ALMAENG</div>
        </div>
      </div>
    </div>
  );
}
