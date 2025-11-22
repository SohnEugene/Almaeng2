/**
 * @fileoverview 키오스크 정보 로컬 스토리지 관리
 *
 * 키오스크 등록 정보를 localStorage에 저장/조회/삭제합니다.
 */

const STORAGE_KEY = "kiosk_info";

/**
 * 키오스크 정보를 localStorage에 저장
 *
 * @param {Object} kioskInfo - 키오스크 정보
 * @param {string} kioskInfo.kid - 키오스크 ID
 * @param {string} kioskInfo.name - 키오스크 이름
 * @param {string} kioskInfo.location - 키오스크 위치
 */
export function saveKioskInfo(kioskInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kioskInfo));
    console.log("✅ 키오스크 정보 저장 완료:", kioskInfo);
  } catch (error) {
    console.error("❌ 키오스크 정보 저장 실패:", error);
    throw error;
  }
}

/**
 * localStorage에서 키오스크 정보 조회
 *
 * @returns {Object|null} 키오스크 정보 또는 null
 */
export function getKioskInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ 키오스크 정보 조회 실패:", error);
    return null;
  }
}

/**
 * 키오스크가 등록되었는지 확인
 *
 * @returns {boolean} 등록 여부
 */
export function isKioskRegistered() {
  const info = getKioskInfo();
  return info !== null && info.kid;
}

/**
 * localStorage에서 키오스크 정보 삭제
 */
export function clearKioskInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ 키오스크 정보 삭제 완료");
  } catch (error) {
    console.error("❌ 키오스크 정보 삭제 실패:", error);
    throw error;
  }
}

/**
 * 키오스크 ID만 조회
 *
 * @returns {string|null} 키오스크 ID 또는 null
 */
export function getKioskId() {
  const info = getKioskInfo();
  console.log(info);
  return info ? info.kid : null;
}
