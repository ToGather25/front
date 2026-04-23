# SaaS 멀티테넌트 설계

ToGather는 여러 교회에 동일한 플랫폼을 제공하는 SaaS 서비스입니다.  
각 교회(테넌트)는 독립된 설정과 데이터를 가집니다.

---

## 핵심 개념

```
교회 A (a.togather.church)          교회 B (b.togather.church)
       ↓                                    ↓
  ChurchConfig A                     ChurchConfig B
  (이름, 주소, 네비, 기능플래그 …)   (이름, 주소, 네비, 기능플래그 …)
       ↓                                    ↓
       동일한 React 앱 코드베이스
```

---

## 교회 설정 파일

`src/config/church.config.js`

```js
const churchConfig = {
  id: "togather-church",     // API 요청 시 churchId
  slug: "togather",          // 서브도메인/URL 슬러그
  name: "투게더교회",

  // 연락처
  address: "경기도 부천시 …",
  tel: "02) 2615-4067",
  fax: "02) 2683-4326",
  email: "algok@gmail.com",
  pastor: "김함께",
  denomination: "대한예수교장로회 고신교단",

  // 브랜드
  logoUrl: null,             // null이면 기본 로고 사용
  social: { youtube, instagram, facebook },

  // 네비게이션 (교회별 커스터마이징)
  nav: [ … ],

  // 기능 플래그 (플랜별 ON/OFF)
  features: {
    jubo:    true,
    events:  true,
    gallery: true,
    bible:   true,
    mypage:  true,
  },

  // 예배 시간표
  worshipSchedule: {
    regular: [ … ],
    departments: [ … ],
  },

  // 연도 표어
  yearlyVision: {
    year: 2026,
    verse: '"함께 모여 하나님 아버지께로"',
    …
  },

  // 히어로 배너 텍스트
  mainBanner: { url, title, subtitle },
};
```

---

## ChurchContext

`src/contexts/ChurchContext.jsx`

앱 전체에서 `useChurch()` 훅으로 교회 설정에 접근합니다.

```jsx
// main.jsx — 앱 최상단에서 제공
<ChurchProvider>
  <App />
</ChurchProvider>

// 컴포넌트에서 사용
const { church, loading } = useChurch();
```

### 운영 환경 전환 방법

`ChurchProvider`의 `useEffect` 내부만 수정하면 됩니다:

```js
// 현재 (개발): 로컬 config 파일 사용
setLoading(false);

// 운영: 서브도메인 기반 API 호출로 교체
const domain = window.location.hostname;
fetchChurchByDomain(domain)
  .then(setChurch)
  .finally(() => setLoading(false));
```

---

## 기능 플래그

`church.features` 객체로 SaaS 플랜에 따라 기능을 ON/OFF합니다.

```jsx
const { church } = useChurch();

// 특정 기능이 비활성화된 경우 라우트 또는 UI를 숨김
if (!church.features.bible) return <Navigate to="/" />;
```

향후 라우터 수준에서 `features`를 검사하는 `FeatureGuard` 컴포넌트로 확장 예정.

---

## 네비게이션 커스터마이징

`church.nav` 배열이 헤더 GNB를 구성합니다. 교회마다 메뉴 구성이 다를 수 있습니다.

```js
nav: [
  { label: "교회소개", to: "/교회소개" },
  {
    label: "교회소식",
    children: [
      { label: "스마트 주보", to: "/주보" },
      { label: "교회행사",   to: "/교회행사" },
    ],
  },
]
```

- `children`이 있으면 드롭다운 메뉴로 렌더링
- `to: "#"`은 미구현 메뉴 (추후 활성화)

---

## 테넌트 식별 흐름 (운영)

```
사용자 접속 (a.togather.church)
    ↓
ChurchProvider useEffect
    ↓
GET /api/tenant?domain=a.togather.church
    ↓
{ id, name, features, nav, … } 응답
    ↓
setChurch(config) → 전체 앱에 반영
```

---

## API 요청과 churchId

모든 서비스 함수는 첫 번째 인자로 `churchId`를 받습니다.  
이를 통해 멀티테넌트 환경에서 데이터를 정확히 분리합니다.

```js
// 올바른 패턴
getEvents(church.id, { year, month })
getNotices(church.id)
getCommunities(church.id)
```
