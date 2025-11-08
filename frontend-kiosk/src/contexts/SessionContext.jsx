/**
 * @fileoverview 세션 관리 Context
 *
 * 키오스크 세션 동안의 사용자 선택 정보를 관리합니다.
 * - 선택한 제품
 * - 용기 보유 여부
 * - 용기 구매 여부
 * - 무게
 * - 총 가격
 */

import { createContext, useContext, useState } from 'react';

/**
 * 세션 초기 상태
 */
const initialSessionState = {
  selectedProduct: null,      // 선택한 제품 정보
  pricePerGram: 0,            // 제품 가격 (1g 단위)
  hasContainer: null,
  purchaseContainer: false,
  bottleWeight: 0,
  combinedWeight: 0,
  weight: 0,
  totalPrice: 0,
};

// Context 생성
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
        pricePerGram: product?.price || 0, // 선택 시 pricePerGram 저장
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
      console.log('📦 [setHasContainer] SessionContext updated:', newSession);
      return newSession;
    });
  };

  const setPurchaseContainer = (purchaseContainer) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        purchaseContainer,
      };
      console.log('📦 [setPurchaseContainer] SessionContext updated:', newSession);
      return newSession;
    });
  };

  const setBottleWeight = (bottleWeight) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        bottleWeight,
      };
      console.log('📦 [setBottleWeight] SessionContext updated:', newSession);
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
      console.log('📦 [setCombinedWeight] SessionContext updated:', newSession);
      return newSession;
    });
  };

  const calculateTotalPrice = (customWeight) => {
    const weightToUse = customWeight !== undefined ? customWeight : session.weight;
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

  /**
   * 세션 초기화 (처음으로 돌아가기)
   */
  const resetSession = () => {
    console.log('📦 [resetSession] SessionContext reset to initial state');
    setSession(initialSessionState);
  };

  const value = {
    // 상태
    session,

    // 액션
    selectProduct,
    setHasContainer,
    setPurchaseContainer,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    resetSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
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
    throw new Error('useSession must be used within a SessionProvider');
  }

  return context;
}
