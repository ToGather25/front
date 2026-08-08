# 성경 읽기 — 회귀 테스트 + 명세 gap 수정 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **세 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 앞선 두 사이클(교회소개, 회원가입/로그인)은 완료되어 `develop`에 병합됨.

성경 활동 도메인은 명세서 분량이 가장 많고(CSV 행 32~143) 구현도 2,600줄이 넘는 가장 큰 도메인이라, **성경 읽기(BibleRead + 4개 하위 뷰)를 먼저, 성경 쓰기(BibleWrite)는 별도 사이클로** 나누기로 확정했다(사용자 확인, 2026-08-08).

## 대상 파일

- `src/pages/BibleRead/BibleRead.jsx` (852줄) — 성경 읽기 메인 페이지, 내부적으로 4개 뷰(성경읽기/랭킹/내구절/내현황) 전환
- `src/components/bible/BibleRankingView.jsx` (121줄) — 랭킹 뷰
- `src/components/bible/BibleSidebar.jsx` (99줄) — 좌측 메뉴바 (읽기/쓰기 공용)
- `src/components/bible/BibleStatusView.jsx` (646줄) — 내 현황(마이페이지) 뷰, 목표 대시보드+스트릭 캘린더+진척도+목표설정모달 포함
- `src/components/bible/BibleVersesView.jsx` (106줄) — 내 구절(좋아요) 뷰
- `src/pages/Nurture/Nurture.jsx` — "성경읽기/쓰기" 탭에 로그인 가드 추가 (실질적 진입점)
- (삭제) `src/pages/Bible/Bible.jsx` — 죽은 코드
- (신규) `src/components/common/LoginRequiredModal.jsx`
- (신규) `src/components/bible/BibleTutorial.jsx`
- (신규) `src/utils/bibleReadingProgress.js`

## 사전 조사 결과: Bible.jsx는 죽은 코드

`src/pages/Bible/Bible.jsx`는 `App.jsx` 어디에도 라우팅되어 있지 않다 — grep 결과 어떤 파일에서도 import되지 않음. 실제 "성경 활동 첫 페이지"(명세서가 말하는 `bible/` 진입점) 역할은 `src/pages/Nurture/Nurture.jsx`의 "성경읽기/쓰기" 탭(내부 `activeTab === "성경읽기/쓰기"` 분기, 390번째 줄 부근)이 대신하고 있다 — 동일한 카드 선택 UI를 자체적으로 갖고 `/말씀/필사`·`/말씀/읽기`로 링크한다. 과거 `/말씀` 라우트를 `/양육훈련`으로 통합하는 리팩터(커밋 `60c371d`) 때 `Bible.jsx`가 정리되지 않고 남은 것으로 보인다.

**결정(사용자 확인)**: `Bible.jsx` 삭제. 로그인 가드는 `Nurture.jsx`의 "성경읽기/쓰기" 탭에 배치. `BibleRead.jsx`/`BibleWrite.jsx`에도 방어적으로 가드를 추가해 직접 URL 접근도 막는다.

## 명세서 대비 gap과 결정 사항

| 항목 | 명세서 | 현재 구현 | 결정 |
|---|---|---|---|
| 비회원 접근 가드 | "로그인이 필요한 서비스 입니다" 모달 (CSV 행32) | 없음 — `Nurture.jsx`/`BibleRead.jsx`/`BibleWrite.jsx` 전부 미가드 | **`LoginRequiredModal` 신규 컴포넌트**로 `Nurture.jsx`(탭 진입 시) + `BibleRead.jsx`/`BibleWrite.jsx`(마운트 시, 직접 URL 접근 방어)에 추가 |
| 신규 유저 튜토리얼 | "처음 이용하는 유저인 경우 읽음 표시 방법과 좋아요 방법 간단한 튜토리얼" (CSV 행33-49) | 없음 (더블클릭 좋아요 힌트가 `title` 속성으로만 존재) | **`BibleTutorial` 신규 컴포넌트**, `localStorage`에 "본 적 있음" 플래그 저장해 최초 1회만 노출 |
| 좋아요 취소 애니메이션 | "펑하며 사라지는 효과 → 다음 구절 박스가 다시 앞으로 땡겨질 수 있게" (CSV 행107-112) | 즉시 제거, 애니메이션 없음 | CSS 트랜지션(`scale`+`opacity`) 추가 후 실제 state 제거 — 그리드 레이아웃이라 뒤 항목은 자연히 당겨짐(별도 로직 불필요) |
| 한국어 단위 표기 | "1,234만 5천 566절" (만+천+나머지 3단계) (CSV 행100-106) | "만" 단위까지만 분해 | `formatKorean()` 함수에 "천" 단위 분해 추가 |
| GoalBanner 미설정 문구 | "목표는 단기 목표부터!" (CSV 행118-120) | "목표를 설정해 보세요" | 명세 문구로 교체 |
| 책 클릭 시 이동 위치 | "가장 마지막 읽은 위치인 bible/read/{bible_id}로 이동" (CSV 행124-126) | 항상 1장으로 이동 (마지막 위치 개념 자체가 없음) | **`src/utils/bibleReadingProgress.js` 신규** — `localStorage` 기반 책별 마지막 장 저장. `BibleRead.jsx`가 장 이동 시 저장, `BibleStatusView.jsx`의 책 클릭이 이를 읽어 `state.chapter`로 전달 |
| 월간 목표 설정 | 별도 페이지(`bible/read/mypage/goal`) 명시 (CSV 행127-135) | 모달(`GoalModal`, `BibleStatusView.jsx` 내부) | **모달 유지** (사용자 확인 — 기능적으로 동일, 리팩터 비용 대비 이익 작다고 판단) |
| 랭킹 포디움/신규유저 메시지 | CSV 행94-99 | 이미 구현됨 (`BibleRankingView.jsx`) | 변경 없음, 회귀 테스트만 |
| 스트릭 캘린더 이음새 UI | CSV 행121-123 | 이미 구현됨 | 변경 없음, 회귀 테스트만 |
| 성경별 진척도 필터/뷰토글 | CSV 행124-126 | 이미 구현됨 | 변경 없음, 회귀 테스트만 |
| 검색 하이라이트 | "노란색 하이라이트" (CSV 행74-84) | 이미 구현됨(`BibleRead.jsx`의 `highlight()` 함수가 `bg-yellow-200` 사용) | 변경 없음, 회귀 테스트만 — ~~최초 조사에서 파란 볼드로 잘못 파악했던 항목은 이 도메인과 무관한 `SearchOverlay.jsx`(사이트 전역 헤더 검색)를 잘못 연결한 것으로 확인, 정정함~~ |

