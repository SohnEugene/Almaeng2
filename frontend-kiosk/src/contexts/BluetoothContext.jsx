// src/contexts/BluetoothContext.jsx
import React, { createContext, useContext, useEffect } from "react";
import { useBluetooth } from "../hooks/useBluetooth";

// Context 생성
const BluetoothContext = createContext(null);

// Provider
export function BluetoothProvider({ children }) {
  const bluetooth = useBluetooth({ saveToStorage: true }); // 저장 옵션 유지

  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
}

// 커스텀 훅
export function useBluetoothContext() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error(
      "useBluetoothContext must be used within a BluetoothProvider",
    );
  }
  return context;
}
