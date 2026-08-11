# 교적부 — 인증 가드 + 민감정보 접근 제한 + 데이터 소스 통합 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **여섯 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 앞선 다섯 사이클(교회소개, 회원가입/로그인, 성경 읽기, 성경 쓰기, 예배·방송)은 완료되어 `develop`에 병합됨.

이전 사이클(성경 읽기, 2026-08-09)의 최종 브랜치 리뷰에서 `/교적부` 라우트가 인증 가드 없이 전 교인의 연락처 정보를 공개 노출하고 있음이 발견돼, 이 사이클 스펙에 "인증 가드 + 연락처 노출 정책"을 명시적으로 포함시키기로 미리 합의됨(메모리 기록).

## CSV 명세 확인 결과

교적부(`Gyojeokbu.jsx`)는 CSV 전체(행 2~229)에 **상세 스펙이 없다** — 188행 "💕교적부 (USER: 성도들) EX) 화면", 189행 "admin 교적부 EX) 화면" 두 줄뿐이며 둘 다 피그마 참고 예시 화면 표시로만 되어 있고 상세 설명·요구사항 컬럼이 비어있다. 214행(교회소개 "섬기는 사람들" 카드 관련)에 "연락처 지금으로서는 웹에서 조회 안되게 하는데 나중에 교적부랑 좀 연동할 수 있게 기획해볼게요"라는 메모가 있어, 교적부가 연락처 정보의 정식 창구로 의도됐음을 확인했다 — 다만 접근 정책(누가 볼 수 있는지)은 CSV에 전혀 언급이 없다.

따라서 이번 사이클은 **명세 gap 수정이 아니라, 실제 발견된 보안/개인정보 노출 버그 수정 + 순수 회귀 테스트**가 목적이다(성경 쓰기 사이클과 동일한 성격).

## 코드 탐색 결과

