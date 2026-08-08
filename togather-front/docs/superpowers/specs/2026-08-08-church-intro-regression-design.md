# 교회소개(Church) 페이지 — 회귀 테스트 + 명세 gap 수정 설계

## 배경

`기능 페이지 명세서` CSV(`/Users/myewon/Downloads/개인 페이지 & 공유된 페이지/기능 페이지 명세서/기능 페이지 명세서 2b32db7423888133ab65ff5da203e8e6_all.csv`)를 기준으로, 기존 구현 페이지들을 순차적으로 점검·수정하는 전체 이니셔티브의 **첫 번째 서브 프로젝트**다.

전체 이니셔티브는 아래 7개 도메인으로 분해했고, 각각 독립된 스펙→계획→구현 사이클로 진행한다.

| 순서 | 도메인 | 상태 |
|---|---|---|
| 1 | **교회소개** (인사말/비전/예배안내/섬기는사람들/연혁/층별안내/오시는길/차량운행) | 이 문서 |
| 2 | 회원가입/로그인 | 다음 사이클 |
| 3 | 성경 활동 (읽기/좋아요/마이페이지/목표설정/랭킹) | 다음 사이클 |
| 4 | 예배·방송 (실시간/목록/상세) | 다음 사이클 |
| 5 | 교적부 (회원+관리자) | 다음 사이클 (명세 자체가 "피그마 참고"로만 있어 재확인 필요) |
| 6 | 마이페이지 | 다음 사이클 |
| 7 | 스마트 주보 | 다음 사이클 (명세가 "피그마 참고"로만 있어 재확인 필요) |

**TDD 범위 방침(전체 이니셔티브 공통)**: "TDD 진행"은 기존 구현에 대한 **회귀(characterization) 테스트를 먼저 작성**하고, 명세서와 다른 부분(gap)에 대해서는 그 gap을 드러내는 **실패 테스트를 먼저 추가한 뒤 구현**하는 방식을 의미한다.

## 현재 상태

`src/pages/Church/Church.jsx` (786줄) 안에 아래 8개 탭 섹션이 **비-export 로컬 함수**로 전부 들어있다: `Greeting`, `Vision`, `WorshipInfo`, `Staff`, `History`, `FloorGuide`, `Direction`, `TransportGuide`. 데이터는 `useChurch()` 훅을 통해 `src/config/church.config.js`(로컬 목업, 추후 서브도메인 기반 API로 교체 예정)에서 가져온다.

테스트 인프라는 이미 구성되어 있다: Vitest(jsdom) + React Testing Library + `@testing-library/user-event` + `jest-dom`. 별도 API 목킹 라이브러리는 불필요(데이터가 로컬 config).

## 명세서 대비 gap과 결정 사항

| 항목 | 명세서 | 현재 구현 | 결정 |
|---|---|---|---|
| 오시는 길 지도 | 구글맵 API | 카카오맵 (`KakaoMap`, `KakaoMapRoute`) | **카카오맵 유지.** 국내 주소 정확도·UX 우위, 이미 안정적으로 연동됨 |
| 교구 버스 안내 | 구역별 토글식 시간표 (중대형 교회 대상) | 미구현 | **이번 사이클 제외.** 별도 사이클에서 다룸 |
| 섬기는 사람들 연락처 | "지금으로서는 웹에서 조회 안되게" (추후 교적부 연동 후 노출 예정) | 카드에 전화(`tel:`)·이메일(`mailto:`) 링크 노출 중 | **명세서대로 숨김.** `tel`/`email` 데이터 자체는 config에 유지(추후 재사용) |
| 탭 순서 목록에 "예배 안내" 누락 | 원본 CSV 행 225 탭 순서 나열에는 예배안내가 빠짐 | "예배 안내" 탭 존재, 정기예배/주일학교예배 시간표 제공 | **명세 누락으로 판단, 현재 탭 유지** (별도 확인 필요 항목으로 남김) |

## 아키텍처

`Church.jsx`는 탭 상태(`useSearchParams`) 관리와 `TAB_CONTENT` 매핑만 담당하는 얇은 셸로 축소한다. 8개 섹션은 각자 `useChurch()`로 직접 데이터를 가져오므로 `Church.jsx` → 섹션 컴포넌트 간 props 전달은 없다(현재 패턴 유지). 이는 성경 화면에서 이미 쓰인 패턴(`BibleRankingView`, `BibleVersesView`, `BibleStatusView`를 `src/components/bible/`로 분리)과 동일해 코드베이스 일관성을 가진다.

## 컴포넌트 구조

```
src/components/church/
├── Greeting.jsx
├── Vision.jsx
├── WorshipInfo.jsx
├── Staff.jsx          — 내부 로컬: PersonCard, StaffAvatar, MicIcon/PhoneIcon/MailIcon
│                         (ContactLinks 컴포넌트는 삭제)
├── History.jsx         — 내부 로컬: HISTORY_ROW
├── FloorGuide.jsx
├── Direction.jsx
├── TransportGuide.jsx
└── FallbackImage.jsx   — Greeting·Staff 공용이라 별도 분리
```

