# 행사(Events) 실연동 설계

## 배경

"백엔드 연동" 이니셔티브([[project-backend-integration-initiative]])의 다음 사이클. 이전에 별도 핫픽스 사이클(`docs/superpowers/plans/2026-08-14-events-service-path-hotfix.md`, `835d0bc`)에서 `eventsService.js`의 실API 분기 URL/메서드 오류는 이미 고쳤다. 이번 사이클은 그 실API 분기가 실제로 켜지도록(`USE_DUMMY`→`isDummy("events")`) 전환하고, 화면이 실제 백엔드 데이터로 정상 동작하는지 검증하는 것이 목표였다.

로컬 백엔드에 실제로 로그인해서 행사 등록/조회/수정/삭제/신청을 전부 `curl`로 실행하며 검증한 결과, 공지사항 사이클보다 훨씬 큰 구조적 간극을 발견했다: **백엔드의 행사 모델에는 정원·신청기간·신청인원·등록일 개념이 아예 없다.**

## 백엔드 계약 (실제 검증 완료)

OpenAPI 스키마(`GET /v3/api-docs`)와 실제 `curl` 등록/조회/수정/삭제/신청으로 확인.

| 동작 | 엔드포인트 | 비고 |
|---|---|---|
| 공개 목록 조회 | `GET /api/churches/{churchId}/events?year&month` | 응답 `EventResponse[]`: `id,title,department,date,startTime,endTime,location,description,canRegister,imageUrl`만 존재 |
| 공개 단건 조회 | `GET /api/churches/{churchId}/events/{eventId}` | 위와 동일한 필드 |
| 관리자 등록 | `POST /api/church/admin/events` | 요청 `EventUpsertRequest`: `title,department,date,startTime,endTime,location,description,canRegister,imageUrl`(title/date만 필수). 응답도 위와 동일한 필드만 |
| 관리자 수정 | `PATCH /api/church/admin/events/{id}` | 요청/응답 스키마 동일 |
| 관리자 삭제 | `DELETE /api/church/admin/events/{id}` | 신청 이력이 없는 행사는 204. **신청 이력이 있는 행사를 삭제하면 500 에러**(`서버 오류가 발생했습니다`, code `C004`) — FK 제약으로 추정되는 백엔드 버그, 실제로 재현 확인함 |
| 신청 | `POST /api/churches/{churchId}/events/{eventId}/register` | **요청 바디 스키마 자체가 없음**(OpenAPI에 `requestBody` 미정의) — 이름/연락처/참석인원 등 아무 것도 못 받음. 응답은 `{registered: true}` 고정값뿐. 중복 호출해도 에러 없이 그대로 `{registered:true}` 반환(멱등). 로그인한 사용자가 누구인지는 JWT로만 식별, 신청자 목록으로 저장/조회하는 기능 자체가 없음 |

**구조적으로 없는 것 (검증 완료, 추측 아님)**:
- `capacity`(정원), `registrationStart`/`registrationEnd`(신청기간), `registeredCount`(신청인원) — `EventResponse`/`EventUpsertRequest` 스키마 어디에도 없음.
- `createdAt`(등록일) — 마찬가지로 스키마에 없음.
- "내가 이미 신청했는지" 다시 조회하는 API 자체가 없음 — 인증된 사용자로 단건 조회를 해봐도 등록 여부를 알려주는 필드가 응답에 없음.
- 관리자가 신청자 명단/인원을 조회하는 API가 없음.

## 확정된 설계 결정

지금 백엔드가 실제로 제공하는 필드만으로 연동하고, 없는 기능은 프론트에서 최대한 축소해 "실데이터 없는 기능을 있는 것처럼 보여주지 않는다"는 이번 세션 전체의 원칙을 지킨다. 빠진 기능은 별도로 정리해 백엔드에 이슈로 요청한다(아래 "백엔드 요청 목록" 참고).

### 1. `eventsService.js` — `isDummy("events")` 전환 + 시그니처 정리

