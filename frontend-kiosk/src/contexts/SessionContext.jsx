/**
 * @fileoverview 세션 관리 Context
 * 사용자의 제품 선택, 무게 측정, 결제 정보 등을 전역으로 관리
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// ============================================================
// 상수 정의
// ============================================================
const CONTAINER_PRICE = 500;

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

const isDevelopment = import.meta.env.DEV;

// ============================================================
// 로깅 유틸리티
// ============================================================
function log(level, action, message, ...args) {
  const emoji = {
    info: "📋",
    warn: "⚠️",
    error: "❌",
    debug: "🔍",
  };

  const prefix = `${emoji[level] || "📝"} [Session]`;
  const fullMessage = action ? `${prefix} [${action}] ${message}` : `${prefix} ${message}`;

  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](fullMessage, ...args);
}

// ============================================================
// Context 생성
// ============================================================
const SessionContext = createContext(null);

/**
 * 세션 상태를 제공하는 Provider 컴포넌트
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(initialSessionState);

  /**
   * 세션 상태를 업데이트하고 개발 환경에서 로그를 출력하는 헬퍼 함수
   * @param {Object|Function} updatesOrFn - 업데이트할 부분 상태 또는 업데이터 함수
   * @param {string} actionName - 로깅용 액션 이름
   */
  const updateSession = useCallback((updatesOrFn, actionName) => {
    setSession((prev) => {
      const newSession = typeof updatesOrFn === 'function'
        ? updatesOrFn(prev)
        : { ...prev, ...updatesOrFn };

      if (isDevelopment) {
        log("debug", actionName, "세션 업데이트:", newSession);
      }

      return newSession;
    });
  }, []);

  /**
   * 제품을 선택합니다
   * @param {Object} product - 선택할 제품 객체
   */
  const selectProduct = useCallback((product) => {
    if (!product) {
      log("warn", "selectProduct", "제품이 null 또는 undefined입니다");
      return;
    }

    updateSession(
      {
        selectedProduct: product,
        pricePerGram: product.price || 0,
      },
      'selectProduct'
    );
  }, [updateSession]);

  /**
   * 용기 보유 여부를 설정합니다
   * @param {boolean} hasContainer - 용기 보유 여부
   */
  const setHasContainer = useCallback((hasContainer) => {
    updateSession({ hasContainer }, 'setHasContainer');
  }, [updateSession]);

  /**
   * 용기 구매 여부를 설정합니다
   * @param {boolean} purchaseContainer - 용기 구매 여부
   */
  const setPurchaseContainer = useCallback((purchaseContainer) => {
    updateSession({ purchaseContainer }, 'setPurchaseContainer');
  }, [updateSession]);

  /**
   * 빈 병 무게를 설정합니다
   * @param {number} bottleWeight - 빈 병 무게 (g)
   */
  const setBottleWeight = useCallback((bottleWeight) => {
    if (bottleWeight < 0) {
      log("warn", "setBottleWeight", "병 무게는 음수일 수 없습니다:", bottleWeight);
      return;
    }

    updateSession({ bottleWeight }, 'setBottleWeight');
  }, [updateSession]);

  /**
   * 제품이 담긴 병의 총 무게를 설정하고 순수 제품 무게를 계산합니다
   * @param {number} combinedWeight - 제품이 담긴 병의 총 무게 (g)
   */
  const setCombinedWeight = useCallback((combinedWeight) => {
    if (combinedWeight < 0) {
      log("warn", "setCombinedWeight", "총 무게는 음수일 수 없습니다:", combinedWeight);
      return;
    }

    updateSession((prev) => {
      const netWeight = combinedWeight - prev.bottleWeight;
      return {
        ...prev,
        combinedWeight,
        weight: netWeight > 0 ? netWeight : 0,
      };
    }, 'setCombinedWeight');
  }, [updateSession]);

  /**
   * 총 가격을 계산합니다 (제품 가격 + 용기 가격)
   * @param {number} [customWeight] - 사용자 지정 무게 (선택적)
   * @returns {number} 계산된 총 가격
   */
  const calculateTotalPrice = useCallback((customWeight) => {
    const weightToUse = customWeight !== undefined ? customWeight : session.weight;
    const { pricePerGram, purchaseContainer, selectedProduct } = session;

    // 유효성 검사
    if (!selectedProduct) {
      log("warn", "calculateTotalPrice", "선택된 제품이 없습니다");
      return 0;
    }

    if (pricePerGram < 0) {
      log("error", "calculateTotalPrice", "그램당 가격은 음수일 수 없습니다:", pricePerGram);
      return 0;
    }

    if (weightToUse < 0) {
      log("error", "calculateTotalPrice", "무게는 음수일 수 없습니다:", weightToUse);
      return 0;
    }

    if (weightToUse === 0 || pricePerGram === 0) {
      updateSession({ totalPrice: 0 }, 'calculateTotalPrice');
      return 0;
    }

    const productPrice = pricePerGram * weightToUse;
    const containerPrice = purchaseContainer ? CONTAINER_PRICE : 0;
    const total = productPrice + containerPrice;

    updateSession({ totalPrice: total }, 'calculateTotalPrice');

    return total;
  }, [session, updateSession]);

  /**
   * 결제 방법을 설정합니다
   * @param {string} paymentMethod - 결제 방법 ("CARD", "CASH", "KAKAOPAY" 등)
   */
  const setPaymentMethod = useCallback((paymentMethod) => {
    updateSession({ paymentMethod }, 'setPaymentMethod');
  }, [updateSession]);

  /**
   * 세션을 초기 상태로 리셋합니다
   */
  const resetSession = useCallback(() => {
    if (isDevelopment) {
      log("info", "resetSession", "세션이 초기 상태로 리셋되었습니다");
    }
    setSession(initialSessionState);
  }, []);

  const value = useMemo(() => ({
    session,
    selectProduct,
    setHasContainer,
    setPurchaseContainer,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    setPaymentMethod,
    resetSession,
  }), [
    session,
    selectProduct,
    setHasContainer,
    setPurchaseContainer,
    setBottleWeight,
    setCombinedWeight,
    calculateTotalPrice,
    setPaymentMethod,
    resetSession,
  ]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Session Context를 사용하는 Hook
 *
 * @returns {Object} 세션 상태 및 제어 함수
 * @throws {Error} SessionProvider 외부에서 사용 시 에러 발생
 *
 * @example
 * const { session, selectProduct, setHasContainer } = useSession();
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSession must be used within a SessionProvider. " +
      "SessionProvider로 컴포넌트 트리를 감싸주세요."
    );
  }

  return context;
}
