/**
 * @fileoverview 관리자 정보 로컬 스토리지 관리
 *
 * 관리자 정보를 localStorage에 저장/조회/삭제합니다.
 */

const STORAGE_KEY = 'manager_info';

/**
 * 관리자 정보 매핑
 */
export const MANAGERS = {
  KIM: { code: 'KIM', name: '김나현' },
  SOHN: { code: 'SOHN', name: '손유진' },
  AHN: { code: 'AHN', name: '안유경' },
  LEE: { code: 'LEE', name: '이지현' },
  HWANG: { code: 'HWANG', name: '황지현' }
};

/**
 * 관리자 정보를 localStorage에 저장
 *
 * @param {string} managerCode - 관리자 코드 (KIM, SOHN, AHN, LEE, HWANG)
 */
export function saveManagerInfo(managerCode) {
  try {
    if (!MANAGERS[managerCode]) {
      throw new Error(`Invalid manager code: ${managerCode}`);
    }
    localStorage.setItem(STORAGE_KEY, managerCode);
    console.log('✅ 관리자 정보 저장 완료:', MANAGERS[managerCode].name);
  } catch (error) {
    console.error('❌ 관리자 정보 저장 실패:', error);
    throw error;
  }
}

/**
 * localStorage에서 관리자 코드 조회
 *
 * @returns {string|null} 관리자 코드 또는 null
 */
export function getManagerCode() {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return code || null;
  } catch (error) {
    console.error('❌ 관리자 정보 조회 실패:', error);
    return null;
  }
}

/**
 * localStorage에서 관리자 정보 조회
 *
 * @returns {Object|null} 관리자 정보 { code, name } 또는 null
 */
export function getManagerInfo() {
  const code = getManagerCode();
  return code ? MANAGERS[code] : null;
}

/**
 * 관리자가 설정되었는지 확인
 *
 * @returns {boolean} 설정 여부
 */
export function isManagerSet() {
  return getManagerCode() !== null;
}

/**
 * localStorage에서 관리자 정보 삭제
 */
export function clearManagerInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ 관리자 정보 삭제 완료');
  } catch (error) {
    console.error('❌ 관리자 정보 삭제 실패:', error);
    throw error;
  }
}
