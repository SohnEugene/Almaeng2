# Frontend-Kiosk 프로젝트 구조

BLE 저울을 활용한 리필 스테이션 키오스크 애플리케이션

---

## 📁 폴더 구조

```
frontend-kiosk/
├── public/                     # 정적 파일 (빌드 시 그대로 복사됨)
├── src/                        # 소스 코드
│   ├── assets/                 # 정적 리소스 (이미지, 폰트 등)
│   │   └── README.md
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.jsx
│   │   └── ProductCard.jsx
│   ├── constants/              # 상수 정의
│   │   └── bluetooth.js
│   ├── hooks/                  # 커스텀 React Hooks
│   │   └── useBluetooth.js
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── HomePage.jsx
│   │   ├── ProductSelectionPage.jsx
│   │   ├── ContainerCheckPage.jsx
│   │   ├── ContainerPurchaseModal.jsx
│   │   └── RefillStartPage.jsx
│   ├── services/               # API 통신 및 외부 서비스
│   │   └── api.js
│   ├── styles/                 # 전역 스타일
│   │   └── global.css
│   ├── utils/                  # 유틸리티 함수
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx                 # 메인 앱 컴포넌트 (라우팅)
│   └── main.jsx                # 진입점
├── index.html                  # HTML 템플릿
├── package.json                # 프로젝트 설정 및 의존성
├── vite.config.js             # Vite 빌드 설정
└── STRUCTURE.md               # 이 파일
```

---

## 📂 각 폴더의 역할

### 1. `src/main.jsx` - 애플리케이션 진입점

**역할:**
- React 앱을 DOM에 마운트
- 전역 스타일 import
- StrictMode 설정

**파일 흐름:**
```
index.html → main.jsx → App.jsx
```

---

### 2. `src/App.jsx` - 메인 앱 컴포넌트

**역할:**
- 페이지 라우팅 (페이지 전환 로직)
- 전역 상태 관리 (BLE 연결 등)
- 페이지 렌더링 제어

**주요 상태:**
- `currentPage`: 현재 표시 중인 페이지 번호
- BLE 연결 상태 (useBluetooth Hook 사용)

---

### 3. `src/pages/` - 페이지 컴포넌트

각 화면을 담당하는 컴포넌트들입니다.

| 파일명 | 설명 | 주요 기능 |
|--------|------|----------|
| `HomePage.jsx` | 홈/인트로 화면 | 시작 버튼 |
| `ProductSelectionPage.jsx` | 제품 선택 화면 | 제품 목록, 선택 |
| `ContainerCheckPage.jsx` | 용기 확인 화면 | 용기 보유 여부 확인 |
| `ContainerPurchaseModal.jsx` | 용기 구매 모달 | 다회용기 추가 |
| `RefillStartPage.jsx` | 리필 시작 화면 | 무게 측정 시작 |

**특징:**
- 한 화면 = 하나의 페이지 컴포넌트
- `onNext` prop으로 페이지 전환
- 인라인 스타일 사용

---

### 4. `src/components/` - 재사용 컴포넌트

여러 페이지에서 공통으로 사용되는 UI 컴포넌트들입니다.

| 파일명 | 설명 | Props |
|--------|------|-------|
| `Button.jsx` | 버튼 컴포넌트 | `variant`, `onClick`, `disabled` |
| `ProductCard.jsx` | 제품 카드 | `product`, `isSelected`, `onSelect` |

**사용 예시:**
```jsx
<Button variant="primary" onClick={handleClick}>
  클릭
</Button>
```

**언제 추가해야 하나?**
- ✅ 2개 이상의 페이지에서 사용
- ✅ 독립적으로 재사용 가능
- ✅ Props로 동작 제어 가능

---

### 5. `src/hooks/` - 커스텀 React Hooks

비즈니스 로직과 상태 관리를 캡슐화한 Hooks입니다.

| 파일명 | 설명 | 반환값 |
|--------|------|--------|
| `useBluetooth.js` | BLE 장치 연결 및 데이터 수신 | `{ weight, isConnected, connect, disconnect }` |

**사용 예시:**
```jsx
const { weight, isConnected, connect } = useBluetooth();
```

**언제 추가해야 하나?**
- ✅ 복잡한 상태 관리 로직
- ✅ 여러 컴포넌트에서 재사용
- ✅ 외부 API/장치 통신

---

### 6. `src/services/` - API 및 외부 서비스

