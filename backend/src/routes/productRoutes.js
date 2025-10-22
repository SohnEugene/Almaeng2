/**
 * Product Routes
 * 제품 관련 API 라우트 정의
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  addProduct,
  modifyProduct,
  removeProduct
} = require('../controllers/productController');

/**
 * @route   GET /api/products
 * @desc    모든 제품 조회 (쿼리: ?category=카테고리명)
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:code
 * @desc    제품 코드로 단일 제품 조회
 * @access  Public
 */
router.get('/:code', getProduct);

/**
 * @route   POST /api/products
 * @desc    새 제품 생성
 * @access  Private (추후 인증 미들웨어 추가)
 */
router.post('/', addProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    제품 정보 수정
 * @access  Private (추후 인증 미들웨어 추가)
 */
router.put('/:id', modifyProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    제품 삭제
 * @access  Private (추후 인증 미들웨어 추가)
 */
router.delete('/:id', removeProduct);

module.exports = router;
