/**
 * @fileoverview 블루투스 저울 정보 로컬 스토리지 관리
 *
 * 블루투스 저울 정보를 localStorage에 저장/조회/삭제합니다.
 */

const STORAGE_KEY = "bluetooth_device_info";

/**
 * 블루투스 저울 정보를 localStorage에 저장
 *
 * @param {Object} deviceInfo - 블루투스 장치 정보
 * @param {string} deviceInfo.id - 장치 ID
 * @param {string} deviceInfo.name - 장치 이름
 */
export function saveBluetoothDevice(deviceInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deviceInfo));
  } catch (error) {
    throw error;
  }
}

/**
 * localStorage에서 블루투스 저울 정보 조회
 *
 * @returns {Object|null} 블루투스 장치 정보 또는 null
 */
export function getBluetoothDevice() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

/**
 * localStorage에서 블루투스 저울 정보 삭제
 */
export function clearBluetoothDevice() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw error;
  }
}
