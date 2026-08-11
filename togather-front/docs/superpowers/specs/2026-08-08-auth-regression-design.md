# 회원가입/로그인 — 회귀 테스트 + 명세 gap 수정 설계

## 배경

`기능 페이지 명세서` CSV 기준 페이지 정비 이니셔티브의 **두 번째 서브 프로젝트**([[project-spec-alignment-initiative]] 참고). 첫 번째 서브 프로젝트(교회소개)는 완료되어 `develop`에 병합됨.

## 대상 파일

- `src/pages/Register/Register.jsx` — 회원가입 1단계 (정보 입력)
- `src/pages/Register/SignupNext.jsx` — 회원가입 2단계 (관리자 승인 후 계정 생성)
- `src/pages/Login/Login.jsx` — 로그인
- `src/pages/FindPassword/FindPassword.jsx` — 비밀번호 찾기
- (신규) `src/pages/FindId/FindId.jsx` — 아이디 찾기

## 명세서 대비 gap과 결정 사항

| 항목 | 명세서 | 현재 구현 | 결정 |
|---|---|---|---|
| 아이디 찾기 | 로그인 화면에 "아이디 찾기" 링크 존재 (CSV 행22) | `Login.jsx`가 `/find-id`로 링크하지만 `App.jsx`에 해당 라우트가 없어 404 | **`FindId.jsx` 신규 작성 + 라우트 등록.** `FindPassword.jsx`와 동일 패턴(이름+휴대폰번호 → 마스킹된 아이디 표시)으로 구현 |
| 중복가입 안내 | "관리팀 누르면 관리팀 연락처 복사" (CSV 행11-12) | 전화번호를 정적 텍스트로만 표시, 복사 기능 없음 | **클립보드 복사 기능 추가.** "관리팀" 텍스트를 버튼으로 바꿔 `navigator.clipboard.writeText(ADMIN_CONTACT)` 호출 + 짧은 복사완료 피드백 |
| 가입 완료 안내 | 가입 2단계 완료 후 "OO 교회의 일원이 된 것을 축하합니다!" 모달 (CSV 행19-20) | `SignupNext.jsx` 완료 모달 문구가 "회원가입이 완료되었습니다!"로 다름 | **명세대로 문구 정합화**: `` `${church.name}의 일원이 된 것을 축하합니다!` `` |
| 회원가입 1단계 필드 | 이름/생년월일/휴대폰/새신자여부/개인정보동의 (CSV 행2-11) | 동일하게 이미 구현됨 | 변경 없음, 회귀 테스트만 |
| 관리자 승인 후 2단계 | 아이디/비밀번호 생성, 아이디 중복확인, 비밀번호 규칙 검증, 미승인 URL 직접 접근 시 "잘못된 접근입니다" (CSV 행13-21) | 이미 전부 구현됨(`SignupNext.jsx`) | 변경 없음, 회귀 테스트만 |
| 소셜 로그인 버튼 | 명세서에 언급 없음 | 카카오/구글/네이버 버튼 이미 구현됨 | **유지, 손대지 않음** (명세 이후 추가된 기능으로 판단, 제거 근거 없음) |

## 아키텍처

4개 파일 모두 이미 각자 적절한 크기의 독립 페이지 컴포넌트로, 교회소개 사이클과 달리 **컴포넌트 분리가 필요하지 않다**. 신규 `FindId.jsx`도 `FindPassword.jsx`의 폼→완료화면 전환 패턴을 그대로 따른다.

## 데이터 흐름 / 컨텍스트 의존성

- `Login.jsx`는 `useAuth()`(`src/contexts/auth.jsx`)와 `useChurch()`를 사용. `AuthProvider`는 `RootLayout.jsx`에 이미 연결되어 있음(내부적으로 `useNavigate` 사용 + `localStorage` 읽기/쓰기).
- `Register.jsx`, `SignupNext.jsx`, `FindPassword.jsx`, `FindId.jsx`는 `useChurch()`만 사용.
- 테스트에서 `AuthProvider`를 감쌀 때는 `localStorage`에 이전 테스트의 로그인 상태가 남지 않도록 매 테스트 `beforeEach`에서 `localStorage.clear()`를 호출한다.

