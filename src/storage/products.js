/**
 * @fileoverview 제품 정보 로컬 스토리지 캐싱 관리
 *
 * 키오스크의 제품 목록을 localStorage에 캐싱하여 빠른 로딩을 지원합니다.
 */

const STORAGE_KEY = "kiosk_products_cache";

/**
 * 제품 정보를 localStorage에 저장
 *
 * @param {Array<Object>} products - 제품 목록
 */
export function saveProductsCache(products) {
  try {
    const cacheData = {
      products,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    console.log("💾 [Products Cache] 제품 정보 저장 완료:", products.length, "개");
  } catch (error) {
    console.error("❌ [Products Cache] 저장 실패:", error);
  }
}

/**
 * localStorage에서 제품 정보 조회
 *
 * @param {Array<string>} pids - 조회할 제품 ID 목록
 * @returns {Array<Object>|null} 제품 목록 또는 null
 */
export function getProductsCache(pids) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log("ℹ️ [Products Cache] 캐시된 데이터 없음");
      return null;
    }

    const cacheData = JSON.parse(data);
    const cachedProducts = cacheData.products;

    // 요청된 pid 목록과 캐시된 제품의 pid를 비교
    const cachedPids = new Set(cachedProducts.map(p => p.pid));
    const requestedPids = new Set(pids);

    // 모든 요청된 pid가 캐시에 있는지 확인
    const allPidsInCache = [...requestedPids].every(pid => cachedPids.has(pid));

    if (!allPidsInCache) {
      console.log("ℹ️ [Products Cache] 일부 제품 정보가 캐시에 없음");
      return null;
    }

    // 요청된 pid에 해당하는 제품만 필터링하여 반환
    const filteredProducts = cachedProducts.filter(p => requestedPids.has(p.pid));

    console.log("✅ [Products Cache] 캐시된 제품 정보 사용:", filteredProducts.length, "개");
    return filteredProducts;
  } catch (error) {
    console.error("❌ [Products Cache] 조회 실패:", error);
    return null;
  }
}

/**
 * localStorage에서 제품 정보 삭제
 */
export function clearProductsCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ [Products Cache] 캐시 삭제 완료");
  } catch (error) {
    console.error("❌ [Products Cache] 삭제 실패:", error);
  }
}

/**
 * 단일 제품 정보를 캐시에 추가/업데이트
 *
 * @param {Object} product - 제품 정보
 */
export function updateProductInCache(product) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let cacheData;

    if (data) {
      cacheData = JSON.parse(data);
    } else {
      cacheData = {
        products: [],
        timestamp: Date.now(),
      };
    }

    // 기존 제품 목록에서 같은 pid를 가진 제품 제거
    const filteredProducts = cacheData.products.filter(p => p.pid !== product.pid);

    // 새 제품 추가
    filteredProducts.push(product);

    cacheData.products = filteredProducts;
    cacheData.timestamp = Date.now();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    console.log("💾 [Products Cache] 제품 업데이트 완료:", product.pid);
  } catch (error) {
    console.error("❌ [Products Cache] 업데이트 실패:", error);
  }
}
