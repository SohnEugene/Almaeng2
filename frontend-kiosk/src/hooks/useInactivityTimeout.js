import { useEffect, useRef, useCallback } from 'react';

/**
 * 일정 시간 동안 사용자 인터랙션이 없으면 콜백을 실행하는 훅
 * @param {Function} onTimeout - 타임아웃 시 실행할 콜백 함수
 * @param {number} timeout - 타임아웃 시간 (밀리초), 기본값 5분 (300000ms)
 * @param {boolean} enabled - 타임아웃 활성화 여부, 기본값 true
 */
export default function useInactivityTimeout(onTimeout, timeout = 300000, enabled = true) {
  const timeoutRef = useRef(null);

  // 타이머 리셋 함수
  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // 기존 타이머 제거
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      console.log('⏰ [Inactivity] 타임아웃: HomePage로 이동');
      if (onTimeout) {
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

    // 감지할 이벤트 목록
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // 초기 타이머 설정
    resetTimer();

    // 이벤트 리스너 등록
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // 클린업: 이벤트 리스너 제거 및 타이머 정리
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, enabled]);

  // 수동으로 타이머를 리셋할 수 있는 함수 반환
  return { resetTimer };
}
