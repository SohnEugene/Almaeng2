import React from 'react';

/**
 * ButtonGroup - 버튼들을 그룹화하여 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Function} [props.onBack] - 이전 버튼 클릭 핸들러 (없으면 이전 버튼 미표시)
 * @param {Function} [props.onSubmit] - 제출 버튼 클릭 핸들러
 * @param {string} [props.submitLabel='다음'] - 제출 버튼 레이블
 * @param {boolean} [props.submitDisabled=false] - 제출 버튼 비활성화 여부
 * @param {string} [props.submitType='submit'] - 제출 버튼 타입
 * @returns {JSX.Element} 버튼 그룹 UI
 *
 * @example
 * <ButtonGroup
 *   onBack={() => setStep(1)}
 *   submitLabel="계산하기"
 *   submitDisabled={loading}
 * />
 */
function ButtonGroup({
  onBack,
  onSubmit,
  submitLabel = '다음',
  submitDisabled = false,
  submitType = 'submit',
}) {
  return (
    <div className="button-group">
      {onBack && (
        <button type="button" onClick={onBack} className="back-btn">
          이전
        </button>
      )}
      <button
        type={submitType}
        onClick={submitType === 'button' ? onSubmit : undefined}
        className="submit-btn"
        disabled={submitDisabled}
      >
        {submitLabel}
      </button>
    </div>
  );
}

export default ButtonGroup;
