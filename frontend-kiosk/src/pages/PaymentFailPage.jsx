// src/pages/PaymentFailPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

/**
 * 카카오페이 결제 실패 시 리다이렉트되는 페이지
 */
export default function PaymentFailPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // localStorage 정리
    localStorage.removeItem('payment_tid');
    console.log('❌ 결제가 실패했습니다.');
  }, []);

  return (
    <div className={styles.paymentProcessingContainer}>
      <div className={styles.paymentProcessingContent}>
        <div className={styles.paymentProcessingText} style={{ color: 'red' }}>
          ❌ 결제가 실패했습니다
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>결제 처리 중 오류가 발생했습니다.</p>
          <p>다시 시도하시려면 처음부터 진행해주세요.</p>
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
