# 교적부(Member Registry) 실연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 "화면은 있는데 API 미연동 24건" 배치 중 두 번째 서브프로젝트. 이번 사이클의 실제 대상은 `MembersManage.jsx`(관리자 교인 관리)의 "교인 목록" 탭 하나다 — `Gyojeokbu.jsx`(일반 교인용 교적부)도 당초 함께 다루려 했으나, 아래에서 설명하는 백엔드 권한 문제로 이번 사이클에서는 제외하고 더미 상태 그대로 둔다(사용자와 이 판단을 두 차례 재확인함). 두 화면 다 지금은 `src/config/members.config.js`라는 정적 목업 파일만 참조하고 API 호출이 전혀 없었다.

**가입 승인("승인 대기" 탭)은 이번 사이클 범위에서 제외한다** — 백엔드에 `POST .../signup-requests/{id}/approve`, `/reject` 두 엔드포인트만 있고, 대기 중인 가입 신청 목록을 조회하는 GET API가 아예 없다(swagger·컨트롤러 소스·`api-spec-v2.md` 전부 확인, 목록 조회 자체가 없음이 확실함). 목록을 가져올 방법이 없어 이 탭은 지금 상태(더미 `DUMMY_PENDING`) 그대로 두고 손대지 않는다 — 사용자가 백엔드에 별도로 목록 API 추가를 요청하기로 함.

**`Gyojeokbu.jsx`(일반 교인용 교적부)도 이번 사이클 범위에서 제외한다** — 백엔드 `SecurityConfig.java`를 확인한 결과 `/api/church/admin/members`는 `.requestMatchers("/api/church/admin/**").hasRole("CHURCH_ADMIN")`로 가드되어 있다. `Gyojeokbu.jsx`는 지금 일반 교인(관리자 아님)도 접근 가능한 화면인데(기존 테스트에 명시: "일반 교인으로 로그인하면 교인 목록이 보이고"), 이 엔드포인트를 그대로 연결하면 일반 교인은 403을 받아 아무것도 못 보게 된다 — 지금의 더미 모드보다 후퇴하는 회귀다. 백엔드에 일반 교인용(비관리자) 교적부 조회 API가 생기기 전까지 `Gyojeokbu.jsx`는 더미 상태 그대로 두고, **이번 사이클은 `MembersManage.jsx`(관리자, 원래도 CHURCH_ADMIN 전용 화면이라 권한 문제 없음)의 "교인 목록" 탭만 연동한다.**

## 백엔드 계약 (실제 컨트롤러 소스로 확인, `ChurchAdminMemberController.java`)

| 동작 | 엔드포인트 | 응답 필드 |
|---|---|---|
| 목록 조회 | `GET /api/church/admin/members?keyword&page&size` | `PageResponse<MemberSummaryResponse>`: `content:[{id(UUID), name, birthDate, phone(중간마스킹 "010-****-1234"), newcomer(bool), registeredAt}], pageInfo:{page,size,totalElements,totalPages,hasNext,hasPrevious}` |
| 상세 조회 | `GET /api/church/admin/members/{publicId}` | `{id, name, birthDate, phone(마스킹 없음, 원문), newcomer, registeredAt, hasAccount(bool)}` |

- `page`는 Spring Data 표준 **0-based**다(`@RequestParam(defaultValue="0")`) — 방금 공지사항 사이클에서 겪은 것과 같은 함정이라 처음부터 주의한다.
- `keyword`는 서버에서 `name LIKE %keyword%` 또는 `phone LIKE %keyword%`로 검색한다(`MemberRegistryJpaRepository.searchByKeyword`) — 구역/소그룹 등은 검색 대상이 아니다(애초에 필드 자체가 없음).
- `size` 기본값 20.
- **생성/수정/삭제 API가 없다** — `ChurchAdminMemberController`는 `GET` 2개뿐이다. "교인 등록"/"삭제" 버튼은 호출할 API가 없다.
- **엑셀 내보내기 API가 없다** — "엑셀 다운로드" 버튼도 호출할 API가 없다.

**구조적으로 없는 것(검증 완료)**: 직분/역할(role), 구역(region)·구역장(regionLeader), 소그룹(smallGroup), 부서(department), 성별(gender), 이메일(email, 목록/상세 어디에도 없음), 주소(address), 세례일(baptism), 출석 이력·출석률(attendanceYTD, lastAttend), 가족관계(family), 이력(history), 목회메모(notes), 로마자 이름(nameRoman), 아바타 색상 인덱스(avatarTone) — 지금 `members.config.js`와 두 화면이 쓰는 필드의 대부분이 백엔드에 없다.

