// src/pages/PaymentCompletePage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";

export default function PaymentCompletePage({ onHome }) {
  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-title">결제가 완료되었습니다.</div>

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
