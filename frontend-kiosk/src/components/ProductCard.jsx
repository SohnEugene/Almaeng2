// src/components/ProductCard.jsx
import styles from "../styles/components.module.css";

export default function ProductCard({ product, isSelected, onSelect }) {
  // CSS 모듈 클래스 조합
  const cardClassName = [
    styles.productCard,
    isSelected ? styles.productCardSelected : "",
  ]
    .join(" ")
    .trim();

  return (
    <div className={cardClassName} onClick={() => onSelect(product.id)}>
      <img
        src={product.image}
        alt={product.name}
        className={styles.productCardImage}
      />
      <div className={styles.productCardInfo}>
        <div className={styles.productCardBrand}>{product.brand}</div>
        <div className={styles.productCardName}>{product.name}</div>
        <div className={styles.productCardBrand}>{product.detail}</div>
      </div>
      <div className={styles.productCardPriceContainer}>
        {product.originalPrice && (
          <span className={styles.productCardOriginalPrice}>
            {product.originalPrice}
          </span>
        )}
        <span className={styles.productCardPrice}>₩{product.price} /g</span>
      </div>
    </div>
  );
}
