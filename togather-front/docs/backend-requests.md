# 백엔드 요청 사항

작성일: 2026-09-26
작성: 프론트엔드 (togather-front)
기준 백엔드: `/Users/myewon/Desktop/back` (main), `docs/api-spec-v2.md`

프론트 전체 감사(하드코딩 데이터 · 미연동 API 점검) 결과 정리한 요청 목록입니다.
**이번 감사에서 프론트가 이미 연결을 마친 항목은 요청에 포함하지 않았습니다** (아래 §5 참고).

우선순위 기준

- **P1** — 화면이 가짜 데이터로 동작 중. 실서비스 배포 전 반드시 필요
- **P2** — 화면은 있으나 기능이 반쪽. 운영 시작 후 곧 필요
- **P3** — 개선/확인 요청

---

## 1. P1 — 교적부(MemberRegistry) 필드 확장

### 현황

`/교적부` 화면(`src/pages/Gyojeokbu/Gyojeokbu.jsx`)이 백엔드 대신
프론트 번들에 포함된 `src/config/members.config.js`(가상 인물 12명)를 렌더하고 있습니다.

연결을 시도했으나 **현재 API로는 화면을 채울 수 없어 보류**했습니다.

| API | 제공 필드 |
| --- | --- |
| `GET /api/church/members` (교인용 명부) | `id, name, role, region, department, smallGroup` |
| `GET /api/church/admin/members/{publicId}` (관리자) | 위 + `birthDate, phone, newcomer, registeredAt, hasAccount` |

### 화면이 필요로 하는데 `MemberRegistry`에 없는 필드

| 필드 | 용도 | 비고 |
| --- | --- | --- |
| `email` | 상세 연락처 | |
| `address` | 상세 정보 / 세대 집계 | PII |
| `baptismDate` | 세례일 | |
| `regionLeader` | 구역장 표시 | `region`으로 역참조 가능하면 불필요 |
| `note` | 관리자 메모 | |
| `family[]` | `{ relation, name, memberId? }` — 가족 관계 | 별도 테이블 필요 |
| `history[]` | `{ year, text }` — 등록/임직 이력 | 별도 테이블 필요 |
| `lastAttendedAt`, `attendanceCount/total` | 최근 출석 · 누적 출석 | 출석 도메인 자체가 없음(§3과 동일) |

### 요청

1. 위 필드 중 **어디까지 지원 예정인지** 알려주세요. 지원 범위가 정해지면 프론트가 화면을 그 범위로 맞춰 재구성하겠습니다.
2. `family` / `history`는 스키마가 커서, **이번 범위에서 제외한다면 제외한다고 확정**해 주세요. 그러면 해당 UI를 삭제하겠습니다.
3. 상세 조회용 엔드포인트 관련 확인
   - 일반 교인이 다른 교인의 상세를 볼 수 있어야 하는지 (정책 확인 필요)
   - 가능하다면 `GET /api/church/members/{publicId}` (PII 제외 상세) 추가 요청

### 참고

`member-registry-access-design`의 PII 비노출 원칙은 이해했습니다.
다만 현재 프론트 화면은 연락처·주소를 노출하는 전제로 설계돼 있어, **화면 스펙을 바꿀지 / API를 확장할지 결정이 필요**합니다.

---

## 2. P1 — 계정 ↔ 교적부 연동 (마이페이지 프로필)

### 현황

`/mypage`의 내 정보 · 소속 탭이 `src/components/mypage/mockData.js`의
`MOCK_USER` / `MOCK_DEPT` / `MOCK_GROUPS` 하드코딩을 그대로 렌더합니다.
로그인해도 **모든 사용자에게 "김민수 장로"가 표시**됩니다.

`FrontAuthController` 주석에 이미 인지된 항목으로 보입니다.

> 표시명(name)은 계정-교적부 연동(P8) 전까지 null이다.

### 요청

`GET /api/my/profile` (로그인 사용자 본인 정보) 추가를 요청합니다. 본인 정보이므로 PII 포함이 가능할 것으로 보입니다.

```jsonc
{
  "name": "김민수",
  "email": "...",
  "phone": "...",
  "birthDate": "1972-04-18",
  "role": "장로",           // 직분
  "region": "1구역",
  "department": "남선교회 1지회",
  "smallGroup": "1조",
  "registeredAt": "2014-03-09",
  "baptismDate": "2002-05-19"  // §1에서 추가된다면
}
```

추가로 소속 그룹 목록(`MOCK_GROUPS` 대응)이 별도 개념이라면
`GET /api/my/groups` → `[{ id, name, role, meetingInfo, memberCount }]` 형태를 함께 검토 부탁드립니다.

### 임시 대응

P8 연동 전까지는 최소한 **로그인 응답의 `FrontUser.name`만이라도 채워주시면**,
프론트가 하드코딩 이름을 지우고 실제 이름을 표시하도록 바꾸겠습니다.

