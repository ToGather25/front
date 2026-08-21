# 마이페이지 실연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 "화면은 있는데 API 미연동 24건" 배치 중 여섯 번째(마지막) 서브프로젝트. 대상은 `MyPage.jsx`의 5개 탭 중 3개(일정/기도·상담/문의)와 "내 정보" 탭 안의 회원탈퇴 기능이다. "내 정보"(프로필 수정)·"부서/직책" 탭은 대응 API가 백엔드에 아예 없어 이번 사이클에서 제외한다.

백엔드 `MyPageController`는 "프론트 MyPage 더미 기능 대응"이라는 주석과 함께 이 화면을 겨냥해 설계됐고, 상태값 문자열도 "프론트 표기 그대로(한글)"라는 주석이 붙어 있다 — 지금까지의 다른 사이클(교적부, 주보)보다 프론트-백엔드 필드 불일치가 훨씬 적다.

## 백엔드 계약 (실제 컨트롤러/엔티티 소스로 확인, `MyPageController.java`, `MyPageUseCase.java`)

| 동작 | 엔드포인트 | 필드 |
|---|---|---|
| 일정 목록 | `GET /api/my/schedules` | `Schedule{id, title, date(LocalDate), memo}` |
| 일정 추가 | `POST /api/my/schedules` | 요청: `title(필수), date(필수), memo` |
| 일정 삭제 | `DELETE /api/my/schedules/{id}` | 응답 없음(204) |
| 기도/상담 목록 | `GET /api/my/prayers` | `Prayer{id, type, content, status, createdAt}` — **title 없음** |
| 기도/상담 신청 | `POST /api/my/prayers` | 요청: `type, content(필수)` |
| 문의 목록 | `GET /api/my/inquiries` | `Inquiry{id, title, content, status, answer, createdAt}` |
| 문의 등록 | `POST /api/my/inquiries` | 요청: `title(필수), content` |
| 회원 탈퇴 | `DELETE /api/my/account` | 응답 없음(204), **즉시 소프트삭제**(`deleted_at` 처리, "30일 후 처리" 같은 대기 절차 없음) |

- 전부 `Principal`(JWT subject = 계정 publicId) 기준 본인 데이터만 다룬다 — 로그인 필수(기존 `MyPage.jsx`의 `!currentUser` 게이트 그대로 유효).
- **기도/상담 삭제 API, 문의 삭제 API는 없다** — 일정만 삭제 가능.
- **기도/상담엔 `title` 필드가 없다** — 지금 프론트가 보여주는 제목은 표시할 방법이 없다.
- 상태값 문자열은 백엔드가 프론트 표기와 동일한 한글로 저장한다(`PrayerRequestJpaEntity`/`MemberInquiryJpaEntity` 주석: "status는 프론트 표기 그대로(한글)", 기본값 각각 `"답변 대기"`/`"진행 중"`) — 기존 `StatusBadge`(`src/components/mypage/shared.jsx`)의 스타일 맵(`"답변 완료"`/`"답변 대기"`/`"진행 중"`/`"참석 예정"`/`"미정"`)을 그대로 재사용할 수 있다.

## 확정된 설계 결정

### 1. `myPageService.js` 신규 생성

```js
import api, { isDummy } from "./api";
import {
  DUMMY_MY_SCHEDULES,
  DUMMY_MY_PRAYERS,
  DUMMY_MY_INQUIRIES,
} from "@/data/dummy/mypage";

/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

export async function getMySchedules(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_SCHEDULES];
  const res = await api.get(`/my/schedules`);
  return res.data.data;
}

export async function addMySchedule(churchId, { title, date, memo }) {
  if (isDummy("my")) {
    const created = { id: Date.now(), title, date, memo };
    DUMMY_MY_SCHEDULES.push(created);
    return created;
  }
  const res = await api.post(`/my/schedules`, { title, date, memo });
  return res.data.data;
}

export async function deleteMySchedule(churchId, id) {
  if (isDummy("my")) {
    const idx = DUMMY_MY_SCHEDULES.findIndex((s) => s.id === id);
    if (idx !== -1) DUMMY_MY_SCHEDULES.splice(idx, 1);
    return;
  }
  await api.delete(`/my/schedules/${id}`);
}

export async function getMyPrayers(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_PRAYERS];
  const res = await api.get(`/my/prayers`);
  return res.data.data;
}

export async function addMyPrayer(churchId, { type, content }) {
  if (isDummy("my")) {
    const created = { id: Date.now(), type, content, status: "답변 대기", createdAt: new Date().toISOString() };
    DUMMY_MY_PRAYERS.unshift(created);
    return created;
  }
  const res = await api.post(`/my/prayers`, { type, content });
  return res.data.data;
}

export async function getMyInquiries(churchId) {
  if (isDummy("my")) return [...DUMMY_MY_INQUIRIES];
  const res = await api.get(`/my/inquiries`);
  return res.data.data;
}

export async function addMyInquiry(churchId, { title, content }) {
  if (isDummy("my")) {
    const created = { id: Date.now(), title, content, status: "진행 중", answer: null, createdAt: new Date().toISOString() };
    DUMMY_MY_INQUIRIES.unshift(created);
    return created;
  }
  const res = await api.post(`/my/inquiries`, { title, content });
  return res.data.data;
}

export async function withdrawAccount(churchId) {
  if (isDummy("my")) return;
  await api.delete(`/my/account`);
}
```

