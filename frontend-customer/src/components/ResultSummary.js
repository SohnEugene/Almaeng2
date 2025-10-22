import React from 'react';

/**
 * ResultSummary - 최종 계산 결과를 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {string} props.scaleNumber - 저울 번호
 * @param {Object} props.product - 제품 정보 {name, price}
 * @param {number} props.weight1 - 공병 무게 (g)
 * @param {number} props.weight2 - 전체 무게 (g)
 * @param {number} props.netWeight - 순 무게 (g)
 * @param {number} props.totalPrice - 총 금액 (원)
 * @param {Function} props.onReset - 초기화 버튼 핸들러
 * @returns {JSX.Element} 결과 요약 UI
 *
 * @example
 * <ResultSummary
 *   scaleNumber="1"
 *   product={{ name: '샴푸1', price: 30 }}
 *   weight1={50}
 *   weight2={150}
 *   netWeight={100}
 *   totalPrice={3000}
 *   onReset={handleReset}
 * />
 */
function ResultSummary({
  scaleNumber,
  product,
  weight1,
  weight2,
  netWeight,
  totalPrice,
  onReset,
}) {
  return (
    <div className="result-container">
      <h2>계산 완료!</h2>
      <div className="result-box">
        <div className="result-item">
          <span className="label">저울 번호:</span>
          <span className="value">{scaleNumber}</span>
        </div>
        <div className="result-item">
          <span className="label">제품:</span>
          <span className="value">{product.name}</span>
        </div>
        <div className="result-item">
          <span className="label">무게1 (공병):</span>
          <span className="value">{weight1}g</span>
        </div>
        <div className="result-item">
          <span className="label">무게2 (전체):</span>
          <span className="value">{weight2}g</span>
        </div>
        <div className="result-item highlight">
          <span className="label">실제 무게:</span>
          <span className="value">{netWeight.toFixed(2)}g</span>
        </div>
        <div className="result-item">
          <span className="label">단위 무게 당 가격:</span>
          <span className="value">{product.price.toLocaleString()}원/g</span>
        </div>
        <div className="result-item total">
          <span className="label">총 금액:</span>
          <span className="value">{totalPrice.toLocaleString()}원</span>
        </div>
      </div>
      <button onClick={onReset} className="reset-btn">
        새로 시작
      </button>
    </div>
  );
}

export default ResultSummary;