---

## 3. P2 — 신규 도메인 API (현재 백엔드에 없음)

아래 화면들은 백엔드에 대응 도메인이 없어, 교회별 데이터를
`src/config/church.config.js`로 옮겨둔 상태입니다(배포 시 코드 수정 필요 = 교회가 직접 못 고침).

교회소개(`intro`)처럼 **섹션별 JSONB passthrough 방식**이면 프론트 shape 그대로 저장/조회가 가능해 가장 빠르게 붙일 수 있습니다.

| # | 화면 | 현재 위치 (church.config 키) | 제안 |
| --- | --- | --- | --- |
| 3-1 | 주일학교 (부서 4개) | `sundaySchool` | `intro` 섹션 타입에 `SUNDAY_SCHOOL` 추가 |
| 3-2 | 전도회 소개 | `evangelism` | `EVANGELISM` |
| 3-3 | 국내외 선교 | `missions` | `MISSIONS` |
| 3-4 | 선교지 소식 | `missionNews` | 게시물 성격 → §3-7과 함께 게시판으로 |
| 3-5 | 구역 모임 | `districtMeetings` | `DISTRICT_MEETINGS` (주보 `DISTRICTS`와 중복 검토) |
| 3-6 | 제자훈련 · 양육 프로그램 | `discipleTraining`, `nurturePrograms` | `DISCIPLE_TRAINING`, `NURTURE_PROGRAMS` |
| 3-7 | 양육·훈련 게시판 | `Nurture.jsx`의 `BOARD_POSTS` | 아래 별도 설명 |

### 3-5 중복 확인 필요

주보의 `DISTRICTS` 섹션과 양육·훈련의 "구역 모임"이 **같은 데이터인지** 확인 부탁드립니다.
같다면 프론트가 주보 API(`GET /api/churches/{id}/jubo/districts`)를 재사용하겠습니다.
단, 주보 섹션은 발행본에 묶여 있어 "현재 구역 편성" 조회와는 성격이 다를 수 있습니다.

### 3-7 양육·훈련 게시판

게시물(제목/본문/작성자/작성일/카테고리 `공지|후기|나눔`) + 검색 + 카테고리 필터 + 페이지네이션이 필요합니다.
**기존 공지(`notice`) 도메인에 게시판 종류 구분을 추가**하는 방식이 가장 간단해 보이는데, 어떻게 보시는지 의견 부탁드립니다.

- 안 A: `notice`에 `boardType` 추가 (`ANNOUNCEMENT` | `NURTURE` | `MISSION_NEWS`)
- 안 B: 범용 게시판 도메인 신설

---

## 4. P2 / P3 — 기타 확인 및 요청

### 4-1. (P2) 교회 기본 정보 — 교회 관리자 수정 권한

현재 교회명·주소·전화·팩스·이메일·담임목사·교단·유튜브 채널은
`PATCH /api/admin/churches/{id}/settings` (**SUPER_ADMIN 전용**)로만 수정 가능합니다.

이 때문에 관리자 화면(`/admin/settings`)에서 해당 항목을 **조회 전용**으로 표시하고
"수정이 필요하면 ToGather 운영팀에 요청" 안내를 넣어둔 상태입니다.

교회 관리자가 직접 수정하는 게 맞다면 `PUT /api/church/admin/church-info` 같은
CHURCH_ADMIN 엔드포인트를 요청합니다. **운영 정책상 현재가 의도된 것이라면 그대로 두겠습니다** — 확인만 부탁드립니다.

### 4-2. (P2) 로고 / 파비콘 / 배너 이미지 업로드

관리자 화면에 업로드 UI만 있고 동작하지 않습니다.
현재 배너는 **URL 입력** 방식으로 우회했습니다(`representativeImageUrl`).
`api-spec-v2.md`의 후속 과제 "파일 업로드(S3)"에 포함된 것으로 이해하고 있으며, 일정만 공유해 주시면 됩니다.

갤러리 사진 등록도 동일하게 URL 입력 방식입니다.

### 4-3. (P3) 출석 통계

관리자 대시보드에 "주간 출석 현황" 차트와 "이번 주 출석" 카드가 하드코딩돼 있었습니다.
**출석 도메인 자체가 없어 해당 UI를 제거**하고, 교인 수 · 가입 대기 · 예정 행사 · 최근 공지로 대체했습니다.

출석 관리가 로드맵에 있다면 알려주세요. 없다면 이대로 유지하겠습니다.

### 4-4. (P3) `GET /api/church/bulletins` 사용처 확인

`bulletin` 도메인(`{id, worshipDate, content}`)이 있는데, 스마트 주보는
`jubo` 도메인(`/api/churches/{id}/jubo/**`)으로 구현돼 있어 프론트는 `jubo`만 사용합니다.

`bulletin`이 **구버전이라 제거 예정인지**, 아니면 별도 용도인지 확인 부탁드립니다.
별도 용도라면 어떤 화면에 붙어야 하는지 알려주세요.

