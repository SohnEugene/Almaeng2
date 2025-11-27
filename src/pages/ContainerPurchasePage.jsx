// src/pages/ContainerPurchasePage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";
import bottlesImage from "../assets/images/bottles.png";

export default function ContainerPurchasePage({ onNext, onHome }) {
  const { setPurchaseContainer } = useSession();

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
          리필 전용 다회용기를
          <br />
          추가하시겠어요?
        </div>
        <img className="bottle-image" src={bottlesImage} alt="" />
      </div>
      <div className="kiosk-footer">
        <div className="kiosk-button-container">
          <Button variant="primary" onClick={handlePurchase}>
            추가하기 (500원)
          </Button>

          <Button onClick={handleSkip} variant="outlined">
            건너뛰기
          </Button>
        </div>
      </div>
    </div>
  );
}
