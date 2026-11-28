import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { ChurchProvider, useChurch } from "@/contexts/ChurchContext";
import SearchOverlay from "@/components/common/SearchOverlay";
import ChurchLogo from "@/components/common/ChurchLogo";
import Footer from "@/components/common/Footer";
import SplashScreen from "@/components/common/SplashScreen";
import IcoBell from "@/assets/mob-icon/bell-01.svg";
import IcoMenu from "@/assets/mob-icon/menu-01.svg";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ─────────────────────────────────────────────────────
// 스크롤 방향에 따라 헤더 노출 여부를 결정하는 훅
// 페이지 최상단 근처(threshold 이내)에서는 항상 노출, 마지막으로 방향이
// 확정된 지점(anchor) 대비 아래로 delta 이상 스크롤하면 숨김, 위로 delta
// 이상 스크롤하면 다시 노출한다.
//
// anchor는 "방향이 확정될 때만" 갱신한다(매 프레임 갱신하지 않음) — 그래야
// 트랙패드/마우스의 미세한 스크롤 노이즈에 흔들리지 않고 진짜 방향 전환만
// 반영된다. (참고: 헤더를 숨길 때 max-height 같은 레이아웃 속성을 썼던
// 이전 구현은 헤더 높이만큼 문서 전체 높이가 줄면서, 콘텐츠가 짧은
// 페이지에서 스크롤 가능 범위 자체가 줄어 브라우저가 scrollY를 강제로
// 당겨버렸다(clamp) — 이걸 "위로 스크롤함"으로 오인해 헤더를 다시 켜고,
// 문서가 다시 늘어나 또 꺼지는 진동이 반짝임의 진짜 원인이었다. 지금은
// 레이아웃에 영향을 주지 않는 transform으로 숨기므로 이 되먹임 자체가
// 발생할 수 없다.)
//
// atTop은 "최상단 근처" 여부만 별도로 노출한다 — 아래로 스크롤했다가 다시 위로
// 올려 visible이 true가 된 경우와 구분하기 위함(예: 히어로 위 투명 헤더는
// visible이 아니라 atTop 기준으로 켜져야 한다).
// ─────────────────────────────────────────────────────
function useHideHeaderOnScroll({ threshold = 80, delta = 16 } = {}) {
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let anchorY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        setAtTop(currentY <= threshold);
        if (currentY <= threshold) {
          setVisible(true);
          anchorY = currentY;
        } else if (currentY - anchorY > delta) {
          setVisible(false);
          anchorY = currentY;
        } else if (anchorY - currentY > delta) {
          setVisible(true);
          anchorY = currentY;
        }
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, delta]);

  return { visible, atTop };
}

/**
 * 엘리먼트의 실제(축소되지 않은) 높이를 마운트 시 한 번만 측정해 픽셀 값으로
 * 반환한다. display:none인 브레이크포인트에서는 0을 반환 — 데스크탑/모바일
 * 헤더 중 현재 화면에 실제로 보이는 쪽만 값을 갖게 되므로 별도 매체쿼리
 * 분기 없이 두 값을 더하기만 해도 "현재 보이는 헤더의 높이"가 된다.
 *
 * 의도적으로 ResizeObserver/resize 리스너로 계속 재측정하지 않는다 — 이
 * 훅이 측정한 높이가 다시 헤더의 max-height(레이아웃)에 쓰이므로, 재측정을
 * 계속하면 "측정→렌더→레이아웃 변화→재측정"이 맞물려 헤더가 빠르게
 * 켜졌다 꺼졌다 반복하는 깜빡임의 원인이 될 수 있다. 헤더 콘텐츠 자체가
 * 런타임에 크기를 바꿀 일이 없으므로 최초 1회 측정으로 충분하다.
 */
function useMeasuredHeight(ref) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(el.offsetHeight);
  }, [ref]);

  return height;
}