백엔드 API 통신 및 외부 서비스 연동을 담당합니다.

| 파일명 | 설명 |
|--------|------|
| `api.js` | REST API 호출 함수들, Mock 데이터 |

**주요 함수:**
- `getProducts()`: 제품 목록 조회
- `createOrder()`: 주문 생성
- `getMockProducts()`: 개발용 Mock 데이터

**사용 예시:**
```jsx
import { getMockProducts } from '../services/api';

const products = getMockProducts();
```

---

### 7. `src/constants/` - 상수 정의

애플리케이션 전체에서 사용되는 상수들을 정의합니다.

| 파일명 | 설명 |
|--------|------|
| `bluetooth.js` | BLE UUID, 설정값 |

**사용 예시:**
```jsx
import { SCALE_SERVICE_UUID } from '../constants/bluetooth';
```

**언제 추가해야 하나?**
- ✅ 여러 곳에서 사용되는 고정값
- ✅ 설정 값 (UUID, API URL 등)
- ✅ Magic Number 제거

---

### 8. `src/utils/` - 유틸리티 함수

순수 함수 형태의 헬퍼 함수들입니다.

| 파일명 | 설명 |
|--------|------|
| `formatters.js` | 데이터 포맷팅 (무게, 가격, 날짜) |
| `validators.js` | 데이터 검증 (유효성 체크) |

**사용 예시:**
```jsx
import { formatWeight } from '../utils/formatters';

const text = formatWeight(1250); // "1,250g"
```

**언제 추가해야 하나?**
- ✅ 순수 함수 (입력 → 출력)
- ✅ UI와 무관한 로직
- ✅ 여러 곳에서 재사용

---

### 9. `src/styles/` - 스타일 관리

| 파일명 | 설명 |
|--------|------|
| `global.css` | 전역 CSS, CSS 변수, Reset |

**CSS 변수 사용:**
```jsx
<div style={{ color: 'var(--color-primary)' }}>
  텍스트
</div>
```

---

### 10. `src/assets/` - 정적 리소스

이미지, 폰트, 비디오 등의 파일을 저장합니다.

**권장 구조:**
```
assets/
├── images/
│   ├── logo/
│   ├── products/
│   └── icons/
└── fonts/
```

**사용 예시:**
```jsx
import logoImage from '../assets/images/logo.png';

<img src={logoImage} alt="Logo" />
```

---

## 🔄 데이터 흐름 (Data Flow)

```
사용자 방문
    ↓
index.html
    ↓
main.jsx (전역 스타일 로드, React 앱 시작)
    ↓
App.jsx (라우팅, 전역 상태)
    ↓
HomePage (첫 화면)
    ↓
Button (재사용 컴포넌트)
    ↓
useBluetooth (BLE 로직)
```

---

## 📝 Import 규칙

### 절대 경로 vs 상대 경로

현재는 **상대 경로**를 사용합니다.

```jsx
// 컴포넌트에서
import Button from '../components/Button';
import { useBluetooth } from '../hooks/useBluetooth';
import { formatWeight } from '../utils/formatters';
import { SCALE_SERVICE_UUID } from '../constants/bluetooth';
```

### Import 순서

1. React 관련
2. 외부 라이브러리
3. 내부 모듈 (컴포넌트, 훅, 유틸 등)
4. 스타일

```jsx
import { useState } from 'react';              // 1. React
import axios from 'axios';                     // 2. 외부 라이브러리
import Button from '../components/Button';     // 3. 내부 모듈
import { formatWeight } from '../utils/formatters';
import './styles.css';                         // 4. 스타일
```

---

## 🛠 개발 가이드

### 새 컴포넌트 추가 시

1. **어디에 넣을까?**
   - 한 페이지에서만 사용 → 해당 페이지 파일 내부
   - 여러 페이지에서 사용 → `components/`
   - 전체 화면 → `pages/`

2. **파일명 규칙**
   - 컴포넌트: PascalCase (예: `Button.jsx`)
   - 유틸/서비스: camelCase (예: `formatters.js`)
   - 상수: camelCase (예: `bluetooth.js`)

### 새 기능 추가 시

1. 상수 필요 → `constants/`
2. API 호출 → `services/api.js`
3. 데이터 포맷팅 → `utils/formatters.js`
4. 유효성 검증 → `utils/validators.js`
5. 복잡한 로직 → `hooks/`
6. UI 컴포넌트 → `components/` 또는 `pages/`

---

## 🚀 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
