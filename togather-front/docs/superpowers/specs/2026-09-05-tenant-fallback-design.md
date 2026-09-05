# 프론트 단독 배포 시 교회 정보 폴백 — 설계

## 배경

"교회별 프론트 서버 따로 두기" 이니셔티브의 1단계. 지금 이 저장소(`togather-front`)를 Vercel에 배포하면 `TenantErrorScreen`("교회 정보를 찾을 수 없습니다")이 뜬다.

원인: `ChurchProvider`가 부팅 시 `GET /api/tenant?domain=<현재 호스트>`로 교회 설정을 조회하는데, 백엔드(`togather-back`)가 아직 로컬에서만 실행 중이라 배포된 프론트가 호출할 수 있는 API가 없다. 로컬 개발은 `.env`의 `VITE_DEV_CHURCH_DOMAIN=algok.togather.local` + 로컬 DB 시드로 우회하고 있어 이 문제를 못 느꼈을 뿐이다.

`src/config/church.config.js`는 이미 알곡교회 실데이터로 채워져 있고, `ChurchProvider`는 정상 경로에서 이 파일을 기본값으로 API 응답과 얕게 병합한다. 즉 API가 없어도 보여줄 데이터는 이미 갖고 있는데, 실패 시 처리만 에러 화면으로 막아뒀다.

## 목표 / 범위

- **목표**: 백엔드 API가 없거나 실패해도 `church.config.js` 기본값으로 정상적인 화면을 보여준다. 이 저장소를 배포하면 "알곡교회 프론트"로 동작하게 하는 것이 1단계 목표.
- **범위**: 프론트엔드만. 백엔드 배포, production DB에 테넌트 도메인 등록, Vercel 프로젝트 설정은 이번 범위 밖.
- **비목표(지금 안 함)**: 저장소를 `algok-front`로 rename/분리, 재사용 가능한 "base 템플릿" 추출. 저장소명은 `togather-front`로 유지.

## 접근

`ChurchContext.jsx`의 `getTenant(domain)` 실패 시 처리를, `status: "error"`(에러 화면)에서 → 로컬 `defaultConfig`를 유지한 채 `status: "ready"`로 바꾼다. 개발자 확인용으로 `console.warn`만 남기고 사용자에게는 아무 표시도 하지 않는다(에러 배너 없음 — 실제 서비스처럼 보여야 하므로).

로컬 개발 경로(`VITE_DEV_CHURCH_DOMAIN` + 로컬 DB 시드로 API 호출이 성공하는 경우)는 이 변경과 무관하게 그대로 동작한다. 이 폴백은 API가 진짜로 실패하는 경우에만 개입한다.

검토했지만 채택하지 않은 대안:
- env 플래그로 API 호출 자체를 스킵 — 관리할 환경변수만 늘고 지금 얻는 이득이 없음(YAGNI).
- "네트워크 실패"와 "도메인 미등록(404)"을 구분해서 다르게 처리 — 두 경우 모두 원하는 동작이 "로컬 기본값 표시"로 동일해서 구분할 실익이 없음.

## 변경 대상

- `src/contexts/ChurchContext.jsx` — `.catch()` 핸들러, 관련 주석
- `src/config/church.config.js` — 상단 주석(SaaS 설명에 "API 실패 시 폴백 기본값" 역할 추가 명시)
- `docs/saas-multitenancy.md` — 실제 코드와 어긋난 예시(`fetchChurchByDomain`/`setLoading`/`setChurch` 등 존재하지 않는 API)를 현재 구현(`getTenant`, `status` 상태값, 얕은 병합)에 맞게 수정하고, "테넌트 식별 흐름" 섹션에 폴백 동작 추가

## 리스크 / 확인 필요

- **리스크**: 실제 서비스 오픈 후 백엔드가 배포됐는데 특정 교회 도메인이 DB에 안 등록된 경우에도 조용히 알곡 데이터로 폴백해버려서, 설정 누락을 못 알아챌 수 있다. → 지금은 어차피 알곡 단일 배포라 문제 없지만, 나중에 여러 교회를 실제로 운영할 때는 이 폴백이 "설정 실수를 가려버리는" 부작용이 될 수 있음. 그 시점엔 폴백 여부를 환경별로 분기(예: production에서만 폴백 허용, 그 외엔 에러 유지)하는 재검토가 필요.
- **확인 필요**: `docs/backend-architecture.md`는 이번 조사 중 발견한 별개 이슈 — 실제 백엔드(Spring Boot/Java, `church_domain` 테이블 기반)와 전혀 다른 스택(Fastify/Prisma/AWS S3/Redis)을 설명하고 있음. 이번 작업 범위 밖이라 손대지 않았고, 별도로 처리할지 사용자에게 확인 필요.

## 향후 단계 (지금 안 함, 기록만)

나중에 실제로 다른 교회를 온보딩할 때, 이 저장소를 fork하고 `church.config.js` + `.env`만 교체해서 새 배포를 만드는 방향을 고려한다. 그때 가서 "base 템플릿" 추출 여부를 다시 판단한다.
