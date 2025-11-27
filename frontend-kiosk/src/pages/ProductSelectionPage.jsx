// src/pages/ProductSelectionPage.jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { getKioskProducts } from "../api";
import { getKioskId } from "../storage/kiosk";
import { useSession } from "../contexts/SessionContext";
import loadingGif from "../assets/loading.gif";

export default function ProductSelectionPage({ onNext, onHome }) {
  const { session, selectProduct } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 키오스크에 등록된 제품 불러오기
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // localStorage에서 키오스크 ID 가져오기
        const kioskId = getKioskId();

        if (!kioskId) {
          throw new Error(
            "키오스크가 등록되지 않았습니다. /manage 페이지에서 기기를 등록해주세요.",
          );
        }

        // API로 키오스크에 등록된 제품 호출
        const response = await getKioskProducts(kioskId);
        const availableProducts = response.products
          .filter((item) => item.available)
          .map((item) => item.product);
        setProducts(availableProducts);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const renderStateMessage = (title, subtitle) => {
    return (
      <div className="kiosk-page">
        <KioskHeader onHome={onHome} />
        <div className="kiosk-content">
          <div className="kiosk-content-header">
            <h1 className="kiosk-title">{title}</h1>
            {subtitle && <div className="kiosk-subtitle">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="kiosk-page">
        <KioskHeader onHome={onHome} />
        <div className="kiosk-content">
          <div className="kiosk-content-header">
            <h1 className="kiosk-title">제품을 불러오는 중입니다</h1>
            <img src={loadingGif} alt="로딩 중" className="loading-gif" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return renderStateMessage(
      "제품을 불러올 수 없습니다",
      "관리자에게 문의해주세요",
    );
  }

  // 제품이 없는 경우
  if (products.length === 0) {
    return renderStateMessage(
      "등록된 제품이 없습니다",
      "관리자에게 문의해주세요",
    );
  }

  return (
    <div className="kiosk-page">
      <KioskHeader onHome={onHome} />
      <div className="kiosk-content">
        <div className="kiosk-content-header">
          <h1 className="kiosk-title">리필할 제품을 선택해주세요.</h1>
        </div>
        <div>
          {products.map((product) => (
            <ProductCard
              key={product.pid}
              product={product}
              isSelected={session.selectedProduct?.pid === product.pid}
              onSelect={() => selectProduct(product)}
            />
          ))}
        </div>
      </div>
      <div className="kiosk-footer">
        <Button onClick={onNext} disabled={!session.selectedProduct}>
          상품 선택 완료
        </Button>
      </div>
    </div>
  );
}
