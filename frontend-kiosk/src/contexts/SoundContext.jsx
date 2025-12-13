/**
 * @fileoverview 사운드 재생 관리 Context
 * 안내 음성 파일을 미리 로드하고 재생을 관리
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

// 사운드 파일 임포트
import refillStartVoice from "../assets/voices/리필시작.mp3";
import qrCheckVoice from "../assets/voices/qr제품확인.mp3";
import containerCheckVoice from "../assets/voices/리필빈병확인.mp3";
import emptyContainerScaleVoice from "../assets/voices/빈병저울.mp3";
import filledContainerScaleVoice from "../assets/voices/제품병저울.mp3";

// ============================================================
// 로깅 유틸리티
// ============================================================
function log(level, message, ...args) {
  const emoji = {
    info: "🔊",
    warn: "⚠️",
    error: "❌",
  };

  const prefix = `${emoji[level] || "🔊"} [Sound]`;
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](prefix, message, ...args);
}

// ============================================================
// Context 생성
// ============================================================
const SoundContext = createContext(null);

/**
 * 사운드 ID와 파일 매핑
 *
 * 사용 가능한 사운드 ID:
 * - REFILL_START: 리필 시작 안내
 * - QR_PRODUCT_CHECK: QR 코드 제품 확인 안내
 * - CONTAINER_CHECK: 빈 용기 확인 안내
 * - EMPTY_CONTAINER_SCALE: 빈 용기 저울 안내
 * - FILLED_CONTAINER_SCALE: 제품이 담긴 용기 저울 안내
 */
const SOUND_SOURCES = {
  REFILL_START: refillStartVoice,
  QR_PRODUCT_CHECK: qrCheckVoice,
  CONTAINER_CHECK: containerCheckVoice,
  EMPTY_CONTAINER_SCALE: emptyContainerScaleVoice,
  FILLED_CONTAINER_SCALE: filledContainerScaleVoice,
};

/**
 * 사운드 재생 관리 Provider 컴포넌트
 *
 * 주요 기능:
 * - 모든 사운드 파일을 미리 로드하여 빠른 재생 지원
 * - 이전 사운드를 자동으로 중지하여 동시 재생 방지
 * - playSound 함수를 통해 사운드 ID로 재생
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export function SoundProvider({ children }) {
  const playersRef = useRef({});
  const currentPlayerRef = useRef(null);

  // 컴포넌트 마운트 시 모든 사운드 파일을 미리 로드
  useEffect(() => {
    playersRef.current = Object.entries(SOUND_SOURCES).reduce((acc, [key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      acc[key] = audio;
      return acc;
    }, {});

    // Cleanup: 언마운트 시 모든 오디오 리소스 정리
    return () => {
      Object.values(playersRef.current).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
      playersRef.current = {};
      currentPlayerRef.current = null;
    };
  }, []);

  /**
   * 사운드를 재생하는 함수
   *
   * @param {string} id - SOUND_SOURCES에 정의된 사운드 ID
   * @returns {Promise} 재생 완료 Promise
   *
   * @example
   * const { playSound } = useSound();
   * playSound("REFILL_START");
   */
  const playSound = useCallback((id) => {
    // 이전 사운드가 재생 중이면 중지
    if (currentPlayerRef.current) {
      currentPlayerRef.current.pause();
      currentPlayerRef.current.currentTime = 0;
    }

    const player = playersRef.current[id];
    if (!player) {
      log("warn", `사운드 "${id}"를 찾을 수 없습니다`);
      return Promise.resolve();
    }

    player.currentTime = 0;
    currentPlayerRef.current = player;

    const playPromise = player.play();

    if (playPromise?.catch) {
      playPromise.catch((err) => {
        log("warn", `사운드 "${id}" 재생 실패:`, err);
      });
    }

    return playPromise;
  }, []);

  const value = useMemo(() => ({ playSound }), [playSound]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/**
 * Sound Context를 사용하는 Hook
 *
 * @returns {{ playSound: Function }} playSound 함수를 포함한 객체
 * @throws {Error} SoundProvider 외부에서 사용 시 에러 발생
 *
 * @example
 * const { playSound } = useSound();
 * playSound("REFILL_START");
 */
export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error(
      "useSound must be used within a SoundProvider. " +
      "SoundProvider로 컴포넌트 트리를 감싸주세요."
    );
  }

  return context;
}
