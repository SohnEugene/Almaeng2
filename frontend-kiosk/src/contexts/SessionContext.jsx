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
  hasContainer: null,          // 용기 보유 여부 (true/false/null)
  purchaseContainer: false,    // 용기 구매 여부
  weight: 0,                   // 무게 (gram)
  totalPrice: 0,               // 총 가격
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

  /**
   * 제품 선택
   */
  const selectProduct = (product) => {
    setSession((prev) => ({
      ...prev,
      selectedProduct: product,
    }));
  };

  /**
   * 용기 보유 여부 설정
   */
  const setHasContainer = (hasContainer) => {
    setSession((prev) => ({
      ...prev,
      hasContainer,
    }));
  };

  /**
   * 용기 구매 여부 설정
   */
  const setPurchaseContainer = (purchaseContainer) => {
    setSession((prev) => ({
      ...prev,
      purchaseContainer,
    }));
  };

  /**
   * 무게 설정
   */
  const setWeight = (weight) => {
    setSession((prev) => ({
      ...prev,
      weight,
    }));
  };

  /**
   * 총 가격 계산 및 설정
   * @param {number} customWeight - 사용할 무게 (옵션, 없으면 세션의 무게 사용)
   */
  const calculateTotalPrice = (customWeight) => {
    const weightToUse = customWeight !== undefined ? customWeight : session.weight;
    const { selectedProduct, purchaseContainer } = session;

    if (!selectedProduct || weightToUse === 0) {
      return 0;
    }

    // 제품 가격 계산 (g당 가격 * 무게)
    const productPrice = selectedProduct.price * weightToUse;

    // 용기 가격 (구매하는 경우에만)
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
    console.log('🔄 SessionContext resetSession 호출됨');
    console.log('이전 세션:', session);
    setSession(initialSessionState);
    console.log('새 세션:', initialSessionState);
  };

  const value = {
    // 상태
    session,

    // 액션
    selectProduct,
    setHasContainer,
    setPurchaseContainer,
    setWeight,
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
