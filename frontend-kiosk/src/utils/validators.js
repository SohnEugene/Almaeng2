/**
 * @fileoverview 데이터 검증 유틸리티 함수들
 *
 * 입력값, 상태 등의 유효성을 검증하는 함수들을 제공합니다.
 */

/**
 * Web Bluetooth API 지원 여부 확인
 *
 * @returns {boolean} 지원 여부
 *
 * @example
 * if (!isBluetoothSupported()) {
 *   alert('이 브라우저는 Bluetooth를 지원하지 않습니다.');
 * }
 */
export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

/**
 * HTTPS 환경 여부 확인
 *
 * @returns {boolean} HTTPS 여부
 *
 * @example
 * if (!isSecureContext()) {
 *   console.warn('HTTPS 환경에서만 Bluetooth를 사용할 수 있습니다.');
 * }
 */
export function isSecureContext() {
  return window.isSecureContext;
}

/**
 * 유효한 무게 값인지 확인
 *
 * @param {number} weight - 무게 값
 * @param {number} [min=0] - 최소값
 * @param {number} [max=Infinity] - 최대값
 * @returns {boolean} 유효성 여부
 *
 * @example
 * isValidWeight(100)        // true
 * isValidWeight(-10)        // false
 * isValidWeight(5000, 0, 3000) // false
 */
export function isValidWeight(weight, min = 0, max = Infinity) {
  return (
    typeof weight === 'number' &&
    !isNaN(weight) &&
    weight >= min &&
    weight <= max
  );
}

/**
 * 유효한 가격인지 확인
 *
 * @param {number} price - 가격 값
 * @returns {boolean} 유효성 여부
 *
 * @example
 * isValidPrice(1000)  // true
 * isValidPrice(-100)  // false
 * isValidPrice(null)  // false
 */
export function isValidPrice(price) {
  return typeof price === 'number' && !isNaN(price) && price >= 0;
}

/**
 * 빈 문자열 또는 null/undefined 체크
 *
 * @param {string} str - 검증할 문자열
 * @returns {boolean} 빈 값 여부
 *
 * @example
 * isEmpty('')        // true
 * isEmpty(null)      // true
 * isEmpty('hello')   // false
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * 유효한 UUID 형식인지 확인
 *
 * @param {string} uuid - UUID 문자열
 * @returns {boolean} 유효성 여부
 *
 * @example
 * isValidUUID('0000fff0-0000-1000-8000-00805f9b34fb')  // true
 * isValidUUID('invalid-uuid')                          // false
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
