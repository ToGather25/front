# 주보(Jubo) 도메인 재구축 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])에서 2026-08-22 감사 때 발견돼 별도 사이클로 미뤄뒀던 항목. 스마트 주보 12탭(`Jubo.jsx`, `src/components/jubo/*.jsx`)은 지금까지 `juboService.js`를 전혀 쓰지 않고 정적 파일 `src/config/jubo.config.js`를 직접 읽고 있었다 — `isDummy("jubo")`를 켜도 아무 효과가 없는 죽은 배선이었다. 관리자 화면(`JuboManage.jsx`)도 백엔드 계약과 무관한 임의 필드(설교자/찬양/공지1-4/헌금위원/꽃꽂이)로 구성돼 있어 저장 버튼이 `setSaved(true)` 외엔 아무 일도 하지 않는다.

이번 사이클에서 실제 백엔드 컨트롤러 소스(`ChurchAdminJuboController`, `ChurchesJuboController`, `JuboSectionType`)를 직접 확인한 결과, 백엔드가 지원하는 섹션 타입은 7개뿐이고 12탭 중 6탭에만 대응한다는 사실을 확인했다. 사용자와 논의 후 **이번 사이클은 지원되는 6탭만 실연동**하기로 범위를 좁혔다.

## 백엔드 계약 (실제 컨트롤러/도메인 소스로 확인)

파일: `ChurchAdminJuboController.java`, `ChurchesJuboController.java`, `JuboSectionType.java`, `Jubo.java`, `JuboService.java`, `JuboPersistenceAdapter.java`, `V6__jubo.sql`.

### 관리자 API (`/api/church/admin/jubo`, `ROLE_CHURCH_ADMIN` 필요)

| Method | URL | 요청 | 응답 |
|---|---|---|---|
| POST | `/api/church/admin/jubo` | `issueNo: String(필수), juboDate: LocalDate(필수)` | `{id, issueNo, juboDate, published}` |
| PUT | `/api/church/admin/jubo/{juboId}/sections/{type}` | Body = 임의 JSON(검증 없음), `{type}`은 `JuboSectionType` | 없음(data 없는 ApiResponse) |
| POST | `/api/church/admin/jubo/{juboId}/publish` | 없음 | `{id, issueNo, juboDate, published}` |

**관리자용 목록/현재 초안 조회 GET이 없다.** 생성 응답의 `id`를 프론트가 계속 들고 있어야 하고, 새로고침하면 그 `juboId`를 다시 찾을 방법이 없다.

### 공개 API (`/api/churches/{churchId}/jubo`, 인증 불필요, `permitAll`)

| Method | URL | 파라미터 | 응답 |
|---|---|---|---|
| GET | `/current` | 없음 | `{issueNo, date}` (`date`는 `"yyyy년 M월 d일"` 포맷 문자열) |
| GET | `/worship-services` | 없음 | 섹션 JSON 그대로 |
| GET | `/worship-order` | `serviceType`(선택) | 지정 시 그 키의 값만, 없으면 저장된 객체 전체 |
| GET | `/volunteer` | 없음 | 섹션 JSON 그대로 |
| GET | `/offering` | 없음 | 섹션 JSON 그대로 |
| GET | `/support` | 없음 | 섹션 JSON 그대로 |
| GET | `/districts` | 없음 | 섹션 JSON 그대로 |
| GET | `/ministers` | 없음 | 섹션 JSON 그대로 |

`{churchId}` path 변수는 컨트롤러에서 받기만 하고 쓰이지 않는다 — 테넌트 스코프는 필터가 처리한다. 모든 조회는 "현재 교회의 최신 발행(`published=true`) 주보" 하나만 반환하고, 없으면 404(`JB001`).

### 섹션 저장 방식

