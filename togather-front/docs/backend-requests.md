# 백엔드 요청 사항

작성일: 2026-09-26 (업데이트: 2026-11-06 — §7 추가)
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

> **(2026-11-06) 해결 확인**: `email`/`address`/`baptismDate`/`note`는 `MemberRegistry` 도메인과
> `GET /church/admin/members/{publicId}`(`MemberDetailResponse`)에 이미 추가되어 있습니다.
> `GET /church/members/{publicId}`(PII 제외 상세)도 이미 구현돼 있습니다. 아래는 남은 것만 정리합니다.

| 필드 | 용도 | 비고 |
| --- | --- | --- |
| `regionLeader` | 구역장 표시 | `region`으로 역참조 가능하면 불필요 |
| `family[]` | `{ relation, name, memberId? }` — 가족 관계 | 별도 테이블 필요 |
| `history[]` | `{ year, text }` — 등록/임직 이력 | 별도 테이블 필요 |
| `lastAttendedAt`, `attendanceCount/total` | 최근 출석 · 누적 출석 | 출석 도메인 자체가 없음(§3과 동일) |

### 요청

1. `family` / `history`는 스키마가 커서, **이번 범위에서 제외한다면 제외한다고 확정**해 주세요. 그러면 해당 UI를 삭제하겠습니다.
2. §7-1에 교적부 PII를 로그인 사용자 role에 따라 분기해서 내려주는 구체적인 방식을 새로 제안했습니다. 함께 확인 부탁드립니다.

### 참고

`member-registry-access-design`의 PII 비노출 원칙은 이해했습니다.
다만 현재 프론트 화면은 연락처·주소를 노출하는 전제로 설계돼 있어, **화면 스펙을 바꿀지 / API를 확장할지 결정이 필요**합니다.

---

## 2. (2026-11-06 해결 확인) 계정 ↔ 교적부 연동 (마이페이지 프로필)

`GET /api/my/profile`가 요청대로 이미 구현되어 있습니다(name/email/phone/birthDate/role/region/department/smallGroup/registeredAt/baptismDate 전부 포함). 프론트가 MOCK_USER를 지우고 이 API로 연결하면 됩니다.

다만 **조회만 가능하고 수정 API가 없어** "내 정보 저장" 기능은 아직 동작하지 않습니다 — §7-2에 이어서 요청했습니다.

소속 그룹 목록(`GET /api/my/groups`)은 별도로 생기지 않았다면 여전히 필요합니다 — 확인 부탁드립니다.

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
| 3-5 | 구역 모임 | `districtMeetings` | `DISTRICT_MEETINGS` (주보 `DISTRICTS`와 중복 검토) |
| 3-6 | 제자훈련 · 양육 프로그램 | `discipleTraining`, `nurturePrograms` | `DISCIPLE_TRAINING`, `NURTURE_PROGRAMS` |
| 3-7 | 양육·훈련 게시판 | `Nurture.jsx`의 `BOARD_POSTS` | 아래 별도 설명 |

> **(2026-11-06 해결 확인)**
> - 3-4(선교지 소식): `intro` 섹션이 아니라 공지 도메인의 `boardType=MISSION_NEWS`(`GET /notices?boardType=MISSION_NEWS`)로 이미 구현되어 있습니다. 프론트 연결만 하면 됩니다.
> - 3-6-1(섬기는사람들): `ChurchIntroSectionType`에 `STAFF`가 이미 추가되어 있습니다. 프론트가 바로 연결하면 됩니다(실제 데이터가 비어 있으면 관리자 화면에서 입력).

### 3-5 중복 확인 필요

주보의 `DISTRICTS` 섹션과 양육·훈련의 "구역 모임"이 **같은 데이터인지** 확인 부탁드립니다.
같다면 프론트가 주보 API(`GET /api/churches/{id}/jubo/districts`)를 재사용하겠습니다.
단, 주보 섹션은 발행본에 묶여 있어 "현재 구역 편성" 조회와는 성격이 다를 수 있습니다.

