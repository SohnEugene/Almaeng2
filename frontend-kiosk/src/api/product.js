import { request } from "./client.js";

/**
 * 전체 제품 목록 조회
* @returns {Promise<Array<{
 * pid: string, 
 * name: string, 
 * price: number, 
 * description: string, 
 * image_url: string, 
 * tags: string[], 
 * original_price: number, 
 * original_gram: number
 * }>>}
 */
export async function getProducts() {
  return request("/products/");
}

/**
 * 특정 제품 상세 정보 조회
 * @param {string} productId - 제품 ID
 * @returns {Promise<{
 * pid: string, 
 * name: string, 
 * price: number, 
 * description: string, 
 * image_url: string, 
 * tags: string[], 
 * original_price: number, 
 * original_gram: number
 * }>}
 */
export async function getProductById(productId) {
  return request(`/products/${productId}`);
}
