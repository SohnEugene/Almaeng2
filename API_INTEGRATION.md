# API Integration Guide

## 📡 제품 API 통합 완료

백엔드와 프론트엔드 간의 제품 정보 API 연동이 완료되었습니다.

---

## 🔧 설정 및 실행 방법

### 1. 백엔드 실행

```bash
# 백엔드 디렉토리로 이동
cd backend

# 패키지 설치 (최초 1회)
npm install

# 개발 서버 실행
npm run dev
```

**백엔드 서버**: http://localhost:5000

### 2. 프론트엔드 실행

```bash
# 새 터미널 열기
cd frontend-customer

# 패키지 설치 (최초 1회)
npm install

# 개발 서버 실행
npm start
```

**프론트엔드 서버**: http://localhost:3000

---

## 📚 API 엔드포인트

### Base URL
- **개발**: `http://localhost:5000`
- **프로덕션**: 환경변수 `REACT_APP_API_URL`로 설정

### 제품 관련 API

#### 1. 모든 제품 조회
```http
GET /api/products
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "1": { "name": "샴푸1", "price": 30, "category": "세면용품" },
    "2": { "name": "샴푸2", "price": 50, "category": "세면용품" },
    "3": { "name": "세제1", "price": 20, "category": "생활용품" },
    "4": { "name": "세제2", "price": 80, "category": "생활용품" },
    "5": { "name": "로션1", "price": 120, "category": "화장품" }
  },
  "count": 5
}
```

#### 2. 카테고리별 제품 조회
```http
GET /api/products?category=세면용품
```

#### 3. 단일 제품 조회
```http
GET /api/products/:code
```

**예시:**
```http
GET /api/products/1
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "name": "샴푸1",
    "price": 30,
    "category": "세면용품"
  }
}
```

#### 4. 제품 생성 (관리자)
```http
POST /api/products
Content-Type: application/json

{
  "code": "6",
  "name": "린스1",
  "price": 40,
  "category": "세면용품"
}
```

#### 5. 제품 수정 (관리자)
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "샴푸1 (리뉴얼)",
  "price": 35
}
```

#### 6. 제품 삭제 (관리자)
```http
DELETE /api/products/:id
```

---

## 🧪 API 테스트

### cURL로 테스트

```bash
# 모든 제품 조회
curl http://localhost:5000/api/products

# 특정 제품 조회
curl http://localhost:5000/api/products/1

# 제품 생성
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "6",
    "name": "린스1",
    "price": 40,
    "category": "세면용품"
  }'
```

### Postman/Thunder Client로 테스트

1. VS Code Extension: Thunder Client 설치
2. New Request 생성
3. GET `http://localhost:5000/api/products`
4. Send 클릭

---

## 📂 변경된 파일 목록

### 백엔드 (Backend)

#### 새로 생성된 파일:
- `src/models/Product.js` - 제품 데이터 모델 및 메모리 기반 저장소
- `src/controllers/productController.js` - 제품 관련 비즈니스 로직
- `src/routes/productRoutes.js` - 제품 API 라우트

#### 수정된 파일:
- `src/server.js` - 제품 라우트 추가

### 프론트엔드 (Frontend)

#### 새로 생성된 파일:
- `src/services/productService.js` - 제품 API 호출 함수
- `src/hooks/useProducts.js` - 제품 데이터 관리 커스텀 Hook

#### 수정된 파일:
- `src/pages/WeighingPage.js` - MOCK_PRODUCTS를 백엔드 API로 대체

#### 더 이상 사용하지 않는 파일:
- `src/constants/mockProducts.js` - ⚠️ 백엔드 API로 대체되어 사용하지 않음 (삭제 가능)

---

## 🔄 데이터 흐름

```
Frontend (WeighingPage)
    ↓
useProducts Hook (자동으로 제품 목록 로드)
    ↓
productService.js (API 호출)
    ↓
axios (HTTP 요청)
    ↓
Backend Server (Express)
    ↓
productRoutes (라우팅)
    ↓
productController (비즈니스 로직)
    ↓
Product Model (데이터 조회)
    ↓
메모리 기반 데이터 반환
```

---

## 🎯 주요 기능

### 1. 자동 제품 로드
- 페이지 로드 시 자동으로 백엔드에서 제품 목록 가져옴
- 로딩 상태 표시
- 에러 핸들링

### 2. 제품 검증
- 사용자가 입력한 제품 코드를 백엔드에서 실시간 검증
- 존재하지 않는 제품 코드 입력 시 에러 메시지 표시

### 3. 에러 처리
- 네트워크 오류 처리
- 백엔드 오류 메시지 표시
- 사용자 친화적인 에러 메시지

---

## 🚀 다음 단계

### 데이터베이스 연동 (추후)
현재는 메모리 기반 데이터를 사용하지만, 추후 다음과 같이 데이터베이스로 전환 가능:

1. **MongoDB + Mongoose**
```javascript
// Product Schema
const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'general' },
  active: { type: Boolean, default: true }
});
```

2. **PostgreSQL + Sequelize**
```javascript
// Product Model
const Product = sequelize.define('Product', {
  code: { type: DataTypes.STRING, unique: true },
  name: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL },
  category: { type: DataTypes.STRING },
  active: { type: DataTypes.BOOLEAN }
});
```

---

## ⚠️ 주의사항

1. **CORS 설정**: 백엔드에서 CORS가 활성화되어 있어야 함 (이미 설정됨)
2. **포트 충돌**: 백엔드(5000), 프론트엔드(3000) 포트가 사용 중이 아닌지 확인
3. **환경변수**: 프로덕션 배포 시 `REACT_APP_API_URL` 설정 필요
4. **프록시**: `package.json`의 `"proxy": "http://localhost:5000"`는 개발 환경에서만 작동

---

## 🐛 문제 해결

### 문제: "Failed to fetch products"
**해결**: 백엔드 서버가 실행 중인지 확인
```bash
curl http://localhost:5000/api/products
```

### 문제: "Network Error"
**해결**: CORS 설정 확인 또는 백엔드 재시작
```bash
cd backend
npm run dev
```

### 문제: 제품 목록이 비어있음
**해결**: 백엔드 콘솔에서 에러 로그 확인
```bash
# 백엔드 터미널 확인
# GET /api/products 200 (정상)
# GET /api/products 500 (에러)
```

---

## 📞 연락처

문제가 발생하거나 질문이 있으면 팀원에게 문의하세요!
