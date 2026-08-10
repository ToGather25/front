# 마이페이지 — 인증 가드 + 탭별 컴포넌트 분리 + 회귀 테스트 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **일곱 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 앞선 여섯 사이클(교회소개, 회원가입/로그인, 성경 읽기, 성경 쓰기, 예배·방송, 교적부)은 완료되어 `develop`에 병합됨.

## CSV 명세 확인 결과

CSV에서 "마이 페이지"라는 용어가 등장하는 행(50~138행)은 전부 **성경 읽기 통계/목표 설정 페이지**(`bible/read/mypage`, `bible/read/mypage/goal`)를 가리킨다 — `user_stats`(누적 읽은 구절/완독 횟수/총 방문일/이번 달 읽은 일수/연속 스트릭), `goals`(전체 완독 퍼센트/이번 달 목표), `progress_list`(66권별 읽은 퍼센트) 항목과 "이번 달 목표 설정" 모달(권 선택 바둑판, 실시간 총 구절 수 반영)까지 전부 `src/components/bible/BibleStatusView.jsx`의 `GoalBanner`/`GoalModal`이 이미 구현하고 있음을 확인했다 — **Cycle 3(성경 읽기)에서 이미 완료된 범위다.**

일반 계정 페이지(`src/pages/MyPage/MyPage.jsx`)에 대응하는 CSV 행은 전혀 없다(`grep -n "프로필\|내 정보\|알림 설정\|계정\|회원정보\|탈퇴"` 결과도 없음) — 사전 예상대로 순수 회귀 테스트 + 실제 발견된 보안 gap 수정이 이번 사이클의 목적이다.

## 코드 탐색 결과

`src/pages/MyPage/MyPage.jsx`(1179줄)는 **인증 가드가 전혀 없다** — `useAuth()` 호출 자체가 없어 로그인 여부와 무관하게 항상 렌더된다. 다만 데이터는 `members.config.js`(교적부 사이클에서 다룬 실제 교인 데이터) 같은 실제 데이터가 아니라 파일 내부에 정의된 완전 합성 `MOCK_USER`/`MOCK_DEPT`/`MOCK_GROUPS`/`INITIAL_SCHEDULES`/`INITIAL_PRAYERS`/`INITIAL_INQUIRIES`이므로, 교적부 사이클에서 발견된 "번들에 실제 개인정보가 평문으로 실린다"는 심각도의 이슈는 아니다.

페이지는 5개 탭(내 정보/부서·직책/일정/기도·상담/문의하기)을 `activeTab` 상태 하나로 조건부 렌더하는 단일 거대 컴포넌트 구조다. 각 탭의 상태(폼/페이지네이션/모달)는 서로 완전히 독립적이며, 모달도 탭별로 1:1 대응한다(`withdraw-confirm`/`withdraw-done`→내정보, `dept-change-done`→부서/직책, `add-schedule`→일정, `add-prayer`→기도/상담; 문의하기는 모달 대신 인라인 작성모드). 유일한 탭 간 상호작용은 "내 정보" 탭의 "부서/직책 메뉴에서 확인" 링크가 `activeTab`을 `"dept"`로 바꾸는 것뿐이다.

회원 탈퇴 플로우(확인모달 → 신청 → 완료안내, 검토기간 30일 명시)는 이미 잘 구현되어 있어 앱 심사 규칙(계정 삭제 기능 필수)을 충족한다 — 손대지 않는다.

테스트는 전혀 없다(이 이니셔티브에서 다룬 파일 중 최대 규모의 미테스트 파일).

## 사용자 확인 사항 (2026-08-10)

1. **인증 가드**: 로그인 가드를 추가한다(`BibleRead.jsx`/`Gyojeokbu.jsx`와 동일한 `useAuth`+`LoginRequiredModal` 패턴).
2. **MOCK_USER 실제 사용자 반영**: 이번 사이클에서 제외한다 — 백엔드 API 없이는 근본 해결이 불가능한 별도 규모의 작업. 다음 백엔드 연동 사이클로 이관.
3. **파일 구조**: 탭별 컴포넌트로 분리한다(Church.jsx Cycle 1과 동일 원칙) — 1179줄 단일 파일에 5개 서로 다른 CRUD성 탭이 섞여 있어 리뷰·테스트 관리가 어렵다.

## 아키텍처

### 로그인 가드

`MyPage.jsx` 최상단에 `useAuth()` + `LoginRequiredModal`을 추가한다. `RootLayout` 하위 라우트라 이미 `AuthProvider`를 상속받으므로 `AuthOnlyLayout` 신설은 불필요하다(교적부 사이클과 동일 판단).

### 파일 분리

각 탭의 상태가 서로 완전히 독립적이고 모달도 탭별 1:1 대응이므로 다음과 같이 분리한다:

