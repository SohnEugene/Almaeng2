/**
 * Product Model
 * 제품 정보를 관리하는 모델
 *
 * 현재는 메모리 기반 데이터를 사용하지만,
 * 추후 데이터베이스(MongoDB, PostgreSQL 등)로 전환 가능
 */

class Product {
  constructor(id, code, name, price, category = 'general', active = true) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.price = price; // 그램당 가격
    this.category = category;
    this.active = active;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// 임시 데이터 저장소 (메모리 기반)
let products = [
  new Product(1, '1', '샴푸1', 30, '세면용품'),
  new Product(2, '2', '샴푸2', 50, '세면용품'),
  new Product(3, '3', '세제1', 20, '생활용품'),
  new Product(4, '4', '세제2', 80, '생활용품'),
  new Product(5, '5', '로션1', 120, '화장품'),
];

/**
 * 모든 활성 제품 조회
 * @returns {Array} 활성 제품 목록
 */
const getAllProducts = () => {
  return products.filter(product => product.active);
};

/**
 * 제품 코드로 제품 조회
 * @param {string} code - 제품 코드
 * @returns {Object|null} 제품 정보 또는 null
 */
const getProductByCode = (code) => {
  return products.find(product => product.code === code && product.active) || null;
};

/**
 * ID로 제품 조회
 * @param {number} id - 제품 ID
 * @returns {Object|null} 제품 정보 또는 null
 */
const getProductById = (id) => {
  return products.find(product => product.id === id && product.active) || null;
};

/**
 * 카테고리별 제품 조회
 * @param {string} category - 제품 카테고리
 * @returns {Array} 해당 카테고리의 제품 목록
 */
const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category && product.active);
};

/**
 * 새 제품 추가
 * @param {Object} productData - 제품 데이터
 * @returns {Object} 생성된 제품
 */
const createProduct = (productData) => {
  const newId = Math.max(...products.map(p => p.id), 0) + 1;
  const newProduct = new Product(
    newId,
    productData.code,
    productData.name,
    productData.price,
    productData.category,
    productData.active
  );
  products.push(newProduct);
  return newProduct;
};

/**
 * 제품 정보 업데이트
 * @param {number} id - 제품 ID
 * @param {Object} updates - 업데이트할 데이터
 * @returns {Object|null} 업데이트된 제품 또는 null
 */
const updateProduct = (id, updates) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date()
  };
  return products[index];
};

/**
 * 제품 삭제 (소프트 삭제)
 * @param {number} id - 제품 ID
 * @returns {boolean} 삭제 성공 여부
 */
const deleteProduct = (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;

  products[index].active = false;
  products[index].updatedAt = new Date();
  return true;
};

module.exports = {
  Product,
  getAllProducts,
  getProductByCode,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
};
