import React from 'react';

/**
 * ProductList - 제품 목록을 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Object} props.products - 제품 정보 객체 (키: 제품 코드, 값: {name, price})
 * @returns {JSX.Element} 제품 목록 UI
 *
 * @example
 * <ProductList products={{ '1': { name: '샴푸1', price: 30 } }} />
 */
function ProductList({ products }) {
  return (
    <div className="product-list">
      <p>사용 가능한 제품:</p>
      <ul>
        {Object.entries(products).map(([code, product]) => (
          <li key={code}>
            {code}: {product.name} ({product.price.toLocaleString()}원/g)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
