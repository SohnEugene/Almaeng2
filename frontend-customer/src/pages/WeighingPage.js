import React, { useState } from 'react';
import api from '../services/api';
import { getProductByCode } from '../services/productService';
import useProducts from '../hooks/useProducts';
import { STEP_NUMBERS, STEP_LABELS, STEP_TITLES } from '../constants/steps';
import './WeighingPage.css';

/**
 * WeighingPage - 알맹 계량 시스템의 메인 페이지 컴포넌트
 * 5단계 프로세스를 통해 리필 제품의 무게를 측정하고 가격을 계산합니다.
 *
 * 프로세스 단계:
 * 1. 저울 번호 입력
 * 2. 공병 무게 측정
 * 3. 제품 번호 입력 및 조회
 * 4. 리필 후 전체 무게 측정
 * 5. 결과 표시 (순 무게 및 총 가격)
 *
 * @component
 * @returns {JSX.Element} 계량 시스템 UI
 */
function WeighingPage() {
  // 백엔드에서 제품 데이터 가져오기
  const { products, loading: productsLoading, error: productsError } = useProducts();

  // 현재 단계 상태 (1: 저울 번호, 2: 공병 무게, 3: 제품 선택, 4: 전체 무게, 5: 결과)
  const [step, setStep] = useState(STEP_NUMBERS.SCALE_INPUT);
  const [scaleNumber, setScaleNumber] = useState('');
  const [bottleWeight, setBottleWeight] = useState('');
  const [productNumber, setProductNumber] = useState('');
  const [refilledWeight, setRefilledWeight] = useState('');
  const [productPrice, setProductPrice] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 저울 번호 입력 폼 제출 핸들러
   * 입력값 검증 후 다음 단계(공병 무게 측정)로 이동
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleScaleSubmit = (e) => {
    e.preventDefault();
    if (!scaleNumber.trim()) {
      setError('저울 번호를 입력해주세요');
      return;
    }
    setError('');
    setStep(STEP_NUMBERS.WEIGHT1_INPUT);
  };

  /**
   * 공병 무게 입력 폼 제출 핸들러
   * 무게 값 유효성 검증 후 다음 단계(제품 선택)로 이동
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleBottleWeightSubmit = (e) => {
    e.preventDefault();
    if (!bottleWeight || parseFloat(bottleWeight) < 0) {
      setError('올바른 무게를 입력해주세요');
      return;
    }
    setError('');
    setStep(STEP_NUMBERS.PRODUCT_SELECTION);
  };

  /**
   * 제품 번호 입력 폼 제출 핸들러
   * 제품 정보를 조회하고 유효성 검증 후 다음 단계(전체 무게 측정)로 이동
   *
   * TODO: 백엔드 API 연동 시 주석 처리된 코드 활성화 필요
   *
   * @async
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productNumber.trim()) {
      setError('제품 번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 백엔드에서 제품 정보 가져오기
      const response = await getProductByCode(productNumber);

      if (!response.success) {
        setError('존재하지 않는 제품 번호입니다');
        setLoading(false);
        return;
      }

      setProductPrice(response.data);
      setLoading(false);
      setStep(STEP_NUMBERS.WEIGHT2_INPUT);
    } catch (err) {
      setError(err.response?.data?.error || '제품 정보를 가져오는데 실패했습니다');
      setLoading(false);
    }
  };

  /**
   * 리필 후 전체 무게 입력 폼 제출 핸들러
   * 순 무게(전체 무게 - 공병 무게)를 계산하고 총 가격을 산출한 후 결과 단계로 이동
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleWeight2Submit = (e) => {
    e.preventDefault();
    if (!refilledWeight || parseFloat(refilledWeight) < 0) {
      setError('올바른 무게를 입력해주세요');
      return;
    }

    const netWeight = parseFloat(refilledWeight) - parseFloat(bottleWeight);
    if (netWeight < 0) {
      setError('전체 무게가 공병 무게보다 작을 수 없습니다.');
      return;
    }

    const calculatedPrice = netWeight * productPrice.price;
    setTotalPrice(calculatedPrice);
    setError('');
    setStep(STEP_NUMBERS.RESULT);
  };

  /**
   * 전체 프로세스를 초기화하고 첫 단계로 돌아가는 핸들러
   * 모든 상태 값을 초기값으로 리셋
   */
  const handleReset = () => {
    setStep(STEP_NUMBERS.SCALE_INPUT);
    setScaleNumber('');
    setBottleWeight('');
    setProductNumber('');
    setRefilledWeight('');
    setProductPrice(null);
    setTotalPrice(null);
    setError('');
  };

  /**
   * 순 무게 계산 헬퍼 함수
   *
   * @returns {number} 순 무게 (전체 무게 - 공병 무게)
   */
  const calculateNetWeight = () => {
    return parseFloat(refilledWeight) - parseFloat(bottleWeight);
  };

  return (
    <div className="weighing-page">
      <div className="weighing-container">
        <h1>알맹 계량 시스템</h1>

        <div className="progress-bar">
          {STEP_LABELS.map((label, index) => (
            <div
              key={index}
              className={`progress-step ${step >= index + 1 ? 'active' : ''}`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === STEP_NUMBERS.SCALE_INPUT && (
          <form onSubmit={handleScaleSubmit} className="input-form">
            <h2>{STEP_TITLES[STEP_NUMBERS.SCALE_INPUT]}</h2>
            <input
              type="text"
              value={scaleNumber}
              onChange={(e) => setScaleNumber(e.target.value)}
              placeholder="저울 번호 입력"
              className="input-field"
              autoFocus
            />
            <button type="submit" className="submit-btn">다음</button>
          </form>
        )}

        {step === STEP_NUMBERS.WEIGHT1_INPUT && (
          <form onSubmit={handleBottleWeightSubmit} className="input-form">
            <h2>{STEP_TITLES[STEP_NUMBERS.WEIGHT1_INPUT]}</h2>
            <p className="info-text">저울 번호: {scaleNumber}</p>
            <input
              type="number"
              step="0.01"
              value={bottleWeight}
              onChange={(e) => setBottleWeight(e.target.value)}
              placeholder="무게 입력 (g)"
              className="input-field"
              autoFocus
            />
            <div className="button-group">
              <button type="button" onClick={() => setStep(STEP_NUMBERS.SCALE_INPUT)} className="back-btn">이전</button>
              <button type="submit" className="submit-btn">다음</button>
            </div>
          </form>
        )}

        {step === STEP_NUMBERS.PRODUCT_SELECTION && (
          <form onSubmit={handleProductSubmit} className="input-form">
            <h2>{STEP_TITLES[STEP_NUMBERS.PRODUCT_SELECTION]}</h2>
            <p className="info-text">저울: {scaleNumber} | 공병 무게: {bottleWeight}g</p>

            {productsLoading ? (
              <div className="info-text">제품 목록을 불러오는 중...</div>
            ) : productsError ? (
              <div className="error-message">{productsError}</div>
            ) : (
              <div className="product-list">
                <p>사용 가능한 제품:</p>
                <ul>
                  {Object.entries(products).map(([code, product]) => (
                    <li key={code}>{code}: {product.name} ({product.price.toLocaleString()}원/g)</li>
                  ))}
                </ul>
              </div>
            )}
            <input
              type="text"
              value={productNumber}
              onChange={(e) => setProductNumber(e.target.value)}
              placeholder="제품 번호 입력"
              className="input-field"
              autoFocus
            />
            <div className="button-group">
              <button type="button" onClick={() => setStep(STEP_NUMBERS.WEIGHT1_INPUT)} className="back-btn">이전</button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '확인 중...' : '다음'}
              </button>
            </div>
          </form>
        )}

        {step === STEP_NUMBERS.WEIGHT2_INPUT && (
          <form onSubmit={handleWeight2Submit} className="input-form">
            <h2>{STEP_TITLES[STEP_NUMBERS.WEIGHT2_INPUT]}</h2>
            <div className="info-box">
              <p>저울: {scaleNumber}</p>
              <p>제품: {productPrice.name}</p>
              <p>단가: {productPrice.price.toLocaleString()}원/g</p>
              <p>무게1 (용기 포함): {bottleWeight}g</p>
            </div>
            <input
              type="number"
              step="0.01"
              value={refilledWeight}
              onChange={(e) => setRefilledWeight(e.target.value)}
              placeholder="무게 입력 (g)"
              className="input-field"
              autoFocus
            />
            <div className="button-group">
              <button type="button" onClick={() => setStep(STEP_NUMBERS.PRODUCT_SELECTION)} className="back-btn">이전</button>
              <button type="submit" className="submit-btn">계산하기</button>
            </div>
          </form>
        )}

        {step === STEP_NUMBERS.RESULT && (
          <div className="result-container">
            <h2>{STEP_TITLES[STEP_NUMBERS.RESULT]}</h2>
            <div className="result-box">
              <div className="result-item">
                <span className="label">저울 번호:</span>
                <span className="value">{scaleNumber}</span>
              </div>
              <div className="result-item">
                <span className="label">제품:</span>
                <span className="value">{productPrice.name}</span>
              </div>
              <div className="result-item">
                <span className="label">무게1 (공병)):</span>
                <span className="value">{bottleWeight}g</span>
              </div>
              <div className="result-item">
                <span className="label">무게2 (전체)):</span>
                <span className="value">{refilledWeight}g</span>
              </div>
              <div className="result-item highlight">
                <span className="label">실제 무게:</span>
                <span className="value">{calculateNetWeight().toFixed(2)}g</span>
              </div>
              <div className="result-item">
                <span className="label">단위 무게 당 가격:</span>
                <span className="value">{productPrice.price.toLocaleString()}원/g</span>
              </div>
              <div className="result-item total">
                <span className="label">총 금액:</span>
                <span className="value">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            <button onClick={handleReset} className="reset-btn">새로 시작</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeighingPage;
