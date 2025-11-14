/**
 * @fileoverview HTTP 클라이언트 설정
 *
 * 백엔드 API와 통신하기 위한 기본 HTTP 클라이언트입니다.
 */

/**
 * API 기본 URL
 * @constant {string}
 */
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api';

/**
 * HTTP 요청 헬퍼 함수
 *
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {'json' | 'blob'} responseType - 응답 타입 (기본값: 'json')
 * @returns {Promise<Object | Blob>} 응답 데이터
 */
export async function request(endpoint, options = {}, responseType = 'json') {
  console.log('API Request to:', `${BASE_URL}${endpoint}`);
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to get error details from response body
      let errorDetail = '';
      try {
        if (responseType === 'json') {
          const errorData = await response.json();
          errorDetail = errorData.detail || JSON.stringify(errorData);
        } else {
          errorDetail = await response.text();
        }
      } catch (e) {
        errorDetail = `Failed to parse error response: ${e.message}`;
      }

      console.error('API Error Details:', errorDetail);
      throw new Error(`HTTP Error: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    if (responseType === 'blob') {
      return await response.blob();
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}
