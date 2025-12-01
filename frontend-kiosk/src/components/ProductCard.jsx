// src/components/ProductCard.jsx
import { useRef, useEffect } from "react";
import "../styles/components.css";

export default function ProductCard({ product, isSelected, onSelect }) {
  const nameRef = useRef(null);
  const descriptionRef = useRef(null);

  const cardClassName = ["product-card", isSelected ? "product-card-selected" : ""]
    .join(" ")
    .trim();

  // 텍스트 크기 동적 조정
  useEffect(() => {
    const adjustFontSize = (element, maxSize, minSize = 14, maxLines = 2) => {
      if (!element) return;

      const container = element.parentElement;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      let fontSize = maxSize;
      element.style.fontSize = `${fontSize}px`;

      // 텍스트가 너비와 높이를 모두 넘치지 않을 때까지 폰트 크기 감소
      while (fontSize > minSize) {
        const isOverflowing = element.scrollWidth > containerWidth ||
                             element.scrollHeight > element.clientHeight;

        if (!isOverflowing) break;

        fontSize -= 1;
        element.style.fontSize = `${fontSize}px`;
      }
    };

    // 각 요소의 폰트 크기 조정
    if (nameRef.current) adjustFontSize(nameRef.current, 28, 16, 2);
    if (descriptionRef.current) adjustFontSize(descriptionRef.current, 18, 12, 2);
  }, [product.name, product.description]);

  return (
    <div className={cardClassName} onClick={() => onSelect(product.pid)}>
      <img src={product.image_url} className="product-card-image" />
      <div className="product-card-info">
        <div className="product-card-name" ref={nameRef}>{product.name}</div>
        <div className="product-card-detail" ref={descriptionRef}>{product.description}</div>
      </div>
    </div>
  );
}
