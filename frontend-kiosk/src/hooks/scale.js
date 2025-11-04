// src/hooks/scale.js
import { useState, useRef, useCallback } from 'react';

const SCALE_SERVICE_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const SCALE_CHAR_UUID = '58CEF04B-022C-13A8-C1C3-3B4D507F6BBE';

export function useScale() {
  const [weight, setWeight] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState(null);

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const parseWeight = useCallback((value) => {
    const hexStr = Array.from(new Uint8Array(value.buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const middleHex = hexStr.slice(16, 28).replace(/^0+/, '');
    return middleHex ? parseInt(middleHex, 16) : 0;
  }, []);

  const disconnect = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;
    setIsConnected(false);
    setWeight(0);
    setError(null);
    setDeviceName(null);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SCALE_SERVICE_UUID]
      });

      deviceRef.current = device;

      // Log device information for debugging
      console.log('Connected to device:', {
        name: device.name,
        id: device.id,
      });

      setDeviceName(device.name || 'Unknown Device');

      device.addEventListener('gattserverdisconnected', () => {
        disconnect();
      });

      const server = await device.gatt.connect();

      // Log available services
      console.log('Getting services...');
      const services = await server.getPrimaryServices();
      console.log('Available services:', services.map(s => s.uuid));
      const service = await server.getPrimaryService(SCALE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(SCALE_CHAR_UUID);

      characteristicRef.current = characteristic;

      const handleValue = (value) => {
        const newWeight = parseWeight(value);
        setWeight(newWeight);
      };

      if (characteristic.properties.notify) {
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (e) => {
          handleValue(e.target.value);
        });
      } else if (characteristic.properties.read) {
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
    } catch (err) {
      console.error('Connection error:', err);
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
    disconnect
  };
}