### 3-7 양육·훈련 게시판

> **(2026-11-06 해결 확인)**: 안 A가 이미 구현되어 있습니다 — `notice` 도메인에 `boardType`(`ANNOUNCEMENT`/`NURTURE`/`MISSION_NEWS`) 필드가 추가되었고 `GET /notices?boardType=NURTURE`로 조회됩니다. 프론트 연결만 하면 됩니다.

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
| `GET /api/church/praises`, `/api/church/admin/praises` | **(2026-11-06) 기획에서 최종 제외 확정.** 더 이상 필요하지 않습니다. 백엔드 코드는 그대로 두시면 되고 조치 불필요합니다 |
| `GET /api/church/worship-guides`, `/api/church/admin/worship-guides` | 예배 안내는 현재 예배 시간표(`worship-schedule`)만 사용 중. 자유 텍스트 안내 영역이 화면에 없음 |
| `POST /api/company/inquiries` | 도입 문의(ToGather 영업용) 페이지 미구현 |
| `POST /api/auth/oauth/{provider}` | 소셜 로그인 UI 미구현 |

### 4-6. (P2) 비전 섹션 detailedDescription 필드 추가 요청

현재 백엔드 VISION 섹션의 items에 `title`, `desc` 필드는 있으나,
**`detailedDescription` 필드가 없습니다.**

프론트 Vision 컴포넌트에서 hover 시 상세 설명을 표시하기 위해
`detailedDescription` 필드를 추가해주길 요청합니다.

**요청하는 필드:**
```json
{
  "title": "예배",
  "desc": "살아있는 예배",
  "detailedDescription": [
    {
      "title": "첫째 포인트",
      "text": "상세 설명 텍스트"
    },
    {
      "title": "둘째 포인트",
      "text": "상세 설명 텍스트"
    }
  ]
}
```

**주의:** detailedDescription이 없으면 polygon 아이콘이 표시되지 않으므로,
최소 하나의 detailedDescription 항목이 필요합니다.

### 4-7. (P2) 교회 연혁(History) 섹션 데이터 요청

현재 교회소개의 HISTORY 섹션이 `GET /api/churches/{id}/intro`에 포함되어 있으나,
백엔드에서 데이터를 반환하지 않아 church.config.js의 기본값만 사용 중입니다.

**요청하는 필드 구조:**
```json
{
  "HISTORY": {
    "description": "복음과 함께 걸어온 시간,\n하나님의 인도하심 가운데...",
    "foundedYear": 1985,
    "items": [
      {
        "era": "2020~",
        "events": [
          {
            "date": "2026.01.01",
            "content": "이벤트 설명"
          },
          ...
        ]
      },
      ...
    ]
  }
}
```

현재 History 컴포넌트는 이 데이터 구조를 기대하고 있으니,
백엔드에서 위 형식으로 HISTORY 섹션 데이터를 제공해 주길 요청합니다.

### 4-8. (P2) 주차 안내(Parking) 섹션 데이터 요청

현재 교회소개의 Direction 화면(`src/components/church/Direction.jsx`)이 
`church.parking.lots`를 사용하고 있으나, 백엔드에서 데이터를 반환하지 않아 
church.config.js의 기본값만 사용 중입니다.

§5의 "오시는길·주차" 섹션에 주차 안내가 포함되어 있다고 명시했으나,
현재 intro API에서 주차 데이터를 제공하지 않고 있습니다.

**요청하는 필드 구조:**
```json
{
  "PARKING": {
    "lots": [
      {
        "name": "교회 주차장",
        "details": [
          { "label": "주차 요금", "value": "무료" },
          { "label": "주차 가능 시간", "value": "종일" },
          { "label": "안내", "value": "..." }
        ]
      },
      {
        "name": "옥길새길중학교 주차장",
        "details": [...]
      }
    ]
  }
}
```

백엔드에서 위 형식으로 PARKING 섹션 데이터를 intro 응답에 포함해 주길 요청합니다.

### 4-9. (2026-11-06 해결 확인) 예배 목록 페이지네이션 PageInfo

