# 데스크탑 헤더 드롭다운 메뉴 — 전체 탭 동시 표시 개편 설계

## 배경

사용자가 두 스크린샷을 참고해 헤더 드롭다운 메뉴 디자인 변경을 요청했다(2026-08-11).

- **스크린샷 1**(`~/Desktop/스크린샷 2026-08-11 오후 5.41.05.png`, "gnb 하위 메뉴" 라벨의 목업): 알곡교회 로고 + 상단탭(교회소개/예배·방송/···) 아래, 활성 탭 하나만이 아니라 **상단탭 전부의 하위메뉴가 동시에 여러 컬럼으로 나란히** 표시된다.
- **스크린샷 2**(`~/Desktop/스크린샷 2026-08-11 오후 5.34.57.png`, 외부 레퍼런스 수영로교회 `sooyoungro.org`): 상단탭 4개의 하위메뉴가 **세로 구분선으로 나뉜 컬럼**으로 동시에 표시되고, 활성 컬럼에만 연한 배경 하이라이트가 들어간다(히어로 이미지 위 반투명 오버레이 스타일이지만 이 부분은 이번 범위 아님, 아래 참고).

## 현재 상태

`src/layouts/RootLayout.jsx`의 `DesktopHeader`는 `openMenu`라는 단일 state로 **마우스오버한 상단탭 하나의 하위메뉴만** 보여준다(`NAV_ITEMS.find(n => n.label === openMenu)`). 왼쪽에 좁은 강조 컬럼(활성 탭 라벨, `border-r`로 구분) + 오른쪽에 그 탭 하나의 자식들만 CSS `columns-*`(자식 개수 따라 1~3단) 반응형 레이아웃으로 표시된다.

`church.config.js`의 `nav` 배열(6개 상단탭 — 교회소개/예배·방송/주일학교/전도·선교/양육·훈련/교회소식, 각각 4~7개 하위항목)은 그대로 유지하며 이번 사이클에서 변경하지 않는다.

기존 헤더 관련 테스트는 `routes.test.jsx`/`Nurture.test.jsx`에 RootLayout이 부수적으로 렌더되는 정도만 있고, 드롭다운 메뉴 자체를 검증하는 테스트는 없다.

## 사용자 확인 사항 (2026-08-11)

1. **인터랙션 모델**: "하나의 탭만 표시" → "**하위메뉴 있는 상단탭 전부를 동시에 컬럼으로 표시**"로 변경.
2. **구분선·하이라이트**: 컬럼 사이 세로 구분선 + 마우스오버 중인 컬럼에만 연한 배경 틴트, 둘 다 적용.
3. **배경 스타일**: 스크린샷 2의 히어로 이미지 위 반투명 오버레이 스타일은 채택하지 않는다 — ToGather 헤더는 모든 페이지에 sticky로 떠 있어 페이지마다 고정 히어로 이미지가 있는 게 아니므로 애매하다. **흰 배경 유지**.
4. **우측 영역**: 로그인/회원가입 버튼, 검색 아이콘 배치는 이번 범위 아님 — 변경 없음.
5. **컬럼 헤더**: 각 컬럼 상단에 그 컬럼이 속한 상위 탭 이름(예: "교회소개")을 굵은 제목으로 한 번 더 표시 — 컬럼이 6개로 늘면서 상단 네비게이션 바의 탭 위치와 컬럼 위치가 정확히 정렬되지 않을 수 있어(간격·라벨 길이가 다름), 헤더 없이는 어느 컬럼이 어느 탭인지 헷갈릴 수 있다는 판단.

## 설계

### 레이아웃 — CSS Grid + `divide-x`

컬럼 수(현재 6, `children`이 있는 `NAV_ITEMS` 개수)만큼 `grid-template-columns: repeat(N, 1fr)`을 인라인 스타일로 계산해 적용한다(개수가 데이터에 따라 바뀔 수 있어 `grid-cols-6` 하드코딩 대신). Tailwind `divide-x divide-bluegrey-2`를 그리드 컨테이너에 적용하면 형제 요소 사이에만 구분선이 생겨 맨 끝 컬럼에 불필요한 테두리가 남지 않는다.

