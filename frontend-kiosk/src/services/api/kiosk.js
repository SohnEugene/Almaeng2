/**
 * @fileoverview Kiosk API
 *
 * 키오스크 관련 API 호출 함수를 제공합니다.
 */

import { request } from './client.js';

/**
 * 키오스크 등록
 *
 * @async
 * @param {Object} kioskData - 키오스크 등록 데이터
 * @param {string} kioskData.name - 키오스크 이름
 * @param {string} kioskData.location - 키오스크 위치
 * @returns {Promise<Object>} 등록된 키오스크 정보 (kid, unique_id 포함)
 *
 * @example
 * const kiosk = await registerKiosk({
 *   name: 'Kiosk #1',
 *   location: 'Entrance A',
 * });
 */
export async function createKiosk(kioskData) {
  return request('/kiosk/create', {
    method: 'POST',
    body: JSON.stringify(kioskData),
  });
}

/**
 * 키오스크의 제품 목록 조회
 *
 * @async
 * @param {string} kioskId - 키오스크 ID
 * @returns {Promise<Array>} 제품 목록
 *
 * @example
 * const products = await getKioskProducts('kiosk_001');
 */
export async function getKioskProducts(kioskId) {
  return request(`/kiosk/${kioskId}/products`);
}

/**
 * 키오스크에 제품 추가
 *
 * @async
 * @param {string} kioskId - 키오스크 ID
 * @param {string} productId - 제품 ID
 * @returns {Promise<Object>} 추가 결과
 *
 * @example
 * const result = await addProductToKiosk('kiosk_001', 'prod_001');
 */
export async function addProductToKiosk(kioskId, productId) {
  return request(`/kiosk/${kioskId}/products`, {
    method: 'POST',
    body: JSON.stringify({ pid: productId }),
  });
}
