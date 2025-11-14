// src/pages/PaymentCancelPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

/**
 * 카카오페이 결제 취소 시 리다이렉트되는 페이지
 */
export default function PaymentCancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage 정리
    localStorage.removeItem('payment_tid');
    console.log('💳 결제가 취소되었습니다.');
  }, []);

  return (
    <div className={styles.paymentProcessingContainer}>
      <div className={styles.paymentProcessingContent}>
        <div className={styles.paymentProcessingText} style={{ color: 'orange' }}>
          결제가 취소되었습니다
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>결제를 다시 시도하시려면 처음부터 다시 진행해주세요.</p>
        </div>
        <div className={styles.paymentProcessingAction}>
          <Button onClick={() => navigate('/', { replace: true })}>
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
