// src/pages/ContainerCheckPage.jsx
import Button from "../components/Button";
import KioskHeader from "../components/KioskHeader";
import { useSession } from "../contexts/SessionContext";

export default function ContainerCheckPage({
  onHasContainer,
  onNoContainer,
  onHome,
}) {
  const { setHasContainer } = useSession();

  const handleYes = () => {
    // 용기 보유 여부 세션에 저장
    setHasContainer(true);
    onHasContainer();
  };

  const handleNo = () => {
    // 용기 보유하지 않음
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
          <Button variant="double" onClick={handleNo}>
            아니요, 용기가 없어요
          </Button>

          <Button variant="outlinedDouble" onClick={handleYes}>
            네, 용기를 가져왔어요
          </Button>
        </div>
      </div>
    </div>
  );
}
