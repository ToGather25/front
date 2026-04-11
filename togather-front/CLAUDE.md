# ToGather Frontend

## 프로젝트 개요

교회 커뮤니티 서비스 **ToGather**의 프론트엔드 프로젝트입니다.

## 기술 스택

| 항목 | 버전 |
|------|------|
| React | 19 |
| Vite | 7 |
| Tailwind CSS | v4 (CSS-first config) |
| React Router | v7 (파일 기반 X, `createBrowserRouter` 사용) |
| Axios | 1.x |
| PWA | vite-plugin-pwa |

## 디렉토리 구조

```
togather-front/
├── public/
│   └── icons/           # PWA 아이콘 (192x192, 512x512)
└── src/
    ├── assets/          # 이미지, 폰트 등 정적 자산
    ├── components/      # 재사용 가능한 UI 컴포넌트
    │   ├── ui/          # 기본 원자 단위 컴포넌트 (Button, Input, Badge ...)
    │   └── common/      # 조합형 공통 컴포넌트 (Header, Modal ...)
    ├── contexts/        # React Context (AuthContext 등)
    ├── hooks/           # 커스텀 훅
    ├── layouts/         # 레이아웃 컴포넌트 (RootLayout 등)
    ├── pages/           # 페이지 컴포넌트 (라우트 단위)
    │   └── <PageName>/
    │       └── <PageName>.jsx
    ├── styles/
    │   └── tokens.css   # 디자인 토큰 (색상, 타이포그래피 Tailwind @theme)
    ├── App.jsx          # 라우터 설정
    ├── index.css        # 전역 스타일 (reset + @import tokens.css)
    └── main.jsx         # 앱 진입점
```

## 코딩 컨벤션

- **컴포넌트**: PascalCase, `.jsx` 확장자
- **훅**: camelCase, `use` 접두사
- **컨텍스트**: `XxxContext.jsx` (기존 `auth.jsx` → `AuthContext.jsx` 로 정비 예정)
- **경로 별칭**: `@/` → `src/` (vite.config.js에 설정됨)
- **스타일**: Tailwind 유틸리티 클래스 우선, 커스텀 CSS는 tokens.css의 변수 활용
- **import 순서**: 외부 라이브러리 → 내부 절대경로(`@/`) → 상대경로

## 디자인 시스템

피그마 기반 디자인 시스템. 상세 내용은 아래 파일에 정의:
- **`src/styles/tokens.css`** — Tailwind `@theme` 블록으로 색상/타이포그래피 CSS 변수 정의
- **폰트**: Pretendard (Google Fonts CDN, index.html 또는 index.css에서 import)

### Figma 파일
- **디자인 시스템**: https://www.figma.com/design/2KLWYlKyG81yEqobYDFyZc/ToGather_ver2.?node-id=5-722&p=f&t=PrPIWoIc6Nejspnd-0
  - fileKey: `2KLWYlKyG81yEqobYDFyZc`, nodeId: `5:722`
- **디자인 (화면)**: https://www.figma.com/design/2KLWYlKyG81yEqobYDFyZc/ToGather_ver2.?node-id=12-2131&p=f&t=PrPIWoIc6Nejspnd-0
  - fileKey: `2KLWYlKyG81yEqobYDFyZc`, nodeId: `12:2131`

### 색상 네이밍
```
blue-1 ~ blue-10   : 주요 파란 계열 (연 → 진)
point-1 ~ point-10 : 포인트 브라운 계열
grey-1 ~ grey-12   : 무채색 스케일
primary            : #3B5280 (메인 네이비 블루)
pale               : #B8C4D8 (연한 블루그레이)
```

### 타이포그래피 클래스
Tailwind 커스텀 유틸리티로 `text-headline-1`, `text-body-2` 등 사용.

## 주요 주의사항

1. **React Router v7**: `react-router-dom`이 아닌 `react-router`에서 훅을 import
   ```js
   // ✅ 올바름
   import { useNavigate } from "react-router";
   // ❌ 잘못됨 (패키지 미설치)
   import { useNavigate } from "react-router-dom";
   ```

2. **Tailwind v4**: `tailwind.config.js` 없음. `src/styles/tokens.css`의 `@theme {}` 블록에서 직접 커스텀 토큰 설정.

3. **AuthProvider**: `RootLayout` 또는 `main.jsx`에서 감싸줘야 `useNavigate` 동작함.

4. **PageNotFound**: `App.jsx` 라우터에 `errorElement` 또는 `*` 경로 추가 필요.

## 개발 명령어

```bash
cd togather-front
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint
```
