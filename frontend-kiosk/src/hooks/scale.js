import { useState, useRef, useCallback } from 'react';

// ✅ UUID를 모두 소문자로 통일
const SCALE_SERVICE_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const SCALE_CHAR_UUID = '58cef04b-022c-13a8-c1c3-3b4d507f6bbe';

export function useScale() {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // ✅ 수신 데이터 파싱 함수
  const parseWeight = useCallback((value) => {
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, '');
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  // ✅ 연결 해제 처리
  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      console.log('Disconnecting from device...');
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setError(null);
    setDeviceName(null);
  }, []);

  // ✅ BLE 연결
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // ⚙️ optionalServices 대신 filters 사용 (Android 호환성 개선)
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SCALE_SERVICE_UUID]
      });

      deviceRef.current = device;

      console.log('Selected device:', {
        name: device.name,
        id: device.id,
      });

      setDeviceName(device.name || 'Unknown Device');

      // ✅ 디버깅용 로그 추가
      device.addEventListener('gattserverdisconnected', (event) => {
        console.warn('Device disconnected unexpectedly:', event.target);
        disconnect();
      });

      console.log('Connecting to GATT server...');
      const server = await device.gatt.connect();
      console.log('Connected to GATT server');

      // ⚙️ Android에서 전체 서비스 탐색(getPrimaryServices) 제거
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      console.log('Got service:', service.uuid);

      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);
      console.log('Got characteristic:', characteristic.uuid);

      characteristicRef.current = characteristic;

      // ✅ 데이터 핸들링
      const handleValue = (value) => {
        const newWeight = parseWeight(value);
        setWeight(newWeight);
      };

      if (characteristic.properties.notify) {
        console.log('Starting notifications...');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          handleValue(e.target.value);
        });
      } else if (characteristic.properties.read) {
        console.log('Polling characteristic value...');
        pollIntervalRef.current = setInterval(async () => {
          try {
            const value = await characteristic.readValue();
            handleValue(value);
          } catch (err) {
            console.error('Error reading value:', err);
          }
        }, 500);
      } else {
        throw new Error('Characteristic does not support read or notify');
      }

      setIsConnected(true);
      setIsConnecting(false);
      console.log('✅ BLE connected successfully');
    } catch (err) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect to scale');
      setIsConnecting(false);
      disconnect();
    }
  }, [disconnect, parseWeight]);

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
