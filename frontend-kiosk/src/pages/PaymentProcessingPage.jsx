// src/pages/PaymentProcessingPage.jsx
import { useEffect, useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { preparePayment } from '../services/api/payment';
import { getKioskId } from '../services/kioskStorage';
import Button from '../components/Button';
import styles from '../styles/pages.module.css';

export default function PaymentProcessingPage({ onNext }) {
  const { session } = useSession();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 세션 데이터 검증
        if (!session.selectedProduct) {
          throw new Error('선택된 제품이 없습니다.');
        }

        // 키오스크 ID 가져오기 (kioskStorage 사용)
        const kioskId = getKioskId();
        if (!kioskId) {
          throw new Error('키오스크 ID가 없습니다. /manage 페이지에서 키오스크를 먼저 등록해주세요.');
        }

        // 결제 준비 데이터 구성
        const paymentData = {
          kid: kioskId,
          pid: session.selectedProduct.pid,
          amount_grams: Math.round(session.weight),
          extra_bottle: session.purchaseContainer,
          product_price: session.pricePerGram,
          total_price: session.totalPrice,
          payment_method: 'kakaopay',
        };

        console.log('💳 결제 준비 요청:', paymentData);

        // 카카오페이 결제 준비 API 호출
        const response = await preparePayment(paymentData);

        console.log('💳 결제 준비 응답:', response);

        // tid를 localStorage에 저장 (나중에 승인 시 사용)
        localStorage.setItem('payment_tid', response.tid);

        // 카카오페이 결제 페이지로 리다이렉트
        window.location.href = response.next_redirect_pc_url;
      } catch (err) {
        console.error('❌ 결제 준비 실패:', err);
        setError(err.message || '결제 준비 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [session]);

  return (
    <div className={styles.paymentProcessingContainer}>
      <div className={styles.paymentProcessingContent}>
        {isLoading && !error && (
          <div className={styles.paymentProcessingText}>
            결제 진행 중...
          </div>
        )}

        {error && (
          <>
            <div className={styles.paymentProcessingText} style={{ color: 'red' }}>
              ❌ {error}
            </div>
            <div className={styles.paymentProcessingAction}>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </>
        )}

        {/* 개발용: 결제 완료 버튼 */}
        {!isLoading && !error && (
          <div className={styles.paymentProcessingAction}>
            <Button onClick={onNext}>
              [개발용] 결제 완료
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
