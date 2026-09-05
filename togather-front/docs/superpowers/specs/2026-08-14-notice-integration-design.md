# 공지사항(Notice) 실연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 다음 사이클. 공지사항은 공개 조회(`Notice.jsx`)는 실API 분기가 이미 작성돼 있지만 레거시 `USE_DUMMY` 플래그를 참조 중이고, 관리자 CRUD(`NoticesManage.jsx`)는 API 호출이 전혀 없이 `useState` 로컬 배열만 조작하는 완전 목업 상태다.

로컬 백엔드에 실제로 로그인해서 등록/수정/삭제/조회를 직접 `curl`로 실행해 검증한 결과, 세 가지 구조적 제약을 발견했다.

## 백엔드 계약 (실제 검증 완료)

| 동작 | 엔드포인트 | 비고 |
|---|---|---|
| 공개 목록 조회 | `GET /api/churches/{churchId}/notices?page&limit` | 응답 `{success, data:[{id,type,featured,title,body,date,author}]}` — 프론트 `Notice` 타입과 필드명 완전 일치. `limit` 생략 시 **기본값 10**. |
| 관리자 등록 | `POST /api/church/admin/notices` | body `{title, content, type, featured, author}`(title만 필수). 응답 `{success, data:{noticeId, title, content, createdAt}}` — type/featured/author는 응답에 없음(에코 안 됨). |
| 관리자 수정 | `PATCH /api/church/admin/notices/{noticeId}` | body `{title, content}` — **스키마 자체에 type/featured/author 없음**. 실제로 보내봐도 무시되고 기존 값이 그대로 보존됨(초기화 안 됨, 안전하지만 변경도 안 됨). |
| 관리자 삭제 | `DELETE /api/church/admin/notices/{noticeId}` | 204 No Content |

추가로 확인된 두 가지 제약:

1. **관리자 전용 목록 조회 엔드포인트가 없다.** `GET /api/church/admin/notices`는 존재하지 않는다(전체 API 감사에서 확인됨). 관리자 화면도 공개 목록 API를 재사용해야 한다.
2. **목록 응답에 총 개수 메타데이터가 전혀 없다.** `curl -D -`로 헤더까지 확인했지만 `X-Total-Count` 같은 헤더도, 응답 바디의 `totalCount` 필드도 없다. 따라서 번호 매기기 페이지네이션(`1 2 3 ... N`)은 서버 데이터만으로는 구현 불가능 — "다음 페이지가 있는지"는 오직 "받은 개수 == 요청한 limit"으로만 추론할 수 있다.

요청 필드명(`content`)과 프론트 필드명(`body`)이 다르다는 점도 서비스 레이어에서 매핑이 필요하다.

## 확정된 설계 결정

### 1. 페이지네이션 — 서버 모드/클라이언트 필터 모드 하이브리드

백엔드가 타입 필터·검색을 전혀 지원하지 않고(목록 API는 `page`/`limit`만 받는다) 총 개수도 안 주므로, 두 가지 모드를 명확히 나눈다.

**기본 모드** (`Notice.jsx`: 탭="전체" / `NoticesManage.jsx`: 탭="전체"이고 검색어 없음):
- `getNotices(churchId, { page, limit: 10 })`로 서버 페이지네이션.
- 총 개수를 모르므로 번호 매기기 UI 대신 **이전/다음 버튼만** 제공하는 신규 `PrevNextPagination` 컴포넌트를 쓴다.
- "다음" 버튼 활성 여부는 `받은 개수 === limit`으로 추론(정확히 10개를 다 받았으면 다음 페이지가 있을 수 있다고 간주, 10개 미만이면 마지막 페이지).

**필터 모드** (탭이 "공지/행사/소식"이거나, 관리자 화면에서 검색어가 입력된 경우):
- `getNotices(churchId, { limit: 1000 })`로 크게 받아온 뒤 클라이언트에서 타입/제목 필터링.
- 이 경우엔 필터링된 결과의 전체 개수를 프론트가 알고 있으므로, 기존에 쓰던 번호 매기기 페이지네이션 UI(`Notice.jsx`에 이미 있는 `Pagination` 컴포넌트)를 그대로 재사용한다.
- `NoticesManage.jsx`는 지금까지 페이지네이션 UI 자체가 없었다(더미 데이터 13건을 전부 그냥 나열). 실 API 연동 후에는 데이터가 많아질 수 있으므로 관리자 화면에도 동일한 하이브리드 페이지네이션을 새로 붙인다.

