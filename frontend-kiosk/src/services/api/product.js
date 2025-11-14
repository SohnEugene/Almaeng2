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
 * @returns {Promise<Array<Product>>} 제품 목록 [{ pid, name, price, description, image_url, tags }]
 *
 * @example
 * const products = await getProducts();
 * products.forEach(product => {
 *   console.log(product.pid, product.name, product.price);
 * });
 */
export async function getProducts() {
  return request("/products/");
}

/**
 * 특정 제품 상세 정보 조회
 *
 * @async
 * @param {string} productId - 제품 ID (pid)
 * @returns {Promise<Product>} 제품 상세 정보 { pid, name, price, description, image_url, tags }
 *
 * @example
 * const product = await getProductById('prod_001');
 * console.log(product.name, product.price);
 */
export async function getProductById(productId) {
  return request(`/products/${productId}`);
}