```jsx
{openMenu && (
  <div className="absolute left-0 right-0 bg-white shadow-xl" style={{ animation: "megaFadeIn 0.15s ease-out", borderBottom: "2px solid var(--color-primary)" }}>
    <style>{`@keyframes megaFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    <div className="max-w-[1920px] mx-auto px-8 py-8">
      <div
        className="grid divide-x divide-bluegrey-2"
        style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.filter((n) => n.children).length}, 1fr)` }}
      >
        {NAV_ITEMS.filter((item) => item.children).map((item) => {
          const active = openMenu === item.label;
          return (
            <div
              key={item.label}
              className={`px-6 flex flex-col gap-1 rounded-md transition-colors ${active ? "bg-blue-1" : ""}`}
            >
              <Link
                to={item.to ?? item.children[0].to}
                onClick={() => setOpenMenu(null)}
                className={`text-sub-tit-4 font-bold mb-2 transition-colors ${active ? "text-primary" : "text-grey-10"}`}
              >
                {item.label}
              </Link>
              {item.children.map((child) => (
                <Link
                  key={child.label}
                  to={child.to}
                  onClick={() => setOpenMenu(null)}
                  className="group flex items-center gap-2 px-2 py-2 rounded-md text-body-3 text-grey-7 hover:text-primary hover:bg-blue-1 transition-colors whitespace-nowrap"
                >
                  <span className="w-1 h-1 rounded-full bg-bluegrey-3 group-hover:bg-primary transition-colors shrink-0" />
                  {child.label}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}
```

- `openMenu`는 기존과 동일하게 각 상단탭 wrapper의 `onMouseEnter`로 설정되고, 헤더 전체의 `onMouseLeave`로 닫힌다(변경 없음) — 용도만 "표시할 컬럼 선택"에서 "하이라이트할 컬럼 선택"으로 바뀐다.
- 컬럼 헤더(`item.label`)와 하위 항목 링크 모두 클릭 시 `setOpenMenu(null)`로 패널을 닫는다(기존 동작 유지).
- 기존 CSS `columns-*` 다단 로직은 제거한다 — 컬럼 폭이 좁아져(6분할) 항목이 최대 7개라도 한 줄씩 세로로 나열하는 게 자연스럽다(두 스크린샷 모두 컬럼 내부는 항상 단일 세로 목록).
- `NAV_ITEMS.find(...)`(단일 탭 조회) 로직은 `NAV_ITEMS.filter(...)`(전체 순회)로 교체된다.

### 영향받지 않는 부분

`MobileHeader`/`MobileDrawer`(모바일 메뉴), `DesktopFooter`, `BottomNav`, 우측 로그인/회원가입 버튼 영역, `church.config.js`의 `nav` 데이터 — 전부 변경 없음.

## 테스트 계획

`RootLayout.test.jsx`(신규) — 지금까지 헤더 드롭다운을 전담 검증하는 테스트가 없었으므로 이번에 추가한다:
- 상단탭 하나에 마우스오버 시 **모든** 하위메뉴 컬럼이 동시에 렌더되는지(단일 탭만 렌더되던 기존 동작과의 회귀 방지).
- 마우스오버한 컬럼에 하이라이트 클래스(`bg-blue-1`)가 적용되고 다른 컬럼엔 없는지.
- 컬럼 헤더 링크·하위 항목 링크 클릭 시 패널이 닫히는지(`openMenu` 초기화).
- 헤더 밖으로 마우스가 나가면(`onMouseLeave`) 패널이 닫히는지.
- `church.config.js`의 실제 `nav` 데이터로 6개 컬럼이 렌더되는지(하드코딩된 개수 가정 없이 데이터 기반 검증).

`vp check`(포맷+린트+타입체크)와 전체 `pnpm test:run`으로 마무리.

## 비목표 (이번 사이클 제외)

- 스크린샷 2의 히어로 이미지 오버레이 스타일 도입.
- 우측 로그인/회원가입/검색 아이콘 영역 변경.
- 모바일 헤더/드로어 메뉴 변경.
- `church.config.js`의 `nav` 데이터(라벨·구조·경로) 변경.

## 확인 필요

없음 — 모든 판단 지점은 사용자 확인 완료(2026-08-11).
