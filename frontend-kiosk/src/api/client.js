export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8000/api";

/**
 * HTTP 요청 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} [options={}] - fetch 옵션 (method, body, headers 등)
 * @returns {Promise<Object>} - 서버에서 받은 JSON 데이터
 * @throws {Error} - HTTP 오류 또는 네트워크 오류
 */
export async function request(endpoint, options = {}) {
  console.log("API Request to:", `${BASE_URL}${endpoint}`);

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.ok) {
      // No Content 응답 처리
      if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        return {};
      }
      return await response.json();
    }

    // 에러 응답 처리
    const errorDetail = await parseErrorResponse(response);
    console.error("API Error Details:", errorDetail);

    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorDetail}`
    );
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

/**
 * 에러 응답 파싱
 * @param {Response} response - Fetch API Response 객체
 * @returns {Promise<string>} - 파싱된 에러 메시지
 */
async function parseErrorResponse(response) {
  try {
    const errorData = await response.json();
    return errorData.detail || JSON.stringify(errorData);
  } catch {
    return await response.text();
  }
}
