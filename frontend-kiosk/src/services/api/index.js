/**
 * @fileoverview API Index
 *
 * 모든 API 함수를 재-export하여 통합된 import 경로를 제공합니다.
 *
 * @example
 * import { getProducts, registerKiosk, preparePayment } from '@/services/api';
 */

// Product APIs
// - getProducts(): 모든 제품 조회 (GET /product/)
// - getProductById(pid): 특정 제품 조회 (GET /product/{pid})
export { getProducts, getProductById } from './product.js';

// Kiosk APIs
// - registerKiosk(data): 키오스크 등록 (POST /kiosk/)
// - getKioskProducts(kid): 키오스크 제품 목록 조회 (GET /kiosk/{kid}/products)
// - addProductToKiosk(kid, pid): 키오스크에 제품 추가 (POST /kiosk/{kid}/products)
export { createKiosk as registerKiosk, getKioskProducts, addProductToKiosk } from './kiosk.js';

// Payment APIs
// - preparePayment(data): 결제 준비 (POST /payment/prepare)
// - approvePayment(data): 결제 승인 (POST /payment/approve)
export { preparePayment, approvePayment } from './payment.js';

// HTTP Client (필요한 경우 직접 사용 가능)
export { request, BASE_URL } from './client.js';
