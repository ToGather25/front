# ToGather 백엔드 아키텍처

> 이 문서는 프론트 개발자가 API를 연동할 때 참고하는 요약이다. 상세 구현은 `togather-back` 저장소가
> 원본이며, 이 문서는 그걸 따라가는 요약본이므로 어긋나면 백엔드 코드가 항상 맞다.

## 기술 스택

| 항목      | 버전                        | 비고                                          |
| --------- | --------------------------- | --------------------------------------------- |
| Language  | Java 21                     |                                                |
| Framework | Spring Boot 3.5             | Web, Data JPA, Security, Validation, Actuator |
| DB        | PostgreSQL                  | Flyway로 마이그레이션 관리                    |
| Cache     | Redis                       | 리프레시 토큰 저장, 유튜브 라이브 조회 캐싱   |
| Auth      | JWT (HS256)                 | Access 1시간 / Refresh 7일, jjwt 라이브러리   |
| 아키텍처  | 헥사고날(포트-어댑터)        | 도메인별 `domain/application/adapter` 3계층   |

배포: 현재는 프론트(`togather-front`)만 Vercel에 올라가 있고, 백엔드는 아직 로컬에서만 실행 중이다(2026-09 기준).

---

## 멀티테넌트 전략

- **Row-level isolation**: 비즈니스 테이블에 `church_id` FK.
- **테넌트 식별 우선순위** (`ChurchContextFilter`):
  1. 경로 기반 — `/api/churches/{churchId}/**` (프론트 공개 API 계약)
  2. 개발용 `X-Church-Id` 헤더 — 프론트가 `/api/tenant` 조회로 얻은 churchId를 실어 보낸다(`api.js` 요청 인터셉터)
  3. **최종 목표(아직 미구현)**: host(`getServerName()`) → `church_domain` 테이블 조회. 교회마다 커스텀 도메인을 연결하기 전까지는 1·2번 경로만 쓴다.
- `/api/tenant?domain=<host>` 는 `church_domain.host`를 정확히 일치시켜 조회한다 — 일치하는 행이 없으면 404(`TENANT_NOT_FOUND`). 로컬 개발은 `.env`의 `VITE_DEV_CHURCH_DOMAIN`으로 이 값을 override한다.

---

## 인증 — 세 가지 로그인 표면

같은 백엔드 안에 서로 다른 사용자 풀을 쓰는 로그인이 세 개 있다. 프론트(이 저장소)는 이 중 **①**만 사용한다.

| # | 엔드포인트 | 사용자 풀 | 로그인 필드 | 용도 |
|---|---|---|---|---|
| ① | `POST /api/auth/login` | `account` (Role: `MEMBER` / `CHURCH_ADMIN`) | `email` | **프론트가 실제 사용하는 경로.** 일반 성도·교회 관리자 로그인 |
| ② | `POST /api/church/auth/login` | `account` (동일 테이블) | `loginId` | ①과 같은 계정을 아이디 기반으로도 조회 가능(현재 프론트 미사용) |
| ③ | `POST /api/admin/auth/login` | `admin_staff` (AdminRole: `STAFF` / `SUPER_ADMIN`) | `loginId` | ToGather 운영사 직원용 — 교회 계정과 완전히 별개 |

- 비밀번호: Spring Security `BCryptPasswordEncoder`.
- 토큰: Access(1시간) + Refresh(7일, Redis 저장, 회전형 — `/token/refresh` 호출 시 기존 토큰 폐기 후 새 쌍 발급, 재사용 감지 시 401).
- 회원가입은 자격증명 없이 신청만 받고(`POST /api/auth/register`), 관리팀이 승인하면 완결 토큰으로 비밀번호를 설정한다(`POST /api/auth/register/complete`) — 3단계 플로우.
- 계정(`account`) 롤은 `MEMBER`/`CHURCH_ADMIN` 두 가지뿐이다. 원래 이 문서에 있던 `SUPER_ADMIN`/`PASTOR`/`LEADER` 5단계 RBAC은 실제로 구현된 적 없다.

---

## 도메인 구성

