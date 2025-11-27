export default function ProductsView({
  kioskInfo,
  allProducts,
  kioskProducts,
  onToggleProduct,
  onGoToRegister,
}) {
  if (!kioskInfo) {
    return (
      <section className="management-panel empty-state">
        <p className="panel-eyebrow">STEP 02</p>
        <h3>제품을 관리하려면 키오스크를 먼저 등록해주세요.</h3>
        <button type="button" className="btn-primary" onClick={onGoToRegister}>
          키오스크 등록하기
        </button>
      </section>
    );
  }

  // 키오스크 제품 ID 목록 - product 객체 안에 pid가 있음
  const kioskProductIds = kioskProducts.map((p) => p.product?.pid || p.pid);

  const handleProductClick = (product) => {
    const isSelected = kioskProductIds.includes(product.pid);
    onToggleProduct(product.pid, isSelected);
  };

  return (
    <section className="management-panel">
      <div className="subpage-header">
        <div>
          <h2>제품 관리</h2>
          <p className="panel-description">
            키오스크에 노출할 제품을 선택하세요. (현재 {kioskProducts.length}개
            선택됨)
          </p>
        </div>
      </div>

      {allProducts.length === 0 ? (
        <p className="empty-message">제품을 불러오는 중...</p>
      ) : (
        <div className="product-grid">
          {allProducts.map((product) => {
            const isSelected = kioskProductIds.includes(product.pid);
            return (
              <button
                key={product.pid}
                type="button"
                className={`product-button ${isSelected ? "selected" : ""}`}
                onClick={() => handleProductClick(product)}
              >
                <div className="product-button-name">{product.name}</div>
                <div className="product-button-id">{product.pid}</div>
                <div className="product-button-price">{product.price}원/g</div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
