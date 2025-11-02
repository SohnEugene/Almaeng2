import React from 'react';

/**
 * InfoBox - 정보를 강조하여 표시하는 박스 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Array<{label: string, value: string|number}>} props.items - 표시할 정보 항목 배열
 * @returns {JSX.Element} 정보 박스 UI
 *
 * @example
 * <InfoBox items={[
 *   { label: '저울', value: '1번' },
 *   { label: '제품', value: '샴푸1' }
 * ]} />
 */
function InfoBox({ items }) {
  return (
    <div className="info-box">
      {items.map((item, index) => (
        <p key={index}>
          {item.label}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default InfoBox;
