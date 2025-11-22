// src/pages/PaymentCompletePage.jsx
import Button from "../components/Button";
import "../styles/pages.css";
import KioskHeader from "../components/KioskHeader";

export default function PaymentCompletePage({ onReset }) {
  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onReset} />
      <div className="kiosk-content">
        <div className="kiosk-title">결제가 완료되었습니다.</div>

        <div className="kiosk-subtitle">
          당신의 리필이 작은 변화를 만듭니다.
        </div>
      </div>
      <div className="kiosk-footer">
        <Button onClick={onReset}>처음으로</Button>
      </div>
    </div>
  );
}