- **`/교적부`** (`src/pages/Gyojeokbu/Gyojeokbu.jsx`, 726줄): `routes.jsx`에서 `RootLayout` 하위 일반 라우트로 등록되어 있어 **인증 가드가 전혀 없다** — 누구든 접속하면 실제 교인 27명(`src/config/members.config.js`)의 전체 정보(이름/전화번호/이메일/주소/직분/구역/소그룹/출석현황/가족관계/이력/**목회 메모**)를 볼 수 있다.
- **`/admin/members`** (`src/pages/admin/MembersManage.jsx`, 339줄): `AdminLayout`의 `AdminGuard`(`currentUser?.isAdmin` 체크, 미인증 시 `/login`으로 리다이렉트)로 이미 제대로 보호되어 있다. 다만 `members.config.js`가 아닌 별도의 하드코딩된 더미 배열(`DUMMY_MEMBERS`, `DUMMY_PENDING`)을 써서 교적부와 데이터가 따로 논다.
- `RootLayout.jsx:741`이 이미 `<AuthProvider>`로 전체 트리를 감싸고 있으므로, `/교적부`는 성경 읽기/쓰기와 달리 **별도의 `AuthOnlyLayout`이 필요 없다** — `useAuth()`를 그냥 호출해도 안전하다(RootLayout 하위이므로 Provider 부재 위험 없음).
- 재사용 가능한 기존 패턴: `LoginRequiredModal`(`src/components/common/LoginRequiredModal.jsx`, 성경 읽기 사이클에서 이미 검증됨) — `BibleRead.jsx`가 쓰는 것과 동일한 방식(`message`/`onCancel` props)으로 그대로 재사용 가능.

## 사용자 확인 사항 (2026-08-10)

1. **접근 권한**: 로그인한 교인이면 누구나 교적부 열람 가능(관리자 전용이 아님) — `/admin/members`와 역할이 다르다(교적부=교인 간 연락처 공유, admin/members=관리자 CRUD).
2. **민감정보 범위**: 로그인 교인은 이름/연락처/이메일/주소/직분/구역/소그룹/출석현황/가족관계/이력을 볼 수 있다. **목회 메모**(`m.notes`, 목회자 전용 내부 메모)만 관리자(`currentUser?.isAdmin`)에게만 노출한다.
3. **데이터 소스 통합**: `MembersManage.jsx`의 `DUMMY_MEMBERS`를 `members.config.js`의 `MEMBERS`로 교체 — 이번 사이클에 포함. `DUMMY_PENDING`(가입 승인 대기 큐)은 별도 관심사라 제외.

## 아키텍처

### `Gyojeokbu.jsx` — 재분리하지 않음

`BibleRead.jsx`와 동일한 원칙 — 726줄이지만 단일 응집된 기능(교인 목록 + 상세 드로어)이고 이미 내부적으로 `Avatar`/`RoleChip`/`AttendBar`/`DetailBody`/`Section`/`InfoRow`/`MemberRow`로 잘 분해되어 있다. 컴포넌트 최상단에 로그인 가드만 추가한다:

```jsx
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

export default function Gyojeokbu() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  // ...기존 state...

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="교적부를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return ( /* 기존 JSX */ );
}
```

`DetailBody` 컴포넌트의 "목회 메모" `Section`은 `currentUser?.isAdmin`을 prop으로 받아 조건부 렌더한다 — 관리자가 아니면 그 `Section` 자체가 DOM에 없다(다른 Section들처럼 존재 여부로 제어, 빈 placeholder 없음).

### `MembersManage.jsx` — 데이터 소스 통합 + 동적 필터

`DUMMY_MEMBERS` 배열을 삭제하고 `import { MEMBERS } from "@/config/members.config"`로 교체한다. 필드명 매핑: `dept`→`department`, `position`→`role` (테이블 컬럼 라벨 "부서"/"직책"은 그대로 유지, 내부 접근 키만 변경).

기존 하드코딩 `DEPARTMENTS`/`POSITIONS` 배열은 실제 `MEMBERS` 데이터의 값과 전혀 매칭되지 않는다(예: `DEPARTMENTS`에 `"청년부"`가 있지만 실제 데이터엔 `"청년부 1부"`/`"청년부 2부"`가 있음) — 그대로 두면 필터 클릭 시 결과가 0건이 되는 숨은 버그가 생긴다. 그래서 필터 옵션을 데이터에서 동적으로 파생한다:

```jsx
const DEPARTMENTS = ["전체", ...new Set(MEMBERS.map((m) => m.department))];
const POSITIONS = ["전체", ...new Set(MEMBERS.map((m) => m.role))];
```

`DUMMY_PENDING`과 승인 대기 탭 로직은 그대로 둔다(별도 관심사). "상세"/"삭제" 버튼은 원래도 핸들러가 없는 no-op이라 이번 사이클에서 손대지 않는다(신규 기능 추가 아님, 기존 동작 그대로 회귀 테스트).

## 테스트 계획

- `Gyojeokbu.test.jsx`(신규):
  - 비로그인 시 `LoginRequiredModal`이 뜨고 교인 데이터(이름/전화번호 등)가 DOM에 전혀 없음을 확인 — **TDD, 지금은 실패해야 정상**(현재 아무나 볼 수 있음).
  - 로그인(비관리자) 시 목록/검색/필터/상세드로어 열기가 정상 동작(회귀) + 목회 메모 섹션이 DOM에 없음을 확인 — **TDD**.
  - 관리자로 로그인 시 목회 메모 섹션이 노출됨을 확인 — **TDD**.
- `src/routes.test.jsx`에 `/교적부` 케이스 추가 — 이전 사이클(성경 읽기)의 교훈("컴포넌트 테스트는 `withAuth:true`로 통과했지만 실제 라우트 트리엔 AuthProvider가 없어 프로덕션 크래시")을 되풀이하지 않기 위해, `createMemoryRouter(routes)`로 실제 라우트 트리를 렌더해 가드가 실제로 작동하는지 확인.
- `MembersManage.test.jsx`(신규, 이 이니셔티브에서 admin 보호 페이지에 대한 첫 테스트): `members.config`의 실제 데이터가 목록에 표시되는지, 동적으로 파생된 필터가 실제 데이터를 정확히 걸러내는지(회귀 방지 — 하드코딩 필터였다면 걸렸을 버그를 이 테스트가 명시적으로 검증), 검색 동작 회귀. `AdminLayout`/`AdminGuard`를 거치지 않고 `MembersManage` 컴포넌트 자체를 직접 렌더한다(다른 사이클들의 페이지 컴포넌트 테스트와 동일한 수준 — `AdminGuard` 자체의 라우팅 회귀는 이번 스코프 밖).

## 비목표 (이번 사이클 제외)

- `DUMMY_PENDING`(가입 승인 대기 큐)을 실제 Register/SignupNext 가입 플로우와 연결하는 작업 — 별도 관심사.
- `MembersManage`에 상세 드로어·삭제 기능 신규 구현 — 관리자 CRUD 확장은 이전 사이클들(예배·방송의 예배시간표 CRUD 등)과 일관되게 이번에도 제외.
- 교적부 UI/UX 변경 — CSV에 상세 스펙이 없으므로 순수 보안 gap 수정 + 회귀 테스트만 다룬다.
- `AdminLayout`/`AdminGuard` 자체의 라우팅 회귀 테스트 — 이번 사이클은 `MembersManage`의 데이터 소스만 다룬다.

## 확인 필요

없음 — 모든 판단 지점은 사용자 확인 완료(2026-08-10).
