# 성경 쓰기 — 회귀 테스트 + BOOK_MAP 불일치 버그 수정 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **네 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 성경 활동 도메인을 "읽기 먼저, 쓰기 나중"으로 나누기로 했던 결정(2026-08-08)에 따라, 이번이 그 "쓰기" 사이클이다. 앞선 세 사이클(교회소개, 회원가입/로그인, 성경 읽기)은 완료되어 `develop`에 병합됨.

## CSV 명세 확인 결과

성경 쓰기(`BibleWrite.jsx`)는 CSV 전체(행 2~229)에 **상세 스펙이 전혀 없다** — "성경 읽기 또는 쓰기 원하는 서비스 선택"(행32)과 "성경 쓰기를 눌러서 성경 쓰기 페이지로 이동한다"(leftbar 행85-93)라는 메뉴 이동 문구로만 언급된다. 따라서 이번 사이클은 **명세 gap 수정이 아니라 순수 회귀 테스트 + 실제 발견된 버그 수정**이 목적이다(사용자 확인, 2026-08-09).

## 발견된 버그: 책 이름 약어/전체이름 불일치

`src/pages/BibleWrite/BibleWrite.jsx:248`의 `selectedBook` state는 **약어**를 저장한다(`useState(state?.book ?? "창")`) — `getChapters(bookAbbr)`, `getVerses(bookAbbr, ...)`, `BOOK_MAP[selectedBook]`(표시용), `BookModal`의 `OT.includes(current)` 전부 약어를 기대한다.

반면 `src/components/bible/BibleStatusView.jsx`(성경 읽기 사이클에서 이미 검증됨)의 책 클릭 핸들러는 `navigate("/말씀/필사", { state: { book: BOOK_MAP[abbr] } })`처럼 **전체 이름**을 넘긴다. `BibleWrite.jsx:260-267`의 `useEffect`는 이 `state.book`을 그대로 `setSelectedBook(state.book)`(전체 이름)에 저장하므로, "내 현황" 탭에서 책을 클릭해 필사 페이지로 진입하면 `BOOK_MAP["창세기"]`가 `undefined`가 되어 헤더 표시가 깨지고, `getChapters("창세기")`/`getVerses("창세기", ...)`도 정규식이 매치되지 않아 빈 결과를 반환한다.

**수정**: `src/config/bible.config.js`에 이미 존재하는 역방향 맵 `BOOK_ABBREV`(전체이름→약어, `Object.fromEntries(Object.entries(BOOK_MAP).map(([abbr, name]) => [name, abbr]))`로 자동 생성됨)를 재사용해, `state.book` 소비 시점에 약어로 변환한다. 신규 유틸이나 데이터 구조를 추가할 필요가 없다.

## 아키텍처

`BibleRead.jsx`와 동일한 원칙 — **재분리하지 않는다**. `BibleSidebar`/`BibleRankingView`/`BibleVersesView`/`BibleStatusView`는 이미 성경 읽기 사이클에서 회귀 테스트가 붙었으므로 이번 사이클에서 다시 다루지 않는다. `BibleWrite.jsx` 자체의 로직(책/장/절 선택, 타이핑 판정, 자동 다음 절 이동, 장 진행률)에만 회귀 테스트를 추가한다.

로그인 가드는 이미 지난 사이클(Task 10)에서 추가되고 테스트됨 — 이번 사이클은 그 테스트를 유지한 채 나머지 로직 테스트를 같은 파일에 추가한다.

## 테스트 대상 동작

| 동작 | 현재 구현 | 이번 사이클 |
|---|---|---|
| 책 선택 모달 | `BookModal`에서 책 클릭 시 `selectedBook` 변경 + 장/절 리셋 | 회귀 테스트 |
| 장/절 드롭다운 | 선택 시 상태 변경 + `typed`/`isCorrect` 리셋 | 회귀 테스트 |
| 타이핑 정오 판정 | 입력값이 정답과 일치하면 `isCorrect=true` + `completedVerses`에 추가(중복 방지) | 회귀 테스트 |
| 자동 다음 절 이동 | 정답 입력 후 마지막 절이 아니면 700ms 뒤 자동으로 다음 절로 | 회귀 테스트 |
| "다시 쓰기" | 완료 상태에서 클릭 시 `typed`/`isCorrect` 리셋 | 회귀 테스트 |
| "다음 장으로" 버튼 | 마지막 절 완료 시에만 노출, 클릭 시 다음 장(또는 다음 책)으로 | 회귀 테스트 |
| 장 진행률 바 | 완료 절수/전체 절수 비율 | 회귀 테스트 |
| 랭킹/내구절/내현황 탭 전환 | `activeMenu`에 따라 하위 뷰 전환 | 회귀 테스트 |
| `state.book`(전체이름) 소비 | **버그**: 약어로 변환하지 않고 그대로 저장 | **수정 + TDD** |
| 로그인 가드 | 이미 구현·테스트됨(Task 10) | 유지, 재작성 안 함 |

## 테스트 인프라 참고

- 필사 입력창은 시각적으로 숨겨진(`opacity-0`) 실제 `<textarea>`이지만, 상단 검색창도 별도의 `<input>`(플레이스홀더만 있고 기능 없음)이라 둘 다 `role="textbox"`를 갖는다. 테스트에서 필사 입력창을 특정할 때는 `container.querySelector("textarea")`처럼 태그로 직접 조회하거나, 검색창이 없는 화면 상태에서 테스트하는 방법을 계획 문서에서 구체화한다.
- 회귀 테스트는 `renderWithChurch(ui, { withAuth: true, initialEntries })` 헬퍼를 사용한다(로그인 가드가 있으므로 `withAuth` 필수).

## 비목표 (이번 사이클 제외)

- `BibleSidebar`/`BibleRankingView`/`BibleVersesView`/`BibleStatusView` 재테스트 (이미 완료)
- 로그인 가드 재작성 (이미 완료)
- 명세 gap 수정 (CSV에 스펙 자체가 없음)
- 필사 UI/UX 변경

## 확인 필요

없음.
