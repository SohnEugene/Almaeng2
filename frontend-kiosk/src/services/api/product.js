/**
 * @fileoverview Product API
 *
 * 제품 관련 API 호출 함수를 제공합니다.
 */

import { request } from "./client.js";

/**
 * 전체 제품 목록 조회
 *
 * @async
 * @returns {Promise<Array>} 제품 목록
 *
 * @example
 * const products = await getProducts();
 */
export async function getProducts() {
  return request("/product/list");
}

/**
 * 특정 제품 상세 정보 조회
 *
 * @async
 * @param {string} productId - 제품 ID
 * @returns {Promise<Object>} 제품 상세 정보
 *
 * @example
 * const product = await getProductById('prod_001');
 */
export async function getProductById(productId) {
  return request(`/product/${productId}`);
}
