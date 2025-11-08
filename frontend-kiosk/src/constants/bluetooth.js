/**
 * @fileoverview Bluetooth Low Energy (BLE) 관련 상수 정의
 *
 * BLE 장치 연결에 필요한 서비스 및 특성(Characteristic) UUID를 정의합니다.
 * UUID는 BLE 장치의 프로토콜 스펙에 따라 결정됩니다.
 *
 * @see https://www.bluetooth.com/specifications/gatt/services/
 */

/**
 * BLE 서비스 UUID - 장치의 기본 서비스 식별자
 * @constant {string}
 */
export const SCALE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";

/**
 * BLE 특성(Characteristic) UUID - 데이터 송수신 채널
 * @constant {string}
 */
export const SCALE_CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

/**
 * BLE 연결 설정
 */
export const BLE_CONFIG = {
  /** 재연결 시도 횟수 */
  MAX_RETRY_COUNT: 3,

  /** 재연결 대기 시간 (ms) */
  RETRY_DELAY: 2000,

  /** 폴링 인터벌 (ms) - notify를 지원하지 않는 장치용 */
  POLLING_INTERVAL: 500,
};