`GET /api/church/sermons` 응답에 `pageInfo.{page,size,totalElements,totalPages,hasNext,hasPrevious}`가 공통 `PageResponse` 포맷으로 이미 포함되어 있습니다. 프론트 연결만 하면 됩니다.

### 4-10-a. (2026-11-06 해결 확인) 차량운행 안내(TransportGuide)

기존 `intro`의 `SHUTTLE` 섹션 타입이 이 용도였습니다(`INTRO_SECTION_TO_CONFIG_KEY`의 `SHUTTLE → transportGuide` 매핑). 프론트가 이미 연결해 정상 동작 확인했습니다. 새 `TRANSPORT_GUIDE` 타입은 필요 없습니다.

### 4-10. (P3) 비밀번호 재설정 — 발송 인프라 전환 시 알림 요청

현재 스펙(`§10.10`)대로 `resetToken`을 응답으로 받아
**본인확인 → 새 비밀번호 입력 → 변경 완료**를 한 화면에서 처리하도록 구현했습니다.

메일/SMS 발송 인프라가 붙어 **링크 발송 방식으로 전환될 때 미리 알려주세요.**
토큰을 URL 파라미터로 받는 별도 페이지가 필요해집니다.

### 4-11. (2026-11-06 해결 확인) 주보 발행호별 Cover 이미지

`GET /api/churches/{id}/jubo`(아카이브 목록) 응답의 `JuboSummaryResponse`에 `coverImageUrl`이 이미 발행호별로 포함되어 있습니다. 프론트 연결만 하면 됩니다.

### 4-12. (2026-11-06 해결 확인) 공지사항 Featured 필드

`FrontNoticeResponse.featured`가 이미 있습니다. 프론트에서 정렬 로직만 연결하면 됩니다.

### 4-13. (2026-11-06 해결 확인) 공지사항 페이지네이션 Total

`GET /api/churches/{id}/notices` 응답 본문 최상위에 `total`, `X-Total-Count` 헤더로도 전체 개수가 내려오고 있습니다. 프론트 연결만 하면 됩니다.

### 4-13-1. (2026-11-06 해결 확인) 설교 목록 API — YouTube 썸네일

`SermonResponse`에 `videoId`, `thumbnail`이 이미 포함되어 있습니다. 프론트 연결만 하면 됩니다.

### 4-14. (2026-11-06 해결 확인) 최신 설교 정보 API — YouTube 연동

요청대로 `GET /api/churches/{churchId}/sermon/latest`가 구현되어 있고, YouTube API를 직접 호출하지 않고 DB에 저장된 `youtubeVideoId`로 썸네일/URL을 파생하는 방식입니다(라이브 API 키와 무관하게 동작). 프론트 `MessageSection.jsx`를 이 엔드포인트로 교체하면 §4-14가 지적한 키 노출 문제가 해결됩니다.

