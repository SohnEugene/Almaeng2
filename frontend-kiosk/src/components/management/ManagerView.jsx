import { useState } from "react";

export default function ManagerView({
  managerInfo,
  managers,
  onClearManager,
  onSelectManager,
  onNavigateHome,
}) {
  const [selectedManager, setSelectedManager] = useState(managerInfo);

  const handleConfirm = () => {
    if (selectedManager) {
      onSelectManager(selectedManager);
      alert(`${selectedManager.name} 관리자가 설정되었습니다.`);
      if (onNavigateHome) {
        onNavigateHome();
      }
    }
  };

  return (
    <section className="management-panel">
      <div className="subpage-header">
        <div>
          <h2>관리자 선택</h2>
          <p className="panel-description">
            송금을 받을 계좌의 관리자를 선택합니다.
          </p>
        </div>
      </div>

      {managers && managers.length > 0 ? (
        <>
          <div className="manager-grid">
            {managers.map((manager) => (
              <button
                key={manager.code}
                type="button"
                className={`manager-button ${
                  selectedManager?.code === manager.code ? "selected" : ""
                }`}
                onClick={() => setSelectedManager(manager)}
              >
                <div className="manager-name">{manager.name}</div>
                <div className="manager-code">{manager.code}</div>
              </button>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirm}
              disabled={!selectedManager}
            >
              관리자 확정
            </button>
          </div>
        </>
      ) : (
        <p className="empty-message">사용 가능한 관리자가 없습니다.</p>
      )}
    </section>
  );
}
