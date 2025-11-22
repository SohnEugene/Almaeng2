/**
 * @fileoverview Payment API
 *
 * 결제 관련 API 호출 함수를 제공합니다.
 */

import { request } from "./client.js";

/**
 * 결제 준비 (Kakao Pay / Toss Pay)
 *
 * @async
 * @param {Object} paymentData - 결제 준비 데이터
 * @param {string} paymentData.kid - 키오스크 ID
 * @param {string} paymentData.pid - 제품 ID
 * @param {number} paymentData.amount_grams - 무게 (gram)
 * @param {boolean} paymentData.extra_bottle - 용기 추가 여부
 * @param {number} paymentData.product_price - 제품 가격 (원/g)
 * @param {number} paymentData.total_price - 총 가격
 * @param {string} paymentData.payment_method - 결제 방법 ("kakaopay" | "tosspay")
 * @param {string} paymentData.manager - 관리자 ID
 * @returns {Promise<Object>} { txid, qr_code_base64 }
 *
 * @example
 * const result = await preparePayment({
 *   kid: 'kiosk_001',
 *   pid: 'prod_001',
 *   amount_grams: 100,
 *   extra_bottle: false,
 *   product_price: 8,
 *   total_price: 800,
 *   payment_method: 'kakaopay',
 *   manager: 'manager_001'
 * });
 */
export async function preparePayment(paymentData) {
  return request("/payments/", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

/**
 * 결제 승인 (Kakao Pay / Toss Pay)
 *
 * @async
 * @param {Object} approvalData - 결제 승인 데이터
 * @param {string} approvalData.txid - 거래 ID (prepare에서 받은 값)
 * @returns {Promise<Object>} { message: "success" }
 *
 * @example
 * const result = await approvePayment({
 *   txid: 'abc123def456'
 * });
 */
export async function approvePayment(approvalData) {
  return request("/payments/approve", {
    method: "POST",
    body: JSON.stringify(approvalData),
  });
}
