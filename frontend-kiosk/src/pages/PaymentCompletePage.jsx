// src/pages/PaymentCompletePage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import useInactivityTimeout from "../hooks/useInactivityTimeout";

export default function PaymentCompletePage({ onHome }) {
  const { session } = useSession();

  // 5분 동안 인터랙션이 없으면 HomePage로 이동
  useInactivityTimeout(onHome, 300000);

  // 절약 금액 및 퍼센트 계산
  const calculateSavings = () => {
    const { selectedProduct, weight, totalPrice } = session;

    if (!selectedProduct?.original_price || !selectedProduct?.original_gram || weight === 0) {
      return null;
    }

    // 일반 제품을 같은 무게만큼 구매했을 때의 가격
    const originalTotalPrice = (selectedProduct.original_price / selectedProduct.original_gram) * weight;

    // 절약 금액
    const savedAmount = originalTotalPrice - totalPrice;

    // 절약 퍼센트
    const savedPercent = (savedAmount / originalTotalPrice) * 100;

    return {
      savedAmount: Math.round(savedAmount),
      savedPercent: Math.round(savedPercent)
    };
  };

  const savings = calculateSavings();

  const originalTotalPrice = savings
    ? (session.selectedProduct.original_price / session.selectedProduct.original_gram) * session.weight
    : 0;

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-title">리필이 완료되었습니다.</div>
        <div className="kiosk-subtitle">
          실제로 결제를 진행했다면...
        </div>

        {savings && (
          <div className="savings-info">
            <div className="price-comparison">
              <div className="price-row">
                <span className="price-label">일반 제품 구매 시</span>
                <span className="price-value original">₩{Math.round(originalTotalPrice).toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">리필 제품 구매 시</span>
                <span className="price-value refill">₩{session.totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="savings-summary">
              <div className="savings-amount">
                ₩{savings.savedAmount.toLocaleString()} 절약
              </div>
              <div className="savings-percent">
                {savings.savedPercent}% 할인
              </div>
            </div>
          </div>
        )}

        <div className="kiosk-subtitle">
          나도 좋고 환경도 좋은 리필, <br/> 많은 참여 부탁드립니다!
        </div>
      </div>
      <div className="kiosk-footer">
        <Button onClick={onHome}>처음으로</Button>
      </div>
    </div>
  );
}
