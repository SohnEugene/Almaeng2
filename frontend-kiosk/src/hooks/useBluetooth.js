import { useState, useRef, useCallback } from "react";
import {
  saveBluetoothDevice,
  getBluetoothDevice,
  clearBluetoothDevice,
} from "../storage/bluetooth";

const SCALE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const SCALE_CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

/**
 * 블루투스 저울 연결 및 무게 데이터 수신 Hook
 *
 * @param {Object} options
 * @param {boolean} options.saveToStorage - localStorage 저장 여부
 * @returns {Object} 블루투스 연결 상태 및 제어 함수
 */
export function useBluetooth({ saveToStorage = false } = {}) {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const disconnectHandlerRef = useRef(null);

  const parseWeight = useCallback((value) => {
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, "");
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  const disconnect = useCallback(() => {
    if (deviceRef.current && disconnectHandlerRef.current) {
      deviceRef.current.removeEventListener("gattserverdisconnected", disconnectHandlerRef.current);
      disconnectHandlerRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }

    if (saveToStorage) {
      clearBluetoothDevice();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setError(null);
    setDeviceName(null);
  }, [saveToStorage]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const savedDevice = getBluetoothDevice();
      const deviceName = savedDevice?.name;

      const requestOptions = deviceName
        ? {
            filters: [{ name: deviceName }],
            optionalServices: [SCALE_SERVICE_UUID],
          }
        : {
            acceptAllDevices: true,
            optionalServices: [SCALE_SERVICE_UUID],
          };

      const device = await navigator.bluetooth.requestDevice(requestOptions);
      const name = device.name || "Unknown Device";

      deviceRef.current = device;
      setDeviceName(name);

      if (saveToStorage) {
        saveBluetoothDevice({ id: device.id, name });
      }

      const handleDisconnect = () => disconnect();
      disconnectHandlerRef.current = handleDisconnect;
      device.addEventListener("gattserverdisconnected", handleDisconnect);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);

      characteristicRef.current = characteristic;

      if (!characteristic.properties.notify) {
        throw new Error("This device does not support notifications.");
      }

      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", (e) => {
        const newWeight = parseWeight(e.target.value);
        setWeight(Math.round(newWeight / 100));
      });

      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      setError(err.message || "Failed to connect to scale");
      setIsConnecting(false);
      disconnect();
    }
  }, [disconnect, parseWeight, saveToStorage]);

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
