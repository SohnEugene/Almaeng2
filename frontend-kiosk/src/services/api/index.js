/**
 * @fileoverview API Index
 *
 * 모든 API 함수를 재-export하여 기존 import 경로와의 호환성을 유지합니다.
 */

// Product APIs
export { getProducts, getProductById } from './product.js';

// Kiosk APIs
export { createKiosk as registerKiosk, getKioskProducts, addProductToKiosk } from './kiosk.js';

// Payment APIs
export { preparePayment, approvePayment } from './payment.js';

// HTTP Client (필요한 경우 직접 사용 가능)
export { request, BASE_URL } from './client.js';
