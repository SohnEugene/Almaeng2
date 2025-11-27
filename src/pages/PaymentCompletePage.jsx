// src/pages/PaymentCompletePage.jsx
import { useEffect } from "react";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import { useSound } from "../contexts/SoundContext";

export default function PaymentCompletePage({ onHome }) {
  const { session } = useSession();
  const { playSound } = useSound();

  useEffect(() => {
    playSound("QR_PRODUCT_CHECK");
  }, [playSound]);

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
        <div className="kiosk-title">결제가 완료되었습니다.</div>

        {savings && (
          <div className="savings-info">
            <div className="price-comparison">
              <div className="price-row">
                <span className="price-label">일반 제품 구매 시</span>
                <span className="price-value original">₩{Math.round(originalTotalPrice).toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span className="price-label">리필 결제 금액</span>
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
          당신의 리필이 작은 변화를 만듭니다.
        </div>
      </div>
      <div className="kiosk-footer">
        <Button onClick={onHome}>처음으로</Button>
      </div>
    </div>
  );
}
