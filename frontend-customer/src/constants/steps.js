/**
 * 계량 프로세스의 단계 정보
 */

/**
 * 각 단계의 번호 상수
 * @enum {number}
 */
export const STEP_NUMBERS = {
  SCALE_INPUT: 1,
  WEIGHT1_INPUT: 2,
  PRODUCT_SELECTION: 3,
  WEIGHT2_INPUT: 4,
  RESULT: 5,
};

/**
 * 각 단계의 레이블
 * @type {Array<string>}
 */
export const STEP_LABELS = ['저울', '무게1', '제품', '무게2', '완료'];

/**
 * 각 단계의 제목
 * @type {Object<number, string>}
 */
export const STEP_TITLES = {
  [STEP_NUMBERS.SCALE_INPUT]: '저울 번호를 입력하세요 (수정 필요)',
  [STEP_NUMBERS.WEIGHT1_INPUT]: '공병 무게를 측정하세요',
  [STEP_NUMBERS.PRODUCT_SELECTION]: '제품 번호를 입력하세요',
  [STEP_NUMBERS.WEIGHT2_INPUT]: '리필한 병의 무게를 측정하세요',
  [STEP_NUMBERS.RESULT]: '계산 완료!',
};
