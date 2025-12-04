// src/pages/PaymentMethodPage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import kakaoPayImage from "../assets/images/kakaopay.png";
import tossPayImage from "../assets/images/tosspay.png";
import useInactivityTimeout from "../hooks/useInactivityTimeout";


const PAYMENT_METHODS = {
  KAKAO: "kakaopay",
  TOSS: "tosspay",
};

export default function PaymentMethodPage({ onNext, onHome }) {
  const { session, setPaymentMethod } = useSession();

  // 5분 동안 인터랙션이 없으면 HomePage로 이동
  useInactivityTimeout(onHome, 300000);

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
  };
  const currentSelectedMethod = session.paymentMethod;

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
            className={`payment-method-button ${
              currentSelectedMethod === PAYMENT_METHODS.KAKAO
                ? "payment-method-button-selected"
                : ""
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.KAKAO)}
          >
            <img
              src={kakaoPayImage}
              alt="카카오페이"
              className="payment-method-image"
            />
          </button>

          {/* 토스페이 결제 */}
          <button
            className={`payment-method-button ${
              currentSelectedMethod === PAYMENT_METHODS.TOSS
                ? "payment-method-button-selected"
                : ""
            }`}
            onClick={() => handleMethodSelect(PAYMENT_METHODS.TOSS)}
          >
            <img
              src={tossPayImage}
              alt="토스페이"
              className="payment-method-image"
            />
          </button>
        </div>
      </div>
      <div className="kiosk-footer">
        <Button
          variant="primary"
          size="large"
          onClick={onNext}
          disabled={!session.paymentMethod}
        >
          선택 완료
        </Button>
      </div>
    </div>
  );
}
