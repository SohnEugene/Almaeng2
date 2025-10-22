/**
 * useProducts Hook
 * 제품 데이터를 가져오고 관리하는 커스텀 Hook
 */

import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';

/**
 * 제품 목록을 가져오는 Hook
 *
 * @param {string} category - 카테고리 필터 (선택사항)
 * @returns {Object} { products, loading, error, refetch }
 *
 * @example
 * const { products, loading, error, refetch } = useProducts();
 */
const useProducts = (category = null) => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 제품 데이터 가져오기
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts(category);

      if (response.success) {
        setProducts(response.data);
      } else {
        throw new Error(response.error || '제품 정보를 불러오는데 실패했습니다');
      }
    } catch (err) {
      setError(err.message || '제품 정보를 불러오는데 실패했습니다');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 또는 category 변경 시 제품 데이터 가져오기
  useEffect(() => {
    fetchProducts();
  }, [category]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export default useProducts;