- `USE_DUMMY` 참조를 `isDummy("events")`로 전환(공지사항 사이클과 동일 패턴).
- `registerForEvent(churchId, eventId, payload)` → `registerForEvent(churchId, eventId)`로 시그니처 단순화. 백엔드가 요청 바디를 아예 안 받으므로 프론트도 안 보낸다. 더미 분기도 동일하게 맞춰서 `payload` 인자 없이 `registeredCount`만 증가시키던 로직 대신 단순히 `{registered: true}`를 반환하도록 바꾼다(더미가 실API 제약을 재현하는 기존 관례).
- `getRecentEvents`/`EventSearch.jsx`의 "등록일 순" 정렬이 의존하던 `createdAt`이 실API에는 없으므로, `sortEvents()`의 `"createdAt"` 정렬 키를 **`id` 내림차순**으로 바꾼다. 백엔드 `id`는 자동증가 정수라 "최근 등록순"의 타당한 근사치이고, 더미/실API 양쪽에서 동일한 함수를 그대로 쓰므로 분기 없이 한 곳만 고치면 된다. UI 라벨("등록일 순")은 그대로 둔다 — 사용자에게는 "최근 등록된 것이 먼저"라는 의미가 동일하게 전달된다.
- `deleteEvent`는 URL/메서드를 그대로 두고 에러를 그대로 전파한다(서비스 레이어에서 삼키지 않음) — 신청 이력이 있는 행사의 500 에러 처리는 호출부(`EventsManage.jsx`)의 책임으로 둔다(아래 4번 참고).

### 2. 신청 기능 축소 — `eventStatus.js`, `RegistrationButton.jsx`, `EventApply.jsx` 제거

**`eventStatus.js`**: `REG_STATUS`를 `NONE`/`OPEN`/`CLOSED` 3개로 축소한다(`UPCOMING` 제거 — 신청 시작일 개념이 없어짐). `getRegistrationState(event)`는 오직 `event.canRegister`와 `event.date`만 사용한다:
- `canRegister !== true` → `NONE`
- 행사일이 이미 지남 → `CLOSED`
- 그 외(오늘 포함 미래) → `OPEN`

`capacity`/`registrationStart`/`registrationEnd`/`registeredCount` 관련 계산과 `remaining`/`opensAt`/`closesAt` 필드, `getRegistrationMessage`의 `"before"`/`"full"`/`"period_ended"` 분기를 전부 제거한다. 메시지는 `OPEN`이면 빈 문자열(버튼 라벨 "신청하기"로 충분), `CLOSED`면 "이미 종료된 행사입니다."만 남긴다. `REG_BTN_TONE`도 이제 쓰이지 않는 `UPCOMING` 키를 제거한다(`OPEN`/`CLOSED`/`NONE` 3개만 남음).

**신청 여부 로컬 추적**: 백엔드가 "내가 신청했는지" 조회를 지원하지 않으므로, 신청 성공 시 브라우저 로컬에만 기록한다. `eventStatus.js`에 두 헬퍼를 추가한다:

```js
const registeredKey = (churchId, eventId, userEmail) =>
  `event_registered_${churchId}_${eventId}_${userEmail}`;

export function isLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return false;
  return localStorage.getItem(registeredKey(churchId, eventId, userEmail)) === "true";
}

export function markLocallyRegistered(churchId, eventId, userEmail) {
  if (!userEmail) return;
  localStorage.setItem(registeredKey(churchId, eventId, userEmail), "true");
}
```

이 값은 같은 브라우저에서만 유지되고 다른 기기/브라우저에서는 초기화된다 — 백엔드에 조회 API가 생기기 전까지의 임시 방편임을 명확히 한다.

**`RegistrationButton.jsx`**: 지금은 클릭 시 `/교회행사/:id/신청` 폼 페이지로 이동만 하는 순수 표시 컴포넌트인데, 이제 클릭 자체가 신청 액션을 수행하도록 바뀐다:

```jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useAuth } from "@/contexts/auth";
import { registerForEvent } from "@/services/eventsService";
import {
  getRegistrationState,
  getRegistrationMessage,
  isLocallyRegistered,
  markLocallyRegistered,
  REG_BTN_TONE,
  REG_STATUS,
} from "@/utils/eventStatus";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

export default function RegistrationButton({ event, size = "lg", className = "" }) {
  const navigate = useNavigate();
  const { church } = useChurch();
  const { currentUser } = useAuth();
  const state = getRegistrationState(event);
  const [registered, setRegistered] = useState(
    () => !!event && isLocallyRegistered(church.id, event.id, currentUser?.email),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState(null);

  if (!event || state.status === REG_STATUS.NONE) return null;

  const handleClick = async () => {
    if (state.disabled || registered || submitting) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await registerForEvent(church.id, event.id);
      markLocallyRegistered(church.id, event.id, currentUser.email);
      setRegistered(true);
    } catch {
      setError("신청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = registered ? "신청완료" : submitting ? "신청 중..." : state.label;
  const disabled = state.disabled || registered || submitting;
  const message = registered ? "" : getRegistrationMessage(state);

  const button = (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={
        size === "sm"
          ? `flex-1 py-2.5 rounded-full text-body-5 font-semibold border transition-colors ${
              registered ? REG_BTN_TONE[REG_STATUS.CLOSED] : REG_BTN_TONE[state.status]
            } ${className}`
          : `px-16 py-3 rounded-full text-btn-normal font-semibold transition-colors ${
              registered ? REG_BTN_TONE[REG_STATUS.CLOSED] : REG_BTN_TONE[state.status]
            } ${className}`
      }
    >
      {label}
    </button>
  );

  if (size === "sm") {
    return (
      <>
        {button}
        {showLoginModal && (
          <LoginRequiredModal
            message="행사 신청은 로그인 후 이용하실 수 있습니다."
            onCancel={() => setShowLoginModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {button}
      {error && <span className="text-body-5 text-red-500">{error}</span>}
      {!error && message && <span className="text-body-5 text-grey-6">{message}</span>}
      {showLoginModal && (
        <LoginRequiredModal
          message="행사 신청은 로그인 후 이용하실 수 있습니다."
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
```

