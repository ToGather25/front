# 페이지 & 라우팅

라우터 설정: `src/App.jsx` (`createBrowserRouter`)

모든 페이지는 `RootLayout` (Header + Footer) 아래에서 렌더링됩니다.

---

## 라우트 목록

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `pages/Home/Home.jsx` | 메인 홈 |
| `/주보` | `pages/Jubo/Jubo.jsx` | 스마트 주보 |
| `/교회소개` | `pages/Church/Church.jsx` | 교회 소개 |
| `/교회행사` | `pages/Events/Events.jsx` | 행사 캘린더 |
| `/교회행사/:id` | `pages/Events/EventDetail.jsx` | 행사 상세 |
| `/갤러리` | `pages/Gallery/Gallery.jsx` | 공동체 갤러리 |
| `/말씀` | `pages/Bible/Bible.jsx` | 성경 읽기/필사 선택 |
| `/말씀/읽기` | `pages/BibleRead/BibleRead.jsx` | 성경 읽기 |
| `/말씀/필사` | `pages/BibleWrite/BibleWrite.jsx` | 성경 필사 |
| `/login` | `pages/Login/Login.jsx` | 로그인 |
| `/register` | `pages/Register/Register.jsx` | 회원가입 |
| `/mypage` | `pages/MyPage/MyPage.jsx` | 마이페이지 |
| `/*` | `pages/PageNotFound/PageNotFound.jsx` | 404 |

---

## 페이지별 상세

### Home (`/`)

**섹션 구성:**

1. **HeroBanner** — `church.heroBanner.title/subtitle` 표시
2. **SearchSection** — 교회 내 검색 (UI만, 기능 미구현)
3. **SubMenu** — 주보/행사/갤러리/말씀 바로가기 카드 4개
4. **WorshipSection** — `church.worshipSchedule` (정기 예배 + 부서 예배)
5. **NoticeSection** — `useFetch(getNotices)` — featured 공지 메인 + 사이드 목록
6. **DirectionsSection** — `church.address` 표시 + 지도 영역 (placeholder)
7. **JuboPreviewSection** — `church.yearlyVision` + 주보 미리보기 슬라이더

---

### 스마트 주보 (`/주보`)

**탭 구성**: 표지 / 예배순서 / 교회소식 / 봉사 / 예물 / 후원 / 구역 / 섬기는분들 / 오시는길

- 탭: 둥근 pill 스타일, 활성 시 `bg-blue-8 border-blue-10 text-white`
- 컨테이너: `max-w-[1576px]`
- 우상단 프린트 버튼 포함
- 서비스 레이어: `juboService.js` (연동 대기 중)

---

### 교회소개 (`/교회소개`)

**서브탭**: 인사말 / 비전 / 예배안내 / 섬기는사람들 / 연혁 / 층별안내 / 오시는길 / 차량운행

- Hero 배너: `bg-blue-9`
- 서브탭: `border-blue-8` 언더라인 활성 표시
- sticky 서브탭: `top-[72px]` (헤더 높이 보정)

---

### 교회행사 (`/교회행사`)

- 캘린더 + 우측 사이드바 레이아웃
- 현재 월로 자동 초기화 (`new Date()` 기준)
- 카테고리 필터: `CATEGORIES = ["예배", "청년부", "선교회", "내 공동체"]`
- 데이터: `useFetch(() => getEvents(church.id, { year, month }))`
- 사이드바: 날짜 클릭 시 해당일 행사 표시
- 상태: 날짜 미선택 → "날짜를 선택하세요", 로딩 중 → "불러오는 중..."

---

### 갤러리 (`/갤러리`)

- 2단계 뷰: 공동체 목록 → 사진 그리드
- 공동체 목록: `useFetch(() => getCommunities(church.id))`
- 사진 목록: 공동체 선택 시 `useFetch(() => getPhotos(church.id, { communityId }))`  
  (지연 로딩 — 공동체 선택 전까지 API 미호출)
- 사진 클릭 시 모달 (이전/다음 네비게이션, dot indicator)

---

### 말씀 (`/말씀`, `/말씀/읽기`, `/말씀/필사`)

- `/말씀`: 읽기/필사 선택 화면 (`bg-blue-8` 필사 카드, `border-blue-3` 읽기 카드)
- `/말씀/읽기`: 사이드바(장 선택) + 본문 + 구절 체크 기능
- `/말씀/필사`: 구절 표시 + 타이핑 입력 필드
- 성경 API 연동 미완 (더미 텍스트 사용)

---

### 인증 (`/login`, `/register`)

- `AuthProvider`: `RootLayout` 내부에서 제공 (`useNavigate` 정상 동작 보장)
- 토큰 저장: `localStorage("token")`, `localStorage("user")`
- 401 응답 시 자동 로그아웃 (`api.js` 인터셉터)

---

## 공통 레이아웃 (`src/layouts/RootLayout.jsx`)

### Header

- 높이: `h-[72px]`, `sticky top-0 z-50`
- 로고: `church.logoUrl` (없으면 기본 아이콘) + `church.name`
- GNB: `church.nav` 배열 기반 렌더링
  - `children` 있으면 hover 드롭다운
  - `NavLink` isActive 시 `border-b-2 border-primary font-bold`
- 우측: 회원가입 / 로그인 링크 (로그인 상태 연동 예정)

### Footer

- 배경: `bg-bluegrey-1` (연한 블루그레이)
- 좌측: 로고 + 개인정보취급방침/이용약관 링크 + `church.address/tel/fax/email`
- 우측: YouTube / Instagram / Facebook SNS 아이콘 (링크 미설정)

---

## 미구현 / 남은 작업

| 항목 | 상태 |
|------|------|
| 오시는길 지도 연동 (카카오맵/구글맵) | 미구현 |
| 성경 API 연동 | 미구현 |
| 헤더 로그인 상태 반영 | 미구현 |
| 기능 플래그 기반 라우트 가드 | 미구현 |
| 실제 API 연동 (모든 서비스) | 서버 준비 후 |
| 전도·선교 / 양육·훈련 페이지 | 미구현 |
