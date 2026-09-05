# 갤러리 관리자 CRUD 신규 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 다음 사이클. 2026-08-14 전체 API 감사에서 "화면 자체가 없는 도메인" 2건 중 하나로 분류됐던 갤러리 관리자 기능을 신규 설계·구현한다. 공개 갤러리(`Gallery.jsx`)는 조회만 가능하고, 공동체/사진을 등록·삭제하는 관리자 화면이 지금까지 아예 없었다.

이전 사이클들(교적부, 주보, 마이페이지)과 달리 백엔드 도메인이 **애초에 "프론트 Photo/Community shape"으로 설계**돼 있어(`ChurchesGalleryController`/`ChurchAdminGalleryController` 주석에 명시) 필드 축소가 거의 필요 없다 — 이번 사이클의 핵심은 연동이 아니라 **신규 관리자 화면 설계**다.

## 백엔드 계약 (실제 컨트롤러/도메인 소스로 확인)

| 동작 | 엔드포인트 | 필드 |
|---|---|---|
| 공동체 목록(공개) | `GET /api/churches/{churchId}/communities` | `{id, name, desc}` — 이미 `galleryService.js`에 정확히 연동돼 있음(레거시 `USE_DUMMY` 게이트만 전환 필요) |
| 사진 목록(공개) | `GET /api/churches/{churchId}/gallery?communityId&page&limit` | `{id, communityId, title, date, desc, imageUrl}`, `page` 0-based 기본 0, `limit` 기본 12 |
| 공동체 등록(관리자) | `POST /api/church/admin/communities` | 요청: `name(필수), desc, orderNo`. 응답: `{id, name, desc, orderNo}` |
| 사진 등록(관리자) | `POST /api/church/admin/gallery` | 요청: `communityId(필수), title(필수), date, desc, imageUrl` — 전부 문자열, `date`는 자유 형식("2025년 8월 2일" 같은 표시용 문자열, `LocalDate` 아님). 응답: `{id, communityId, title}`만(등록 폼 값을 그대로 재사용하면 됨) |
| 사진 삭제(관리자) | `DELETE /api/church/admin/gallery/{photoId}` | 응답 없음(204) |

- **공동체/사진 수정 API, 공동체 삭제 API가 없다.** 등록·삭제(사진만)뿐이다.
- **검색/필터/CSV 내보내기 API가 없다.**
- 사진 등록은 파일 업로드가 아니라 `imageUrl` 문자열을 그대로 받는다 — `EventsManage.jsx`의 이미지 URL 입력 패턴과 동일하게 처리한다.
- `date`는 자유 형식 문자열이라 형식 검증 없이 그대로 보낸다(더미 데이터의 "2025년 8월 2일" 같은 표기를 그대로 써도 되고, 관리자가 직접 입력한 값을 그대로 저장).

**참고(이번 사이클 범위 밖, 확인 필요로 기록)**: 공개 `Gallery.jsx`의 `PhotoGrid`가 `getPhotos(church.id, {communityId})`를 `limit` 없이 호출하는데, 백엔드 기본값이 `limit=12`라 한 공동체에 사진이 13장을 넘으면 뒤 사진이 응답에서 아예 빠진다. 관리자가 사진을 아무리 등록해도 공개 화면엔 최대 12장만 보이는 셈이다. 이번 사이클은 관리자 화면만 다루므로 손대지 않고, 다음에 짚어볼 사항으로만 남긴다.

## 확정된 설계 결정

### 1. `galleryService.js` 전환 + 관리자 함수 추가

```js
import api, { isDummy } from "./api";
import { DUMMY_COMMUNITIES, DUMMY_PHOTOS } from "@/data/dummy/gallery";

/**
 * @typedef {{ id:number, name:string, desc:string }} Community
 * @typedef {{ id:number, communityId:number, title:string, date:string,
 *   desc:string, imageUrl:string|null }} Photo
 */

export async function getCommunities(churchId) {
  if (isDummy("gallery")) return DUMMY_COMMUNITIES;
  const res = await api.get(`/churches/${churchId}/communities`);
  return res.data.data;
}

export async function getPhotos(churchId, params = {}) {
  if (isDummy("gallery")) {
    const { communityId } = params;
    return communityId ? DUMMY_PHOTOS.filter((p) => p.communityId === communityId) : DUMMY_PHOTOS;
  }
  const res = await api.get(`/churches/${churchId}/gallery`, { params });
  return res.data.data;
}

/**
 * 공동체 등록 (관리자)
 * @param {string} churchId
 * @param {{ name:string, desc?:string }} payload
 * @returns {Promise<Community>}
 */
export async function createCommunity(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_COMMUNITIES.push(created);
    return created;
  }
  const res = await api.post(`/church/admin/communities`, payload);
  return res.data.data;
}

/**
 * 사진 등록 (관리자)
 * @param {string} churchId
 * @param {{ communityId:number, title:string, date?:string, desc?:string, imageUrl?:string }} payload
 * @returns {Promise<Photo>}
 */
export async function createPhoto(churchId, payload) {
  if (isDummy("gallery")) {
    const created = { id: Date.now(), ...payload };
    DUMMY_PHOTOS.unshift(created);
    return created;
  }
  const res = await api.post(`/church/admin/gallery`, payload);
  // 응답이 {id, communityId, title}뿐이라 나머지 필드는 제출 폼 값으로 채워 반환한다.
  return { ...payload, id: res.data.data.id };
}

/**
 * 사진 삭제 (관리자)
 * @param {string} churchId
 * @param {number} photoId
 */
export async function deletePhoto(churchId, photoId) {
  if (isDummy("gallery")) {
    const idx = DUMMY_PHOTOS.findIndex((p) => p.id === photoId);
    if (idx !== -1) DUMMY_PHOTOS.splice(idx, 1);
    return;
  }
  await api.delete(`/church/admin/gallery/${photoId}`);
}
```

