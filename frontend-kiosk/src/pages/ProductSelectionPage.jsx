// src/pages/ProductSelectionPage.jsx
import { useState, useEffect } from 'react';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { getKioskId } from '../services/kioskStorage';
import { getKioskProducts } from '../services/api/kiosk';
import { useSession } from '../contexts/SessionContext';
import styles from '../styles/pages.module.css';

export default function ProductSelectionPage({ onNext }) {
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
          throw new Error('키오스크가 등록되지 않았습니다. /manage 페이지에서 키오스크를 등록해주세요.');
        }

        // 백엔드에서 이 키오스크의 제품 목록 가져오기
        const response = await getKioskProducts(kioskId);

        // 판매 가능한 제품만 필터링
        const availableProducts = response.products.filter(
          (item) => item.available
        ).map(item => item.product);

        setProducts(availableProducts);
      } catch (err) {
        console.error('제품 목록 로드 실패:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 로딩 중
  if (isLoading) {
    return (
      <div className={styles.productSelectionContainer}>
        <div className={styles.productLoading}>
          <img
            src="/loading.gif"
            alt="로딩 중"
            className={styles.productSelectionLoadingSpinner}
          />
          <div className={styles.productSelectionTitle}>
            <div>상품 로딩 중...</div>
            <p>상품을 저렴하게,</p>
            <p>지구를 건강하게!</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className={styles.productSelectionContainer}>
        <div className={styles.productSelectionHeader}>home</div>
        <div className={styles.productSelectionContent}>
          <div className={styles.productSelectionTitle}>
            ⚠️ 제품을 불러올 수 없습니다
          </div>
          <div className={styles.productSelectionSubtitle}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // 제품이 없는 경우
  if (products.length === 0) {
    return (
      <div className={styles.productSelectionContainer}>
        <div className={styles.productSelectionHeader}>home</div>
        <div className={styles.productSelectionContent}>
          <div className={styles.productSelectionTitle}>
            등록된 제품이 없습니다
          </div>
          <div className={styles.productSelectionSubtitle}>
            관리자에게 문의해주세요
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productSelectionContainer}>
      <div className={styles.productSelectionHeader}>home</div>
      <div className={styles.productSelectionContent}>

        <div className={styles.productSelectionTitle}>
          어떤 제품을 리필하시겠어요?
        </div>

        <div className={styles.productSelectionSubtitle}>
          1g당 가격이 표시됩니다
        </div>

        <div className={styles.productSelectionProducts}>
          {products.map((product) => (
            <ProductCard
              key={product.pid}
              product={product}
              isSelected={session.selectedProduct?.pid === product.pid}
              onSelect={() => selectProduct(product)}
            />
          ))}
        </div>

        <div className={styles.productSelectionFooter}>
          <Button onClick={onNext} disabled={!session.selectedProduct}>
            상품 선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
