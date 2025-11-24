// src/components/ProductCard.jsx
import "../styles/components.css";

export default function ProductCard({ product, isSelected, onSelect }) {
  const cardClassName = ["product-card", isSelected ? "product-card-selected" : ""]
    .join(" ")
    .trim();

  // 원가 대비 절약률 계산
  const calculateSavings = () => {
    if (!product.original_price || !product.original_gram) return null;

    const originalPricePerGram = product.original_price / product.original_gram;
    const refillPricePerGram = product.price;
    const savingsPercent = (
      ((originalPricePerGram - refillPricePerGram) / originalPricePerGram) *
      100
    ).toFixed(0);

    return {
      originalPricePerGram: Math.round(originalPricePerGram),
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
    };
  };

  const savings = calculateSavings();

  return (
    <div className={cardClassName} onClick={() => onSelect(product.pid)}>
      <img src={product.image_url} className="product-card-image" />
      <div className="product-card-info">
        <div className="product-card-header">
          <div className="product-card-name">{product.name}</div>
          <div className="product-card-price">₩{product.price}/g</div>
        </div>
        <div className="product-card-detail">{product.description}</div>
        {savings && (
          <div className="product-card-compare">
            <span className="product-card-original-price">
              원가: ₩{savings.originalPricePerGram} /g
            </span>
            <span className="product-card-savings">
              {savings.savingsPercent}% 절약
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
