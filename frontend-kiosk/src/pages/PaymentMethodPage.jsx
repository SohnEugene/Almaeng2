// src/pages/PaymentMethodPage.jsx
import { useState } from "react";
import "../styles/pages.css";
import kakaoPayImage from "../assets/images/kakaopay.png";
import tossPayImage from "../assets/images/tosspay.png";
import { useSession } from "../contexts/SessionContext";
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";

const PAYMENT_METHODS = {
  KAKAO: "kakaopay",
  TOSS: "tosspay",
};

export default function PaymentMethodPage({ onNext, onHome }) {
  const { setPaymentMethod } = useSession();
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  const handleNext = () => {
    if (selectedMethod) {
      onNext();
    }
  };

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />

      <div className="kiosk-content">
        <div className="kiosk-content-header">
          <h1 className="kiosk-title">결제 수단</h1>
          <div className="kiosk-subtitle">간편한 QR 송금으로 결제할게요!</div>
        </div>

        <div className="payment-button-container">
          <button
            className={`paymentMethodButton ${
              selectedMethod === PAYMENT_METHODS.KAKAO
                ? "paymentMethodButtonSelected"
                : ""
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.KAKAO)}
          >
            <img
              src={kakaoPayImage}
              alt="카카오페이"
              className="paymentMethodImage"
            />
          </button>

          {/* 토스페이 결제 */}
          <button
            className={`paymentMethodButton ${
              selectedMethod === PAYMENT_METHODS.TOSS
                ? "paymentMethodButtonSelected"
                : ""
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.TOSS)}
          >
            <img
              src={tossPayImage}
              alt="토스페이"
              className="paymentMethodImage"
            />
          </button>
        </div>
      </div>
      <div className="kiosk-footer">
        <Button
          variant="primary"
          size="large"
          onClick={handleNext}
          disabled={!selectedMethod}
        >
          선택 완료
        </Button>
      </div>
    </div>
  );
}