`jubo_section.content`는 `JSONB` 컬럼이고 엔티티는 `content: String`(`@JdbcTypeCode(SqlTypes.JSON)`) — **완전 자유형식**. 관리자 PUT은 `Object`를 받아 검증 없이 그대로 직렬화해 저장하고, 공개 GET은 저장된 문자열을 그대로 파싱해 반환한다. 백엔드는 섹션 내부 구조를 전혀 모른다 — **프론트가 정하는 모양이 곧 계약**이다.

### `JuboSectionType` — 정확히 7개

`WORSHIP_SERVICES, WORSHIP_ORDER, VOLUNTEER, OFFERING, SUPPORT, DISTRICTS, MINISTERS`

이 중 `WORSHIP_SERVICES`+`WORSHIP_ORDER`는 "예배" 탭 하나에 같이 쓰이므로, 12탭 중 실제로 커버되는 건 **예배·봉사·예물·후원·구역·섬기는 분들 6탭**뿐이다. `표지·소식·오시는 길·말씀·헌금·기도제목` 6탭은 대응 섹션이 없다.

## 범위

### 이번 사이클에 포함

- `예배`, `봉사`, `예물`, `후원`, `구역`, `섬기는 분들` 6개 공개 탭을 `juboConfig` 정적 읽기 → `juboService.js` 실API 호출로 재배선
- 관리자 화면(`JuboManage.jsx`) 전면 재작성 — 6개 섹션(API로는 7개 PUT) 에디터 + 발행 흐름
- `표지` 탭의 호수/날짜만 `GET /current`로 실데이터 연결(사진은 계속 정적) — 별도 백엔드 작업 없이 이미 있는 API로 거저 얻는 부분

### 이번 사이클에서 제외 (정적 유지, 백엔드 요청 사항으로만 기록)

- `소식`, `말씀`, `헌금`, `기도제목` 탭 — 대응 섹션 타입 없음
- `표지`의 사진(교회/파노라마/단체) — 대응 필드 없음
- `오시는 길` 탭 — 이미 `ChurchContext`(교회 주소/셔틀 정보)를 읽고 있어 jubo 도메인이 아니라 교회 설정 쪽 문제로 분류, 손대지 않음

## 데이터 모양 확정

### 예배 탭 — 유일하게 UI 동작이 바뀌는 탭

**결정**: 사이드바에서 예배를 고르면 순서표가 실제로 그 예배의 것으로 바뀌도록 만든다(현재는 어떤 항목을 골라도 똑같은 표가 보이는 장식적 상태). 부서 소그룹(유치부/초등부 등)은 백엔드에 그룹 개념이 없어 평평한 목록으로 단순화한다.

```js
// WORSHIP_SERVICES 섹션 — 사이드바 목록 + 우측 "예배 및 모임 안내" 패널을 동시에 채움
// [{ label: string, time: string }]
[
  { label: "주일 오전예배", time: "오전 9:00" },
  { label: "주일 오후예배", time: "오후 2:00" },
]

// WORSHIP_ORDER 섹션 — label별로 순서표를 따로 가짐
// { [label: string]: Array<{ role: string, name: string }> }
{
  "주일 오전예배": [
    { role: "예배 부름", name: "성가대" },
    { role: "설 교", name: "김영수 담임목사" },
  ],
}
```

`Worship.jsx` 변경점:
- 사이드바를 `WORSHIP_SERVICES` 목록(라벨만)으로 렌더링, 첫 항목 자동 선택
- 순서표를 `worshipOrder[selected] ?? []`로 렌더링, 컬럼을 기존 "구분/1부/2부" 3열에서 **"역할/담당자" 2열**로 변경(예배별로 각자 순서를 가지므로 나란히 비교할 두 번째 열이 없어짐)
- 우측 "예배 및 모임 안내" 패널은 `WORSHIP_SERVICES`를 그대로 매핑(기존과 동일)
- `WORSHIP_ORDER` 조회는 `serviceType` 파라미터 없이 한 번만 호출해 전체 객체를 받고, 클라이언트에서 `selected` 키로 조회(예배 개수가 적어 요청을 나눌 필요 없음)

