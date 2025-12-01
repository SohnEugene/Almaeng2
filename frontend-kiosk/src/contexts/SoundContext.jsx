import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

// 사운드 파일 import
import refillStartVoice from "../assets/voices/리필시작.mp3";
import qrCheckVoice from "../assets/voices/qr제품확인.mp3";
import containerCheckVoice from "../assets/voices/리필빈병확인.mp3";
import emptyContainerScaleVoice from "../assets/voices/빈병저울.mp3";
import filledContainerScaleVoice from "../assets/voices/제품병저울.mp3";

const SoundContext = createContext(null);

/**
 * 사운드 ID와 파일 매핑
 *
 * 사용 가능한 사운드 ID:
 * - REFILL_START: 리필 시작 안내
 * - QR_PRODUCT_CHECK: QR 코드로 제품 확인 안내
 * - CONTAINER_CHECK: 리필용 빈 병 확인 안내
 * - EMPTY_CONTAINER_SCALE: 빈 병을 저울에 올리라는 안내
 * - FILLED_CONTAINER_SCALE: 제품을 담은 병을 저울에 올리라는 안내
 */
const SOUND_SOURCES = {
  REFILL_START: refillStartVoice,
  QR_PRODUCT_CHECK: qrCheckVoice,
  CONTAINER_CHECK: containerCheckVoice,
  EMPTY_CONTAINER_SCALE: emptyContainerScaleVoice,
  FILLED_CONTAINER_SCALE: filledContainerScaleVoice,
};

/**
 * 사운드 재생을 관리하는 Provider 컴포넌트
 *
 * 기능:
 * - 모든 사운드 파일을 미리 로드하여 빠른 재생 보장
 * - 동시에 여러 사운드가 재생되지 않도록 이전 사운드 자동 정지
 * - playSound 함수를 통해 사운드 ID로 재생
 */
export function SoundProvider({ children }) {
  const playersRef = useRef({});
  const currentPlayerRef = useRef(null);

  // 컴포넌트 마운트 시 모든 사운드 파일 미리 로드
  useEffect(() => {
    console.log("🔊 [Sound] 사운드 파일 로드 중...");

    playersRef.current = Object.entries(SOUND_SOURCES).reduce((acc, [key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      acc[key] = audio;
      return acc;
    }, {});

    console.log(`✅ [Sound] ${Object.keys(SOUND_SOURCES).length}개 사운드 로드 완료`);
  }, []);

  /**
   * 사운드를 재생하는 함수
   *
   * @param {string} id - SOUND_SOURCES에 정의된 사운드 ID
   * @returns {Promise} 재생 완료 Promise
   *
   * 사용 예시:
   * const { playSound } = useSound();
   * playSound("REFILL_START");
   */
  const playSound = useCallback((id) => {
    // 이전 사운드가 재생 중이면 멈춤
    if (currentPlayerRef.current) {
      currentPlayerRef.current.pause();
      currentPlayerRef.current.currentTime = 0;
    }

    const player = playersRef.current[id];
    if (!player) {
      console.warn(`⚠️ [Sound] "${id}" 사운드를 찾을 수 없습니다`);
      return Promise.resolve();
    }

    player.currentTime = 0;
    currentPlayerRef.current = player;

    console.log(`🔊 [Sound] "${id}" 재생 시작`);
    const playPromise = player.play();

    if (playPromise?.catch) {
      playPromise.catch((err) => {
        console.warn(`⚠️ [Sound] "${id}" 재생 실패:`, err);
      });
    }

    return playPromise;
  }, []);

  const value = useMemo(() => ({ playSound }), [playSound]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/**
 * 사운드 재생 훅
 *
 * @returns {{ playSound: Function }} playSound 함수를 포함한 객체
 * @throws {Error} SoundProvider 외부에서 사용 시 에러
 *
 * 사용 예시:
 * const { playSound } = useSound();
 * playSound("REFILL_START");
 */
export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
