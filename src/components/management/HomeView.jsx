import KioskSummary from "./KioskSummary";
import ManagerPanel from "./ManagerPanel";

export default function HomeView({
  kioskInfo,
  managerInfo,
  onClearKiosk,
  onClearManager,
  onNavigate,
  VIEWS,
}) {
  return (
    <div className="home-grid">
      <div className="home-info">
        <KioskSummary kioskInfo={kioskInfo} onClear={onClearKiosk} />
        <ManagerPanel managerInfo={managerInfo} onClear={onClearManager} />
      </div>
      <div className="home-actions-grid">
        <button
          className="home-action-card"
          onClick={() => onNavigate(VIEWS.REGISTER)}
        >
          <span className="card-eyebrow">STEP 01</span>
          <span className="card-title">키오스크 등록</span>
          <span className="card-link">등록 화면 열기 →</span>
        </button>

        <button
          className={`home-action-card ${!kioskInfo ? "disabled" : ""}`}
          onClick={() => onNavigate(VIEWS.PRODUCTS)}
        >
          <span className="card-eyebrow">STEP 02</span>
          <span className="card-title">제품 관리</span>
          <span className="card-link">
            {kioskInfo ? "제품 관리 →" : "키오스크 등록 필요"}
          </span>
        </button>

        <button
          className="home-action-card"
          onClick={() => onNavigate(VIEWS.MANAGER)}
        >
          <span className="card-eyebrow">STEP 03</span>
          <span className="card-title">관리자 선택</span>
          <span className="card-link">관리자 선택 →</span>
        </button>

        <button
          className="home-action-card"
          onClick={() => onNavigate(VIEWS.BLUETOOTH)}
        >
          <span className="card-eyebrow">STEP 04</span>
          <span className="card-title">블루투스 저울</span>
          <span className="card-link">
            {kioskInfo ? "저울 연결 →" : "키오스크 등록 필요"}
          </span>
        </button>
      </div>
    </div>
  );
}