### 나머지 5개 탭 — 기존 공개 컴포넌트가 쓰는 모양을 그대로 저장(UI 변경 없음)

`dummy/jubo.js`의 기존 추정 모양(주차별 봉사, 카테고리별 후원 등)은 어떤 컴포넌트도 실제로 소비한 적 없는 죽은 데이터라 버리고, **실제 렌더링 로직이 쓰는 모양을 그대로 계약으로 삼는다.**

| 탭 | 섹션 타입 | 저장 모양 | 근거 파일 |
|---|---|---|---|
| 봉사 | `VOLUNTEER` | `[{ role, part1, part2 }]` | `Service.jsx` |
| 예물 | `OFFERING` | `[{ title, items: string[] }]` | `Offering.jsx` |
| 후원 | `SUPPORT` | `[{ organization, target, region }]` | `Support.jsx` |
| 구역 | `DISTRICTS` | `[{ name, location, time, leader }]` | `District.jsx` |
| 섬기는 분들 | `MINISTERS` | `[{ title, items: string[] }]`, `items`는 `"역할 \| 이름"` 형식 문자열 | `Ministers.jsx` |

## 확정된 설계 결정

### 1. `juboService.js` 전면 재작성

레거시 `USE_DUMMY` 전역 플래그를 버리고 이 세션에서 확립된 `isDummy("jubo")` 패턴으로 전환한다. 공개 조회 7개(현재 정보 포함) + 관리자 3개.

```js
import api, { isDummy } from "./api";
import {
  DUMMY_JUBO_INFO,
  DUMMY_WORSHIP_SERVICES,
  DUMMY_WORSHIP_ORDER,
  DUMMY_VOLUNTEER,
  DUMMY_OFFERING,
  DUMMY_SUPPORT,
  DUMMY_DISTRICTS,
  DUMMY_MINISTERS,
} from "@/data/dummy/jubo";

/**
 * @typedef {{ issueNo: string, date: string }} JuboInfo
 * @typedef {{ label: string, time: string }} WorshipService
 * @typedef {{ role: string, name: string }} OrderRow
 * @typedef {Record<string, OrderRow[]>} WorshipOrderMap
 */

/** 현재 발행된 주보의 호수/날짜 */
export async function getJuboInfo(churchId) {
  if (isDummy("jubo")) return DUMMY_JUBO_INFO;
  const res = await api.get(`/churches/${churchId}/jubo/current`);
  return res.data.data;
}

/** @returns {Promise<WorshipService[]>} */
export async function getWorshipServices(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_SERVICES;
  const res = await api.get(`/churches/${churchId}/jubo/worship-services`);
  return res.data.data;
}

/** serviceType 없이 호출해 전체 맵을 받는다 — 클라이언트에서 라벨로 조회 */
export async function getWorshipOrder(churchId) {
  if (isDummy("jubo")) return DUMMY_WORSHIP_ORDER;
  const res = await api.get(`/churches/${churchId}/jubo/worship-order`);
  return res.data.data;
}

export async function getVolunteer(churchId) {
  if (isDummy("jubo")) return DUMMY_VOLUNTEER;
  const res = await api.get(`/churches/${churchId}/jubo/volunteer`);
  return res.data.data;
}

export async function getOffering(churchId) {
  if (isDummy("jubo")) return DUMMY_OFFERING;
  const res = await api.get(`/churches/${churchId}/jubo/offering`);
  return res.data.data;
}

export async function getSupport(churchId) {
  if (isDummy("jubo")) return DUMMY_SUPPORT;
  const res = await api.get(`/churches/${churchId}/jubo/support`);
  return res.data.data;
}

export async function getDistricts(churchId) {
  if (isDummy("jubo")) return DUMMY_DISTRICTS;
  const res = await api.get(`/churches/${churchId}/jubo/districts`);
  return res.data.data;
}

export async function getMinisters(churchId) {
  if (isDummy("jubo")) return DUMMY_MINISTERS;
  const res = await api.get(`/churches/${churchId}/jubo/ministers`);
  return res.data.data;
}

/**
 * 주보 발행 초안 생성 (관리자)
 * @param {string} churchId
 * @param {{ issueNo: string, juboDate: string }} payload - juboDate는 "YYYY-MM-DD"
 * @returns {Promise<{ id:number, issueNo:string, juboDate:string, published:boolean }>}
 */
export async function createJuboIssue(churchId, payload) {
  if (isDummy("jubo")) return { id: `dummy-${Date.now()}`, ...payload, published: false };
  const res = await api.post(`/church/admin/jubo`, payload);
  return res.data.data;
}

/**
 * 섹션 저장 (관리자) — content는 자유형식, 위 "데이터 모양 확정" 표를 따른다
 * @param {string} churchId
 * @param {number|string} juboId
 * @param {"WORSHIP_SERVICES"|"WORSHIP_ORDER"|"VOLUNTEER"|"OFFERING"|"SUPPORT"|"DISTRICTS"|"MINISTERS"} sectionType
 * @param {object} content
 */
export async function updateJuboSection(churchId, juboId, sectionType, content) {
  if (isDummy("jubo")) return;
  await api.put(`/church/admin/jubo/${juboId}/sections/${sectionType}`, content);
}

/**
 * 주보 발행 (관리자)
 * @param {string} churchId
 * @param {number|string} juboId
 */
export async function publishJubo(churchId, juboId) {
  if (isDummy("jubo")) return { id: juboId, published: true };
  const res = await api.post(`/church/admin/jubo/${juboId}/publish`);
  return res.data.data;
}
```

