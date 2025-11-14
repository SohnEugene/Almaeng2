// src/pages/PaymentSuccessPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { approvePayment } from '../services/api/payment';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

/**
 * 카카오페이 결제 성공 후 리다이렉트되는 페이지
 *
 * URL 쿼리 파라미터에서 pg_token을 받아서 결제 승인 API를 호출합니다.
 */
export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [approvalResult, setApprovalResult] = useState(null);

  useEffect(() => {
    const approvePaymentProcess = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // URL에서 pg_token 추출
        const pgToken = searchParams.get('pg_token');
        if (!pgToken) {
          throw new Error('pg_token이 없습니다.');
        }

        // localStorage에서 tid 가져오기
        const tid = localStorage.getItem('payment_tid');
        if (!tid) {
          throw new Error('결제 정보(tid)가 없습니다.');
        }

        console.log('💳 결제 승인 요청:', { tid, pg_token: pgToken });

        // 결제 승인 API 호출
        const response = await approvePayment({
          tid,
          pg_token: pgToken,
        });

        console.log('✅ 결제 승인 성공:', response);

        setApprovalResult(response);
        setIsProcessing(false);

        // 결제 완료 후 localStorage 정리
        localStorage.removeItem('payment_tid');

        // 3초 후 자동으로 완료 페이지로 이동
        setTimeout(() => {
          navigate('/', { replace: true, state: { fromPayment: true } });
        }, 3000);
      } catch (err) {
        console.error('❌ 결제 승인 실패:', err);
        setError(err.message || '결제 승인 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    approvePaymentProcess();
  }, [searchParams, navigate]);

  return (
    <div className={styles.paymentProcessingContainer}>
      <div className={styles.paymentProcessingContent}>
        {isProcessing && (
          <div className={styles.paymentProcessingText}>
            결제 승인 중...
          </div>
        )}

        {!isProcessing && !error && approvalResult && (
          <>
            <div className={styles.paymentProcessingText} style={{ color: 'green' }}>
              ✅ 결제가 완료되었습니다!
            </div>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
              <p>거래번호: {approvalResult.txid}</p>
              <p>잠시 후 메인 화면으로 이동합니다...</p>
            </div>
            <div className={styles.paymentProcessingAction}>
              <Button onClick={() => navigate('/', { replace: true })}>
                바로 이동
              </Button>
            </div>
          </>
        )}

        {error && (
          <>
            <div className={styles.paymentProcessingText} style={{ color: 'red' }}>
              ❌ {error}
            </div>
            <div className={styles.paymentProcessingAction}>
              <Button onClick={() => navigate('/', { replace: true })}>
                처음으로 돌아가기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
