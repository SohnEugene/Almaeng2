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
 * @returns {Promise<Object>} 등록된 키오스크 정보 { kid: string }
 *
 * @example
 * const response = await createKiosk({
 *   name: 'Kiosk #1',
 *   location: 'Entrance A',
 * });
 * console.log(response.kid); // 'kiosk_001'
 */
export async function createKiosk(kioskData) {
  return request('/kiosks/', {
    method: 'POST',
    body: JSON.stringify(kioskData),
  });
}

/**
 * 키오스크의 제품 목록 조회
 *
 * @async
 * @param {string} kioskId - 키오스크 ID (kid)
 * @returns {Promise<Object>} { products: [{ product: Product, available: bool }] }
 *
 * @example
 * const response = await getKioskProducts('kiosk_001');
 * response.products.forEach(item => {
 *   console.log(item.product.name, item.available);
 * });
 */
export async function getKioskProducts(kioskId) {
  return request(`/kiosks/${kioskId}/products`);
}

/**
 * 키오스크에 제품 추가
 *
 * @async
 * @param {string} kioskId - 키오스크 ID (kid)
 * @param {string} productId - 제품 ID (pid)
 * @returns {Promise<Object>} { message: string }
 *
 * @example
 * const result = await addProductToKiosk('kiosk_001', 'prod_001');
 * console.log(result.message); // "Product prod_001 added to kiosk kiosk_001"
 */
export async function addProductToKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products`, {
    method: 'POST',
    body: JSON.stringify({ pid: productId }),
  });
}
