import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerKiosk,
  getKioskProducts,
  addProductToKiosk,
  getProducts,
} from "../services/api";
import {
  saveKioskInfo,
  getKioskInfo,
  clearKioskInfo,
} from "../services/kioskStorage";
import {
  MANAGERS,
  saveManagerInfo,
  getManagerInfo,
  clearManagerInfo,
} from "../services/managerStorage";
import { useBluetoothContext } from "../contexts/BluetoothContext";
import "../styles/ManagementPage.css";

const VIEWS = {
  HOME: "home",
  REGISTER: "register",
  PRODUCTS: "products",
  MANAGER: "manager",
};

export default function ManagementPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredInfo, setRegisteredInfo] = useState(getKioskInfo());
  const [managerInfo, setManagerInfo] = useState(getManagerInfo());

  const [allProducts, setAllProducts] = useState([]);
  const [kioskProducts, setKioskProducts] = useState([]);
  const [productIdInput, setProductIdInput] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);

  const {
    weight,
    isConnected,
    isConnecting,
    error: bleError,
    deviceName,
    connect,
    disconnect,
  } = useBluetoothContext();

  useEffect(() => {
    loadAllProducts();
    if (registeredInfo?.kid) {
      loadKioskProducts();
    }
  }, [registeredInfo?.kid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await registerKiosk({
        name: formData.name,
        location: formData.location,
      });

      const kioskInfo = {
        kid: response.kid,
        name: formData.name,
        location: formData.location,
      };

      saveKioskInfo(kioskInfo);
      setRegisteredInfo(kioskInfo);
      setFormData({ name: "", location: "" });
      setCurrentView(VIEWS.HOME);
      alert("키오스크가 성공적으로 등록되었습니다!");
    } catch (err) {
      setError(err.message || "키오스크 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInfo = () => {
    if (window.confirm("저장된 키오스크 정보를 삭제하시겠습니까?")) {
      clearKioskInfo();
      setRegisteredInfo(null);
      setKioskProducts([]);
      setFormData({ name: "", location: "" });
      setCurrentView(VIEWS.HOME);
      alert("키오스크 정보가 삭제되었습니다.");
    }
  };

  const handleSelectManager = (managerCode) => {
    saveManagerInfo(managerCode);
    setManagerInfo(MANAGERS[managerCode]);
    setCurrentView(VIEWS.HOME);
    alert(`${MANAGERS[managerCode].name} 님이 관리자로 설정되었습니다.`);
  };

  const handleClearManager = () => {
    if (window.confirm("설정된 관리자 정보를 삭제하시겠습니까?")) {
      clearManagerInfo();
      setManagerInfo(null);
      alert("관리자 정보가 삭제되었습니다.");
    }
  };

  const loadAllProducts = async () => {
    try {
      const products = await getProducts();
      setAllProducts(products);
    } catch (err) {
      console.error("전체 제품 목록 로드 실패:", err);
      setAllProducts([]);
    }
  };

  const loadKioskProducts = async () => {
    if (!registeredInfo?.kid) return;
    try {
      setProductLoading(true);
      const response = await getKioskProducts(registeredInfo.kid);
      // response.products에서 product와 available 정보 추출
      const productsWithStatus = response.products.map(item => ({
        ...item.product,
        available: item.available
      }));
      setKioskProducts(productsWithStatus);
    } catch (err) {
      console.error("제품 목록 로드 실패:", err);
      setKioskProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!registeredInfo?.kid) {
      alert("먼저 키오스크를 등록해주세요.");
      return;
    }

    if (!productIdInput.trim()) {
      alert("제품 ID를 입력해주세요.");
      return;
    }

    try {
      setProductLoading(true);
      setProductError(null);
      await addProductToKiosk(registeredInfo.kid, productIdInput.trim());
      alert(`제품 ${productIdInput}이(가) 키오스크에 추가되었습니다!`);
      setProductIdInput("");
      await loadKioskProducts();
    } catch (err) {
      setProductError(err.message || "제품 추가에 실패했습니다.");
    } finally {
      setProductLoading(false);
    }
  };

  const goHome = () => setCurrentView(VIEWS.HOME);

  const renderRegisteredSummary = (options = { showActions: true }) => {
    if (!registeredInfo) {
      return (
        <section className="management-panel empty-state">
          <p className="panel-eyebrow">등록 정보</p>
          <h3>아직 등록된 키오스크가 없어요</h3>
          <p>새 키오스크를 등록하면 여기에 정보가 표시됩니다.</p>
        </section>
      );
    }

    return (
      <section className="management-panel info-panel">
        <div className="panel-header">
          <p className="panel-eyebrow">현재 등록된 키오스크</p>
          {options.showActions && (
            <button
              className="btn-danger btn-inline compact-danger"
              onClick={handleClearInfo}
            >
              등록 정보 삭제
            </button>
          )}
        </div>
        <div className="kiosk-summary">
          <div>
            <p className="summary-title">{registeredInfo.name}</p>
            <p className="summary-meta">{registeredInfo.location}</p>
          </div>
          <div className="summary-details">
            <div>
              <span className="label">키오스크 ID</span>
              <span className="value">{registeredInfo.kid}</span>
            </div>
            <div>
              <span className="label">고유 식별자</span>
              <span className="value code">{registeredInfo.unique_id}</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderManagerPanel = () => (
    <section className="management-panel info-panel">
      <div className="panel-header">
        <p className="panel-eyebrow">관리자 정보</p>
        {managerInfo && (
          <button
            className="btn-danger btn-inline compact-danger"
            onClick={handleClearManager}
          >
            관리자 정보 삭제
          </button>
        )}
      </div>
      {managerInfo ? (
        <div className="kiosk-summary">
          <div>
            <p className="summary-title">{managerInfo.name}</p>
            <p className="summary-meta">현재 관리자</p>
          </div>
          <div className="summary-details">
            <div>
              <span className="label">관리자 코드</span>
              <span className="value">{managerInfo.code}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>관리자가 설정되지 않았습니다.</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            결제를 처리하려면 관리자를 설정해주세요.
          </p>
        </div>
      )}
    </section>
  );

  const renderBluetoothPanel = () => (
    <section className="management-panel bluetooth-panel">
      <div className="bluetooth-header">
        <h3>Bluetooth 저울 연결</h3>
        {bleError && <span className="error-inline">⚠️ {bleError}</span>}
      </div>
      <div className="bluetooth-status">
        <div className="status-info">
          <span className="status-icon">{isConnected ? "✅" : "⚠️"}</span>
          <div>
            <p className="device-name">
              {isConnected
                ? `연결됨: ${deviceName || "저울"}`
                : "저울이 연결되지 않았습니다"}
            </p>
            <p className="current-weight">
              {isConnected ? `${weight} g` : "—"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={isConnected ? "btn-danger" : "btn-primary"}
          onClick={isConnected ? disconnect : connect}
          disabled={isConnecting}
        >
          {isConnected
            ? "연결 해제"
            : isConnecting
            ? "연결 중..."
            : "저울 연결"}
        </button>
      </div>
    </section>
  );

  const renderHomeView = () => (
    <div className="home-grid">
      {renderRegisteredSummary({ showActions: !!registeredInfo })}
      {renderManagerPanel()}
      <div className="home-actions-grid">
        <button
          type="button"
          className="home-action-card"
          onClick={() => setCurrentView(VIEWS.REGISTER)}
        >
          <span className="card-eyebrow">STEP 01</span>
          <h3>새 키오스크 등록</h3>
          <p>위치와 이름을 입력하고 즉시 키오스크를 연결하세요.</p>
          <span className="card-link">등록 화면 열기 →</span>
        </button>
        <button
          type="button"
          className={`home-action-card ${
            !registeredInfo ? "card-disabled" : ""
          }`}
          onClick={() => registeredInfo && setCurrentView(VIEWS.PRODUCTS)}
        >
          <span className="card-eyebrow">STEP 02</span>
          <h3>제품 관리</h3>
          <p>판매할 제품을 조회하고 키오스크에 추가합니다.</p>
          <span className="card-link">
            {!registeredInfo ? "키오스크 등록 필요" : "제품 관리로 이동 →"}
          </span>
        </button>
        <button
          type="button"
          className="home-action-card"
          onClick={() => setCurrentView(VIEWS.MANAGER)}
        >
          <span className="card-eyebrow">STEP 03</span>
          <h3>관리자 설정</h3>
          <p>결제를 처리할 관리자를 선택합니다.</p>
          <span className="card-link">관리자 선택 →</span>
        </button>
      </div>
      {renderBluetoothPanel()}
    </div>
  );

  const renderRegisterView = () => (
    <section className="management-panel">
      <div className="subpage-header">
        <div>
          <p className="panel-eyebrow">STEP 01</p>
          <h2>새 키오스크 등록</h2>
          <p className="panel-description">
            Railway 백엔드에 키오스크를 등록하고 식별자를 저장합니다.
          </p>
        </div>
      </div>

      {renderRegisteredSummary({ showActions: true })}

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">키오스크 이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 알맹상점 #1"
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
              onChange={handleChange}
              placeholder="예: 성수 쇼룸"
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
    </section>
  );

  const renderManagerView = () => (
    <section className="management-panel">
      <div className="subpage-header">
        <div>
          <p className="panel-eyebrow">STEP 03</p>
          <h2>관리자 설정</h2>
          <p className="panel-description">
            결제를 처리할 관리자를 선택하세요. 선택한 관리자의 계좌로 결제 QR 코드가 생성됩니다.
          </p>
        </div>
      </div>

      {managerInfo && (
        <section className="management-panel info-panel">
          <div className="panel-header">
            <p className="panel-eyebrow">현재 설정된 관리자</p>
            <button
              className="btn-danger btn-inline compact-danger"
              onClick={handleClearManager}
            >
              관리자 정보 삭제
            </button>
          </div>
          <div className="kiosk-summary">
            <div>
              <p className="summary-title">{managerInfo.name}</p>
              <p className="summary-meta">현재 관리자</p>
            </div>
            <div className="summary-details">
              <div>
                <span className="label">관리자 코드</span>
                <span className="value">{managerInfo.code}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="management-subpanel">
        <h3>관리자 선택</h3>
        <div className="product-list" style={{ gap: '12px' }}>
          {Object.values(MANAGERS).map((manager) => (
            <button
              key={manager.code}
              className="product-item"
              style={{
                cursor: 'pointer',
                border: managerInfo?.code === manager.code ? '2px solid #ff6b6b' : '1px solid #e0e0e0',
                backgroundColor: managerInfo?.code === manager.code ? '#fff5f5' : 'white',
                transition: 'all 0.2s',
              }}
              onClick={() => handleSelectManager(manager.code)}
            >
              <div className="product-info">
                <span className="product-name" style={{ fontSize: '18px' }}>
                  {manager.name}
                </span>
                <span className="product-id">관리자 코드: {manager.code}</span>
              </div>
              {managerInfo?.code === manager.code && (
                <span style={{ fontSize: '20px' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderProductView = () => {
    if (!registeredInfo) {
      return (
        <section className="management-panel empty-state">
          <p className="panel-eyebrow">STEP 02</p>
          <h3>제품을 관리하려면 키오스크를 먼저 등록해주세요.</h3>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setCurrentView(VIEWS.REGISTER)}
          >
            키오스크 등록하기
          </button>
        </section>
      );
    }

    return (
      <section className="management-panel">
        <div className="subpage-header">
          <div>
            <p className="panel-eyebrow">STEP 02</p>
            <h2>제품 관리</h2>
            <p className="panel-description">
              전체 제품을 조회하고 매장에 노출할 상품을 선택하세요.
            </p>
          </div>
        </div>

        <div className="product-panel-grid">
          <div className="product-section management-subpanel">
            <h3>전체 제품 목록</h3>
            {allProducts.length === 0 ? (
              <p className="empty-message">제품을 불러오는 중...</p>
            ) : (
              <div className="product-list">
                {allProducts.map((product) => (
                  <div key={product.pid} className="product-item">
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-id">ID: {product.pid}</span>
                    </div>
                    <span className="product-price">{product.price}원/g</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-add-form management-subpanel">
            <h3>키오스크에 제품 추가</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="productId">제품 ID *</label>
                <input
                  type="text"
                  id="productId"
                  value={productIdInput}
                  onChange={(e) => setProductIdInput(e.target.value)}
                  placeholder="예: prod_001"
                  disabled={productLoading}
                />
              </div>

              {productError && (
                <div className="error-message">❌ {productError}</div>
              )}

              <button
                type="submit"
                className="btn-primary product-add-submit"
                disabled={productLoading || !productIdInput.trim()}
              >
                {productLoading ? "추가 중..." : "제품 추가"}
              </button>
            </form>
          </div>
        </div>

        <div className="product-section management-subpanel">
          <h3>현재 키오스크 제품 ({kioskProducts.length}개)</h3>
          {productLoading ? (
            <p>로딩 중...</p>
          ) : kioskProducts.length > 0 ? (
            <div className="product-list">
              {kioskProducts.map((product) => (
                <div key={product.pid} className="product-item kiosk-product">
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-id">ID: {product.pid}</span>
                  </div>
                  <div className="product-status">
                    <span className="product-price">{product.price}원/g</span>
                    <span
                      className={`status-badge ${
                        product.available ? "available" : "unavailable"
                      }`}
                    >
                      {product.available ? "판매중" : "품절"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">등록된 제품이 없습니다.</p>
          )}
        </div>
      </section>
    );
  };

  const isHome = currentView === VIEWS.HOME;

  return (
    <div className="management-page">
      <header className="management-header">
        <div className="header-text-group">
          <div className="title-row">
            {!isHome && (
              <button
                type="button"
                className="header-back-icon"
                aria-label="홈으로 돌아가기"
                onClick={goHome}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  className="back-icon-svg"
                >
                  <path
                    d="M15.5 4.5 7.5 12l8 7.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            )}
            <h1 className="console-title" onClick={goHome} role="button">
              운영자 콘솔
            </h1>
          </div>
          <p className="header-description">
            태블릿에서 바로 키오스크를 등록하고 제품 목록을 관리하세요.
          </p>
        </div>
        <button className="btn-ghost" onClick={() => navigate("/")}>
          키오스크 화면 보기
        </button>
      </header>

      <main className="management-body">
        {currentView === VIEWS.HOME && renderHomeView()}
        {currentView === VIEWS.REGISTER && renderRegisterView()}
        {currentView === VIEWS.PRODUCTS && renderProductView()}
        {currentView === VIEWS.MANAGER && renderManagerView()}
      </main>
      <footer>
        <img src="logo_black.png" className="management-logo" alt="" />
      </footer>
    </div>
  );
}