### 4-5. (P3) 찬양 · 예배 안내 — 프론트 화면 없음 (백엔드 조치 불필요)

아래는 백엔드가 구현돼 있으나 **프론트에 대응 화면이 없어** 미연동인 항목입니다.
프론트 쪽 과제이며, 기획 확정 후 저희가 붙이겠습니다. 참고용으로만 공유합니다.

| API | 상태 |
| --- | --- |
| `GET /api/church/praises`, `/api/church/admin/praises` | 찬양 화면 미기획 |
| `GET /api/church/worship-guides`, `/api/church/admin/worship-guides` | 예배 안내는 현재 예배 시간표(`worship-schedule`)만 사용 중. 자유 텍스트 안내 영역이 화면에 없음 |
| `POST /api/company/inquiries` | 도입 문의(ToGather 영업용) 페이지 미구현 |
| `POST /api/auth/oauth/{provider}` | 소셜 로그인 UI 미구현 |

### 4-6. (P3) 비밀번호 재설정 — 발송 인프라 전환 시 알림 요청

현재 스펙(`§10.10`)대로 `resetToken`을 응답으로 받아
**본인확인 → 새 비밀번호 입력 → 변경 완료**를 한 화면에서 처리하도록 구현했습니다.

메일/SMS 발송 인프라가 붙어 **링크 발송 방식으로 전환될 때 미리 알려주세요.**
토큰을 URL 파라미터로 받는 별도 페이지가 필요해집니다.

---

## 5. 참고 — 이번 감사에서 프론트가 연결 완료한 항목

아래는 백엔드에 이미 있었으나 프론트가 안 쓰고 있던 것으로, **이번에 연결을 마쳤습니다. 백엔드 조치는 필요 없습니다.**

| API | 연결된 화면 |
| --- | --- |
| `GET /api/churches/{id}/intro` | 교회소개 8개 섹션 (인사말·비전·연혁·섬기는사람들·층별안내·오시는길·차량운행·주차) |
| `GET /api/church/worship-schedule` | 홈 · 예배 안내 |
| `PUT /api/church/admin/worship-schedule` | 관리자 > 메인 페이지 관리 |
| `GET /api/church/profile` → `instagramUrl` | 푸터 인스타그램 링크 |
| `PUT /api/church/admin/profile` → `instagramUrl` | 관리자 > 사이트 기본 설정 |
| `GET/POST /api/church/admin/signup-requests/**` | 관리자 > 교인 관리 > 승인 대기 (승인·거절) |
| `POST /api/auth/find-id` | 아이디 찾기 |
| `POST /api/auth/find-password/verify`, `/reset-password` | 비밀번호 찾기 |
| `GET /api/church/members` | 서비스 계층 추가 (화면 연결은 §1 결정 대기) |

### 프론트에서 함께 고친 버그

- `eventsService` / `noticeService` / `myPageService`가 정의되지 않은 `isDummy()`를 호출해
  **호출 즉시 `ReferenceError`** → 행사·공지 관리, 마이페이지 전체가 동작 불가였음
- `galleryService`가 `const isDummy = () => true`라 **갤러리 API를 한 번도 호출하지 않고 있었음**
- 주보 상세(`GET /api/churches/{id}/jubo/{juboId}`)의 `title` / `scripture`를
  프론트가 "flat 필드가 없다"고 잘못 가정해 빈 문자열로 두고 있었음 → 실제 값 사용하도록 수정

---

## 6. 회신 요청 항목 정리

의사결정이 필요한 것만 추렸습니다.

| # | 질문 | 관련 |
| --- | --- | --- |
| Q1 | 교적부에 어느 필드까지 추가 가능한가? `family`/`history`는 범위에 포함되는가? | §1 |
| Q2 | 일반 교인이 다른 교인 상세를 조회할 수 있어야 하는가? | §1 |
| Q3 | `GET /api/my/profile` 추가 가능한가? 어렵다면 로그인 응답의 `name`만이라도 우선 채울 수 있는가? | §2 |
| Q4 | 주일학교·전도선교·양육훈련을 `intro` 섹션 방식으로 확장하는 데 동의하는가? | §3 |
| Q5 | 양육·훈련 게시판 — 안 A(notice에 boardType 추가) vs 안 B(게시판 신설) | §3-7 |
| Q6 | 주보 `DISTRICTS`와 양육훈련 "구역 모임"은 같은 데이터인가? | §3-5 |
| Q7 | 교회 기본 정보를 교회 관리자가 직접 수정해야 하는가, 운영팀 경유가 맞는가? | §4-1 |
| Q8 | 파일 업로드(S3) 일정은? | §4-2 |
| Q9 | 출석 도메인 계획이 있는가? | §4-3 |
| Q10 | `bulletin` 도메인은 제거 예정인가, 별도 용도인가? | §4-4 |