// 메가 메뉴의 흰색 하이라이트 배경 — 가운데서 양옆으로 퍼지듯 열리게, 매번 다른
// 메뉴로 전환될 때마다(key로 리마운트) 같은 효과가 다시 재생되도록 한다. 마운트된
// 바로 그 프레임에 scale-x-100을 적용하면 브라우저가 scale-x-0인 프레임을 아예
// 그리지 않고 건너뛰므로, 한 프레임 쉬었다가 적용해야 확장이 눈에 보인다.
function ExpandingHighlight({ left, width }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`absolute bg-white origin-center transition-transform duration-500 ease-out ${
        expanded ? "scale-x-100" : "scale-x-0"
      }`}
      style={{ top: "-1.25rem", bottom: "-1.25rem", left, width }}
    />
  );
}

// ─────────────────────────────────────────────────────
// Desktop Header (md 이상에서만 표시)
// ─────────────────────────────────────────────────────
function DesktopHeader({ visible, barRef, transparent = false }) {
  const { church } = useChurch();
  const { currentUser, logout } = useAuth();
  const NAV_ITEMS = church.nav;
  const menuItems = NAV_ITEMS.filter((item) => item.children);
  const [openMenu, setOpenMenu] = useState(null);
  // 패널이 닫힐 때도 close 애니메이션이 끝까지 재생되도록, 실제 렌더링에 쓰는
  // displayMenu는 openMenu가 null이 된 뒤에도 애니메이션 시간만큼 지연 유지한다.
  const [displayMenu, setDisplayMenu] = useState(null);
  const closeTimeoutRef = useRef(null);
  const displayMenuRef = useRef(null);
  const rowRef = useRef(null);
  const itemRefs = useRef({});
  const colRefs = useRef({});
  const panelContentRef = useRef(null);
  const [colCenters, setColCenters] = useState({});
  const [panelHeight, setPanelHeight] = useState(0);
  const [wrapHeight, setWrapHeight] = useState(0);

  useEffect(() => {
    displayMenuRef.current = displayMenu;
  }, [displayMenu]);

  useEffect(() => {
    if (openMenu) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      // 완전히 닫혀 있던 상태에서 새로 열 때만 0부터 다시 자라도록 초기화한다 —
      // 이미 열린 패널에서 다른 메뉴로 바로 넘어갈 때는 기존 높이에서
      // 자연스럽게 이어서 전환되어야 하므로 건드리지 않는다.
      if (!displayMenuRef.current) setWrapHeight(0);
      setDisplayMenu(openMenu);
    } else if (displayMenuRef.current) {
      closeTimeoutRef.current = setTimeout(() => {
        setDisplayMenu(null);
      }, 450); // 아래 close transition duration과 맞춤
    }
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [openMenu]);

  // 메가 메뉴 각 열의 중심이 상단 메뉴 항목의 중심과 같은 x축 위치에 오도록, 메뉴
  // 항목의 실제 렌더 위치(중심 좌표)를 측정해둔다. 열의 왼쪽 끝을 메뉴 항목의 왼쪽
  // 끝에 맞추고 그 안에서 하위 항목들을 가운데 정렬하면, 하위 항목 중 가장 긴
  // 것이 열의 폭을 정하면서 짧은 항목들이 메뉴 항목 기준에서 오른쪽으로 밀려
  // 보인다 — 그래서 왼쪽 끝이 아니라 중심끼리 맞춰야 한다.
  useLayoutEffect(() => {
    function measure() {
      const rowEl = rowRef.current;
      if (!rowEl) return;
      const rowLeft = rowEl.getBoundingClientRect().left;
      const next = {};
      NAV_ITEMS.forEach((item) => {
        const el = itemRefs.current[item.label];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        next[item.label] = rect.left - rowLeft + rect.width / 2;
      });
      setColCenters(next);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [displayMenu, NAV_ITEMS]);

  // 각 열은 position:absolute + translateX(-50%)로 중심을 고정하므로 문서 흐름에서
  // 빠진다 — 패널이 가장 긴 열의 높이만큼 자기 높이를 확보하도록 렌더 후 별도로 측정.
  useLayoutEffect(() => {
    if (!displayMenu) return;
    const heights = Object.values(colRefs.current)
      .filter(Boolean)
      .map((el) => el.offsetHeight);
    setPanelHeight(heights.length ? Math.max(...heights) : 0);
  }, [displayMenu, colCenters]);

  // 커튼/칠판을 내리듯 패널 전체 높이를 0→실제 높이로 키워서 보여준다 — 내용이
  // 늘어나 보이지 않도록(overflow:hidden) 실제 콘텐츠 높이를 측정해 그 값으로
  // height를 트랜지션한다. 완전히 닫힌 상태에서 새로 열 때는 height:0인 프레임이
  // 실제로 한 번 그려진 뒤에 목표 높이를 적용해야 0→목표 구간이 눈에 보인다 —
  // 같은 동기 커밋에서 바로 목표 높이를 적용하면 브라우저가 0인 프레임을 아예
  // 그리지 않아(배치) 트랜지션이 생략된 것처럼 보인다.
  useLayoutEffect(() => {
    if (!displayMenu) return;
    const el = panelContentRef.current;
    if (!el) return;
    const target = el.offsetHeight;
    if (wrapHeight === 0 && openMenu) {
      requestAnimationFrame(() => setWrapHeight(target));
    } else {
      setWrapHeight(target);
    }
  }, [displayMenu, panelHeight, colCenters, openMenu, wrapHeight]);

  // 메뉴가 열린 채로 스크롤하면 헤더는 translateY로 숨는데 드롭다운 패널은 헤더와
  // 무관하게 별도로 떠 있어서 화면에 그대로 남는다 — 스크롤이 시작되면 닫는다.
  useEffect(() => {
    if (!openMenu) return;
    function closeOnScroll() {
      setOpenMenu(null);
    }
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [openMenu]);

  // 메가 메뉴가 열려 있는 동안은 히어로 배경이 뒤에 비치는 투명 헤더 대신
  // 흰 배경으로 전환한다 — 드롭다운 아래로 배경 사진이 겹쳐 보이지 않도록.
  const effectiveTransparent = transparent && !openMenu;

  // 텍스트는 항상 세로 중앙(items-center)에 두고, 밑줄만 별도 요소로 분리해
  // 메뉴 항목 wrapper(h-full, 72px)의 맨 아래에 고정한다 — 그래야 글자 위치는
  // 그대로인 채 밑줄만 드롭다운 배경 상단에 딱 붙는다.
  const navTextCls = (active) => {
    if (effectiveTransparent) {
      return active ? "text-white font-bold" : "text-white hover:text-white/90";
    }
    return active ? "text-blue-6 font-bold" : "text-grey-10 hover:text-blue-6";
  };
  const navUnderlineCls = (active) => {
    if (effectiveTransparent) {
      return active ? "bg-white" : "bg-transparent group-hover:bg-white/70";
    }
    return active ? "bg-blue-6" : "bg-transparent group-hover:bg-blue-6";
  };

  const authBtnOutlineCls = effectiveTransparent
    ? "border-white/60 text-white hover:bg-white/10 hover:border-white"
    : "border-bluegrey-3 text-grey-9 hover:text-primary hover:border-blue-5";

  // 회원가입은 배경 없는 텍스트 링크로, 로그인은 히어로 배경 위(투명 헤더)에서는
  // 흰 배경, 그 외(흰 헤더)에서는 진한 남색 배경으로 — 헤더 배경과 항상 대비되게.
  const registerLinkCls = effectiveTransparent
    ? "text-white hover:text-white/70"
    : "text-grey-9 hover:text-primary";
  const loginBtnCls = effectiveTransparent
    ? "bg-white text-primary hover:bg-blue-1"
    : "bg-blue-9 text-white hover:bg-blue-6";

  return (
    <header className="sticky top-0 z-50 hidden md:block" onMouseLeave={() => setOpenMenu(null)}>
      <div
        className="overflow-hidden transition-transform duration-300 ease-in-out"
        style={{
          // max-height 등 레이아웃에 영향을 주는 속성으로 숨기면, 헤더 높이만큼
          // 문서 전체 높이가 실시간으로 줄어든다 — 콘텐츠가 짧은 페이지에서는
          // 이게 스크롤 가능 범위 자체를 줄여서 브라우저가 scrollY를 강제로
          // 당겨버렸고(clamp), 스크롤 리스너가 이를 "위로 스크롤함"으로 오인해
          // 헤더를 다시 켰다 — 그러면 문서가 다시 늘어나 또 꺼지는 조건이
          // 충족되고... 이 진동이 반짝임의 진짜 원인이었다. transform은
          // 레이아웃에 전혀 영향을 주지 않으므로 이 되먹임 자체가 불가능하다.
          transform: visible ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div
          ref={barRef}
          className={`pt-2 transition-colors duration-300 ${
            effectiveTransparent
              ? "bg-transparent border-b border-white/20"
              : "bg-white border-b border-bluegrey-1"
          }`}
        >
          <div
            ref={rowRef}
            className="max-w-[1440px] mx-auto px-8 h-[72px] flex items-center justify-between gap-16"
          >
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 w-[180px]"
              onMouseEnter={() => setOpenMenu(null)}
            >
              <ChurchLogo
                className="h-30 w-30 object-contain transition-[filter] duration-300"
                style={{ filter: effectiveTransparent ? "brightness(0) invert(1)" : "none" }}
                alt={`${church.name} 로고`}
              />
            </Link>

            <nav className="flex items-center gap-14 h-full">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  ref={(el) => (itemRefs.current[item.label] = el)}
                  className="group relative flex items-center h-full"
                  onMouseEnter={() => setOpenMenu(item.children ? item.label : null)}
                >
                  {item.children ? (
                    <>
                      <button
                        className={`text-body-2 font-medium whitespace-nowrap py-2 transition-colors ${navTextCls(
                          openMenu === item.label,
                        )}`}
                      >
                        {item.label}
                      </button>
                      <span
                        className={`absolute bottom-0 -left-7 -right-7 h-0.5 origin-center transition-transform duration-500 ease-out ${
                          openMenu === item.label ? "scale-x-100" : "scale-x-0"
                        } ${navUnderlineCls(true)}`}
                      />
                    </>
                  ) : (
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        `text-body-2 font-medium whitespace-nowrap py-2 transition-colors ${navTextCls(isActive)}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.label}
                          <span
                            className={`absolute bottom-0 -left-3 -right-3 h-0.5 transition-colors ${navUnderlineCls(isActive)}`}
                          />
                        </>
                      )}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>

            <div
              className="flex items-center gap-2.5 shrink-0 justify-end"
              onMouseEnter={() => setOpenMenu(null)}
            >
              {currentUser ? (
                <>
                  <Link
                    to="/mypage"
                    className={`px-4 py-2 rounded-full border border-bluegrey-3 text-body-3 font-semibold transition-colors whitespace-nowrap ${authBtnOutlineCls}`}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={logout}
                    className={`px-4 py-2 rounded-full border border-bluegrey-3 text-body-3 font-semibold transition-colors whitespace-nowrap ${authBtnOutlineCls}`}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={`px-4 py-2 text-body-3 font-semibold transition-colors whitespace-nowrap ${registerLinkCls}`}
                  >
                    회원가입
                  </Link>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-full shadow-sm text-body-3 font-semibold active:scale-95 transition-all whitespace-nowrap ${loginBtnCls}`}
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {displayMenu && (
        <div
          className={`absolute left-0 right-0 shadow-xl overflow-hidden ${
            transparent ? "bg-white/90" : "bg-bluegrey-1"
          }`}
          onMouseLeave={() => setOpenMenu(null)}
          style={{
            height: openMenu ? wrapHeight : 0,
            // 커튼/칠판을 내리듯: 열릴 땐 묵직하게 내려오다 바닥에서 부드럽게 멈추고,
            // 닫힐 땐 스르륵 말려 올라가듯 가속한다.
            transition: openMenu
              ? "height 950ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "height 450ms cubic-bezier(0.64, 0, 0.78, 0)",
          }}
        >
          <div
            ref={panelContentRef}
            className="max-w-[1440px] mx-auto py-5"
            style={{ paddingRight: "2rem" }}
          >
            {/* 각 열은 position:absolute + translateX(-50%)로 열의 "중심"을 상위 메뉴
                항목의 중심(colCenters)에 정확히 맞춘다. 폭이 트랙 크기에 좌우되는
                grid 대신 이 방식을 쓰는 이유: 하위 항목 중 가장 긴 것이 열 폭을
                정하는 한, 어떤 정렬 기준을 쓰든 "열의 왼쪽 끝"과 "상위 메뉴의 왼쪽
                끝"을 맞추면 짧은 하위 항목들이 상위 메뉴 기준에서 오른쪽으로 밀려
                보인다 — 중심끼리 맞춰야 열 폭과 무관하게 항상 상위 메뉴 아래 온다.
                absolute로 빼면 문서 흐름에서 높이가 사라지므로, 위 useLayoutEffect가
                실제 렌더된 열 높이를 측정해 panelHeight로 되돌려준다. */}
            <div
              data-testid="mega-menu-columns"
              className="relative"
              style={{ height: panelHeight || undefined }}
            >
              {/* 현재 호버 중인 상위 메뉴의 열 배경을 흰색으로 강조 — 패널 자체를 히어로
                  위에서는 반투명 흰색(bg-white/90), 일반 페이지에서는 불투명 회색
                  (bg-bluegrey-1)으로 깔아두므로 흰색 하이라이트가 항상 도드라진다.
                  이웃 메뉴 중심까지의 절반 지점을 경계로 삼아 폭을 정한다. */}
              {(() => {
                const activeIndex = menuItems.findIndex((item) => item.label === displayMenu);
                if (activeIndex === -1) return null;
                const activeCenter = colCenters[displayMenu] ?? 0;
                const prevCenter =
                  activeIndex > 0 ? (colCenters[menuItems[activeIndex - 1].label] ?? null) : null;
                const nextCenter =
                  activeIndex < menuItems.length - 1
                    ? (colCenters[menuItems[activeIndex + 1].label] ?? null)
                    : null;
                const leftGap =
                  prevCenter !== null
                    ? activeCenter - prevCenter
                    : nextCenter !== null
                      ? nextCenter - activeCenter
                      : 160;
                const rightGap = nextCenter !== null ? nextCenter - activeCenter : leftGap;
                return (
                  <ExpandingHighlight
                    key={displayMenu}
                    left={activeCenter - leftGap / 2}
                    width={(leftGap + rightGap) / 2}
                  />
                );
              })()}
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  ref={(el) => (colRefs.current[item.label] = el)}
                  className="absolute top-0 flex flex-col items-center"
                  style={{
                    left: colCenters[item.label] ?? 0,
                    transform: "translateX(-50%)",
                  }}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.to}
                      onClick={() => setOpenMenu(null)}
                      className="px-2 py-1.5 text-body-3 text-grey-7 whitespace-nowrap relative group transition-colors hover:text-blue-6 hover:font-semibold"
                    >
                      {child.label}
                      <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-primary origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────
// Mobile Header (md 미만에서만 표시)
// ─────────────────────────────────────────────────────
function MobileHeader({ onMenuOpen, visible, barRef }) {
  return (
    <header
      className="sticky top-0 z-50 overflow-hidden transition-transform duration-300 ease-in-out md:hidden"
      style={{ transform: visible ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div
        ref={barRef}
        className="relative bg-white border-b border-bluegrey-2 flex items-center justify-between px-5 h-14"
      >
        <Link to="/" className="flex items-center gap-2">
          <ChurchLogo className="h-24 w-25 object-contain" alt="" />
        </Link>
        <div className="flex items-center">
          <span aria-hidden="true" className="p-1.5">
            <img src={IcoBell} className="w-6 h-6" alt="" />
          </span>
          <button onClick={onMenuOpen} className="p-1.5 -mr-1" aria-label="메뉴 열기">
            <img src={IcoMenu} className="w-6 h-6" alt="" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────
// Mobile Drawer
// ─────────────────────────────────────────────────────

function MobileDrawer({ isOpen, onClose }) {
  const { church } = useChurch();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 프로필 (로그인 상태일 때만) */}
        {currentUser && (
          <div className="px-5 py-4 border-b border-bluegrey-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[15px] font-bold text-white shrink-0">
                {currentUser.name?.[0]}
              </div>
              <span className="text-body-2 font-semibold text-grey-10">
                {currentUser.name}님
              </span>
            </div>
          </div>
        )}

        {/* 네비게이션 — 데스크톱 메가메뉴와 같은 church.nav를 쓴다(하드코딩 중복 방지) */}
        <nav className="flex-1 overflow-y-auto py-2">
          {church.nav.map((item) =>
            item.children ? (
              <div key={item.label}>
                <p className="p-4 text-[12px] font-semibold text-grey-5 border-b border-bluegrey-3">{item.label}</p>
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    to={child.to}
                    onClick={onClose}
                    className="block px-5 py-3 text-[15px] font-medium text-grey-10"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="block px-5 py-3 text-[15px] font-medium text-grey-10 border-b border-bluegrey-3"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* 로그아웃 / 로그인·회원가입 */}
        <div
          className="px-5 py-5 border-t border-bluegrey-3 shrink-0"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          {currentUser ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full bg-blue-9 text-center py-2.5 rounded-full border border-bluegrey-3 text-body-4 text-white"
            >
              로그아웃
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/register"
                onClick={onClose}
                className="flex-1 text-center py-2.5 rounded-full border border-bluegrey-3 text-[14px] font-semibold text-grey-9"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="flex-1 text-center py-2.5 rounded-full bg-primary text-white text-[14px] font-semibold"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// Bottom Nav Icons
// ─────────────────────────────────────────────────────
function IconBible({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function IconWorship({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h7.5L19.5 9v11.25a1 1 0 01-1 1h-11.5a1 1 0 01-1-1V4.75a1 1 0 011-1zM14.5 3.75V9h5M9 13.5h6M9 17h6"
      />
    </svg>
  );
}

function IconHome({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconCalendar({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function IconMyPage({ active }) {
  return (
    <svg
      className={`w-[22px] h-[22px] ${active ? "text-primary" : "text-grey-6"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// Bottom Navigation Bar (md 미만에서만 표시)
// ─────────────────────────────────────────────────────
const HIDE_BOTTOM_NAV_ON = ["/login", "/register"];
const HIDE_FOOTER_ON_MOBILE = ["/login", "/register"];

function BottomNav() {
  // useLocation().pathname은 한글 경로에서 percent-encoding된 채로 오므로, 아래
  // match 비교들이 리터럴 한글 문자열과 맞춰지도록 디코딩해서 사용한다.
  const { pathname: rawPathname } = useLocation();
  const pathname = decodeURIComponent(rawPathname);
  const navigate = useNavigate();
  const railRef = useRef(null);
  const touchRef = useRef({ startX: 0, width: 0 });
  // 드래그 중에는 숫자(소수 포함) 인덱스로 손가락을 1:1 추적하고, 손을 떼면 null로 돌아가 activeIndex 기준 스냅 애니메이션을 탄다.
  const [dragIndex, setDragIndex] = useState(null);

  if (HIDE_BOTTOM_NAV_ON.some((p) => pathname.startsWith(p))) return null;

  const tabs = [
    { label: "홈", to: "/", icon: (a) => <IconHome active={a} />, match: (p) => p === "/" },
    {
      label: "예배",
      to: "/말씀",
      icon: (a) => <IconWorship active={a} />,
      match: (p) => p === "/말씀" || (p.startsWith("/말씀") && !p.startsWith("/말씀/읽기") && !p.startsWith("/말씀/필사")),
    },
    {
      label: "성경",
      to: "/말씀/읽기",
      icon: (a) => <IconBible active={a} />,
      match: (p) => p.startsWith("/말씀/읽기") || p.startsWith("/말씀/필사"),
    },
    { label: "캘린더", to: "/교회행사", icon: (a) => <IconCalendar active={a} />, match: (p) => p.startsWith("/교회행사") },
    { label: "마이페이지", to: "/mypage", icon: (a) => <IconMyPage active={a} />, match: (p) => p.startsWith("/mypage") },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.match(pathname));
  const isDragging = dragIndex !== null;
  // 드래그 중엔 activeIndex가 없는 화면(교회소개 등)이라도 손가락이 짚은 위치를 기준으로 인디케이터를 보여준다.
  const indicatorIndex = isDragging ? dragIndex : activeIndex;

  const handleTouchStart = (e) => {
    if (activeIndex === -1 || !railRef.current) return;
    touchRef.current = { startX: e.touches[0].clientX, width: railRef.current.offsetWidth };
    setDragIndex(activeIndex);
  };

  const handleTouchMove = (e) => {
    if (dragIndex === null) return;
    const tabWidth = touchRef.current.width / tabs.length;
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const next = Math.min(tabs.length - 1, Math.max(0, activeIndex + dx / tabWidth));
    setDragIndex(next);
  };

  const handleTouchEnd = () => {
    if (dragIndex === null) return;
    const target = Math.round(dragIndex);
    setDragIndex(null);
    if (target !== activeIndex) {
      navigator.vibrate?.(10);
      void navigate(tabs[target].to);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-gradient-to-b from-bluegrey-1/0 to-bluegrey-1 pt-[10px] pb-[calc(21px+env(safe-area-inset-bottom))] pointer-events-none md:hidden"
    >
      <nav
        ref={railRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative w-[400px] max-w-[calc(100%-38px)] h-[60px] rounded-full bg-white/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0px_3px_40px_0px_rgba(36,42,57,0.1)] touch-none pointer-events-auto"
      >
        {/* 활성 탭 배경 — 탭이 바뀔 때 슬라이드로 따라 이동한다(overshoot로 살짝 통통 튀는 느낌).
            드래그 중에는 손가락을 1:1로 따라가야 하니 transition을 끄고, 손을 떼는 순간 다시 스프링 애니메이션을 켠다.
            어떤 탭과도 매치되지 않는 화면(예: 교회소개)에서는 보여줄 위치가 없으니 숨긴다. */}
        {indicatorIndex !== -1 && (
          <div
            className={`absolute top-1 bottom-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.9),0_2px_10px_0_rgba(59,82,128,0.18)] ${isDragging ? "" : "transition-[left] duration-[350ms]"}`}
            style={{
              left: `calc(${indicatorIndex} * ${100 / tabs.length}% + 4px)`,
              width: `calc(${100 / tabs.length}% - 8px)`,
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        )}
        <div className="relative flex items-stretch h-full">
          {tabs.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.label}
                to={tab.to}
                onClick={() => navigator.vibrate?.(10)}
                className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform duration-150"
              >
                {tab.icon(active)}
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-grey-6"}`}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────
const BIBLE_PAGES = ["/말씀/읽기", "/말씀/필사"];

function Layout() {
  // 한글 경로의 percent-encoding을 풀어야 BIBLE_PAGES 등 리터럴 한글 문자열
  // 비교가 실제 브라우저 환경에서도 맞는다(BottomNav의 동일 이슈 참고).
  const { pathname: rawPathname } = useLocation();
  const pathname = decodeURIComponent(rawPathname);
  const { loading: churchLoading } = useChurch();
  const [showSplash, setShowSplash] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { visible: headerVisible, atTop } = useHideHeaderOnScroll();
  const desktopBarRef = useRef(null);
  const mobileBarRef = useRef(null);
  const desktopBarHeight = useMeasuredHeight(desktopBarRef);
  const mobileBarHeight = useMeasuredHeight(mobileBarRef);
  // display:none인 브레이크포인트 쪽은 항상 0이 측정되므로, 둘을 더하기만 해도
  // "현재 화면에 실제로 보이는 헤더의 높이"가 된다 — sticky 서브탭이 이 값을 참조한다.
  const headerHeight = desktopBarHeight + mobileBarHeight;

  const showBottomNav = !HIDE_BOTTOM_NAV_ON.some((p) => pathname.startsWith(p));
  const hideFooterOnMobile = HIDE_FOOTER_ON_MOBILE.some((p) => pathname.startsWith(p));
  const isBiblePage = BIBLE_PAGES.some((p) => pathname.startsWith(p));
  // 모바일에서 푸터가 보이면 푸터 자신이 바텀 네비 높이만큼 하단 여백을 이미 두므로,
  // main에 또 같은 여백을 주면 콘텐츠와 푸터 사이에 빈 공간이 이중으로 생긴다.
  const footerVisibleOnMobile = !isBiblePage && !hideFooterOnMobile;
  const isHome = pathname === "/";
  // 홈 히어로 배너 위에서만(맨 위 근처) 헤더를 투명하게 — 배너가 헤더 뒤까지 차오르는 연출.
  const headerTransparent = isHome && atTop;

  useEffect(() => {
    if (!churchLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [churchLoading]);


  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        // sticky 서브탭용 — 헤더가 숨김 상태면 0(서브탭이 자리를 메우며 위로 붙음).
        "--header-offset": `${headerVisible ? headerHeight : 0}px`,
        // 홈 히어로 배너가 헤더 아래로 파고들 때 쓰는 고정값 — 숨김 상태와 무관하게
        // 항상 "완전히 펼쳐진" 헤더 높이를 유지해야 스크롤 중 레이아웃이 튀지 않는다.
        "--header-height": `${headerHeight}px`,
        // 바텀탭 pill이 실제로 차지하는 총 높이(위 패딩 10px + pill 60px + 아래
        // 패딩 21px) + safe-area. main의 하단 패딩, 모바일 Footer, 상세 페이지의
        // sticky CTA가 전부 이 값 하나를 참조해야 겹침 없이 일관된다.
        "--bottom-nav-h": "calc(91px + env(safe-area-inset-bottom))",
      }}
    >
      {/* 데스크탑 헤더 (bible 전체화면 페이지 제외) */}
      {!isBiblePage && (
        <DesktopHeader
          visible={headerVisible}
          barRef={desktopBarRef}
          transparent={headerTransparent}
        />
      )}

      {/* 모바일 헤더 */}
      <MobileHeader
        onMenuOpen={() => setDrawerOpen(true)}
        visible={headerVisible}
        barRef={mobileBarRef}
      />

      {/* 모바일 드로어 */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* 페이지 컨텐츠 */}
      <main className={`flex-1 ${showBottomNav && !footerVisibleOnMobile ? "pb-[var(--bottom-nav-h)] md:pb-0" : ""}`}>
        <Outlet />
      </main>

      {/* 푸터 (bible 전체화면 페이지 제외, 로그인은 모바일에서만 숨김) */}
      {!isBiblePage && (
        <div className={hideFooterOnMobile ? "hidden md:block" : ""}>
          <Footer isHome={pathname === "/"} />
        </div>
      )}

      {/* 모바일 바텀 네비 */}
      <BottomNav />

      {/* 검색 오버레이 */}
      <SearchOverlay />

      {/* 모바일 스플래시 — 교회 데이터 로딩 동안 노출 */}
      <SplashScreen show={showSplash} />
    </div>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChurchProvider>
        <ScrollToTop />
        <Layout />
      </ChurchProvider>
    </AuthProvider>
  );
}