### 2. 더미 데이터 재작성 (`src/data/dummy/jubo.js`)

기존 값들은 위에서 확정한 새 모양과 맞지 않으므로 다시 쓴다: `DUMMY_JUBO_INFO`(기존 유지), `DUMMY_WORSHIP_SERVICES`(`[{label,time}]`), `DUMMY_WORSHIP_ORDER`(라벨 키 맵), `DUMMY_VOLUNTEER`(`[{role,part1,part2}]`), `DUMMY_OFFERING`(기존 `jubo.config.js`의 `offering` 값 그대로 가져옴), `DUMMY_SUPPORT`(`[{organization,target,region}]`), `DUMMY_DISTRICTS`(`[{name,location,time,leader}]`), `DUMMY_MINISTERS`(`[{title,items}]`, `items`는 파이프 구분 문자열) — 사실상 `jubo.config.js`의 기존 정적 값들을 더미 데이터로 승격하는 것과 같다.

### 3. 공개 컴포넌트 6개 재배선

`Worship.jsx`, `Service.jsx`, `Offering.jsx`, `Support.jsx`, `District.jsx`, `Ministers.jsx` — `juboConfig` import를 제거하고 `juboService`의 해당 함수를 `useEffect`로 호출한다. 이 세션에서 확립된 패턴을 그대로 적용:
- `loading`/`loadError` state + "다시 시도" 버튼
- `ChurchContext`의 `church.id`를 조회 파라미터로 사용
- `Worship.jsx`만 `getWorshipServices`+`getWorshipOrder` 두 번 호출(`Promise.all` — 상세 페이지처럼 하나가 보조 데이터인 관계가 아니라 둘 다 필수라 `allSettled` 불필요)

`Cover.jsx`: `cover.issueNumber`/`cover.date` 두 필드만 `getJuboInfo`로 교체, `cover.photos`는 계속 `jubo.config.js`에서 읽는다(대응 백엔드 필드 없음 — import를 완전히 없애지 않고 사진 필드만 남긴다).

### 4. `JuboManage.jsx` 전면 재작성

기존 파일(호수 드롭다운 + 3개 임의 섹션 + `setSaved`뿐인 가짜 저장 버튼)을 통째로 버리고 새로 짠다.

