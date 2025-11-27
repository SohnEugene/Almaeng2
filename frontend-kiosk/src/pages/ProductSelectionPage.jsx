// src/pages/ProductSelectionPage.jsx
import { useState, useEffect } from "react";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import KioskHeader from "../components/KioskHeader";
import "../styles/pages.css";
import { getKiosk, getKioskProducts } from "../api";
import { getKioskId } from "../storage/kiosk";
import { useSession } from "../contexts/SessionContext";
import { getProductsCache, saveProductsCache } from "../storage/products";
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

        // 1단계: 키오스크 정보만 먼저 가져오기 (빠름)
        console.log("🔍 [ProductSelection] 키오스크 정보 조회 중...");
        const kioskInfo = await getKiosk(kioskId);
        const productIds = kioskInfo.products || [];

        console.log("📋 [ProductSelection] 제품 ID 목록:", productIds);

        // 2단계: 캐시에서 제품 정보 확인
        const cachedProducts = getProductsCache(productIds);

        if (cachedProducts) {
          // 캐시 히트: 즉시 표시
          console.log("✅ [ProductSelection] 캐시된 제품 정보 사용");
          setProducts(cachedProducts);
          setIsLoading(false);

          // 백그라운드에서 최신 정보 업데이트
          console.log("🔄 [ProductSelection] 백그라운드에서 최신 정보 업데이트 중...");
          getKioskProducts(kioskId)
            .then((response) => {
              const availableProducts = response.products
                .filter((item) => item.available)
                .map((item) => item.product);

              // 캐시 업데이트
              saveProductsCache(availableProducts);

              // UI 업데이트 (변경사항이 있을 경우에만)
              setProducts(availableProducts);
              console.log("✅ [ProductSelection] 최신 정보로 업데이트 완료");
            })
            .catch((err) => {
              console.warn("⚠️ [ProductSelection] 백그라운드 업데이트 실패:", err);
              // 캐시된 데이터가 있으므로 에러 무시
            });
        } else {
          // 캐시 미스: 전체 제품 정보 가져오기
          console.log("📡 [ProductSelection] API에서 제품 정보 조회 중...");
          const response = await getKioskProducts(kioskId);
          const availableProducts = response.products
            .filter((item) => item.available)
            .map((item) => item.product);

          // 캐시 저장
          saveProductsCache(availableProducts);

          setProducts(availableProducts);
          setIsLoading(false);
          console.log("✅ [ProductSelection] 제품 정보 로드 완료");
        }

      } catch (err) {
        console.error("❌ [ProductSelection] 에러 발생:", err);
        setError(err.message);
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
        <div className="card-container">
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
