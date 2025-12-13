/**
 * @fileoverview Bluetooth Low Energy (BLE) 장치 연결을 위한 React Hook
 * 자동 재연결, 메모리 누수 방지, 에러 처리 개선
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  clearBluetoothDevice,
  getBluetoothDevice,
  saveBluetoothDevice,
} from "../storage/bluetooth";

// ============================================================
// 상수 정의
// ============================================================
const SCALE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const SCALE_CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

const RECONNECT_CONFIG = {
  interval: 3000, // 재연결 시도 간격 (ms)
  maxAttempts: 10, // 최대 재연결 시도 횟수
  disconnectDelay: 500, // GATT 해제 후 대기 시간 (ms)
};

const isDevelopment = import.meta.env.DEV;

// ============================================================
// 유틸리티 함수
// ============================================================
function log(level, message, ...args) {
  if (!isDevelopment && level === "debug") return;

  const emoji = {
    debug: "🔍",
    info: "ℹ️",
    success: "✅",
    warn: "⚠️",
    error: "❌",
    connecting: "🔗",
    reconnecting: "🔄",
    disconnected: "🔌",
  };

  const prefix = `${emoji[level] || "📝"} [BLE]`;
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](prefix, message, ...args);
}

function parseWeight(value) {
  const hexStr = Array.from(new Uint8Array(value.buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const middleHex = hexStr.slice(16, 28).replace(/^0+/, "");
  return middleHex ? parseInt(middleHex, 16) : 0;
}

async function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Main Hook
// ============================================================
export function useBluetooth({ saveToStorage = false } = {}) {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  // Refs
  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Event handlers refs (for cleanup)
  const handlersRef = useRef({
    disconnect: null,
    characteristicValue: null,
  });

  // ============================================================
  // 재연결 로직 정리
  // ============================================================
  const stopReconnection = useCallback(() => {
    if (reconnectIntervalRef.current) {
      clearInterval(reconnectIntervalRef.current);
      reconnectIntervalRef.current = null;
      reconnectAttemptsRef.current = 0;
      log("info", "재연결 중지");
    }
  }, []);

  const startReconnection = useCallback((device, onSuccess) => {
    if (reconnectIntervalRef.current) {
      log("debug", "이미 재연결 시도 중");
      return;
    }

    log("reconnecting", "자동 재연결 시작");
    reconnectAttemptsRef.current = 0;

    reconnectIntervalRef.current = setInterval(async () => {
      if (!device || !deviceRef.current) {
        stopReconnection();
        return;
      }

      if (device.gatt?.connected) {
        log("debug", "이미 연결됨");
        stopReconnection();
        return;
      }

      reconnectAttemptsRef.current += 1;
      const attempt = reconnectAttemptsRef.current;

      if (attempt > RECONNECT_CONFIG.maxAttempts) {
        log("warn", `재연결 시도 ${RECONNECT_CONFIG.maxAttempts}회 초과`);
        setIsConnecting(false);
        setError("자동 연결 실패. '저울 연결하기' 버튼을 눌러주세요.");
        stopReconnection();
        return;
      }

      log("reconnecting", `재연결 시도 중... (${attempt}/${RECONNECT_CONFIG.maxAttempts})`);
      setIsConnecting(true);
      setError(`재연결 시도 중... (${attempt}/${RECONNECT_CONFIG.maxAttempts})`);

      const success = await onSuccess(device, true);

      if (success) {
        stopReconnection();
      }
    }, RECONNECT_CONFIG.interval);
  }, [stopReconnection]);

  // ============================================================
  // 이벤트 리스너 정리
  // ============================================================
  const cleanupListeners = useCallback(() => {
    // Disconnect handler
    if (deviceRef.current && handlersRef.current.disconnect) {
      try {
        deviceRef.current.removeEventListener("gattserverdisconnected", handlersRef.current.disconnect);
      } catch (err) {
        log("debug", "Disconnect 리스너 제거 실패 (무시):", err);
      }
      handlersRef.current.disconnect = null;
    }

    // Characteristic value handler
    if (characteristicRef.current && handlersRef.current.characteristicValue) {
      try {
        characteristicRef.current.removeEventListener("characteristicvaluechanged", handlersRef.current.characteristicValue);
      } catch (err) {
        log("debug", "Characteristic 리스너 제거 실패 (무시):", err);
      }
      handlersRef.current.characteristicValue = null;
    }
  }, []);

  // ============================================================
  // GATT 연결 로직
  // ============================================================
  const connectToDevice = useCallback(async (device, isReconnecting = false) => {
    try {
      log("connecting", `GATT 연결 시도: ${device.name || device.id}`);

      // 재연결 시 기존 GATT 연결 해제
      if (isReconnecting && device.gatt?.connected) {
        log("debug", "기존 GATT 연결 해제 후 재연결");
        try {
          device.gatt.disconnect();
          await waitFor(RECONNECT_CONFIG.disconnectDelay);
        } catch (err) {
          log("debug", "기존 연결 해제 실패 (무시):", err.message);
        }
      }

      // Disconnect handler 등록 (재연결이 아닐 때만)
      if (!isReconnecting) {
        const handleDisconnect = () => {
          log("disconnected", "장치 연결 끊어짐");
          setIsConnected(false);
          setIsConnecting(false);
          setError("장치 연결이 끊어졌습니다. 재연결 시도 중...");
          characteristicRef.current = null;

          // 자동 재연결 시작
          if (deviceRef.current) {
            startReconnection(deviceRef.current, connectToDevice);
          }
        };

        cleanupListeners(); // 기존 리스너 정리
        handlersRef.current.disconnect = handleDisconnect;
        device.addEventListener("gattserverdisconnected", handleDisconnect);
      }

      // GATT 연결
      const server = await device.gatt.connect();
      log("success", "GATT 서버 연결 성공");

      deviceRef.current = device;
      setDeviceName(device.name || "Unknown Device");

      // 서비스 및 Characteristic 검색
      log("debug", "서비스 검색 중...");
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);

      log("debug", "Characteristic 검색 중...");
      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);
      characteristicRef.current = characteristic;

      // Notification 시작
      if (!characteristic.properties.notify) {
        throw new Error("이 장치는 알림을 지원하지 않습니다.");
      }

      const handleValue = (e) => {
        const newWeight = parseWeight(e.target.value);
        const adjustedWeight = Math.round(newWeight / 100);
        setWeight(adjustedWeight);
      };

      await characteristic.startNotifications();

      // 기존 리스너 정리 후 새 리스너 등록
      if (handlersRef.current.characteristicValue) {
        characteristic.removeEventListener("characteristicvaluechanged", handlersRef.current.characteristicValue);
      }
      handlersRef.current.characteristicValue = handleValue;
      characteristic.addEventListener("characteristicvaluechanged", handleValue);

      // 연결 완료
      log("success", "연결 완료!");
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // 저장소 업데이트
      if (saveToStorage) {
        saveBluetoothDevice({ id: device.id, name: device.name });
      }

      return true;

    } catch (err) {
      log("error", "GATT 연결 실패:", err);
      setError(err.message || "저울 연결 실패");
      setIsConnecting(false);

      // 연결 실패 시 정리
      try {
        if (device?.gatt?.connected) {
          device.gatt.disconnect();
        }
      } catch (disconnectErr) {
        log("debug", "연결 해제 실패 (무시):", disconnectErr);
      }

      return false;
    }
  }, [saveToStorage, startReconnection, cleanupListeners]);

  // ============================================================
  // 자동 재연결 (마운트 시)
  // ============================================================
  useEffect(() => {
    const tryAutoReconnect = async () => {
      if (!navigator.bluetooth) {
        log("info", "Web Bluetooth API 미지원");
        return;
      }

      if (!navigator.bluetooth.getDevices) {
        log("warn", "getDevices() 미지원 - 자동 재연결 불가");
        log("info", "Tip: Chrome 85+ 필요. chrome://flags에서 활성화하거나 Fully Kiosk Browser 사용");
        return;
      }

      try {
        log("info", "자동 재연결 시도 중...");
        const devices = await navigator.bluetooth.getDevices();

        if (devices.length === 0) {
          log("info", "허용된 블루투스 기기 없음");
          return;
        }

        log("info", `허용된 기기 ${devices.length}개 발견`);

        let targetDevice = null;

        if (saveToStorage) {
          const lastDevice = getBluetoothDevice();
          if (lastDevice) {
            targetDevice = devices.find(d => d.id === lastDevice.id);
            if (!targetDevice) {
              log("info", "저장된 기기 ID와 일치하는 기기 없음. 첫 번째 기기 사용");
              targetDevice = devices[0];
            }
          } else {
            log("info", "저장된 기기 정보 없음. 첫 번째 기기 사용");
            targetDevice = devices[0];
          }
        } else {
          targetDevice = devices[0];
        }

        if (targetDevice) {
          log("info", `재연결 대상: ${targetDevice.name || targetDevice.id}`);
          deviceRef.current = targetDevice;
          setIsConnecting(true);

          const success = await connectToDevice(targetDevice);

          if (!success) {
            log("warn", "초기 연결 실패. 재시도 시작");
            setIsConnecting(false);
            setError("기기를 찾을 수 없습니다. 재시도 중...");
            startReconnection(targetDevice, connectToDevice);
          }
        }
      } catch (err) {
        log("warn", "자동 재연결 실패 (치명적이지 않음):", err);
        setIsConnecting(false);
      }
    };

    tryAutoReconnect();

    // Cleanup
    return () => {
      stopReconnection();
      cleanupListeners();

      if (deviceRef.current?.gatt?.connected) {
        log("info", "컴포넌트 언마운트로 연결 해제");
        try {
          deviceRef.current.gatt.disconnect();
        } catch (err) {
          log("debug", "언마운트 시 연결 해제 실패:", err);
        }
      }
    };
  }, [connectToDevice, startReconnection, stopReconnection, cleanupListeners, saveToStorage]);

  // ============================================================
  // 외부 노출 함수: 수동 연결
  // ============================================================
  const connect = useCallback(async () => {
    log("info", "수동 연결 시작");
    setIsConnecting(true);
    setError(null);

    if (!navigator.bluetooth) {
      setError("Web Bluetooth를 지원하지 않는 브라우저입니다.");
      setIsConnecting(false);
      return;
    }

    try {
      const requestOptions = {
        filters: [{ services: [SCALE_SERVICE_UUID] }],
        optionalServices: [SCALE_SERVICE_UUID],
      };

      const device = await navigator.bluetooth.requestDevice(requestOptions);
      log("success", `사용자가 기기 선택: ${device.name}`);

      await connectToDevice(device);

    } catch (err) {
      if (err.name === "NotFoundError" || err.message.includes("User cancelled")) {
        log("info", "사용자 취소");
      } else {
        log("error", "수동 연결 실패:", err);
        setError(err.message);
      }
      setIsConnecting(false);
    }
  }, [connectToDevice]);

  // ============================================================
  // 외부 노출 함수: 연결 해제
  // ============================================================
  const disconnect = useCallback((clearStorage = false) => {
    log("info", "연결 해제 시도");

    stopReconnection();
    cleanupListeners();

    // GATT 연결 해제
    if (deviceRef.current?.gatt?.connected) {
      try {
        deviceRef.current.gatt.disconnect();
        log("success", "GATT 연결 해제 완료");
      } catch (err) {
        log("warn", "GATT 연결 해제 실패:", err);
      }
    }

    // 스토리지 정리
    if (clearStorage && saveToStorage) {
      clearBluetoothDevice();
      log("info", "저장된 기기 정보 삭제");
    }

    // 상태 초기화
    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setDeviceName(null);
    setError(null);
  }, [saveToStorage, stopReconnection, cleanupListeners]);

  const disconnectAndClear = useCallback(() => {
    disconnect(true);
  }, [disconnect]);

  return {
    weight,
    isConnected,
    isConnecting,
    error,
    deviceName,
    connect,
    disconnect,
    disconnectAndClear,
  };
}
