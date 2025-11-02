import React from 'react';

/**
 * StepForm - 각 단계별 입력 폼의 공통 레이아웃 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSubmit - 폼 제출 핸들러
 * @param {string} props.title - 폼 제목
 * @param {React.ReactNode} props.children - 폼 내부 컨텐츠 (input, 버튼 등)
 * @param {string} [props.className] - 추가 CSS 클래스명
 * @returns {JSX.Element} 폼 레이아웃
 *
 * @example
 * <StepForm onSubmit={handleSubmit} title="저울 번호를 입력하세요">
 *   <input type="text" />
 *   <button type="submit">다음</button>
 * </StepForm>
 */
function StepForm({ onSubmit, title, children, className = '' }) {
  return (
    <form onSubmit={onSubmit} className={`input-form ${className}`}>
      <h2>{title}</h2>
      {children}
    </form>
  );
}

export default StepForm;
