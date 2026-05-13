# ToGather 백엔드 아키텍처

## 기술 스택

| 항목 | 버전 | 비고 |
|------|------|------|
| Runtime | Node.js 22 LTS | |
| Framework | Fastify v5 | 고성능 REST API |
| ORM | Prisma 5 | 타입 안전 쿼리 |
| DB | PostgreSQL 16 | 멀티테넌트 Row-level 격리 |
| Cache | Redis 7 | 세션·피드 캐싱 |
| Storage | AWS S3 | 이미지·파일 업로드 |
| Auth | JWT RS256 | Access 15분 / Refresh 7일 |
| 이메일 | AWS SES | 비밀번호 재설정·알림 |

---

## 멀티테넌트 전략

- **Row-level isolation**: 모든 비즈니스 테이블에 `church_id` FK 필수
- 쿼리 레이어에서 `WHERE church_id = ?` 자동 주입 (Prisma middleware)
- PostgreSQL RLS 보조 적용 가능: `SET LOCAL app.current_church_id = ?`
- 테넌트 식별: `subdomain` (e.g. `togather.church/{slug}`) 또는 커스텀 도메인

---

## RBAC (5단계 권한)

| Role | 설명 |
|------|------|
| `SUPER_ADMIN` | 플랫폼 운영자 (Anthropic 측) |
| `CHURCH_ADMIN` | 교회 대표 관리자 (담임목사·행정간사) |
| `PASTOR` | 부교역자·전도사 |
| `LEADER` | 구역장·셀리더·부서장 |
| `MEMBER` | 일반 교인 |

---

## DB 테이블 설계

### TENANT

```
churches
  id            UUID PK
  slug          TEXT UNIQUE          -- URL 식별자 (e.g. "togather")
  name          TEXT
  logo_url      TEXT
  address       TEXT
  tel           TEXT
  fax           TEXT
  email         TEXT
  plan_id       UUID FK → church_plans
  created_at    TIMESTAMPTZ

church_plans
  id            UUID PK
  name          TEXT                 -- free / standard / premium
  max_members   INT
  price_monthly INT
```

### AUTH

```
users
  id            UUID PK
  church_id     UUID FK → churches
  email         TEXT UNIQUE
  password_hash TEXT
  name          TEXT
  role          ENUM(SUPER_ADMIN, CHURCH_ADMIN, PASTOR, LEADER, MEMBER)
  is_active     BOOLEAN DEFAULT true
  created_at    TIMESTAMPTZ

refresh_tokens
  id            UUID PK
  user_id       UUID FK → users
  family_id     UUID                 -- 재사용 감지용 family 그룹
  token_hash    TEXT
  expires_at    TIMESTAMPTZ
  revoked_at    TIMESTAMPTZ

password_resets
  id            UUID PK
  user_id       UUID FK → users
  token_hash    TEXT
  expires_at    TIMESTAMPTZ
  used_at       TIMESTAMPTZ
```

### MEMBER (교적부)

```
members
  id              UUID PK
  church_id       UUID FK → churches
  user_id         UUID FK → users (nullable, 앱 계정 연결)
  name            TEXT
  name_roman      TEXT
  gender          ENUM(M, F)
  birth_date      DATE
  phone           TEXT
  email           TEXT
  address         TEXT
  district_id     UUID FK → districts
  small_group_id  UUID FK → small_groups
  role            TEXT               -- 장로·집사·청년 등 자유 입력
  department      TEXT
  baptism_date    DATE
  registered_at   DATE
  notes           TEXT
  avatar_tone     INT                -- 아바타 색조 (1~8)
  is_active       BOOLEAN DEFAULT true
  created_at      TIMESTAMPTZ

districts                            -- 구역
  id          UUID PK
  church_id   UUID FK
  name        TEXT
  leader_id   UUID FK → members

small_groups                         -- 셀·다락방
  id          UUID PK
  church_id   UUID FK
  name        TEXT
  leader_id   UUID FK → members

member_families
  id          UUID PK
  member_id   UUID FK → members
  rel         TEXT                   -- 배우자·부·모·자녀 등
  name        TEXT
  phone       TEXT
  linked_id   UUID FK → members (nullable)

member_history
  id          UUID PK
  member_id   UUID FK → members
  year        SMALLINT
  content     TEXT

member_attendance
  id          UUID PK
  church_id   UUID FK
  member_id   UUID FK → members
  service_id  UUID FK → worship_schedules
  attended_at TIMESTAMPTZ
  note        TEXT
```

