// src/pages/ContainerCheckPage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { useSession } from "../contexts/SessionContext";

export default function ContainerCheckPage({
  onHasContainer,
  onNoContainer,
  onHome,
}) {
  const { setHasContainer } = useSession();

  const handleYes = () => {
    setHasContainer(true);
    onHasContainer();
  };

  const handleNo = () => {
    setHasContainer(false);
    onNoContainer();
  };

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-content-header">
          <h1 className="kiosk-title">
            리필에 사용할 용기를
            <br />
            가지고 계신가요?
          </h1>
        </div>
      </div>
      <div className="kiosk-footer">
        <div className="kiosk-button-container">
          <Button variant="primary" onClick={handleNo}>
            아니요, 용기가 없어요
          </Button>

          <Button variant="outlined" onClick={handleYes}>
            네, 용기를 가져왔어요
          </Button>
        </div>
      </div>
    </div>
  );
}