`churchId`는 다른 관리자 서비스 함수들과 동일하게(예: `memberService.js`, `sermonService.js`) 시그니처 일관성을 위해 유지하지만 URL에는 쓰지 않는다(`/api/my/**`는 host+JWT 기반, churchId 경로 세그먼트 없음).

### 2. 더미 데이터 — `src/data/dummy/mypage.js` 신규

기존 `src/components/mypage/mockData.js`의 `INITIAL_SCHEDULES`/`INITIAL_PRAYERS`/`INITIAL_INQUIRIES`를 백엔드 필드에 맞게 축소해서 새 파일에 옮긴다(`MOCK_USER`/`MOCK_DEPT`/`MOCK_GROUPS`는 "내 정보"/"부서·직책" 탭이 계속 쓰므로 `mockData.js`에 그대로 둔다).

- `DUMMY_MY_SCHEDULES`: `{id, title, date, memo}` 6개 항목(기존 `INITIAL_SCHEDULES`에서 `day`/`status` 제거, `info`→`memo`).
- `DUMMY_MY_PRAYERS`: `{id, type, content, status, createdAt}` 5개 항목(기존에서 `title`/`reply` 제거, `date`→`createdAt`).
- `DUMMY_MY_INQUIRIES`: `{id, title, content, status, answer, createdAt}` 5개 항목(기존 `reply`→`answer`, `content` 필드 새로 채움, `date`→`createdAt`).

### 3. `ScheduleTab.jsx` 재설계

- 폼에서 "요일" 입력 제거(백엔드에 필드 없음), "시간·장소" 라벨은 유지하되 실제로는 `memo`에 매핑.
- 목록 렌더링: `item.date`를 `formatMonthDay(item.date)`(`@/utils/date.js`에 이미 있는 헬퍼, "YYYY-MM-DD"→"MM/DD")로 표시하고 요일은 `getWeekdayLabel(parseLocalDate(item.date).getDay())`로 파생 렌더링(백엔드가 안 주지만 순수 클라이언트 계산이라 문제없음). `item.info`→`item.memo`. `<StatusBadge status={item.status} />` 제거(필드 없음).
- 각 일정 항목에 삭제 버튼을 추가한다(백엔드가 지원). 클릭 시 `confirm()` 후 `deleteMySchedule` 호출, 성공하면 로컬 목록에서 제거.
- `handleAddSchedule`이 `addMySchedule(church.id, {title, date, memo})`를 호출하고, 성공하면 반환된 항목을 로컬 목록에 추가한다.
- 컴포넌트 마운트 시 `getMySchedules(church.id)`로 초기 목록을 불러온다(부모 `MyPage.jsx`가 `useFetch`로 불러와 props로 내려주는 기존 구조를 유지 — `MyPage.jsx`가 `schedules`/`setSchedules`를 이미 소유하고 있으므로, 그 초기값을 `useState(INITIAL_SCHEDULES)` 대신 `useFetch`로 바꾼다).

### 4. `PrayerTab.jsx` 재설계

- 폼에서 "제목" 입력 제거. 대신 유형 선택(기도/상담 토글 버튼 또는 select, 목록 상단의 필터 칩과 같은 두 값)을 추가한다 — 지금은 `type: "기도"`로 하드코딩돼 있던 것을 실제로 선택 가능하게 만든다.
- 목록 렌더링에서 제목(`item.title`) 표시 제거, 답변(`item.reply`) 표시 블록 전체 제거(백엔드가 반환하지 않음) — 유형 배지 + 내용 + 상태 배지만 남는다.
- `handleAddPrayer`가 `addMyPrayer(church.id, {type, content})`를 호출한다.
- `MyPage.jsx`가 `getMyPrayers(church.id)`로 초기 목록을 불러온다.

### 5. `InquiryTab.jsx` 재설계

- 거의 그대로 유지 — `item.reply`를 `item.answer`로, `item.date`를 `formatDotDate(item.createdAt)`(이미 있는 `@/utils/date.js` 헬퍼, "YYYY-MM-DD"→"YYYY.MM.DD")로만 바꾼다.
- `handleAddInquiry`가 `addMyInquiry(church.id, {title, content})`를 호출한다.
- `MyPage.jsx`가 `getMyInquiries(church.id)`로 초기 목록을 불러온다.

