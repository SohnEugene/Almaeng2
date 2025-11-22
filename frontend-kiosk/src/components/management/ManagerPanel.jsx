export default function ManagerPanel({ managerInfo, onClear }) {
  if (!managerInfo) {
    return (
      <section className="management-panel empty-state">
        <p className="panel-eyebrow">관리자 정보</p>
        <h3>관리자가 설정되지 않았습니다</h3>
        <p>결제를 처리하려면 관리자를 설정해주세요.</p>
      </section>
    );
  }

  return (
    <section className="management-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">관리자 정보</p>
        <button className="btn-danger btn-compact" onClick={onClear}>
          관리자 정보 삭제
        </button>
      </div>
      <div className="kiosk-summary">
        <h3>{managerInfo.name}</h3>
        <p>현재 관리자</p>
        <div className="summary-details">
          <div>
            <span className="label">관리자 코드</span>
            <span className="value">{managerInfo.code}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
