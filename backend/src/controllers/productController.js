/**
 * Product Controller
 * 제품 관련 비즈니스 로직 처리
 */

const {
  getAllProducts,
  getProductByCode,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../models/Product');

/**
 * 모든 제품 조회
 * GET /api/products
 */
const getProducts = (req, res) => {
  try {
    const { category } = req.query;

    let products;
    if (category) {
      products = getProductsByCategory(category);
    } else {
      products = getAllProducts();
    }

    // 프론트엔드에서 사용하는 형식으로 변환 (code를 키로 사용)
    const productsMap = {};
    products.forEach(product => {
      productsMap[product.code] = {
        name: product.name,
        price: product.price,
        category: product.category
      };
    });

    res.json({
      success: true,
      data: productsMap,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * 제품 코드로 단일 제품 조회
 * GET /api/products/:code
 */
const getProduct = (req, res) => {
  try {
    const { code } = req.params;
    const product = getProductByCode(code);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: {
        name: product.name,
        price: product.price,
        category: product.category
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * 새 제품 생성
 * POST /api/products
 */
const addProduct = (req, res) => {
  try {
    const { code, name, price, category } = req.body;

    // 입력값 검증
    if (!code || !name || !price) {
      return res.status(400).json({
        success: false,
        error: '제품 코드, 이름, 가격은 필수입니다'
      });
    }

    // 코드 중복 체크
    if (getProductByCode(code)) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 제품 코드입니다'
      });
    }

    const newProduct = createProduct({ code, name, price, category });

    res.status(201).json({
      success: true,
      data: {
        name: newProduct.name,
        price: newProduct.price,
        category: newProduct.category
      },
      message: '제품이 생성되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * 제품 정보 수정
 * PUT /api/products/:id
 */
const modifyProduct = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = updateProduct(parseInt(id), updates);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category
      },
      message: '제품 정보가 수정되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * 제품 삭제
 * DELETE /api/products/:id
 */
const removeProduct = (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteProduct(parseInt(id));

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '제품을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '제품이 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  addProduct,
  modifyProduct,
  removeProduct
};