`Church.jsx`에는 `TABS` 배열과 `TAB_CONTENT` 매핑, Hero 배너, 서브탭 네비게이션만 남는다.

## 데이터 흐름

변경 없음. `ChurchProvider`(`src/contexts/ChurchContext.jsx`)가 `church.config.js`를 컨텍스트로 제공하고, 각 섹션 컴포넌트가 `useChurch()`로 필요한 필드만 구독한다. 테스트에서는 `ChurchProvider`로 감싸서 렌더링한다 (필요 시 테스트별 목업 config를 주입할 수 있도록 `ChurchProvider`가 `value` prop으로 커스텀 church 객체를 받을 수 있는지 확인 — 현재는 내부 `useState(defaultConfig)`로 고정되어 있어 **오버라이드 불가**. TransportGuide의 "waypoints 없음" 분기처럼 config 변형이 필요한 테스트 케이스는 실제 config의 기존 데이터(운행코스 2~5가 이미 빈 `waypoints: []`)를 그대로 활용해 검증한다).

## Staff.jsx 연락처 정책 변경

`PersonCard`와 담임목사 와이드카드 양쪽에서 `ContactLinks` 렌더링을 제거한다. `ContactLinks` 컴포넌트 자체도 삭제한다(미사용 코드 유지 금지). `tel`/`email` 필드는 `church.config.js`에 그대로 둔다.

## 에러/예외 상태

기존 동작을 그대로 보존한다(회귀 테스트로 고정):
- `Greeting`/`Staff`: 이미지 없거나 로드 실패 시 `FallbackImage`가 아바타 아이콘 플레이스홀더로 대체
- `FloorGuide`: `image` 없는 층은 안내 아이콘 + "층 사진" 텍스트로 대체
- `Staff`: 검색+칩 필터 결과 없으면 "해당하는 교역자가 없습니다" 문구
- `TransportGuide`: 모든 코스에 `waypoints`가 없으면 "경유지 좌표를 입력하면 지도에 경로가 표시됩니다" 안내문구
- `History`: 첫 페이지에서 위로 이동 버튼 비활성, 마지막 페이지에서 아래로 이동 버튼 비활성

## 테스트 계획 (TDD)

각 컴포넌트를 추출하면서 **먼저 기존 동작을 검증하는 회귀 테스트**를 작성해 리팩터 안전망으로 삼는다. `Staff`는 연락처 숨김에 대한 **새 실패 테스트를 먼저 추가**한 뒤 구현한다.

| 파일 | 핵심 검증 항목 |
|---|---|
| `Greeting.test.jsx` | 제목/본문 단락/서명(교회명·직함·이름) 렌더, 목사 사진 있을 때/없을 때(fallback) |
| `Vision.test.jsx` | 메인 문구(mainTitle/mainVerse), 비전 3항목 라벨+설명 렌더 |
| `WorshipInfo.test.jsx` | 정기예배 표 행(이름/시간/장소), 주일학교예배 표 행 |
| `Staff.test.jsx` | 칩 필터 전환 시 그룹 변경, 이름 검색 필터링, 결과 없음 문구, **담임목사 카드·일반 카드 모두 `tel:`/`mailto:` 링크 미노출 (신규)** |
| `History.test.jsx` | 최초 2개 시대 그룹 노출, 상단 경계에서 위로 이동 비활성, 하단 경계에서 아래로 이동 비활성, 이동 시 다음 그룹 노출 |
| `FloorGuide.test.jsx` | 층 리스트 렌더, 행 클릭 시 우측 이미지 전환, `image` 없는 층 선택 시 fallback 아이콘 |
| `Direction.test.jsx` | 주차 안내 행(라벨/값) 렌더, 지도 컴포넌트에 주소 전달·주소 텍스트 렌더 |
| `TransportGuide.test.jsx` | 코스별 이름/일정/색상 점 렌더, 최소 한 코스에 waypoints 있으면 범례 표시, 전부 없으면 안내문구 |
| `Church.test.jsx` | 초기 탭="인사말", 탭 버튼 클릭 시 URL searchParams 반영 + 해당 섹션 컴포넌트 렌더 (섹션 내부 검증은 각 단위 테스트 책임 — 얕은 통합 테스트) |

테스트는 각 컴포넌트 파일과 co-located(`Xxx.jsx` 옆 `Xxx.test.jsx`)로 작성한다. Router가 필요한 곳(`Staff`의 `설교영상` 링크, `Church`의 `useSearchParams`)은 `MemoryRouter`로 감싼다.

## 비목표 (이번 사이클 제외)

- 교구 버스 안내(구역별 토글 시간표) 신규 구현
- 지도 API 교체(구글맵 전환)
- 교회소개 외 다른 도메인(회원가입/로그인, 성경활동, 예배·방송, 교적부, 마이페이지, 스마트주보)

## 확인 필요

- CSV 명세 원본 행 225의 탭 순서 나열에 "예배 안내"가 빠져 있음 — 명세 누락으로 판단하고 현재 탭 구성(8개 탭에 예배안내 포함)을 유지. 문제 시 정정 필요.