**구조**:
1. 상단: "현재 발행된 주보" 정보(`getJuboInfo`로 호수/날짜 표시, 조회 실패해도 치명적이지 않으므로 조용히 숨김 처리)
2. "새 주보 작성" 버튼 → 호수(`issueNo`)/날짜(`juboDate`) 입력 모달 → `createJuboIssue` 호출 → 성공 시 받은 `id`를 `juboId` state로 보관하고 6개 섹션 에디터 카드를 렌더링
3. 상단 고정 경고: "작성 중 새로고침하면 저장하지 않은 내용은 유실됩니다. 섹션별로 저장 버튼을 눌러 진행 상황을 지켜주세요."
4. 각 섹션 카드는 **직전 발행본 값으로 미리 채워짐** — 기존 공개 조회 함수(`getWorshipServices`/`getWorshipOrder`/`getVolunteer`/`getOffering`/`getSupport`/`getDistricts`/`getMinisters`)로 프리필해 매주 처음부터 다시 입력하지 않아도 되게 한다(공개 GET이 `permitAll`이라 관리자 세션에서도 그대로 호출 가능)
5. 섹션마다 독립적인 "저장" 버튼 → 그 섹션만 즉시 `updateJuboSection` 호출(배치 저장 아님 — 하나씩 저장되므로 중간에 새로고침해도 이미 저장된 섹션은 안전)
6. 맨 아래 "발행하기" 버튼 → `publishJubo` 호출 → 성공 시 "발행 완료" 상태로 전환, 상단의 "현재 발행된 주보" 정보 갱신
7. 발행 후에도 같은 세션에서는 `juboId`를 계속 들고 있으므로 섹션을 계속 수정·재저장할 수 있다(백엔드가 발행 상태와 무관하게 PUT을 막지 않는다) — 다만 새로고침하면 위 "관리자 초안 유실 제약"이 그대로 적용돼 그 `juboId`는 잃는다

**섹션 에디터 컴포넌트 분리** — 800줄 단일 파일 대신 `src/components/admin/jubo/` 아래 6개로 나눈다:
- `WorshipSectionEditor.jsx` — 예배명 목록(추가/삭제) + 선택된 예배의 순서표 행(추가/삭제) 편집, `WORSHIP_SERVICES`+`WORSHIP_ORDER` 두 섹션을 함께 다룸(같은 라벨을 키로 공유하므로 한 카드에서 관리하는 게 자연스러움)
- `VolunteerSectionEditor.jsx` — `[{role,part1,part2}]` 행 추가/삭제
- `OfferingSectionEditor.jsx` — `[{title,items}]` 그룹+항목 추가/삭제
- `SupportSectionEditor.jsx` — `[{organization,target,region}]` 행 추가/삭제
- `DistrictSectionEditor.jsx` — `[{name,location,time,leader}]` 행 추가/삭제
- `MinistersSectionEditor.jsx` — `[{title,items}]` 그룹+`"역할 | 이름"` 항목 추가/삭제

각 에디터는 `{ value, onSave }` props만 받는 순수 폼 컴포넌트로 만들어 `JuboManage.jsx`가 데이터 흐름(프리필 fetch, 저장 호출, 저장 상태 표시)을 전담하고 에디터는 입력 UI만 담당한다.

**공통 처리**: 각 섹션 저장 버튼은 저장 중(`saving`) 동안 비활성화 + "저장 중..." 라벨(중복 제출 방지), 저장 성공 시 짧게 "저장됨" 표시 후 사라짐, 실패 시 에러 메시지 + 재시도 가능.

### 5. 라우팅/사이드바

이미 `/admin/jubo` 라우트와 사이드바 메뉴가 존재한다(`routes.jsx:105`, `AdminLayout.jsx:21`) — 변경 없음.

## 관리자 초안 유실 제약 (그대로 두기로 결정됨)