### 2. 신규 `GalleryManage.jsx` — `/admin/gallery`

기존 관리자 화면(`EventsManage.jsx`, `NoticesManage.jsx`) 패턴을 그대로 따른다: 카드형 목록 + "등록" 버튼이 여는 모달 폼, 삭제는 `confirm()` 후 실행.

**공동체 관리 섹션**:
- 공동체 카드 그리드(이름 + 설명, 아바타는 공개 화면과 동일하게 이름 첫 글자).
- "공동체 등록" 버튼 → 모달(`name` 필수, `desc` 선택) → `createCommunity` 호출 → 성공 시 목록에 추가.
- 수정/삭제 API가 없으므로 그 버튼들은 만들지 않는다.

**사진 관리 섹션**:
- 공동체 선택 탭(또는 드롭다운) — 선택된 공동체의 사진만 `getPhotos(church.id, {communityId})`로 조회.
- 사진 그리드(썸네일 + 제목), "사진 등록" 버튼 → 모달(`communityId`는 현재 선택된 공동체로 고정, `title` 필수, `date`/`desc`/`imageUrl` 선택) → `createPhoto` 호출 → 성공 시 그리드에 추가.
- 각 사진에 삭제 버튼 → `confirm("삭제하시겠습니까?")` → `deletePhoto` 호출 → 성공 시 그리드에서 제거, 실패 시 에러 안내(이번 세션에서 확립된 패턴 — try/catch + 에러 state + 중복 클릭 방지, `InfoTab.jsx`/`WorshipManage.jsx`의 fix wave 이후 코드를 참고).
- 공동체를 아직 하나도 선택 안 한 초기 상태에는 "공동체를 먼저 선택해 주세요" 안내.

**공통**: 등록 폼 제출 버튼은 진행 중(`submitting`) 동안 비활성화하고 라벨을 "등록 중..."으로 바꾼다(이번 세션에서 반복적으로 지적된 중복 제출 문제를 처음부터 피한다). 목록 조회(`getCommunities`/`getPhotos`) 실패 시에도 "불러오지 못했습니다. 다시 시도해 주세요." + 재시도 버튼을 처음부터 넣는다(마이페이지 사이클 최종 리뷰에서 지적된 것과 동일한 패턴을 이번엔 최초 구현부터 반영).

### 3. 라우팅 + 사이드바 메뉴 추가

- `src/routes.jsx`: `GalleryManage` import 추가, admin 라우트 배열에 `{ path: "gallery", element: <GalleryManage /> }` 추가(`members`와 `jubo` 사이 등 자유로운 위치).
- `src/layouts/AdminLayout.jsx`: nav 배열에 `{ label: "갤러리 관리", to: "/admin/gallery", icon: IcoGallery }` 추가.
- 신규 아이콘 `src/assets/icon-svg/admin-gallery-white.svg` 생성 — 기존 `admin-file-white.svg`와 동일한 스타일(20x20 viewBox, `stroke="#EEF0F2"`, `stroke-width="1.4"`)로 사진/이미지를 나타내는 심플한 라인 아이콘(사각 프레임 + 산 모양 + 원 = 전형적인 "이미지" 아이콘).

### 4. 더미 데이터

기존 `src/data/dummy/gallery.js`의 `DUMMY_COMMUNITIES`/`DUMMY_PHOTOS`를 그대로 재사용한다(이미 백엔드 필드와 정확히 일치하는 shape이라 새로 만들 필요 없음).

## 백엔드 요청 목록 (사용자가 별도 이슈로 등록 예정)

1. **공동체/사진 수정 API** — 등록 후 오타 수정 등을 할 방법이 없다.
2. **공동체 삭제 API** — 등록만 있고 삭제가 없다.
3. **갤러리 검색/필터 API** — 관리자가 사진이 많아지면 찾기 어렵다.

## 비목표

- 백엔드 스키마 변경 — back 저장소는 건드리지 않는다.
- 공동체/사진 수정 UI, 공동체 삭제 UI — 대응 API가 없어 범위 밖.
- 공개 `Gallery.jsx`의 `limit` 파라미터 누락 수정 — 위에서 설명한 대로 이번 사이클 범위 밖, 별도 확인 필요 사항으로만 기록.
- 이미지 파일 업로드(스토리지 연동) — 백엔드가 URL 문자열만 받으므로 범위 밖.

## 테스트 계획

- `src/services/galleryService.test.js`(신규): 4개 함수(`createCommunity`/`createPhoto`/`deletePhoto` + 기존 `getCommunities`/`getPhotos`의 `isDummy` 전환 확인)가 정확한 엔드포인트/payload로 호출되는지.
- `src/pages/admin/GalleryManage.test.jsx`(신규): 공동체 목록이 렌더되는지, 공동체 등록이 `createCommunity`를 호출하는지, 공동체 선택 시 해당 사진만 조회되는지, 사진 등록이 `createPhoto`를 호출하는지, 사진 삭제가 `deletePhoto`를 호출하고 목록에서 제거되는지, 조회 실패 시 재시도 버튼이 동작하는지.

## 확인 필요

- 공개 `Gallery.jsx`의 사진 목록 `limit` 누락(위 "참고" 항목) — 별도 사이클에서 처리할지 사용자 확인 필요. 그 외 결정은 전부 사용자와 직접 확인(짧은 설계 제시 후 승인)을 거쳤다.
