// src/pages/ProductSelectionPage.jsx
import { useState } from "react";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import { getMockProducts } from "../services/api";
import styles from "../styles/pages.module.css";

export default function ProductSelectionPage({ onNext }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const products = getMockProducts(); // 백엔드 개발 전까지 Mock 데이터 사용

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
              key={product.id}
              product={product}
              isSelected={selectedProduct === product.id}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
        <div className={styles.productSelectionFooter}>
          <Button onClick={onNext} disabled={!selectedProduct}>
            상품 선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