### 6. `InfoTab.jsx` — 회원탈퇴를 실제 API와 연동

- "탈퇴 신청" 버튼 클릭 시 `withdrawAccount(church.id)`를 호출한다.
- 성공 안내 문구를 실제 동작에 맞게 수정한다: 지금은 "탈퇴 신청이 접수되었습니다. 검토 완료 후 탈퇴가 최종 처리되며, 처리까지는 약 30일 정도 소요됩니다."(가짜 대기 절차)인데, 백엔드는 즉시 소프트삭제이므로 "회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다." 같은 즉시-완료 문구로 바꾼다.
- 확인 버튼 클릭 시(또는 API 성공 직후) `useAuth()`의 `logout()`을 호출해 세션을 정리하고 로그인 화면 등으로 이동시킨다.
- 실패 시(네트워크 에러 등) 에러 문구를 보여주고 로그아웃은 하지 않는다.

### 7. `MyPage.jsx` — 데이터 페칭으로 전환

`useFetch`는 `setData`를 노출하지 않아 하위 탭의 낙관적 갱신(추가/삭제 직후 로컬 배열 즉시 반영)에 쓸 수 없다 — `WorshipManage.jsx`(설교·방송 사이클)가 이미 쓴 것과 동일한 수동 패턴을 그대로 따른다:

```js
const { church } = useChurch();
const [schedules, setSchedules] = useState([]);
const [prayers, setPrayers] = useState([]);
const [inquiries, setInquiries] = useState([]);

useEffect(() => {
  let cancelled = false;
  getMySchedules(church.id).then((list) => {
    if (!cancelled) setSchedules(list);
  });
  return () => {
    cancelled = true;
  };
}, [church.id]);

useEffect(() => {
  let cancelled = false;
  getMyPrayers(church.id).then((list) => {
    if (!cancelled) setPrayers(list);
  });
  return () => {
    cancelled = true;
  };
}, [church.id]);

useEffect(() => {
  let cancelled = false;
  getMyInquiries(church.id).then((list) => {
    if (!cancelled) setInquiries(list);
  });
  return () => {
    cancelled = true;
  };
}, [church.id]);
```

`schedules`/`setSchedules` 등은 지금처럼 `ScheduleTab`/`PrayerTab`/`InquiryTab`에 그대로 props로 내려간다(컴포넌트 구조는 안 바뀜, 초기값 소스만 정적 mock에서 fetch로 바뀜). `userForm` 초기값(`MOCK_USER` 기반)은 이번 사이클 범위 밖이라 그대로 둔다.

## 백엔드 요청 목록 (사용자가 별도 이슈로 등록 예정)

1. **기도/상담 삭제 API** — 지금은 등록뿐이라 잘못 신청해도 지울 수 없다.
2. **문의 삭제 API** — 마찬가지.
3. **기도/상담에 제목(title) 필드 추가** — 지금은 유형+내용만 있어 목록에서 각 항목을 구분하기 어렵다.

## 비목표

- 백엔드 스키마 변경 — back 저장소는 건드리지 않는다.
- "내 정보"(프로필 수정)·"부서/직책" 탭 연동 — 대응 API가 백엔드에 없어 범위 밖, 계속 목업.
- 기도/상담·문의 수정·삭제 UI — 대응 API가 없어 범위 밖(일정만 삭제 지원).

## 테스트 계획

- `src/services/myPageService.test.js`(신규): 7개 함수 전부 정확한 엔드포인트/payload로 호출하는지. `isDummy` 모킹은 기존 사이클과 동일 패턴.
- `src/pages/MyPage/MyPage.test.jsx`(신규 또는 확장): 로그인 가드가 여전히 동작하는지, 3개 탭이 각각 `getMySchedules`/`getMyPrayers`/`getMyInquiries`로 초기 렌더링되는지.
- `src/components/mypage/ScheduleTab.test.jsx`(신규): 일정 추가/삭제가 실제로 서비스 함수를 호출하는지, 요일 입력 필드가 없는지, 상태 배지가 없는지.
- `src/components/mypage/PrayerTab.test.jsx`(신규): 제목 입력/답변 표시가 없는지, 유형 선택이 실제로 동작하는지, 신청이 `addMyPrayer`를 호출하는지.
- `src/components/mypage/InquiryTab.test.jsx`(신규): 등록이 `addMyInquiry`를 호출하는지, `answer` 필드가 표시되는지.
- `src/components/mypage/InfoTab.test.jsx`(신규 또는 확장): 탈퇴 버튼이 `withdrawAccount`를 호출하고 성공 시 로그아웃되는지, 실패 시 에러 문구가 뜨고 로그아웃되지 않는지.

## 확인 필요

없음 — 위 결정 전부 사용자와 직접 확인(기도탭 제목·답변 제거, 회원탈퇴 즉시처리 문구 수정 포함)을 거쳤다.