## 아키텍처

`BibleRead.jsx`는 이미 4개 하위 뷰(BibleRankingView/BibleVersesView/BibleStatusView/BibleSidebar)로 일부 분리되어 있다. 교회소개 사이클과 달리 **전면 재분리는 하지 않는다** — gap 수정에 필요한 조각만 신규로 추가한다:

- `LoginRequiredModal`은 `RootLayout.jsx`에 이미 있는 모달 UI(아이콘+제목+문구+버튼 2개)를 `src/components/common/`으로 추출한 재사용 컴포넌트다. `RootLayout.jsx`는 nav 클릭 시 모달을 띄우고 닫으면 그 자리에 머무는 방식이지만, Bible 페이지는 진입 시점에 이미 보호돼야 하는 콘텐츠이므로 "취소"를 누르면 홈(`/`)으로 이동시킨다 — 두 소비자가 서로 다른 "취소" 동작을 쓸 수 있도록 `onCancel` prop으로 동작을 주입받는다.
- `BibleTutorial`은 `BibleRead.jsx`에서만 쓰이는 단순 오버레이 컴포넌트로, `src/components/bible/`에 둔다.
- `bibleReadingProgress.js`는 UI가 아닌 순수 유틸(localStorage read/write 래퍼)이라 `src/utils/`에 둔다.

## 데이터 흐름

- `LoginRequiredModal`을 쓰는 3곳(`Nurture.jsx`, `BibleRead.jsx`, `BibleWrite.jsx`) 모두 `useAuth().currentUser`로 로그인 여부를 판단한다(기존 `RootLayout.jsx`와 동일 패턴).
- `bibleReadingProgress.js`는 `{ [bookName]: chapterNumber }` 형태로 `localStorage`에 저장한다. 키는 `"bible-reading-progress"` 하나로 통일.
- `BibleRead.jsx`는 `selectedBook`/`chapter`가 바뀔 때마다(장 이동, 책 선택 등) `saveLastPosition(selectedBook, chapter)`를 호출한다.
- `BibleStatusView.jsx`의 책 클릭 핸들러는 `getLastPosition(book)`을 호출해 저장된 장이 있으면 `state: { book, chapter: savedChapter }}`로, 없으면 기존처럼 `chapter` 없이(1장 기본값) 이동한다.

## 튜토리얼 설계

`BibleTutorial`은 `BibleRead.jsx`가 마운트될 때 `localStorage.getItem("bible-tutorial-seen")`이 없으면 화면 중앙에 짧은 오버레이(1~2단계, "구절을 클릭하면 읽음 표시됩니다" / "두 번 클릭하면 좋아요됩니다")를 띄우고, "확인" 클릭 시 `localStorage.setItem("bible-tutorial-seen", "true")`로 재노출을 막는다. 로그인 가드 모달보다 우선순위가 낮으므로(로그인 안 된 유저에게는 애초에 안 보임), 가드 통과 후에만 조건부 렌더링한다.

## 테스트 계획 (TDD)

기존 5개 파일(BibleRead/BibleRankingView/BibleSidebar/BibleStatusView/BibleVersesView)은 **회귀 테스트**를 우선 작성한다. 신규 요구사항(로그인 가드, 튜토리얼, 좋아요 애니메이션, 한국어 단위, 문구, 하이라이트 색상, 마지막 위치 이동)은 **실패 테스트를 먼저 추가한 뒤 구현**한다.

각 파일의 정확한 테스트 케이스 목록은 계획 문서(다음 단계)에서 확정한다 — 이 스펙에서는 범위와 정책만 고정한다.

## 비목표 (이번 사이클 제외)

- 성경 쓰기(`BibleWrite.jsx`) — 다음 사이클, 명세 자체가 없어(CSV에 상세 스펙 없음) 회귀 테스트 위주가 될 전망
- 월간 목표 설정을 별도 페이지로 전환 — 모달 유지로 확정(위 표 참고)
- 실제 로그인 상태 판단 로직 자체(현재 `useAuth`가 목업 계정 기반인 것) 변경 — 기존 패턴 그대로 사용
- 성경 API 연동 (로컬 `bible.json` 유지)
- 랭킹/스트릭/진척도 등 이미 명세에 맞게 구현된 부분의 UI 변경

## 확인 필요

없음(모든 gap과 Bible.jsx 처리 방향이 사용자 확인으로 결정됨).
