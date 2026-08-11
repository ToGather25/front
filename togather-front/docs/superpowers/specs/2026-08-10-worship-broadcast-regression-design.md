# 예배·방송 — 탭 구조 정비 + 회귀 테스트 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **다섯 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 앞선 네 사이클(교회소개, 회원가입/로그인, 성경 읽기, 성경 쓰기)은 완료되어 `develop`에 병합됨.

이전 사이클(교회소개, 2026-08-08)에서 사용자가 이미 확인한 gap: CSV 149행 "말씀 및 찬양 서비스의 메인 상단 탭 네비게이션"은 **실시간 예배 / 예배 목록 / 예배 안내 / 스마트 주보** 4탭을 명시하는데, 현재 `WordTabBar.jsx`는 2탭뿐이라 예배 안내·스마트 주보 탭이 없다. 반면 CSV 226행(교회소개 탭 순서)은 예배 안내를 뺀 7개 탭만 나열한다 — 즉 예배 안내 탭을 **교회소개에서 예배·방송으로 이전**하라는 의도다. 이번 사이클은 이 두 도메인에 걸친 이전 작업을 함께 처리한다.

## CSV 명세 확인 결과

- CSV 149행(탭 네비게이션): "1. 실시간 예배 2. 예배 목록 • 기본 진입 시 '실시간 설교 보기' 탭이 디폴트로 활성화됨 3. 예배 안내 4. 스마트 주보"
- CSV 150행(실시간 예배 페이지, 내부명 "실시간 설교 보기"): YouTube 라이브 스트리밍 iframe, 설교 본문 텍스트, "스마트 주보 보기" 버튼(클릭 시 당일 주보 모달), 하단 지난 설교 가로 스크롤 — **이미 `WordBroadcast.jsx`에 구현되어 있음**(모달 콘텐츠만 TODO 플레이스홀더).
- CSV 165행(예배 목록, 내부명 "설교 목록"): 통합 검색바, 4×3 그리드, 페이지네이션 — **이미 `WordSermon.jsx`에 구현되어 있음**.
- CSV 183행(설교 상세): 리스트 카드 클릭 시 `:id` 라우팅 — **이미 `WordSermonDetail.jsx`에 구현되어 있음**.
- CSV 205행(예배 안내, "각 예배들의 시간·장소 표 형식 조회"): **`WorshipInfo.jsx`(교회소개 탭, cycle 1에서 이미 테스트됨)가 정확히 이 내용을 구현하고 있음** — 정기 예배/주일학교예배 표.
- CSV 205행 "예외처리&주의" 컬럼: "각 교회마다 진행하는 예배가 각기 다를 것이기 때문에 추가&삭제 가능한 커스텀 가능한 일관된 폼 디자인&개발"(관리자 CRUD 요구) — 확인된 gap이지만, 신규 관리자 화면+데이터 모델 변경이 필요한 별도 규모의 작업이라 **이번 사이클에서 제외**하기로 사용자 확인(2026-08-10). 다음 관리자 화면 정비 시점에 별도 처리.
- 스마트 주보 탭 자체에 대한 상세 스펙 행은 CSV에 없음(226행 이후 "스마트 주보"라는 페이지명만 언급) — 이미 구현된 `/주보`(`Jubo.jsx`, 탭: 표지/예배/소식/봉사/예물/후원/구역/섬기는분들/오시는길)를 재사용하는 것으로 충분하다고 판단.

## 코드 탐색 결과 — 추가로 발견한 버그/죽은 코드

- **`/말씀` 빈 경로가 `/양육훈련`으로 리다이렉트됨**(`routes.jsx`) — 예배·방송과 무관한 레거시로 보이며, CSV의 "기본 진입 시 실시간 예배 탭 활성화" 요구와 어긋난다. 사용자 확인(2026-08-10): 이번 사이클에서 `/말씀/방송`으로 수정.
- **`WordPraise.jsx`(찬양 탭)가 라우팅되지 않는 죽은 코드** — `routes.jsx`에 `말씀/찬양` 라우트와 import가 주석 처리되어 있고, CSV 4탭 목록에 찬양 탭 자체가 없다. 이전 사이클에서 죽은 `Bible.jsx`를 삭제한 것과 동일한 패턴. 사용자 확인(2026-08-10): 삭제.
- **탭 라벨/순서가 CSV와 다름** — 현재 `WordTabBar.jsx`는 `["예배 다시보기"(→/말씀/설교), "실시간 설교 보기"(→/말씀/방송)]` 순서인데, CSV는 "실시간 예배"가 먼저이고 라벨도 "예배 목록"/"실시간 예배"다. CSV 문구 그대로 정정한다.

## 아키텍처

### 신규 파일

- `src/pages/WordInfo/WordInfo.jsx` — `WordSermon`/`WordBroadcast`와 동일한 Hero + `WordTabBar` 패턴. 본문에는 기존 `WorshipInfo`(`src/components/church/WorshipInfo.jsx`)를 그대로 재사용해 마운트한다. 컴포넌트 자체는 수정하지 않는다(cycle 1의 회귀 테스트가 이미 이 컴포넌트를 커버함).
- `src/pages/WordInfo/WordInfo.test.jsx`

