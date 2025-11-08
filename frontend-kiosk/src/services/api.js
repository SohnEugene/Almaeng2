/**
 * @fileoverview API 통신 서비스
 *
 * 백엔드 서버와의 HTTP 통신을 담당합니다.
 * 제품 정보, 주문 처리 등의 API 호출 함수를 제공합니다.
 */

import { PRODUCT_IMAGES } from "../constants/products";

/**
 * API 기본 URL
 * @constant {string}
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * HTTP 요청 헬퍼 함수
 *
 * @private
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Object>} 응답 데이터
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

// ============================================================
// 제품 관련 API
// ============================================================

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
  return request("/products");
}

/**
 * 특정 제품 상세 정보 조회
 *
 * @async
 * @param {number} productId - 제품 ID
 * @returns {Promise<Object>} 제품 상세 정보
 *
 * @example
 * const product = await getProductById(1);
 */
export async function getProductById(productId) {
  return request(`/products/${productId}`);
}

// ============================================================
// 주문 관련 API
// ============================================================

/**
 * 주문 생성
 *
 * @async
 * @param {Object} orderData - 주문 데이터
 * @param {number} orderData.productId - 제품 ID
 * @param {number} orderData.weight - 무게 (gram)
 * @param {number} orderData.totalPrice - 총 가격
 * @param {boolean} orderData.hasContainer - 용기 보유 여부
 * @returns {Promise<Object>} 생성된 주문 정보
 *
 * @example
 * const order = await createOrder({
 *   productId: 1,
 *   weight: 1000,
 *   totalPrice: 8000,
 *   hasContainer: false,
 * });
 */
export async function createOrder(orderData) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

/**
 * 주문 조회
 *
 * @async
 * @param {string} orderId - 주문 ID
 * @returns {Promise<Object>} 주문 정보
 *
 * @example
 * const order = await getOrder('order-123');
 */
export async function getOrder(orderId) {
  return request(`/orders/${orderId}`);
}

/**
 * 주문 상태 업데이트
 *
 * @async
 * @param {string} orderId - 주문 ID
 * @param {string} status - 새로운 상태 ('pending', 'processing', 'completed', 'cancelled')
 * @returns {Promise<Object>} 업데이트된 주문 정보
 *
 * @example
 * const order = await updateOrderStatus('order-123', 'completed');
 */
export async function updateOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ============================================================
// Mock Data (개발용 - 실제 API 없을 때 사용)
// ============================================================

/**
 * Mock 제품 데이터
 * 실제 API가 없을 때 개발용으로 사용
 *
 * @returns {Array} Mock 제품 목록
 */
export function getMockProducts() {
  return [
    {
      id: 1,
      brand: "MOMIRAE",
      name: "핑크솔트 딥모 샴푸",
      detail: "히말라야에서 온 핑크솔트",
      price: 8,
      originalPrice: 17,
      image: PRODUCT_IMAGES[1],
    },
    {
      id: 2,
      brand: "Dr.FORHAIR",
      name: "폴리젠 샴푸",
      detail: "두피 냄새 케어에 도움을 주는 폴리젠 샴푸",
      price: 9,
      originalPrice: 20,
      image: PRODUCT_IMAGES[2],
    },
    {
      id: 3,
      brand: "OSULLOC",
      name: "제주 그린티 핸드워시",
      detail: "제주 녹차 성분이 함유된 상쾌한 그린티 핸드워시",
      price: 7,
      originalPrice: 12,
      image: PRODUCT_IMAGES[3],
    },
  ];
}