각 도메인은 대체로 "공개 조회용 `Churches*Controller`"와 "교회 관리자 CRUD용 `ChurchAdmin*Controller`" 한 쌍으로 이뤄진다.

| 도메인 | 공개(front) | 관리자(admin) |
|---|---|---|
| 교회 프로필/소개 | `GET /api/church/profile`, `/api/church/worship-guides` | `PUT /api/church/admin/profile`, `worship-guides` CRUD |
| 공지 | `GET /api/church/notices`, `/api/churches/{id}/notices` | `/api/church/admin/notices` CRUD |
| 행사 | `GET /api/churches/{id}/events`, 참가신청 | `/api/church/admin/events` CRUD + 신청자 목록 |
| 주보 | `GET /api/churches/{id}/jubo/**` (섹션별 세분화) | `/api/church/admin/jubo` CRUD + 발행 |
| 갤러리 | `GET /api/churches/{id}/{communities,gallery}` | `/api/church/admin/{communities,gallery}` CRUD |
| 설교/방송 | `GET /api/church/sermons`, `/api/church/broadcast/live` | `/api/church/admin/sermons`, `/broadcasts` (start/end) |
| 찬양 | `GET /api/church/praises` | `/api/church/admin/praises` CRUD |
| 회보(bulletin) | `GET /api/church/bulletins`, `/latest` | `PUT /api/church/admin/bulletins` |
| 교적부 | — | `GET /api/church/admin/members`, `/{publicId}` |
| 문의(연락처) | `POST /api/churches/{id}/contact` | — |
| 마이페이지 | `/api/my/{schedules,prayers,inquiries}` CRUD, `DELETE /api/my/account`(회원탈퇴) | — |
| 회원가입 승인 | — | `GET /api/church/admin/signup-requests`, `/approve`, `/reject` |
| 회사 문의(랜딩) | `POST /api/company/inquiries` | `GET/PATCH/DELETE /api/admin/inquiries` |
| SaaS 교회 관리 | — | `/api/admin/churches` — 목록/생성/상태변경/도메인 등록/설정(운영사 전용, `admin_staff` 권한) |

이 표는 요약이며, 정확한 파라미터·요청/응답 바디는 각 컨트롤러(`togather-back/src/main/java/com/togather/**/adapter/in/web/*Controller.java`)를 직접 확인한다.

---

## DB 스키마 개요

Flyway 마이그레이션(`src/main/resources/db/migration/V*.sql`)이 스키마의 유일한 출처다. 주요 테이블(V2 기준 핵심 + 이후 도메인별 추가):

```
church, church_domain, church_profile, church_contact         -- 테넌트/프로필
plan, subscription                                            -- SaaS 플랜(틀만 있음, 미사용)
account, member_registry, admin_staff, signup_request          -- 계정/교적부/운영사 직원/가입신청
worship, worship_guide, sermon, live_broadcast, praise, bulletin -- 예배·설교·찬양·회보
jubo, jubo_section                                             -- 주보(섹션 구조화)
church_notice                                                  -- 공지
church_event, event_registration                               -- 행사·참가신청
gallery_community, gallery_photo                                -- 갤러리
my_schedule, prayer_request, member_inquiry                     -- 마이페이지
inquiry                                                          -- 회사(랜딩) 문의
bible_book, bible_verse, reading_record, verse_like, last_read_position -- 성경(현재 프론트는 로컬 bible.json 사용, 미연동)
```

---

## 프론트 연동 시 참고

- 모든 응답은 `{ success, data }` 봉투(`ApiResponse`)로 오되, `/api/auth/**`(①)만 프론트 전용 계약이라 `{ success, data, token, refreshToken }` 형태로 다르다(`FrontLoginResponse` 등).
- 프론트 `api.js`는 로그인 성공 시 받은 `token`을 `localStorage`에 저장하고, 이후 모든 요청에 `Authorization: Bearer` + `X-Church-Id` 헤더를 자동으로 붙인다.
- 401 응답은 원인(계정 없음/미승인/비밀번호 불일치)을 구분하지 않고 통일한다(계정 열거 공격 방지).
