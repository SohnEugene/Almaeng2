import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerKiosk, getKioskProducts, addProductToKiosk, getProducts } from '../services/api';
import { saveKioskInfo, getKioskInfo, clearKioskInfo } from '../services/kioskStorage';
import { useBluetooth } from '../hooks/useBluetooth';
import '../styles/ManagementPage.css';

/**
 * 키오스크 관리 페이지
 *
 * 새로운 키오스크를 백엔드에 등록하고 localStorage에 정보를 저장합니다.
 * 메인 플로우와 독립적으로 동작하는 관리 페이지입니다.
 * URL: /manage
 */
export default function ManagementPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredInfo, setRegisteredInfo] = useState(getKioskInfo());

  // 제품 관련 상태
  const [allProducts, setAllProducts] = useState([]);
  const [kioskProducts, setKioskProducts] = useState([]);
  const [productIdInput, setProductIdInput] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);

  // Bluetooth 저울 관련
  const { weight, isConnected, isConnecting, error: bleError, deviceName, connect, disconnect } = useBluetooth();

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 등록 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 백엔드에 키오스크 등록
      const response = await registerKiosk({
        name: formData.name,
        location: formData.location,
      });

      console.log('✅ 키오스크 등록 성공:', response);

      // localStorage에 정보 저장
      const kioskInfo = {
        kid: response.kid,
        unique_id: response.unique_id,
        name: formData.name,
        location: formData.location,
      };

      saveKioskInfo(kioskInfo);
      setRegisteredInfo(kioskInfo);

      // 폼 초기화
      setFormData({ name: '', location: '' });

      alert('키오스크가 성공적으로 등록되었습니다!');
    } catch (err) {
      console.error('❌ 키오스크 등록 실패:', err);
      setError(err.message || '키오스크 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 등록 정보 삭제 핸들러
  const handleClearInfo = () => {
    if (window.confirm('저장된 키오스크 정보를 삭제하시겠습니까?')) {
      clearKioskInfo();
      setRegisteredInfo(null);
      setKioskProducts([]);
      alert('키오스크 정보가 삭제되었습니다.');
    }
  };

  // 제품 목록 불러오기 (useEffect)
  useEffect(() => {
    // 백엔드에서 전체 제품 목록 로드
    loadAllProducts();

    // 키오스크가 등록되어 있으면 해당 키오스크의 제품 목록 로드
    if (registeredInfo?.kid) {
      loadKioskProducts();
    }
  }, [registeredInfo?.kid]);

  // 전체 제품 목록 로드
  const loadAllProducts = async () => {
    try {
      const products = await getProducts();
      setAllProducts(products);
    } catch (err) {
      console.error('전체 제품 목록 로드 실패:', err);
      setAllProducts([]);
    }
  };

  // 키오스크의 제품 목록 로드
  const loadKioskProducts = async () => {
    if (!registeredInfo?.kid) return;

    try {
      setProductLoading(true);
      const products = await getKioskProducts(registeredInfo.kid);
      setKioskProducts(products);
    } catch (err) {
      console.error('제품 목록 로드 실패:', err);
      setKioskProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  // 키오스크에 제품 추가 핸들러
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!registeredInfo?.kid) {
      alert('먼저 키오스크를 등록해주세요.');
      return;
    }

    if (!productIdInput.trim()) {
      alert('제품 ID를 입력해주세요.');
      return;
    }

    try {
      setProductLoading(true);
      setProductError(null);

      await addProductToKiosk(registeredInfo.kid, productIdInput.trim());

      alert(`제품 ${productIdInput}이(가) 키오스크에 추가되었습니다!`);
      setProductIdInput('');

      // 제품 목록 새로고침
      await loadKioskProducts();
    } catch (err) {
      console.error('제품 추가 실패:', err);
      setProductError(err.message || '제품 추가에 실패했습니다.');
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <div className="management-page">
      <div className="management-container">
        <h1>키오스크 관리</h1>

        {/* 등록된 정보 표시 */}
        {registeredInfo && (
          <div className="registered-info">
            <h2>✅ 현재 등록된 키오스크</h2>
            <div className="info-box">
              <div className="info-row">
                <span className="label">키오스크 ID:</span>
                <span className="value">{registeredInfo.kid}</span>
              </div>
              <div className="info-row">
                <span className="label">고유 식별자:</span>
                <span className="value unique-id">{registeredInfo.unique_id}</span>
              </div>
              <div className="info-row">
                <span className="label">이름:</span>
                <span className="value">{registeredInfo.name}</span>
              </div>
              <div className="info-row">
                <span className="label">위치:</span>
                <span className="value">{registeredInfo.location}</span>
              </div>
            </div>
            <button className="btn-danger" onClick={handleClearInfo}>
              등록 정보 삭제
            </button>
          </div>
        )}

        {/* 등록 폼 */}
        <div className="registration-form">
          <h2>{registeredInfo ? '새 키오스크 등록' : '키오스크 등록'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">키오스크 이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: Kiosk #1"
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
                placeholder="예: 1층 입구"
                required
              />
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !formData.name || !formData.location}
            >
              {isLoading ? '등록 중...' : '키오스크 등록'}
            </button>
          </form>
        </div>

        {/* Bluetooth 저울 연결 섹션 */}
        <div className="bluetooth-section">
          <h2>⚖️ Bluetooth 저울 연결</h2>
          <div className="bluetooth-status">
            {isConnected ? (
              <div className="status-connected">
                <div className="status-info">
                  <span className="status-icon">✅</span>
                  <div>
                    <div className="device-name">연결됨: {deviceName || '저울'}</div>
                    <div className="current-weight">현재 무게: {weight}g</div>
                  </div>
                </div>
                <button className="btn-danger" onClick={disconnect}>
                  연결 해제
                </button>
              </div>
            ) : (
              <div className="status-disconnected">
                <div className="status-info">
                  <span className="status-icon">⚠️</span>
                  <span>저울이 연결되지 않았습니다</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={connect}
                  disabled={isConnecting}
                >
                  {isConnecting ? '연결 중...' : '저울 연결'}
                </button>
              </div>
            )}
            {bleError && (
              <div className="error-message">❌ {bleError}</div>
            )}
          </div>
        </div>

        {/* 제품 관리 섹션 */}
        {registeredInfo && (
          <div className="product-management">
            <h2>📦 제품 관리</h2>

            {/* 전체 제품 목록 */}
            <div className="product-section">
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

            {/* 제품 추가 폼 */}
            <div className="product-add-form">
              <h3>키오스크에 제품 추가</h3>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label htmlFor="productId">제품 ID *</label>
                  <input
                    type="text"
                    id="productId"
                    value={productIdInput}
                    onChange={(e) => setProductIdInput(e.target.value)}
                    placeholder="예: 1"
                    disabled={productLoading}
                  />
                </div>

                {productError && <div className="error-message">❌ {productError}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={productLoading || !productIdInput.trim()}
                >
                  {productLoading ? '추가 중...' : '제품 추가'}
                </button>
              </form>
            </div>

            {/* 현재 키오스크 제품 목록 */}
            <div className="product-section">
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
                        <span className={`status-badge ${product.available ? 'available' : 'unavailable'}`}>
                          {product.available ? '판매중' : '품절'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">등록된 제품이 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {/* 뒤로가기 버튼 */}
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