### JUBO (주보)

```
jubo
  id            UUID PK
  church_id     UUID FK
  date          DATE UNIQUE PER CHURCH
  title         TEXT
  cover_image   TEXT
  published     BOOLEAN DEFAULT false
  created_at    TIMESTAMPTZ

jubo_worship_order                   -- 예배 순서
  id          UUID PK
  jubo_id     UUID FK → jubo
  seq         INT
  role        TEXT                   -- 사회·기도·찬양 등
  content     TEXT
  person      TEXT

jubo_volunteers                      -- 봉사자
  id          UUID PK
  jubo_id     UUID FK → jubo
  dept        TEXT
  person      TEXT

jubo_news                            -- 교회 소식
  id          UUID PK
  jubo_id     UUID FK → jubo
  seq         INT
  content     TEXT

jubo_offering                        -- 예물
  id          UUID PK
  jubo_id     UUID FK → jubo
  category    TEXT
  amount      INT
  person      TEXT

jubo_support                         -- 후원·선교
  id          UUID PK
  jubo_id     UUID FK → jubo
  target      TEXT
  amount      INT
  note        TEXT

worship_schedules                    -- 정기 예배 시간표
  id          UUID PK
  church_id   UUID FK
  name        TEXT                   -- 주일오전·주일오후·수요예배 등
  day_of_week SMALLINT               -- 0=일 ~ 6=토
  time        TIME
  location    TEXT
  is_active   BOOLEAN DEFAULT true
```

### CONTENT (공지·행사·갤러리)

```
notices
  id          UUID PK
  church_id   UUID FK
  author_id   UUID FK → users
  category    ENUM(NOTICE, EVENT, NEWS)
  title       TEXT
  body        TEXT
  pinned      BOOLEAN DEFAULT false
  published_at TIMESTAMPTZ
  created_at  TIMESTAMPTZ

events
  id           UUID PK
  church_id    UUID FK
  author_id    UUID FK → users
  title        TEXT
  description  TEXT
  location     TEXT
  start_at     TIMESTAMPTZ
  end_at       TIMESTAMPTZ
  cover_image  TEXT
  created_at   TIMESTAMPTZ

event_attachments
  id        UUID PK
  event_id  UUID FK → events
  url       TEXT
  filename  TEXT

event_registrations
  id         UUID PK
  event_id   UUID FK → events
  member_id  UUID FK → members
  status     ENUM(PENDING, CONFIRMED, CANCELLED)
  created_at TIMESTAMPTZ

gallery_communities                  -- 공동체 분류 (전체·청년부·찬양팀 등)
  id        UUID PK
  church_id UUID FK
  name      TEXT
  order_idx INT

gallery_albums
  id              UUID PK
  church_id       UUID FK
  community_id    UUID FK → gallery_communities
  title           TEXT
  cover_photo_id  UUID (circular → set after insert)
  date            DATE
  created_at      TIMESTAMPTZ

gallery_photos
  id          UUID PK
  album_id    UUID FK → gallery_albums
  url         TEXT                   -- S3 URL
  thumb_url   TEXT
  caption     TEXT
  order_idx   INT
  uploaded_by UUID FK → users
  created_at  TIMESTAMPTZ
```

### BIBLE (성경 읽기·필사)

