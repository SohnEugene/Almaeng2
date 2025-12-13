/**
 * @fileoverview 비활동 타임아웃 감지 Hook
 * 일정 시간 동안 사용자 인터랙션이 없으면 콜백을 실행
 */

import { useCallback, useEffect, useRef } from "react";

// ============================================================
// 상수 정의
// ============================================================
const TRACKED_EVENTS = [
  "mousedown",
  "keypress",
  "scroll",
  "touchstart",
];

const isDevelopment = import.meta.env.DEV;

// ============================================================
// 유틸리티 함수
// ============================================================
function formatTimeout(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}분` : `${seconds}초`;
}

function log(message, ...args) {
  if (!isDevelopment) return;
  console.log("⏰ [Inactivity]", message, ...args);
}

// ============================================================
// Hook
// ============================================================
/**
 * 사용자 비활동 감지 및 타임아웃 처리 Hook
 *
 * @param {Function} onTimeout - 타임아웃 시 실행할 콜백 함수
 * @param {number} [timeout=300000] - 타임아웃 시간 (밀리초), 기본값 5분
 * @param {boolean} [enabled=true] - 타임아웃 활성화 여부
 * @returns {{ resetTimer: Function }} 타이머를 수동으로 리셋할 수 있는 함수
 *
 * @example
 * // 5분 동안 활동이 없으면 홈으로 이동
 * useInactivityTimeout(() => navigate('/'), 300000);
 *
 * @example
 * // 타이머를 수동으로 리셋
 * const { resetTimer } = useInactivityTimeout(handleTimeout, 60000);
 * // 특정 액션 후 타이머 리셋
 * onClick={() => { doSomething(); resetTimer(); }}
 */
export default function useInactivityTimeout(onTimeout, timeout = 300000, enabled = true) {
  const timeoutRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // 기존 타이머 제거
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        log(`타임아웃 발생 (${formatTimeout(timeout)})`);
        onTimeout();
      }
    }, timeout);
  }, [onTimeout, timeout, enabled]);

  useEffect(() => {
    if (!enabled) {
      // 비활성화된 경우 기존 타이머 제거
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // 초기 타이머 설정
    resetTimer();

    // 이벤트 리스너 등록 (passive 옵션으로 성능 최적화)
    const options = { passive: true };
    TRACKED_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer, options);
    });

    // Cleanup: 이벤트 리스너 제거 및 타이머 정리
    return () => {
      TRACKED_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer, options);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, enabled]);

  return { resetTimer };
}