```
src/pages/MyPage/MyPage.jsx        — 얇은 부모: 로그인가드, 사이드바(탭 네비 + 유저 요약), activeTab 상태만 보유
src/components/mypage/
  ├── mockData.js                  — MOCK_USER/MOCK_DEPT/MOCK_GROUPS/INITIAL_SCHEDULES/INITIAL_PRAYERS/INITIAL_INQUIRIES (현재 파일 상단 그대로 이동, 값 변경 없음)
  ├── shared.jsx                   — ReadonlyField/InputField/ModalOverlay/StatusBadge/Pagination (공용 UI 5종, 로직 변경 없음)
  ├── InfoTab.jsx                  — 내 정보(프로필 이미지 업로드 UI/기본정보 폼/교적정보/보안, 회원탈퇴 확인+완료 모달)
  ├── DeptTab.jsx                  — 부서/직책(조회 ↔ 변경신청 토글, 변경완료 모달, 참여 중인 부서/모임 목록)
  ├── ScheduleTab.jsx              — 일정(목록 + 페이지네이션 + 일정추가 모달)
  ├── PrayerTab.jsx                — 기도/상담(전체·기도·상담 필터 + 목록 + 페이지네이션 + 신청 모달)
  └── InquiryTab.jsx                — 문의하기(목록 ↔ 작성폼 토글 + 페이지네이션)
```

각 탭 컴포넌트는 자기 상태(폼 값/페이지네이션/모달 열림 여부)를 독립적으로 소유한다(prop drilling 없음, 완전히 자기완결적). 유일한 교차 상호작용인 "부서/직책으로 이동" 링크는 `InfoTab`이 `onNavigateDept` 콜백 prop을 받아 처리한다(부모가 `() => setActiveTab("dept")`를 내려줌). `MOCK_USER`는 부모(사이드바 요약)·`InfoTab`(기본정보 폼 초기값)·`InquiryTab`(문의자 정보 readonly 필드) 3곳에서 공유되므로 `mockData.js`로 분리해 셋 다 import한다.

부모 `MyPage.jsx`는 사이드바(유저 요약 카드 + 탭 버튼 5개)와 `activeTab` 상태만 남기고, 본문은 `activeTab`에 따라 해당 Tab 컴포넌트 하나만 마운트한다.

### 컴포넌트 리팩터링 원칙

- 각 파일을 옮기는 과정에서 **로직·마크업·클래스명은 그대로 유지**한다(순수 구조 재배치 — 동작 변경 없음). 유일한 코드 변경은 (1) 로그인 가드 추가, (2) import 경로 조정, (3) `InfoTab`의 `onNavigateDept` prop 연결이다.
- `MOCK_USER`/`MOCK_DEPT`/`MOCK_GROUPS`/`INITIAL_*`의 값 자체는 전혀 바꾸지 않는다.

## 테스트 계획

CSV 스펙이 없으므로 전부 characterization test(회귀 테스트)다.

- `MyPage.test.jsx`(신규, 로그인 가드 전용): 비로그인 시 `LoginRequiredModal` 노출 + 탭 콘텐츠 미노출(TDD, 실패 우선), 로그인 시 사이드바 5개 탭 버튼 렌더 + 기본 탭("내 정보") 콘텐츠 노출.
- `InfoTab.test.jsx`: 기본정보 폼 입력 변경, 회원탈퇴 확인→완료 모달 흐름, 취소 시 폼 리셋.
- `DeptTab.test.jsx`: 조회 화면 렌더, 변경신청 모드 전환, 신청 완료 모달.
- `ScheduleTab.test.jsx`: 목록 렌더, 페이지네이션, 일정 추가.
- `PrayerTab.test.jsx`: 필터 전환, 목록 렌더, 신청 추가.
- `InquiryTab.test.jsx`: 목록 렌더, 작성모드 전환, 문의 접수(목록 최상단 추가 확인).
- `src/routes.test.jsx`에 `/mypage` 케이스 추가 — 이전 사이클들의 교훈("컴포넌트 테스트는 통과했는데 실제 라우트 트리엔 AuthProvider가 없어 프로덕션 크래시")을 예방하기 위해 실제 라우트 트리로 가드를 재검증한다.

렌더 헬퍼는 `renderWithChurch(ui, { withAuth: true })`를 재사용한다(`useNavigate` 사용을 위한 자동 `MemoryRouter` 래핑).

## 비목표 (이번 사이클 제외)

- `MOCK_USER`를 실제 로그인 사용자(`currentUser`)로 교체 — 백엔드 연동 없이는 근본 해결 불가, 사용자 확인 완료.
- 회원 탈퇴 플로우 변경 — 이미 앱 심사 규칙을 충족하는 상태, 손대지 않음.
- UI/UX 변경, 디자인 개편.
- 실제 백엔드 API 연동(일정/기도/문의 CRUD를 서버에 저장).

## 확인 필요

없음 — 모든 판단 지점은 사용자 확인 완료(2026-08-10).