## FindId.jsx 신규 페이지 설계

`FindPassword.jsx`와 대칭 구조:
- 입력 필드: 이름, 휴대폰 번호
- 제출 시 목업 처리 후 "찾은 아이디" 화면으로 전환: 아이디를 앞 4자만 보이고 나머지는 `*`로 마스킹해 표시(예: `test****`), "로그인으로 돌아가기" / "비밀번호 찾기" 링크 제공
- 좌측 브랜드 패널은 기존 3개 인증 페이지와 동일한 디자인 패턴(그라디언트 배경 + 아이콘 + 안내 문구) 재사용

## 클립보드 복사 (Register.jsx)

`ADMIN_CONTACT` 상수(이미 존재, `"02-2615-4067"`)를 클릭 시 복사하는 버튼으로 변경:
```jsx
async function handleCopyContact() {
  try {
    await navigator.clipboard.writeText(ADMIN_CONTACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch {
    // 클립보드 API 미지원 환경 — 조용히 무시(연락처는 여전히 화면에 텍스트로 보임)
  }
}
```
`navigator.clipboard`가 없는 테스트/구형 브라우저 환경에서도 크래시하지 않도록 `try/catch`로 감싼다.

## 테스트 계획 (TDD)

기존 4개 파일은 **회귀 테스트**(현재 동작 고정), 새 요구사항(FindId 신규, 클립보드 복사, 완료모달 문구)은 **실패 테스트 먼저 → 구현** 순서로 진행한다.

| 파일 | 핵심 검증 항목 |
|---|---|
| `Register.test.jsx` | 필수 필드 검증, 새신자 체크박스, 개인정보 동의 체크 전 제출 버튼 비활성, 정상 제출 시 완료 화면 전환, **중복가입 감지 시 모달 노출 + "관리팀" 버튼 클릭 시 클립보드 복사 호출(신규)** |
| `SignupNext.test.jsx` | `token` 파라미터 없으면 "잘못된 접근입니다" 화면, 아이디 중복확인 전 제출 불가, 비밀번호 규칙 위반 시 에러 문구, 비밀번호 확인 불일치 에러, **완료 모달에 명세 문구 노출(신규)** |
| `Login.test.jsx` | 이메일/비밀번호 제출, 잘못된 자격증명 시 에러 문구, "아이디 찾기"/"비밀번호 찾기" 링크가 실제 존재하는 라우트를 가리킴(신규 회귀 방지) |
| `FindPassword.test.jsx` | 이메일/휴대폰 제출 → 발송완료 화면 전환, 발송완료 화면 문구에 입력한 이메일 포함 |
| `FindId.test.jsx` (신규) | 이름/휴대폰 제출 → 마스킹된 아이디 표시 화면 전환 |

Router가 필요한 모든 페이지는 `MemoryRouter`로 감싼다. `Login.test.jsx`는 추가로 `AuthProvider`로 감싸고 `beforeEach`에서 `localStorage.clear()`를 호출한다.

## 라우팅 변경

`src/App.jsx`에 `{ path: "find-id", element: <FindId /> }` 추가 (기존 `find-password` 라우트 바로 옆에 배치).

## 비목표 (이번 사이클 제외)

- 실제 API 연동 (회원가입/로그인/아이디·비번찾기 전부 여전히 목업)
- 관리자 승인 워크플로 자체(교적부/관리자 도메인에서 다룸)
- 소셜 로그인(카카오/구글/네이버) 버튼의 실제 OAuth 연동
- 이전 사이클에서 발견된 "예배 안내 탭 이전" 이슈 — 예배·방송 사이클에서 처리

## 확인 필요

없음 (이전 사이클과 달리 이번 도메인은 명세와 구현 간 불일치가 작고 전부 결정됨).
