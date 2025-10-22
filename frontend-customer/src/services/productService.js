/**
 * Product Service
 * 제품 관련 API 호출 함수들
 */

import api from './api';

/**
 * 모든 제품 조회
 * @param {string} category - 카테고리 필터 (선택사항)
 * @returns {Promise} 제품 목록
 */
export const getProducts = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/api/products', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

/**
 * 제품 코드로 단일 제품 조회
 * @param {string} code - 제품 코드
 * @returns {Promise} 제품 정보
 */
export const getProductByCode = async (code) => {
  try {
    const response = await api.get(`/api/products/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${code}:`, error);
    throw error;
  }
};

/**
 * 새 제품 생성 (관리자용)
 * @param {Object} productData - 제품 데이터
 * @returns {Promise} 생성된 제품 정보
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/api/products', productData);
    return response.data;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

/**
 * 제품 정보 수정 (관리자용)
 * @param {number} id - 제품 ID
 * @param {Object} updates - 수정할 데이터
 * @returns {Promise} 수정된 제품 정보
 */
export const updateProduct = async (id, updates) => {
  try {
    const response = await api.put(`/api/products/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    throw error;
  }
};

/**
 * 제품 삭제 (관리자용)
 * @param {number} id - 제품 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    throw error;
  }
};
