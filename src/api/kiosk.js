import { request } from "./client.js";

/**
 * 키오스크 등록
 * @param {Object} kioskData
 * @param {string} kioskData.name - 키오스크 이름
 * @param {string} kioskData.location - 키오스크 위치
 * @returns {Promise<{kid: string}>}
 */
export async function registerKiosk(kioskData) {
  return request("/kiosks/", {
    method: "POST",
    body: JSON.stringify(kioskData),
  });
}

/**
 * 키오스크 정보 조회 (제품 ID 목록 포함)
 * @param {string} kioskId - 키오스크 ID
 * @returns {Promise<{kid: string, name: string, location: string, status: string, products: Array<string>}>}
 */
export async function getKiosk(kioskId) {
  return request(`/kiosks/${kioskId}`);
}

/**
 * 키오스크의 제품 목록 조회
 * @param {string} kioskId - 키오스크 ID
 * @returns {Promise<{products: Array<{product: Object, available: boolean}>}>}
 */
export async function getKioskProducts(kioskId) {
  return request(`/kiosks/${kioskId}/products`);
}

/**
 * 키오스크에 제품 추가
 * @param {string} kioskId - 키오스크 ID
 * @param {string} productId - 제품 ID
 * @returns {Promise<{message: string}>}
 */
export async function addProductToKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products`, {
    method: "POST",
    body: JSON.stringify({ pid: productId }),
  });
}

/**
 * 키오스크에서 제품 제거
 * @param {string} kioskId - 키오스크 ID
 * @param {string} productId - 제품 ID
 * @returns {Promise<{message: string}>}
 */
export async function deleteProductFromKiosk(kioskId, productId) {
  return request(`/kiosks/${kioskId}/products/${productId}`, {
    method: "DELETE",
  });
}