## 확정된 설계 결정

백엔드가 실제로 주는 필드만으로 화면을 다시 그린다. 없는 기능은 UI에서도 완전히 제거한다(행사 사이클과 동일한 원칙 — 실데이터 없는 기능을 있는 것처럼 보여주지 않는다).

### 1. `memberService.js` 신규 생성

```js
import api, { isDummy } from "./api";
import { DUMMY_MEMBERS } from "@/data/dummy/members";

/**
 * @typedef {Object} MemberSummary
 * @property {string} id            - UUID
 * @property {string} name
 * @property {string} birthDate     - "YYYY-MM-DD"
 * @property {string} phone         - 목록: 중간 마스킹("010-****-1234"), 상세: 원문
 * @property {boolean} newcomer
 * @property {string} registeredAt  - ISO datetime
 */

const DEFAULT_SIZE = 20;

/**
 * 교적부 목록 조회 (관리자)
 * @param {string} churchId
 * @param {{ keyword?:string, page?:number, size?:number }} params - page는 1-based(프론트 관례), 내부에서 0-based로 변환
 * @returns {Promise<{ members: MemberSummary[], pageInfo: object }>}
 */
export async function getMembers(churchId, { keyword, page = 1, size = DEFAULT_SIZE } = {}) {
  if (isDummy("member")) {
    const filtered = keyword
      ? DUMMY_MEMBERS.filter((m) => m.name.includes(keyword) || m.phone.includes(keyword))
      : DUMMY_MEMBERS;
    const start = (page - 1) * size;
    const content = filtered.slice(start, start + size);
    return {
      members: content,
      pageInfo: {
        page: page - 1,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        hasNext: start + size < filtered.length,
        hasPrevious: page > 1,
      },
    };
  }
  const res = await api.get(`/church/admin/members`, {
    params: { keyword: keyword || undefined, page: page - 1, size },
  });
  return { members: res.data.data.content, pageInfo: res.data.data.pageInfo };
}

/**
 * 교적부 상세 조회 (관리자)
 * @param {string} churchId
 * @param {string} publicId
 * @returns {Promise<MemberSummary & { hasAccount:boolean }>}
 */
export async function getMemberDetail(churchId, publicId) {
  if (isDummy("member")) {
    const found = DUMMY_MEMBERS.find((m) => String(m.id) === String(publicId));
    return found ? { ...found, hasAccount: true } : null;
  }
  const res = await api.get(`/church/admin/members/${publicId}`);
  return res.data.data;
}
```

- `page`는 공지사항 사이클에서 확정한 관례대로 **1-based로 받아 서비스 레이어에서 `page - 1`로 변환**한다(호출부는 항상 1-based만 다룸).
- `isDummy("member")` 신규 도메인 플래그. `USE_DUMMY`(레거시) 전환 대상엔 없었으므로 새로 추가.
- churchId는 URL에 안 쓰인다(`/church/admin/members`는 host+`X-Church-Id` 기반) — 다른 관리자 엔드포인트와 동일한 패턴, 시그니처에는 일관성을 위해 유지만 한다(다른 서비스 함수들과 동일 관례).

### 2. 더미 데이터 축소 — `src/data/dummy/members.js` 신규

기존 `src/config/members.config.js`(15개 필드짜리 풍부한 목업)를 대체한다. 새 더미는 백엔드 응답과 동일한 6개 필드만 가진 배열(`id, name, birthDate, phone, newcomer, registeredAt`) — 약 15명 규모로 새로 작성. `members.config.js`는 `MembersManage.jsx`(교인 목록 탭)에서만 쓰이던 것을 확인했으므로(`Gyojeokbu.jsx`는 이번 사이클에서 손대지 않지만 이 파일을 계속 참조해야 하므로 삭제하지 않는다 — 아래 참고) **삭제하지 않고 그대로 둔다.**

### 3. `MembersManage.jsx` "교인 목록" 탭 재설계

