/**
 * @fileoverview 데이터 포맷팅 유틸리티 함수들
 *
 * 숫자, 날짜, 문자열 등의 데이터를 사용자에게 보여주기 좋은 형태로 변환합니다.
 */

/**
 * 무게를 그램(g) 단위로 포맷팅
 *
 * @param {number} weight - 무게 값 (gram)
 * @param {number} [decimals=0] - 소수점 자리수
 * @returns {string} 포맷팅된 무게 문자열 (예: "1,250g")
 *
 * @example
 * formatWeight(1250)      // "1,250g"
 * formatWeight(1250.5, 1) // "1,250.5g"
 */
export function formatWeight(weight, decimals = 0) {
  if (weight === null || weight === undefined) return '0g';

  const formatted = Number(weight).toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formatted}g`;
}

/**
 * 가격을 원(₩) 단위로 포맷팅
 *
 * @param {number} price - 가격 값
 * @returns {string} 포맷팅된 가격 문자열 (예: "8,000원")
 *
 * @example
 * formatPrice(8000)  // "8,000원"
 * formatPrice(500)   // "500원"
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '0원';

  const formatted = Number(price).toLocaleString('ko-KR');
  return `${formatted}원`;
}

/**
 * 그램당 가격 계산 및 포맷팅
 *
 * @param {number} totalPrice - 총 가격
 * @param {number} totalWeight - 총 무게 (gram)
 * @returns {string} 그램당 가격 (예: "8원/g")
 *
 * @example
 * formatPricePerGram(8000, 1000)  // "8원/g"
 */
export function formatPricePerGram(totalPrice, totalWeight) {
  if (!totalWeight || totalWeight === 0) return '0원/g';

  const pricePerGram = Math.round(totalPrice / totalWeight);
  return `${pricePerGram}원/g`;
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 *
 * @param {Date|string} date - 날짜 객체 또는 날짜 문자열
 * @returns {string} 포맷팅된 날짜 (예: "2025년 1월 4일")
 *
 * @example
 * formatDate(new Date())  // "2025년 1월 4일"
 */
export function formatDate(date) {
  const d = new Date(date);

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 시간을 포맷팅 (HH:MM:SS)
 *
 * @param {Date|string} date - 날짜 객체 또는 날짜 문자열
 * @returns {string} 포맷팅된 시간 (예: "14:30:25")
 *
 * @example
 * formatTime(new Date())  // "14:30:25"
 */
export function formatTime(date) {
  const d = new Date(date);

  if (isNaN(d.getTime())) return '';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 16진수 문자열을 정수로 변환
 *
 * @param {string} hexString - 16진수 문자열
 * @returns {number} 변환된 정수값
 *
 * @example
 * hexToInt("FF")    // 255
 * hexToInt("0A")    // 10
 */
export function hexToInt(hexString) {
  return parseInt(hexString, 16);
}