**참고**: 이 엔드포인트와 별개로 `/church/broadcast/live`, `/church/broadcast/sermons`(실시간 라이브 감지용, `ChurchBroadcastController`)는 여전히 YouTube API를 직접 호출하며 `YOUTUBE_API_KEY` 환경변수가 필요합니다 — §7-5 참고.

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
| Q1 | `family`/`history`(가족·이력)는 이번 범위에 포함되는가, 제외인가? (email/address/baptismDate/note는 이미 해결됨) | §1 |
| ~~Q2~~ | ~~일반 교인이 다른 교인 상세를 조회할 수 있어야 하는가~~ | **(2026-11-06) 해결됨** — `GET /church/members/{publicId}` 이미 존재 |
| ~~Q3~~ | ~~`GET /api/my/profile` 추가 가능한가~~ | **(2026-11-06) 해결됨** — §2 |
| Q4 | 주일학교·전도선교·양육훈련을 `intro` 섹션 방식으로 확장하는 데 동의하는가? (STAFF/MISSION_NEWS/NURTURE는 이미 반영됨) | §3 |
| ~~Q5~~ | ~~양육·훈련 게시판 — 안 A vs 안 B~~ | **(2026-11-06) 해결됨** — 안 A(`notice.boardType`) 채택 확인 |
| Q6 | 주보 `DISTRICTS`와 양육훈련 "구역 모임"은 같은 데이터인가? | §3-5 |
| Q7 | 교회 기본 정보를 교회 관리자가 직접 수정해야 하는가, 운영팀 경유가 맞는가? | §4-1 |
| Q8 | 파일 업로드(S3) 일정은? | §4-2 |
| Q9 | 출석 도메인 계획이 있는가? | §4-3 |
| Q10 | `bulletin` 도메인은 제거 예정인가, 별도 용도인가? | §4-4 |
| Q11 | 교적부 응답을 역할별로 분기할 때 (A) `/church/members` 하나를 서버가 role 보고 PII까지 채워 내려주는 방식과 (B) 기존 두 엔드포인트를 유지하고 프론트가 role만 보고 호출을 바꾸는 방식 중 어느 쪽이 맞는가? | §7-1 |
| Q12 | `PATCH /api/my/profile`(address 포함), `PATCH /api/my/schedules/{id}` 추가 가능한가? | §7-2 |
| Q13 | `jubo/map-image` 프록시 엔드포인트, 언제쯤 가능한가? | §7-4 |
| Q14 | `YOUTUBE_API_KEY` 환경변수를 지금 실행 중인 백엔드 프로세스에 설정해 재시작할 수 있는가? | §7-5 |

---

## 7. (2026-11-06 추가) 전체 API 재점검 결과

### 7-1. (P1) 교적부 — 권한별로 다른 응답 (§1 보완)

§1에서 이미 PII 비노출 원칙은 확인했습니다. 이번엔 구체적인 분기 방식을 제안합니다.

로그인한 사용자가 CHURCH_ADMIN이면 개인정보까지, 일반 교인이면 지금처럼 비개인정보만 보이게 하려 합니다.

- (A) `GET /api/church/members` 하나로 통합하고, 호출자가 CHURCH_ADMIN이면 서버가 PII 필드까지 채워서 내려준다 (권장 — 프론트 분기 로직 단순화)
- (B) 기존 두 엔드포인트(`/church/members`, `/church/admin/members`)를 유지하되, 프론트가 로그인 사용자의 role을 보고 관리자면 관리자 엔드포인트를 호출하도록 권한 체크만 완화

어느 쪽이 백엔드 구조상 더 적합한지 판단 부탁드립니다(Q11).

### 7-2. (P1) 마이페이지 — 수정 API 신규 (§2 보완)

`GET /api/my/profile`은 이제 존재함을 확인했습니다. 다만 수정 쪽이 비어 있습니다.

- `PATCH /api/my/profile` — 조회만 있고 수정이 없어 "내 정보" 저장 버튼이 동작하지 않습니다. `MyProfile`에 `address` 필드도 없어 함께 추가 필요합니다.
- `PATCH /api/my/schedules/{id}` — 프론트(`myPageService.updateMySchedule`)는 이미 PATCH로 호출 중인데 `MyPageController`엔 GET/POST/DELETE만 있어 수정 시 404/405가 납니다.
- `Prayer`에 `reply {author, text}` 필드 — 기도제목 답변 완료 상태에서 보여줄 교역자 답변 데이터가 없어 프론트가 하드코딩 문구로 대체 중입니다.

### 7-3. (P2) 주보 — 예배 순서에 "사회" 역할 필드 추가

각 예배(`WORSHIP_ORDER` 섹션)의 역할 목록에 "사회"가 없어, 프론트에서 설교/대표기도 등과 나란히 "사회자" 정보를 보여주지 못하고 전부 "-"로 표시 중입니다. 다른 역할(설교/기도/찬양 등)과 같은 방식으로 "사회" 역할을 추가해 주세요.

### 7-4. (P2) 카카오 정적지도 프록시 엔드포인트 (주보 PDF 다운로드용)

