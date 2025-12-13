/**
 * @fileoverview Bluetooth 연결 상태를 전역으로 관리하는 Context
 */

import { createContext, useContext } from "react";

import { useBluetooth } from "../hooks/useBluetooth";

const BluetoothContext = createContext(null);

/**
 * Bluetooth 상태를 제공하는 Provider 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @param {boolean} [props.saveToStorage=true] - 기기 정보를 localStorage에 저장할지 여부
 */
export function BluetoothProvider({ children, saveToStorage = true }) {
  const bluetooth = useBluetooth({ saveToStorage });

  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
}

/**
 * Bluetooth Context를 사용하는 Hook
 * @returns {Object} Bluetooth 상태 및 제어 함수
 * @throws {Error} BluetoothProvider 외부에서 사용 시 에러 발생
 */
export function useBluetoothContext() {
  const context = useContext(BluetoothContext);

  if (!context) {
    throw new Error(
      "useBluetoothContext must be used within a BluetoothProvider. " +
      "Wrap your component tree with <BluetoothProvider>."
    );
  }

  return context;
}