관리자용 "현재 초안 조회" GET이 백엔드에 없어서, 작성 중 새로고침하면 `juboId`를 잃고 그 초안엔 다시 접근할 수 없다(섹션별로 이미 저장된 내용은 백엔드에 남아있지만, 프론트가 그 `juboId`를 잊어버려 이어서 편집할 수 없다). 사용자와 논의 후 **이 제약을 UI 경고 문구로 안내하고 그대로 진행하기로 결정**했다 — `WorshipManage`/`GalleryManage` 사이클과 동일하게 "지금 가능한 것만 하고 백엔드 요청 사항으로 남기는" 패턴을 따른다.

## 백엔드 요청 목록 (사용자가 별도로 전달 예정)

1. **관리자용 주보 목록/현재 초안 조회 API** — 생성 후 새로고침하면 진행 중인 초안을 잃어버리는 문제의 근본 해결책.
2. **섹션 타입 확장**: `COVER`, `NEWS`, `PRAYER_TOPICS`, `SERMON_NOTE` 4개 추가 — 저장 방식이 이미 완전 자유형식 패스스루라 비용이 낮을 것으로 추정(구조 설계가 필요 없음). 표지/소식/기도제목/말씀 4탭을 실연동할 수 있게 된다.
3. **헌금/오시는 길**은 위와 별개로, jubo 섹션이 아니라 교회 설정(tenant) 쪽에 계좌정보/셔틀정보 필드를 추가하는 게 맞다는 의견(이번 사이클 범위 밖, 참고용으로만 기록).

## 비목표

- 백엔드 스키마/코드 변경 — `back` 저장소는 건드리지 않는다.
- `표지`(사진 제외 필드)/`소식`/`말씀`/`헌금`/`기도제목`/`오시는 길` 6탭 실연동 — 대응 섹션 없음, 위 범위 절 참고.
- 과거 발행 호수 조회/전환 UI — 백엔드에 "최신 발행본 1개"만 조회하는 API뿐이라 과거 호수 열람 자체가 불가능.
- 관리자 초안 복구 — 위 "관리자 초안 유실 제약" 절 참고, 이번엔 손대지 않는다.

## 테스트 계획

- `src/services/juboService.test.js`(신규 또는 전면 재작성): 10개 함수가 정확한 엔드포인트/payload로 호출되는지, `isDummy("jubo")`일 때 더미 데이터를 반환하는지.
- 공개 컴포넌트 6개 테스트(`Worship.test.jsx` 등 기존 파일 갱신): `@/services/api` 모킹 + `isDummy: () => false` 패턴으로 전환(이 세션에서 확립된 표준), 로딩/에러/재시도 상태 검증 추가. `Worship.test.jsx`는 사이드바 선택 시 순서표가 바뀌는 것도 검증.
- `src/pages/admin/JuboManage.test.jsx`(신규): 주보 생성이 `createJuboIssue`를 호출하는지, 각 섹션 저장이 올바른 `sectionType`으로 `updateJuboSection`을 호출하는지, 발행이 `publishJubo`를 호출하는지, 섹션 프리필이 기존 공개 조회 함수를 호출하는지, 조회/저장 실패 시 에러 처리가 동작하는지.
- 6개 섹션 에디터 컴포넌트는 `JuboManage.test.jsx` 안에서 통합 검증(개별 유닛 테스트는 만들지 않음 — 순수 폼 컴포넌트라 상위 통합 테스트로 충분).

## 확인 필요

- 위 "백엔드 요청 목록" 3건은 사용자가 백엔드팀과 직접 소통해야 하는 부분 — 이번 세션에서 `back` 저장소를 건드리지 않는다는 기존 지시를 그대로 따른다.
- `Worship.jsx`의 컬럼 변경("구분/1부/2부" 3열 → "역할/담당자" 2열)은 사용자가 이미 승인한 결정이지만, 실제 구현 후 화면으로 한번 더 확인받는 게 안전하다(순서표 레이아웃이 크게 바뀌는 유일한 부분).