**배경**: 주보 PDF 다운로드 시 "오시는 길" 지도를 이미지로 캡처해야 하는데, 프론트에서 Kakao 정적지도 REST API(`https://dapi.kakao.com/v2/maps/staticmap`)를 직접 호출하면 CORS에 막혀 브라우저가 응답을 읽지 못합니다(이 API는 서버-서버 호출 전용으로 설계되어 `Access-Control-Allow-Origin` 헤더를 내려주지 않습니다). 백엔드에서 중계(프록시)해주는 엔드포인트가 필요합니다.

**요청 엔드포인트**
```
GET /churches/{churchId}/jubo/map-image?level={level}
```
- `churchId`: path param (기존 컨벤션과 동일)
- `level`: 선택, 지도 확대 레벨 (기본 4)
- 주소는 교회 정보(`church.address`)에서 백엔드가 직접 가져오면 됩니다(프론트에서 주소를 쿼리로 넘기는 방식도 무방).

**백엔드 동작**: Kakao 정적지도 API를 서버에서 호출해 이미지 바이너리(또는 URL)를 그대로 중계 응답.

### 7-5. (P1, 운영환경) YouTube 연동 — YOUTUBE_API_KEY 환경변수 누락

설교/방송 화면(`/church/broadcast/sermons`, `/church/broadcast/live`)이 둘 다 빈 결과를 반환하고 있습니다. §4-14에서 제안한 "최신 설교 API 신설"과는 별개로, **이미 구현된 YouTube 연동 자체가 지금 동작하지 않는** 더 긴급한 문제입니다.

**원인**: `YouTubeApiAdapter.java`(40, 74행)가 `apiKey`/`channelId`가 비어 있으면 즉시 빈 값을 반환하도록 되어 있고, `application.yml`(54행)의 `api-key: ${YOUTUBE_API_KEY:}`가 환경변수 미설정 시 빈 문자열로 떨어집니다. DB의 `channelId` 설정 자체는 정상입니다(`live` 응답의 `fallbackUrl`에 올바른 채널 UC가 찍힘). 프론트 `.env`의 키값(`VITE_YOUTUBE_API_KEY`)으로 직접 YouTube API를 호출하면 영상 86개가 정상 조회되므로, 키 자체 문제가 아니라 **그 키가 백엔드 프로세스 환경변수로 전달되지 않은 것**이 원인입니다.

**요청**: 백엔드 실행 환경(로컬 실행 스크립트/IDE Run Configuration/배포 환경변수 등)에 `YOUTUBE_API_KEY`를 설정해 주세요. Spring은 기동 시 1회만 환경변수를 읽으므로 재시작이 필요합니다(Q14).

**참고 — 프론트 쪽 키 노출 위험**: 현재 프론트 `.env`에도 `VITE_YOUTUBE_API_KEY`가 들어있습니다. Vite는 `VITE_` 접두사 변수를 빌드 시 클라이언트 번들에 그대로 포함시키므로, 배포되면 누구나 브라우저에서 이 키를 꺼내볼 수 있습니다. §4-14가 제안한 대로 YouTube 연동을 백엔드로 완전히 옮기는 게 맞고, 그 전환이 끝나면 프론트 `.env`에서 `VITE_YOUTUBE_API_KEY`는 제거할 예정입니다. API 키 자체도 가능하면 HTTP 리퍼러 제한 없이 서버 IP 제한으로 재발급하는 걸 권장드립니다.

### 7-6. 참고 — 이번 재점검에서 프론트가 연결/수정 완료한 항목 (백엔드 조치 불필요)

- 공개 주보 화면이 섹션 엔드포인트를 11개 가까이 따로 부르던 것을 `GET /jubo/{id}`(상세, 섹션 전체 포함) 하나로 통합 — 호출 수 10~14회 → 2회로 감소, 지난 호 조회 시 최신 내용이 섞여 나오던 버그도 함께 해결
- 홈 화면에서 `getChurchProfile`이 두 곳(ChurchContext, MainBanner)에서 중복 호출되던 것을 하나로 통합
