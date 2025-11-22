export default function KioskSummary({
  kioskInfo,
  onClear,
  showActions = true,
}) {
  if (!kioskInfo) {
    return (
      <section className="management-panel empty-state">
        <p className="panel-eyebrow">등록 정보</p>
        <h3>키오스크로 등록되어 있지 않습니다</h3>
        <p>키오스크로 등록하면 여기에 정보가 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="management-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">현재 등록된 키오스크</p>
        {showActions && (
          <button className="btn-danger btn-compact" onClick={onClear}>
            키오스크 정보 삭제
          </button>
        )}
      </div>
      <div className="kiosk-summary">
        <h3>{kioskInfo.name}</h3>
        <p>{kioskInfo.location}</p>
        <div className="summary-details">
          <div>
            <span className="label">키오스크 ID</span>
            <span className="value">{kioskInfo.kid}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
