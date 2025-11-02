import React from 'react';

/**
 * ProgressBar - 단계별 진행 상황을 시각적으로 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {number} props.currentStep - 현재 진행 중인 단계 (1-5)
 * @param {Array<string>} props.steps - 각 단계의 레이블 배열
 * @returns {JSX.Element} 진행 상황 표시 바
 *
 * @example
 * <ProgressBar currentStep={3} steps={['저울', '무게1', '제품', '무게2', '완료']} />
 */
function ProgressBar({ currentStep, steps }) {
  return (
    <div className="progress-bar">
      {steps.map((stepLabel, index) => (
        <div
          key={index}
          className={`progress-step ${currentStep >= index + 1 ? 'active' : ''}`}
        >
          {index + 1}. {stepLabel}
        </div>
      ))}
    </div>
  );
}

export default ProgressBar;