### 수정 파일

- `src/components/word/WordTabBar.jsx` — `TABS` 배열을 4개 항목으로 확장, CSV 순서·라벨로 정정:
  ```js
  const TABS = [
    { label: "실시간 예배", to: "/말씀/방송" },
    { label: "예배 목록", to: "/말씀/설교" },
    { label: "예배 안내", to: "/말씀/안내" },
    { label: "스마트 주보", to: "/주보" },
  ];
  ```
  "스마트 주보"는 `/말씀` 네임스페이스 밖의 기존 `/주보` 페이지로 나가는 링크다. `NavLink`의 `isActive`는 URL이 `/주보`일 때 자연히 false가 되므로(이 탭 자체가 다른 섹션으로 이동하는 out-link) 별도 처리가 필요 없다 — `/주보` 페이지엔 `WordTabBar`가 없어 되돌아오는 경로는 기존처럼 헤더 내비게이션에 의존한다.
- `src/routes.jsx`:
  - `{ path: "말씀", element: <Navigate to="/양육훈련" replace /> }` → `<Navigate to="/말씀/방송" replace />`
  - `{ path: "말씀/안내", element: <WordInfo /> }` 추가
  - `WordPraise` import(주석 처리된 줄) 및 `말씀/찬양` 라우트(주석 처리된 줄) 삭제
- `src/pages/Church/Church.jsx` — `TABS` 배열에서 `"예배 안내"` 제거, `TAB_CONTENT`에서 `"예배 안내": <WorshipInfo />` 제거, `WorshipInfo` import 제거. 결과 7탭 순서(인사말/교회 비전/교회 연혁/섬기는 사람들/층별 안내/오시는 길/차량운행 안내)가 CSV 226행과 정확히 일치.

### 삭제 파일

- `src/pages/WordPraise/WordPraise.jsx` (죽은 코드, 라우팅된 적 없음)

## 테스트 계획

대상: `WordTabBar`, `WordSermon`, `WordBroadcast`, `WordSermonDetail`, `WordInfo`(신규) — 전부 기존 테스트 없음.

- `sermonService.getLiveSermon`/`getPastSermons`는 `USE_DUMMY`(테스트 환경 기본값 `true`) 덕분에 결정론적 더미 데이터를 반환한다: `DUMMY_LIVE_SERMON = null`, `DUMMY_PAST_SERMONS` 5건(`id`/`videoId`(전부 `null`)/`title`/`date`/`thumbnail`). 별도 mock 없이 이 더미 데이터를 그대로 단언 대상으로 쓴다(성경 사이클의 "실제 데이터 참조" 원칙과 동일 — 하드코딩된 가짜 데이터를 새로 만들지 않는다).
- `DUMMY_LIVE_SERMON = null`이므로 `WordBroadcast`는 항상 `status !== "live"`로 렌더된다 — `pastSermons[0]`이 있으므로 `status === "ended"` 분기(가장 최근 업로드를 히어로로) 검증. `status === "live"`/`"none"` 분기는 이 더미 데이터로는 도달 불가하므로 이번 사이클의 회귀 테스트 범위에서 제외한다(기존에도 테스트가 없었고, 이번 사이클의 목적은 tab 구조 정비이지 라이브 상태 로직 재설계가 아니다).
- 회귀 테스트: 각 페이지가 `WordTabBar`를 렌더하는지, 더미 설교 목록이 카드/그리드에 표시되는지, 검색/필터/페이지네이션(WordSermon), 히어로+지난설교 스크롤(WordBroadcast), 상세 진입·이전/다음 네비게이션(WordSermonDetail), `WorshipInfo` 렌더 여부(WordInfo)를 확인한다.
- TDD gap: `WordTabBar`의 4탭 구성·순서·라벨(실패 테스트 먼저), `/말씀` 리다이렉트 대상(실패 테스트 먼저), `Church.jsx`의 7탭 구성(실패 테스트 먼저 — 기존 `Church.test.jsx`가 있다면 거기에 추가, 없다면 신규 작성).
- `WorshipInfo.test.jsx`(cycle 1에서 작성됨)는 컴포넌트를 수정하지 않으므로 그대로 통과해야 한다 — 손대지 않는다.

## 비목표 (이번 사이클 제외)

- 예배 시간표 관리자 CRUD 폼 (확인됨, 별도 사이클로 이월)
- `WordBroadcast`의 "스마트 주보 보기" 모달 내부 TODO 콘텐츠 개선 (스마트주보 자체 사이클로 이월)
- `Jubo.jsx` 변경
- `WordBroadcast`의 `status === "live"`/`"none"` 분기 테스트 (더미 데이터로 도달 불가, 실제 API 연동 시점에 재검토)

## 확인 필요

없음 — 모든 판단 지점은 사용자 확인 완료(2026-08-10).
