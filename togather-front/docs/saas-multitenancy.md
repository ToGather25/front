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
  name: "알곡교회",

  // 연락처
  address: "서울 관악구 난곡로24길 42 (신림동)",
  tel: "02) 2615-4067",
  fax: "02) 2683-4326",
  email: "algok@gmail.com",
  pastor: "유상현",
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
</ChurchProvider>;

// 컴포넌트에서 사용
const { church, loading } = useChurch();
```

### 실제 동작 (`ChurchProvider`)

부팅 시 `getTenant(domain)`으로 `/api/tenant`를 호출하고, 응답을 `church.config.js`(`defaultConfig`) 위에 얕게 병합한다. `nav`(GNB 메뉴 구조)는 프론트 전용 라우팅 데이터라 병합 대상에서 제외하고 항상 `defaultConfig.nav`를 쓴다.

```js
getTenant(domain)
  .then((data) => {
    setCurrentChurchId(data.id);
    setState({ church: { ...defaultConfig, ...data, nav: defaultConfig.nav }, status: "ready" });
  })
  .catch((err) => {
    // 백엔드 미배포, 도메인 미등록 등으로 실패해도 에러 화면을 띄우지 않고
    // defaultConfig(이 배포의 기본 교회 데이터)를 그대로 보여준다.
    console.warn("[ChurchProvider] 테넌트 조회 실패 — 로컬 기본 설정으로 표시합니다.", err);
    setState({ church: defaultConfig, status: "ready" });
  });
```

`domain`은 `VITE_DEV_CHURCH_DOMAIN` 환경변수가 있으면 그 값을, 없으면 `window.location.hostname`을 쓴다(로컬 개발은 `localhost`가 어떤 교회에도 안 매핑되므로 `.env`에서 override).

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
      { label: "교회행사", to: "/교회행사" },
    ],
  },
];
```

- `children`이 있으면 드롭다운 메뉴로 렌더링
- `to: "#"`은 미구현 메뉴 (추후 활성화)

---

## 테넌트 식별 흐름

```
사용자 접속 (a.togather.church)
    ↓
ChurchProvider useEffect
    ↓
GET /api/tenant?domain=a.togather.church
    ↓
   성공 ──→ { id, name, features, nav, … } 응답 → defaultConfig 위에 병합 → 전체 앱에 반영
    │
   실패 ──→ (백엔드 미배포·도메인 미등록 등) → defaultConfig 그대로 사용 → 전체 앱에 반영
```

**폴백 동작**: 지금 `togather-front` 저장소는 `church.config.js`가 곧 알곡교회 데이터라, `/api/tenant` 호출이 실패해도(예: 백엔드가 아직 배포되지 않은 환경에 프론트만 먼저 배포한 경우) 에러 화면 대신 알곡교회 데이터로 정상 렌더링된다. 새 교회를 실제로 온보딩해 이 폴백에 의존하면 안 되는 시점이 오면(설정 누락을 조용히 가려버리는 부작용), 폴백 허용 여부를 환경별로 재검토해야 한다.

---

## API 요청과 churchId

모든 서비스 함수는 첫 번째 인자로 `churchId`를 받습니다.  
이를 통해 멀티테넌트 환경에서 데이터를 정확히 분리합니다.

```js
// 올바른 패턴
getEvents(church.id, { year, month });
getNotices(church.id);
getCommunities(church.id);
```