```
bible_read_logs
  id          UUID PK
  church_id   UUID FK
  user_id     UUID FK → users
  book        TEXT                   -- e.g. "창세기"
  chapter     SMALLINT
  verse       SMALLINT
  checked_at  TIMESTAMPTZ

bible_write_logs
  id          UUID PK
  church_id   UUID FK
  user_id     UUID FK → users
  book        TEXT
  chapter     SMALLINT
  verse       SMALLINT
  content     TEXT                   -- 필사 내용
  created_at  TIMESTAMPTZ

bible_favorites
  id          UUID PK
  user_id     UUID FK → users
  book        TEXT
  chapter     SMALLINT
  verse       SMALLINT
  note        TEXT
  created_at  TIMESTAMPTZ
```

### STATIC (교회 소개)

```
church_staff                         -- 섬기는 분들
  id          UUID PK
  church_id   UUID FK
  name        TEXT
  title       TEXT                   -- 담임목사·부목사 등
  photo_url   TEXT
  order_idx   INT

church_history                       -- 연혁
  id          UUID PK
  church_id   UUID FK
  year        SMALLINT
  month       SMALLINT
  content     TEXT
```

---

## API 엔드포인트 목록

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
DELETE /api/auth/logout
POST   /api/auth/password-reset/request
POST   /api/auth/password-reset/confirm
```

### Churches
```
GET    /api/churches/:slug           -- 퍼블릭 교회 정보
PUT    /api/churches/:id             -- CHURCH_ADMIN 이상
GET    /api/churches/:id/worship-schedules
PUT    /api/churches/:id/worship-schedules
```

### Jubo
```
GET    /api/jubo                     -- 목록 (최신순)
GET    /api/jubo/:id
POST   /api/jubo                     -- PASTOR 이상
PUT    /api/jubo/:id
DELETE /api/jubo/:id
POST   /api/jubo/:id/publish
```

### Members (교적부)
```
GET    /api/members                  -- LEADER 이상
GET    /api/members/:id
POST   /api/members                  -- PASTOR 이상
PUT    /api/members/:id
DELETE /api/members/:id
GET    /api/members/:id/attendance
POST   /api/members/:id/attendance
GET    /api/districts
POST   /api/districts
GET    /api/small-groups
POST   /api/small-groups
```

### Notices
```
GET    /api/notices
GET    /api/notices/:id
POST   /api/notices                  -- LEADER 이상
PUT    /api/notices/:id
DELETE /api/notices/:id
```

### Events
```
GET    /api/events
GET    /api/events/:id
POST   /api/events                   -- LEADER 이상
PUT    /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/register      -- MEMBER
DELETE /api/events/:id/register
```

### Gallery
```
GET    /api/gallery/communities
GET    /api/gallery/albums
GET    /api/gallery/albums/:id
POST   /api/gallery/albums           -- LEADER 이상
POST   /api/gallery/albums/:id/photos
DELETE /api/gallery/photos/:id
```

### Bible
```
GET    /api/bible/read-logs
POST   /api/bible/read-logs
GET    /api/bible/write-logs
POST   /api/bible/write-logs
GET    /api/bible/favorites
POST   /api/bible/favorites
DELETE /api/bible/favorites/:id
```

### Upload
```
POST   /api/upload/presign            -- S3 presigned URL 발급
```

---

## 인증 플로우

```
로그인 → Access Token (15분 JWT RS256) + Refresh Token (7일, DB 저장)
         ↓
Access 만료 → POST /auth/refresh (Refresh Token 검증 + rotation)
              새 Refresh Token 발급, 기존 무효화 (family_id 재사용 감지)
         ↓
Refresh 재사용 감지 → family 전체 revoke (계정 탈취 방어)
```

---

## 구현 단계

| Phase | 범위 |
|-------|------|
| 1 MVP | Auth + Church + Jubo + Notices |
| 2 목양 | Members + Attendance + Districts |
| 3 콘텐츠 | Events + Gallery + Bible |
| 4 SaaS | 플랜 관리 + 온보딩 + 관리자 대시보드 |
