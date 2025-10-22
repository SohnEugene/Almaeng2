import React from 'react';

/**
 * ErrorMessage - 에러 메시지를 표시하는 컴포넌트
 *
 * @component
 * @param {Object} props
 * @param {string} props.message - 표시할 에러 메시지
 * @returns {JSX.Element|null} 에러 메시지 UI (메시지가 없으면 null 반환)
 *
 * @example
 * <ErrorMessage message="올바른 값을 입력해주세요" />
 */
function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-message">
      {message}
    </div>
  );
}

export default ErrorMessage;
