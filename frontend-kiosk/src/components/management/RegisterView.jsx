export default function RegisterView({
  kioskInfo,
  formData,
  isLoading,
  error,
  onChange,
  onSubmit,
  onClearKiosk,
}) {
  return (
    <section className="management-panel">
      <div className="subpage-header">
        <h2>새 키오스크 등록</h2>
        <p className="panel-description">
          Railway 백엔드에 키오스크를 등록하고 식별자를 저장합니다.
        </p>
      </div>

      {kioskInfo ? (
        <div className="current-kiosk-info">
          <div className="info-row">
            <span className="info-label">현재 등록된 키오스크</span>
            <button className="btn-danger btn-compact" onClick={onClearKiosk}>
              등록 정보 삭제
            </button>
          </div>
          <div className="info-content">
            <div>
              <strong>{kioskInfo.name}</strong>
              <span className="info-meta">{kioskInfo.location}</span>
            </div>
            <span className="info-id">ID: {kioskInfo.kid}</span>
          </div>
          <p className="info-notice">
            새 키오스크를 등록하려면 먼저 현재 등록된 키오스크 정보를 삭제해야
            합니다.
          </p>
        </div>
      ) : (
        <form className="registration-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">키오스크 이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="예: 서울대학교 학생회관"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">위치 *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onChange}
                placeholder="예: 서울특별시 관악구 관악로 1"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !formData.name || !formData.location}
            >
              {isLoading ? "등록 중..." : "키오스크 등록"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