`showRemaining` prop은 제거한다(정원이 없으므로 "잔여 인원" 표시 자체가 사라짐) — `EventDetail.jsx:90`의 `<RegistrationButton event={event} size="lg" showRemaining />`에서 `showRemaining`을 뗀다.

"신청완료" 상태는 별도 색상 토큰을 새로 만들지 않고 `REG_BTN_TONE[REG_STATUS.CLOSED]`(회색·비활성 톤)을 그대로 재사용한다 — 둘 다 "더 이상 누를 수 없는 상태"라는 점에서 동일한 시각적 취급이 자연스럽고, 이번 사이클에서 디자인 토큰을 새로 추가할 필요가 없다.

**`EventApply.jsx`와 라우트 제거**: `src/pages/Events/EventApply.jsx` 파일과 `routes.jsx`의 `{ path: "교회행사/:id/신청", element: <EventApply /> }` 항목을 삭제한다. 이름/연락처/참석인원/비고를 받던 폼, 개인정보 동의 체크박스, 로그인 필요 안내 화면, 신청 완료 화면이 모두 `RegistrationButton` 자체의 인라인 처리(로그인 모달 + 버튼 상태 전환)로 흡수된다.

### 3. `EventDetail.jsx` / `Events.jsx` — 없는 필드 참조 제거

- `Events.jsx:257`의 `<span>등록일 {evt.createdAt}</span>`을 제거한다 — 실API에서 `createdAt`이 항상 `undefined`라 "등록일 undefined"로 보일 것이기 때문.
- `EventDetail.jsx:90`에서 `showRemaining` prop 제거(위 2번 참고).

### 4. `EventsManage.jsx` — 관리자 화면 정리

- "더미 모드: 새로고침 시 초기화됩니다" 안내 문구(299번째 줄)를 제거한다 — 이제 실제로 영속되므로 더 이상 사실이 아니다.
- `EventFormModal`에서 "신청 시작일"/"신청 마감일"/"정원" 입력 필드(168-200번째 줄, `form.canRegister`일 때만 보이던 회색 박스 전체)를 제거한다. 백엔드가 저장할 방법이 없는 값을 입력받는 건 거짓 UI다. "신청 받기" 체크박스(`canRegister`)는 실제로 저장되는 필드이므로 그대로 유지한다.
- `handleSubmit`이 조립하던 payload에서 `capacity`/`registrationStart`/`registrationEnd` 관련 코드(61-63번째 줄)를 제거한다.
- 테이블의 "신청현황" 컬럼(지금은 `registeredCount`/`capacity` 숫자 표시)을 인원수 없이 상태 배지만 표시하도록 바꾼다: `canRegister`가 `false`면 "-", 아니면 `getRegistrationState(e)`의 `OPEN`/`CLOSED`를 그대로 "신청가능"/"신청마감" 배지로 보여준다. 기존 `STATUS_BADGE` 객체(`open`/`upcoming`/`closed` 3개 키)에서도 더 이상 발생하지 않는 `upcoming` 키를 제거한다.
- `handleDelete`에 try/catch를 추가한다. 삭제 실패 시(신청 이력이 있는 행사를 삭제하려다 500을 받는 경우 포함) "삭제할 수 없습니다. 이미 신청 내역이 있는 행사일 수 있습니다."라는 안내를 보여주고, 목록은 그대로 둔다(현재는 에러 처리가 전혀 없어 500이 나면 콘솔에만 찍히고 아무 피드백 없이 끝남 — 이것도 이번에 같이 고친다).

### 5. `.env`

`VITE_DUMMY_DOMAINS`에서 `events`를 제거한다(이 저장소의 `.env`는 gitignore 대상이라 워크트리에 없을 수 있음 — 있으면 수정, 없으면 스킵하고 오케스트레이터가 병합 후 로컬 `.env`를 별도로 안내).

## 백엔드 요청 목록 (사용자가 별도 이슈로 등록 예정)

