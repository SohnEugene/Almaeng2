// src/pages/ContainerPurchasePage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import bottlesImage from "../assets/images/bottles.png";
import useInactivityTimeout from "../hooks/useInactivityTimeout";

export default function ContainerPurchasePage({ onNext, onHome }) {
  const { setPurchaseContainer } = useSession();

  // 5분 동안 인터랙션이 없으면 HomePage로 이동
  useInactivityTimeout(onHome, 300000);

  const handlePurchase = () => {
    setPurchaseContainer(true);
    onNext();
  };

  const handleSkip = () => {
    setPurchaseContainer(false);
    onNext();
  };

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-title">
          아래에 비치된 용기를
          <br />
          이용해주세요
        </div>
        <img className="bottle-image" src={bottlesImage} alt="" />
      </div>
      <div className="kiosk-footer">
        <div className="kiosk-button-container">
          <Button variant="primary" onClick={handlePurchase}>
            리필 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
