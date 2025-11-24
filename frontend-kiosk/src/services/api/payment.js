import { request } from "./client.js";

/**
 * 결제 준비
 * @param {Object} paymentData
 * @param {string} paymentData.kid - 키오스크 ID
 * @param {string} paymentData.pid - 제품 ID
 * @param {number} paymentData.amount_grams - 무게 (gram)
 * @param {boolean} paymentData.extra_bottle - 용기 추가 여부
 * @param {number} paymentData.product_price - 제품 가격 (원/g)
 * @param {number} paymentData.total_price - 총 가격
 * @param {string} paymentData.payment_method - "kakaopay" | "tosspay"
 * @param {string} paymentData.manager - 관리자 ID
 * @returns {Promise<{txid: string, qr_code_base64: string}>}
 */
export async function preparePayment(paymentData) {
  return request("/payments/", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

/**
 * 결제 승인
 * @param {Object} approvalData
 * @param {string} approvalData.txid - 거래 ID
 * @returns {Promise<{message: string}>}
 */
export async function approvePayment(approvalData) {
  return request("/payments/approve", {
    method: "POST",
    body: JSON.stringify(approvalData),
  });
}