두 파일이 동일한 두 종류의 페이지네이션 UI(이전/다음, 번호 매기기)를 쓰게 되므로 컴포넌트를 공유 위치로 옮긴다:
- `src/components/common/PrevNextPagination.jsx` (신규)
- `src/components/common/NumberedPagination.jsx` (`Notice.jsx`에 있던 기존 `Pagination` 컴포넌트를 그대로 이동, 로직 변경 없음)

**받아들이는 제약**:
- 기본 모드에서 페이지당 10건만 불러오므로, `Notice.jsx`의 `?id=` 딥링크로 들어온 공지가 현재 불러온 페이지에 없으면(예: 3페이지에 있는 글을 딥링크로 바로 열었을 때) 상세 화면이 뜨지 않고 목록만 보인다. 지금까지 요구된 적 없는 시나리오이고 백엔드에 단건 조회 API도 없어(`GET /churches/{id}/notices/{noticeId}` 없음, 전체 API 감사에서 확인됨) 이번 사이클 범위 밖으로 둔다.
- 필터 모드의 `limit:1000`은 사실상 무제한 취급이다. 전체 공지가 1000건을 넘으면 1000건 이후 데이터는 필터 결과에서 누락된다. 교회 공지 게시판 규모에서는 현실적으로 발생하지 않는다고 보고 받아들인다.

### 2. 관리자 CRUD

`noticeService.js`에 3개 함수를 신규 추가한다. 관리자 엔드포인트(`/church/admin/notices`)는 v1 계약(호스트 또는 `X-Church-Id` 헤더로 테넌트 식별)을 따르므로 URL에 `churchId`가 들어가지 않는다 — 다만 이벤트 핫픽스 사이클과 동일하게 호출부 시그니처 일관성을 위해 `churchId` 파라미터 자체는 유지한다(실제로는 안 쓰임, 테넌트 식별은 `api.js`가 이미 붙이는 `X-Church-Id` 헤더가 담당).

```js
export async function createNotice(churchId, payload) {
  // payload: { type, title, body, author, featured }
  const res = await api.post(`/church/admin/notices`, {
    title: payload.title,
    content: payload.body,
    type: payload.type,
    featured: payload.featured,
    author: payload.author,
  });
  return res.data.data; // { noticeId, title, content, createdAt }
}

export async function updateNotice(churchId, noticeId, payload) {
  // payload: { title, body } — type/author/featured는 백엔드가 아예 안 받으므로 보내지 않는다
  const res = await api.patch(`/church/admin/notices/${noticeId}`, {
    title: payload.title,
    content: payload.body,
  });
  return res.data.data;
}

export async function deleteNotice(churchId, noticeId) {
  await api.delete(`/church/admin/notices/${noticeId}`);
  return { success: true };
}
```

세 함수의 더미 분기(`isDummy("notice")`일 때)는 `eventsService.js`의 `createEvent`/`updateEvent`/`deleteEvent`와 동일한 패턴을 따른다 — `DUMMY_NOTICES` 배열을 직접 `unshift`/`splice`로 조작하고, `updateNotice`의 더미 분기만 위에서 정한 대로 title/body 두 필드만 바꾼다.

**목록 갱신 전략**: 등록/수정 응답에는 type/featured/author/date가 없어 응답만으로 목록 행을 완전히 재구성할 수 없다. 따라서 낙관적 업데이트 대신, 등록/수정/삭제 성공 후 목록을 다시 불러온다(`useFetch`의 `refetch()` 호출).

**수정 모달의 읽기 전용 필드**: 백엔드가 수정 시 구분(type)/작성자(author)/상단고정(featured)을 받지 않으므로, 이 3개 필드를 수정 모달에서 편집 가능한 것처럼 보여주면 실제로는 반영되지 않는 거짓 UI가 된다. `NoticeModal`을 등록/수정 모드에 따라 분기해서, 수정 모드에서는 이 3개 필드를 회색 텍스트로 읽기 전용 표시하고("등록 시에만 설정할 수 있어요" 같은 보조 문구 추가) 제목/내용만 편집 가능하게 한다. 등록 모드는 지금처럼 5개 필드 전부 편집 가능하다.

**"조회수" 컬럼 제거**: 현재 `NoticesManage.jsx`는 목업에서 `Math.floor(Math.random()*500+10)`으로 조회수를 매번 랜덤 생성해서 보여주고 있다. 실제 백엔드 공지 응답에는 조회수 필드가 아예 없다 — 가짜 숫자를 그대로 실 데이터인 것처럼 보여주는 건 이번 세션에서 계속 지켜온 "데이터를 조작해서 맞추지 않는다" 원칙에 어긋난다. 테이블에서 "조회" 컬럼을 제거한다. (백엔드에 조회수 기능이 추가되면 그때 다시 붙인다.)

