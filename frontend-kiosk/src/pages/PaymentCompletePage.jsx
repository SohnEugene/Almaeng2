// src/pages/PaymentCompletePage.jsx
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

export default function PaymentCompletePage({ onReset }) {
  return (
    <div className={styles.paymentCompleteContainer}>
      <div className={styles.paymentCompleteContent}>
        <div className={styles.paymentCompleteMainText}>
          결제가 완료되었습니다.
        </div>

        <div className={styles.paymentCompleteSubText}>
          당신의 리필이 작은 변화를 만듭니다.
        </div>

        <div className={styles.paymentCompleteAction}>
          <Button onClick={onReset}>
            처음으로
          </Button>
        </div>
      </div>
    </div>
  );
}
