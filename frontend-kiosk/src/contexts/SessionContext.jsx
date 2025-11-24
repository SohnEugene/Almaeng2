/**
 * @fileoverview 세션 관리 Context
 */

import { createContext, useContext, useState } from "react";

const initialSessionState = {
  selectedProduct: null,
  pricePerGram: 0,
  hasContainer: null,
  purchaseContainer: false,
  bottleWeight: 0,
  combinedWeight: 0,
  weight: 0,
  totalPrice: 0,
  paymentMethod: null,
};

// context 생성
const SessionContext = createContext(null);

/**
 * Session Provider 컴포넌트
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(initialSessionState);

  const selectProduct = (product) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        selectedProduct: product,
        pricePerGram: product?.price || 0,
      };
      return newSession;
    });
  };

  const setHasContainer = (hasContainer) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        hasContainer,
      };
      console.log("[setHasContainer] SessionContext updated:", newSession);
      return newSession;
    });
  };

  const setPurchaseContainer = (purchaseContainer) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        purchaseContainer,
      };
      console.log("[setPurchaseContainer] SessionContext updated:", newSession,);
      return newSession;
    });
  };

  const setBottleWeight = (bottleWeight) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        bottleWeight,
      };
      console.log("[setBottleWeight] SessionContext updated:", newSession);
      return newSession;
    });
  };

  const setCombinedWeight = (combinedWeight) => {
    setSession((prev) => {
      const netWeight = combinedWeight - prev.bottleWeight;
      const newSession = {
        ...prev,
        combinedWeight,
        weight: netWeight > 0 ? netWeight : 0,
      };
      console.log("[setCombinedWeight] SessionContext updated:", newSession);
      return newSession;
    });
  };

  const calculateTotalPrice = (customWeight) => {
    const weightToUse =
      customWeight !== undefined ? customWeight : session.weight;
    const { pricePerGram, purchaseContainer } = session;

    if (weightToUse === 0 || pricePerGram === 0) {
      setSession((prev) => ({
        ...prev,
        totalPrice: 0,
      }));
      return 0;
    }

    const productPrice = pricePerGram * weightToUse;
    const containerPrice = purchaseContainer ? 500 : 0;
    const total = productPrice + containerPrice;

    setSession((prev) => ({
      ...prev,
      totalPrice: total,
    }));

    return total;
  };

  const setPaymentMethod = (paymentMethod) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        paymentMethod,
      };
      console.log("[setPaymentMethod] SessionContext updated:", newSession);
      return newSession;
    });
  };

  // 세션 초기화
  const resetSession = () => {
    console.log("[resetSession] SessionContext reset to initial state");
    setSession(initialSessionState);
  };

  const value = {
    session,

    selectProduct,
    setHasContainer,
    setPurchaseContainer,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    setPaymentMethod,
    resetSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Session Context를 사용하는 커스텀 훅
 *
 * @returns {Object} Session context value
 *
 * @example
 * const { session, selectProduct, setHasContainer } = useSession();
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
