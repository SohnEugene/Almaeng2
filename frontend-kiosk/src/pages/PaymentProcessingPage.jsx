// src/pages/PaymentProcessingPage.jsx
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

export default function PaymentProcessingPage({ onNext }) {
  return (
    <div className={styles.paymentProcessingContainer}>
      <div className={styles.paymentProcessingContent}>
        <div className={styles.paymentProcessingText}>
          결제 진행 중...
        </div>

        {/* 개발용: 결제 완료 버튼 */}
        <div className={styles.paymentProcessingAction}>
          <Button onClick={onNext}>
            [개발용] 결제 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
