# 프로젝트 아키텍처

## 기술 스택

| 항목 | 버전 | 비고 |
|------|------|------|
| React | 19 | |
| Vite | 7 | 빌드 도구 + 개발 서버 |
| Tailwind CSS | v4 | CSS-first 설정 (`tailwind.config.js` 없음) |
| React Router | v7 | `createBrowserRouter` 사용, `react-router`에서 import |
| Axios | 1.x | HTTP 클라이언트 |
| vite-plugin-pwa | — | PWA 지원 |

## 디렉토리 구조

```
togather-front/
├── public/
│   └── icons/               # PWA 아이콘 (192x192, 512x512)
├── docs/                    # 이 문서들
├── .env.example             # 환경변수 예시
└── src/
    ├── assets/              # 이미지, 폰트 등 정적 자산
    ├── components/
    │   ├── ui/              # 기본 원자 단위 컴포넌트 (Button, Input, Badge …)
    │   └── common/          # 조합형 공통 컴포넌트 (Modal …)
    ├── config/
    │   └── church.config.js # 교회 테넌트 설정 (SaaS 핵심)
    ├── contexts/
    │   ├── ChurchContext.jsx # 교회 설정 전역 제공
    │   └── auth.jsx         # 인증 컨텍스트
    ├── data/
    │   └── dummy/           # 더미 데이터 (서버 미준비 시 사용)
    │       ├── events.js
    │       ├── gallery.js
    │       ├── jubo.js
    │       └── notices.js
    ├── hooks/
    │   └── useFetch.js      # 범용 데이터 페칭 훅
    ├── layouts/
    │   └── RootLayout.jsx   # 공통 Header + Footer + <Outlet />
    ├── pages/               # 라우트 단위 페이지
    │   └── <PageName>/
    │       └── <PageName>.jsx
    ├── services/            # API 서비스 레이어
    │   ├── api.js           # Axios 인스턴스 + 인터셉터
    │   ├── eventsService.js
    │   ├── galleryService.js
    │   ├── juboService.js
    │   └── noticeService.js
    ├── styles/
    │   └── tokens.css       # 디자인 토큰 (Tailwind @theme)
    ├── App.jsx              # 라우터 설정
    ├── index.css            # 전역 스타일 (@import tokens.css)
    └── main.jsx             # 앱 진입점
```

## 앱 진입점 구조

```
main.jsx
└── ChurchProvider          ← 교회 테넌트 설정 전역 공급
    └── App (RouterProvider)
        └── RootLayout
            ├── AuthProvider
            ├── Header (useChurch)
            ├── <Outlet /> → 각 페이지
            └── Footer (useChurch)
```

## 경로 별칭

`vite.config.js`에서 `@/` → `src/`로 설정되어 있습니다.

```js
// 올바른 import 예시
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch }  from "@/hooks/useFetch";
```

## 주요 컨벤션

- **컴포넌트**: PascalCase `.jsx`
- **훅**: camelCase, `use` 접두사
- **컨텍스트 파일명**: `XxxContext.jsx`
- **React Router v7**: `react-router`에서 import (`react-router-dom` 아님)
- **import 순서**: 외부 라이브러리 → 내부 절대경로(`@/`) → 상대경로

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint
```

## 환경변수

`.env.example` 참고:

```env
VITE_API_BASE_URL=http://localhost:8080   # 백엔드 API URL
VITE_USE_DUMMY=true                       # false로 설정 시 실제 API 호출
```
