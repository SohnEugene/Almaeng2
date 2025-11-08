# Assets

이 폴더는 정적 파일(이미지, 폰트, 아이콘 등)을 저장하는 곳입니다.

## 폴더 구조

```
assets/
├── images/         # 이미지 파일
│   ├── logo/       # 로고 이미지
│   ├── products/   # 제품 이미지
│   └── icons/      # 아이콘
├── fonts/          # 폰트 파일
└── videos/         # 비디오 파일
```

## 사용 방법

```jsx
// 이미지 import
import logoImage from '../assets/images/logo/logo.png';

function MyComponent() {
  return <img src={logoImage} alt="Logo" />;
}
```

## 주의사항

- 이미지 파일은 최적화하여 업로드 (용량 줄이기)
- 파일명은 kebab-case 사용 (예: `my-image.png`)
- SVG 파일은 가능하면 컴포넌트로 변환하여 사용
