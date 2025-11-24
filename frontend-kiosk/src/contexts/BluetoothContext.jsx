import { createContext, useContext } from "react";
import { useBluetooth } from "../hooks/useBluetooth";

const BluetoothContext = createContext(null);

export function BluetoothProvider({ children }) {
  const bluetooth = useBluetooth({ saveToStorage: true });

  return (
    <BluetoothContext.Provider value={bluetooth}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetoothContext() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error(
      "useBluetoothContext must be used within a BluetoothProvider",
    );
  }
  return context;
}
