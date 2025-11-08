/**
 * @fileoverview Bluetooth Low Energy (BLE) 장치 연결을 위한 React Hook
 *
 * Web Bluetooth API를 사용하여 BLE 장치와 연결하고 데이터를 수신합니다.
 * 주로 BLE 저울 장치와의 통신에 사용되지만, 다른 BLE 장치에도 확장 가능합니다.
 *
 * @requires navigator.bluetooth - Web Bluetooth API 지원 필요
 * @requires HTTPS - 보안 컨텍스트에서만 동작
 * @requires User Gesture - 사용자 인터랙션(클릭 등) 후에만 장치 선택 가능
 *
 * @author Eugene Sohn
 * @version 1.0.0
 */

import { useState, useRef, useCallback } from 'react';
import { SCALE_SERVICE_UUID, SCALE_CHAR_UUID, BLE_CONFIG } from '../constants/bluetooth';

/**
 * useBluetooth - BLE 장치 연결 및 데이터 수신을 위한 React Hook
 *
 * @description
 * Web Bluetooth API를 사용하여 BLE 장치와 연결하고 실시간 데이터를 수신합니다.
 * 연결 상태 관리, 에러 핸들링, 자동 재연결 등의 기능을 제공합니다.
 *
 * @returns {Object} Bluetooth 연결 상태 및 제어 함수
 * @returns {number} weight - 현재 수신된 무게 값 (단위: gram)
 * @returns {boolean} isConnected - 장치 연결 상태 (true: 연결됨, false: 연결 안됨)
 * @returns {boolean} isConnecting - 연결 시도 중 상태 (true: 연결 중, false: 대기 중)
 * @returns {string|null} error - 에러 메시지 (에러 없을 시 null)
 * @returns {string|null} deviceName - 연결된 장치 이름 (미연결 시 null)
 * @returns {Function} connect - 장치 연결 함수 (비동기)
 * @returns {Function} disconnect - 장치 연결 해제 함수
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { weight, isConnected, connect, disconnect } = useBluetooth();
 *
 *   return (
 *     <div>
 *       <button onClick={connect}>연결</button>
 *       <button onClick={disconnect}>연결 해제</button>
 *       <p>무게: {weight}g</p>
 *       <p>상태: {isConnected ? '연결됨' : '연결 안됨'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBluetooth() {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // ============================================================
  // 내부 함수: 연결 해제
  // ============================================================
  /**
   * disconnect - BLE 장치 연결 해제 및 상태 초기화
   *
   * @description
   * 현재 연결된 BLE 장치와의 연결을 종료하고, 모든 상태를 초기화합니다.
   * - 폴링 인터벌 정리
   * - GATT 서버 연결 해제
   * - 모든 ref 및 state 초기화
   *
   * @function
   * @returns {void}
   */
  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      console.log('🔌 Disconnecting from device...');
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setError(null);
    setDeviceName(null);
  }, []);

  // ============================================================
  // 내부 함수: 데이터 파싱
  // ============================================================
  /**
   * parseWeight - BLE 장치로부터 수신된 데이터를 무게 값으로 파싱
   *
   * @description
   * BLE Characteristic으로부터 수신된 ArrayBuffer 데이터를 분석하여
   * 실제 무게 값(gram)으로 변환합니다.
   *
   * 파싱 프로토콜:
   * 1. ArrayBuffer → Hex String 변환
   * 2. Hex String의 특정 위치(16~28번째 문자) 추출
   * 3. 16진수 → 10진수 변환
   *
   * @function
   * @param {DataView} value - BLE Characteristic에서 수신된 DataView 객체
   * @returns {number} 파싱된 무게 값 (gram 단위)
   *
   * @example
   * parseWeight(dataView) // returns: 1250 (1250g)
   */
  const parseWeight = useCallback((value) => {
    // ArrayBuffer → Hex String
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // 저울 프로토콜 상 유효 데이터 추출
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, '');
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  // ============================================================
  // 내부 함수: BLE 장치 연결
  // ============================================================
  /**
   * connect - BLE 장치 검색 및 연결 수행
   *
   * @description
   * Web Bluetooth API를 사용하여 사용자에게 BLE 장치 선택을 요청하고,
   * 선택된 장치와 GATT 연결을 수립합니다. 연결 후 데이터 수신을 시작합니다.
   *
   * 연결 프로세스:
   * 1. navigator.bluetooth.requestDevice() - 장치 선택 UI 표시
   * 2. GATT 서버 연결
   * 3. 서비스 및 Characteristic 획득
   * 4. Notification 시작 (또는 Polling 시작)
   * 5. 데이터 수신 이벤트 리스너 등록
   *
   * @async
   * @function
   * @throws {Error} Bluetooth API 미지원, 사용자 취소, 연결 실패 등
   * @returns {Promise<void>}
   *
   * @example
   * await connect(); // 장치 선택 UI가 표시됨
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Android 호환성을 위한 설정 (acceptAllDevices + optionalServices)
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SCALE_SERVICE_UUID],
      });

      deviceRef.current = device;
      console.log('📱 Selected device:', { name: device.name, id: device.id });
      setDeviceName(device.name || 'Unknown Device');

      // 예기치 않은 연결 해제 시 처리
      device.addEventListener('gattserverdisconnected', (event) => {
        console.warn('⚠️ Device disconnected unexpectedly:', event.target);
        disconnect();
      });

      // GATT 서버 연결
      console.log('🔗 Connecting to GATT server...');
      const server = await device.gatt.connect();
      console.log('✅ Connected to GATT server');

      // 서비스 및 캐릭터리스틱 획득
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      console.log('📦 Got service:', service.uuid);

      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);
      console.log('📨 Got characteristic:', characteristic.uuid);

      characteristicRef.current = characteristic;

      // 수신된 데이터 처리 핸들러
      const handleValue = (value) => {
        const newWeight = parseWeight(value);
        setWeight(newWeight);
      };

      // notify 우선, 없을 경우 read로 폴백
      if (characteristic.properties.notify) {
        console.log('🔔 Starting notifications...');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          handleValue(e.target.value);
        });
      } else if (characteristic.properties.read) {
        console.log('⏱ Polling characteristic value...');
        pollIntervalRef.current = setInterval(async () => {
          try {
            const value = await characteristic.readValue();
            handleValue(value);
          } catch (err) {
            console.error('Error reading value:', err);
          }
        }, BLE_CONFIG.POLLING_INTERVAL);
      } else {
        throw new Error('Characteristic does not support read or notify');
      }

      setIsConnected(true);
      setIsConnecting(false);
      console.log('🎉 BLE connected successfully');
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect to scale');
      setIsConnecting(false);
      disconnect();
    }
  }, [disconnect, parseWeight]);

  // ============================================================
  // Hook 반환값
  // ============================================================
  return {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
  };
}