**`Gyojeokbu.jsx`는 이번 사이클에서 전혀 건드리지 않는다** — 위에서 결정한 대로 백엔드에 일반 교인용 조회 API가 없어 지금의 `members.config.js` 더미 그대로 유지한다. 따라서 `members.config.js` 파일 자체는 삭제하지 않는다(`Gyojeokbu.jsx`가 계속 참조함).

("승인 대기" 탭은 위에서 결정한 대로 이번 사이클에서 손대지 않는다 — `DUMMY_PENDING` 그대로 유지.)

**제거**: 부서/직책 필터 드롭다운(필드 없음), "교인 등록" 버튼(생성 API 없음), "엑셀 다운로드" 버튼(내보내기 API 없음), "삭제" 액션 버튼(삭제 API 없음).

**유지·변경**:
- 검색창 → `Gyojeokbu.jsx`와 동일하게 서버 사이드 `keyword` 검색(디바운스) + 서버 페이지네이션(`PrevNextPagination`).
- 테이블 컬럼: No / 이름 / 생년월일 / 연락처(마스킹) / 등록일 / 신규 배지 / 관리(상세). 부서·직책·이메일 컬럼 제거.
- "상세" 버튼 → 클릭 시 `getMemberDetail` 호출 결과를 보여주는 간단한 모달(이름/생년월일/전화 원문/등록일/신규여부/계정연동여부) — `Gyojeokbu.jsx`의 드로어와 별도로, 관리자 화면 기존 패턴(`EventsManage.jsx`의 `EventFormModal`처럼 중앙 모달)을 따른다.

## 백엔드 요청 목록 (사용자가 별도 이슈로 등록 예정)

1. **가입 승인 대기 목록 조회 API** — `GET /api/church/admin/signup-requests?status=PENDING` 같은 형태. 지금은 승인/거절 엔드포인트만 있고 무엇을 승인할지 알 방법이 없다. (이번 사이클에서 "승인 대기" 탭을 손대지 못한 직접적 이유.)
2. **교적부 생성/수정/삭제 API** — 지금은 조회 2개뿐이라 관리자가 교인을 직접 등록/삭제할 방법이 없다.
3. **교적부 CSV/엑셀 내보내기 API**.
4. **교적부 확장 필드** — 직분·구역·소그룹·부서 등 실제 교회 운영에 필요한 필드들이 도메인에 아예 없음. 최소한 "직분"과 "구역" 정도는 다음 우선순위로 요청.

## 비목표

- 백엔드 스키마 변경 — back 저장소는 건드리지 않는다.
- "승인 대기" 탭 연동 — 위 사유로 이번 사이클 범위 밖, 목록 API가 생기면 별도 사이클로 진행.
- 교적부 생성/수정/삭제 UI — 대응 API가 없어 범위 밖.
- 페이지 경계를 넘는 드로어 이전/다음 네비게이션 — 범위 밖(필요시 후속 개선).

## 테스트 계획

- `src/services/memberService.test.js`(신규): `getMembers`가 1-based `page`를 0-based로 변환해 `GET /church/admin/members`를 호출하는지, `keyword` 파라미터가 그대로 전달되는지, `getMemberDetail`이 `GET /church/admin/members/{publicId}`를 호출하는지. `isDummy` 모킹은 기존 사이클과 동일 패턴.
- `src/pages/admin/MembersManage.test.jsx`(전면 교체 — 기존 테스트는 전부 `members.config.js`의 부서/직책 클라이언트 필터에 의존해 이번 변경으로 전제 자체가 사라짐): "교인 목록" 탭이 `getMembers`로 렌더되는지, 검색어 입력이 디바운스 후 서버 `keyword` 검색을 호출하는지, 부서/직책 필터·교인등록·엑셀다운로드·삭제 버튼이 존재하지 않는지, "상세" 클릭 시 `getMemberDetail` 모달이 뜨는지, "승인 대기" 탭은 기존 더미 동작 그대로인지(회귀 확인 — 탭 전환 자체가 깨지지 않는지).
- `Gyojeokbu.jsx`는 이번 사이클에서 코드를 바꾸지 않으므로 기존 `Gyojeokbu.test.jsx`는 그대로 둔다(수정 없음, 회귀 없어야 함).

## 확인 필요

없음 — 위 결정 전부 사용자와 직접 확인을 거쳤다(가입승인 스킵, 백엔드 없는 필드 전면 제거, 그리고 `Gyojeokbu.jsx` 제외 여부는 권한 문제를 명시적으로 설명한 뒤 재확인까지 받음).
