/**
 * @fileoverview Bluetooth 장치 정보 저장 및 관리
 *
 * localStorage를 사용하여 연결된 Bluetooth 장치 정보를 저장합니다.
 */

const STORAGE_KEY = "bluetooth_device_info";

/**
 * Bluetooth 장치 정보 저장
 *
 * @param {Object} deviceInfo - 장치 정보
 * @param {string} deviceInfo.id - 장치 ID
 * @param {string} deviceInfo.name - 장치 이름
 */
export function saveBluetoothDevice(deviceInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deviceInfo));
    console.log("✅ Bluetooth 장치 정보 저장:", deviceInfo);
  } catch (error) {
    console.error("❌ Bluetooth 장치 정보 저장 실패:", error);
  }
}

/**
 * 저장된 Bluetooth 장치 정보 가져오기
 *
 * @returns {Object|null} 저장된 장치 정보 또는 null
 */
export function getBluetoothDevice() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Bluetooth 장치 정보 불러오기 실패:", error);
    return null;
  }
}

/**
 * 저장된 Bluetooth 장치 정보 삭제
 */
export function clearBluetoothDevice() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Bluetooth 장치 정보 삭제됨");
  } catch (error) {
    console.error("❌ Bluetooth 장치 정보 삭제 실패:", error);
  }
}

/**
 * Bluetooth 장치가 저장되어 있는지 확인
 *
 * @returns {boolean} 장치 정보 존재 여부
 */
export function hasBluetoothDevice() {
  const device = getBluetoothDevice();
  return device !== null && device.id;
}
