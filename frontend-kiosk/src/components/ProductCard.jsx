// src/components/ProductCard.jsx
import { useRef, useEffect } from "react";
import "../styles/components.css";

export default function ProductCard({ product, isSelected, onSelect }) {
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);

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

  // 텍스트 크기 동적 조정
  useEffect(() => {
    const adjustFontSize = (element, maxSize, minSize = 14) => {
      if (!element) return;

      const container = element.parentElement;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      let fontSize = maxSize;
      element.style.fontSize = `${fontSize}px`;

      // 텍스트가 넘치지 않을 때까지 폰트 크기 감소
      while (element.scrollWidth > containerWidth && fontSize > minSize) {
        fontSize -= 1;
        element.style.fontSize = `${fontSize}px`;
      }
    };

    // 각 요소의 폰트 크기 조정
    if (nameRef.current) adjustFontSize(nameRef.current, 32, 18);
    if (priceRef.current) adjustFontSize(priceRef.current, 32, 18);
    if (descriptionRef.current) adjustFontSize(descriptionRef.current, 20, 14);
  }, [product.name, product.price, product.description]);

  return (
    <div className={cardClassName} onClick={() => onSelect(product.pid)}>
      <img src={product.image_url} className="product-card-image" />
      <div className="product-card-info">
        <div className="product-card-header">
          <div className="product-card-name" ref={nameRef}>{product.name}</div>
          <div className="product-card-price" ref={priceRef}>₩{product.price}/g</div>
        </div>
        <div className="product-card-detail" ref={descriptionRef}>{product.description}</div>
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