### 3. `USE_DUMMY` → `isDummy("notice")` 전환

기반 작업 사이클에서 만든 도메인별 플래그로 전환한다. `noticeService.js`의 모든 함수(`getNotices` 포함)가 `isDummy("notice")`를 참조하도록 바꾸고, `.env`의 `VITE_DUMMY_DOMAINS` 목록에서 `notice`를 제거한다.

더미 분기도 실제 API와 동일한 제약을 흉내내도록 맞춘다(더미와 실API의 동작 차이를 최소화):
- `getNotices`의 더미 분기도 `page`/`limit`이 오면 `DUMMY_NOTICES`를 슬라이스해서 반환한다(현재는 파라미터를 무시하고 항상 전체 반환).
- `updateNotice`의 더미 분기도 title/body만 바꾸고 type/author/featured는 그대로 둔다(실 API의 "수정 시 이 필드들은 무시된다" 동작을 그대로 재현 — 읽기 전용 UI가 더미 모드에서도 똑같이 자연스럽게 동작하게 하기 위함).

## 변경 대상 파일

- `src/services/noticeService.js` — `createNotice`/`updateNotice`/`deleteNotice` 추가, `getNotices` 페이지네이션 파라미터 처리 보강, `USE_DUMMY`→`isDummy("notice")` 전환.
- `src/components/common/PrevNextPagination.jsx` (신규) — 이전/다음 버튼만 있는 페이지네이션.
- `src/components/common/NumberedPagination.jsx` (신규, `Notice.jsx`의 기존 `Pagination` 컴포넌트를 이동) — 번호 매기기 페이지네이션.
- `src/pages/Notice/Notice.jsx` — 서버 모드/필터 모드 하이브리드 페칭으로 재설계, 로컬 `Pagination` 컴포넌트를 공유 컴포넌트 import로 교체.
- `src/pages/admin/NoticesManage.jsx` — 로컬 `useState` 목업 제거, 공개 목록 API 재사용 + 실 CRUD 연동 + 하이브리드 페이지네이션 신규 추가, 조회수 컬럼 제거, `NoticeModal`에 읽기 전용 모드 추가.
- `.env` — `VITE_DUMMY_DOMAINS`에서 `notice` 제거.

## 비목표

- 단건 공지 상세 조회 API 연동 — 백엔드에 해당 엔드포인트가 없다. 딥링크 제약은 위에서 받아들이기로 했다.
- 조회수 기능 백엔드 추가 요청 — back 저장소는 건드리지 않는다는 방침(이 세션 전체에 걸쳐 유지됨).
- 검색/타입 필터 서버사이드 지원 요청 — 마찬가지로 백엔드 변경이 필요해 범위 밖.

## 테스트 계획

- `src/services/noticeService.test.js` (신규): `getNotices`가 `page`/`limit` 파라미터를 그대로 전달하는지, `createNotice`가 `body`→`content` 매핑을 정확히 하는지, `updateNotice`가 `title`/`content`만 보내는지(type/author/featured를 안 보내는지), `deleteNotice`가 정확한 URL로 호출되는지 — `vi.mock("@/services/api", ...)`로 모킹.
- `src/pages/Notice/Notice.test.jsx` (기존 확장): 기본 탭에서 `getNotices`가 `{page:1, limit:10}`으로 호출되는지, 받은 개수가 10개면 "다음" 버튼이 활성화되는지, 10개 미만이면 비활성화되는지, 탭 전환 시 `{limit:1000}`으로 재요청되고 이후 클라이언트 필터링되는지.
- `src/pages/admin/NoticesManage.test.jsx` (신규 또는 기존 확장): 등록 성공 후 `createNotice` 호출 + 목록 refetch 확인, 수정 모달에서 type/author/featured가 읽기 전용(입력 불가)으로 렌더링되는지, 삭제 확인 후 `deleteNotice` 호출 + refetch 확인, 조회수 컬럼이 더 이상 렌더링되지 않는지.

## 확인 필요

없음 — 위 결정 3가지 모두 사용자 확인 완료. "조회수 컬럼 제거"만 이번 스펙 작성 중 새로 발견되어 사용자 확인 없이 원칙에 따라 결정했다 — 스펙 리뷰 단계에서 이견 있으면 조정한다.