이번 사이클에서 실제로 API를 호출해보며 확인한, 프론트가 필요로 하지만 지금 백엔드에 없는 것들:

1. **행사 신청 시 정원/신청기간 관리** — `EventUpsertRequest`/`EventResponse`에 `capacity`(정원), `registrationStart`/`registrationEnd`(신청 기간) 필드 추가.
2. **행사별 신청 인원 집계** — `registeredCount` 같은 필드를 `EventResponse`에 추가하거나, 최소한 관리자가 신청 인원수를 조회할 수 있는 별도 API.
3. **"내가 이미 신청했는지" 조회** — 인증된 사용자 기준으로 단건/목록 조회 시 `isRegistered` 같은 필드를 포함하거나, 별도 조회 엔드포인트 추가. (현재 프론트는 이 정보를 브라우저 로컬스토리지로만 임시 추적 중 — 다른 기기에서는 신청 여부가 안 보임.)
4. **관리자용 신청자 명단 조회** — 신청 시 회원 식별자(JWT)는 서버에 남지만 조회 API가 없음. `GET /church/admin/events/{id}/registrations` 같은 형태로 신청자 목록(가능하면 회원 프로필의 연락처와 매칭)을 관리자가 볼 수 있는 API 필요.
5. **행사 등록일(`createdAt`) 노출** — "최근 등록순" 정렬을 위해 `EventResponse`에 등록 일시 필드 추가.
6. **신청 이력이 있는 행사 삭제 시 500 에러** — `DELETE /church/admin/events/{id}`가 해당 행사에 신청 이력이 있으면 500(`code: C004`, "서버 오류가 발생했습니다")을 반환함(FK 제약으로 추정). 신청 이력이 있으면 삭제를 막는 명확한 4xx 응답(예: 409 Conflict)으로 바꾸거나, 신청 이력을 함께 정리하고 삭제를 허용하도록 수정 필요.

## 비목표

- 백엔드 스키마 변경 — back 저장소는 건드리지 않는다는 방침(이 세션 전체에 걸쳐 유지). 위 목록은 어디까지나 사용자가 별도로 이슈를 등록하기 위한 참고 자료다.
- 신청 여부를 서버에 영속화하는 방법을 프론트에서 우회 구현하는 것(예: 신청 내역을 별도 프론트 전용 백엔드에 저장) — 범위 밖, 로컬스토리지 임시 방편으로 충분하다고 판단.
- `EventSearch.jsx`의 검색/정렬 로직 자체를 바꾸는 것 — 이미 핫픽스 사이클에서 클라이언트 필터링 방식으로 정리됐고, 이번엔 정렬 키(`createdAt`→`id`)만 손본다.

## 테스트 계획

- `src/services/eventsService.test.js`(기존 확장): `registerForEvent`가 새 시그니처(`churchId, eventId`만, payload 없음)로 `POST`하는지, `getRecentEvents`가 `id` 내림차순으로 정렬하는지(기존 `createdAt` 기준 테스트를 `id` 기준으로 교체), `isDummy` 모킹 방식은 공지사항 사이클과 동일(`{ default: {...}, isDummy: () => false }`).
- `src/utils/eventStatus.test.js`(신규): `getRegistrationState`가 `canRegister`+`date`만으로 `NONE`/`OPEN`/`CLOSED`를 올바르게 판단하는지(정원/신청기간 관련 케이스는 전부 삭제), `isLocallyRegistered`/`markLocallyRegistered`가 `localStorage`를 올바르게 읽고 쓰는지.
- `src/components/events/RegistrationButton.test.jsx`(신규): 로그인 안 한 상태에서 클릭 시 `LoginRequiredModal`이 뜨는지, 로그인한 상태에서 클릭 시 `registerForEvent`를 호출하고 버튼이 "신청완료"로 바뀌는지, 이미 로컬에 신청 기록이 있으면 처음부터 "신청완료"로 렌더링되는지, API 실패 시 에러 메시지가 뜨는지.
- `src/pages/admin/EventsManage.test.jsx`(신규): 등록/수정 모달에 정원·신청기간 입력 필드가 없는지, 삭제 실패(500) 시 에러 안내가 뜨고 목록은 유지되는지, "신청현황" 컬럼이 숫자 없이 상태 배지만 보여주는지.
- `routes.test.jsx`(기존 확장): `교회행사/:id/신청` 경로가 더 이상 존재하지 않는지 확인(또는 해당 라우트 검증 테스트가 있었다면 제거).

## 확인 필요

없음 — 위 결정 전부 사용자와 직접 확인(신청 기능 축소 방향, 폼 페이지 제거+버튼 즉시신청, 관리자 컬럼을 상태배지로 축소, 백엔드 요청 목록 작성)을 거쳤다.
