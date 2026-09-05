import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { SearchProvider } from "@/contexts/SearchContext";

// MyPage가 마운트되면 /my/schedules, /my/prayers, /my/inquiries를 실제로 호출한다.
// 이 파일의 라우팅 스모크 테스트들은 응답 내용에 관심이 없으므로 빈 목록으로 막아
// jsdom에서 실제 네트워크 요청이 실패해 unhandled rejection이 나는 것을 방지한다.
vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { ...actual.default, get: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  };
});

/**
 * 회귀 방지 테스트 (C-1): /말씀/읽기, /말씀/필사 라우트는 routes.jsx의 실제 라우트 트리에서
 * AuthProvider 하위에 있어야 한다. BibleRead/BibleWrite는 useAuth()로 currentUser를
 * 구조분해하는데, AuthProvider(즉 AuthContext.Provider)가 상위에 없으면 useAuth()가
 * 기본값 null을 반환해 구조분해 시점에 TypeError가 발생하며 화면이 크래시한다.
 *
 * 이 테스트는 App.jsx가 createBrowserRouter에 그대로 넘기는 실제 routes 배열을
 * createMemoryRouter에 꽂아 렌더링함으로써, 실제 라우터 구성에 AuthProvider가
 * 누락되면 여기서 크래시로 드러나게 한다.
 */
describe("routes — 말씀 읽기/필사 라우트의 AuthProvider 존재 확인", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/말씀/읽기 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/읽기"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("/말씀/필사 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/필사"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /말씀/읽기 진입 시 크래시 없이 본문이 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    localStorage.setItem("bible-tutorial-seen", "true");
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/읽기"] });
    // 로그인 상태에서는 BibleSidebar(ChurchLogo 포함)까지 렌더되어 useChurch()가 필요하다.
    render(
      <ChurchProvider>
        <RouterProvider router={router} />
      </ChurchProvider>,
    );
    expect(await screen.findByText("창세기")).toBeInTheDocument();
  });
});

/**
 * 아래 두 테스트는 "/" 하위 RootLayout 라우트(즉 말씀/방송, 말씀/안내)를 거치므로
 * DesktopHeader/DesktopFooter/MobileFooter/SearchOverlay가 함께 렌더된다.
 * 이 컴포넌트들은 useChurch()/useSearch()를 쓰는데, 실제 앱에서는 main.jsx가
 * ChurchProvider·SearchProvider로 RouterProvider 바깥을 감싸주지만 여기서는
 * routes 배열만 createMemoryRouter에 직접 꽂으므로 그 provider들이 없다.
 * (위쪽 "말씀/읽기·필사" 테스트들은 AuthOnlyLayout만 거쳐 RootLayout을 타지 않으므로
 * 이 문제가 드러나지 않았다.) 그래서 여기서만 두 provider로 감싸 렌더한다.
 */
describe("routes — /말씀 리다이렉트 + 예배 안내 라우트", () => {
  it("/말씀 진입 시 /말씀/방송(예배·방송 기본 탭)으로 리다이렉트된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByRole("heading", { name: "예배·방송" })).toBeInTheDocument();
    // 헤더 드롭다운(예배·방송 메뉴)에도 동일 라벨의 링크가 있어 getByRole은 모호해진다.
    // WordTabBar의 활성 탭(class="border-blue-8")을 명시적으로 찾아 검증한다.
    const activeTabLinks = screen
      .getAllByRole("link", { name: "실시간 예배" })
      .filter((link) => link.className.includes("border-blue-8"));
    expect(activeTabLinks).toHaveLength(1);
  });

  it("/말씀/안내 진입 시 예배 안내 페이지가 렌더된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/말씀/안내"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByText("정기 예배")).toBeInTheDocument();
  });
});

describe("routes — /교적부 인증 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/교적부 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/교적부"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /교적부 진입 시 크래시 없이 교인 목록이 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    const router = createMemoryRouter(routes, { initialEntries: ["/교적부"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(await screen.findByPlaceholderText("이름 또는 휴대폰 번호로 검색")).toBeInTheDocument();
  });
});

describe("routes — /mypage 인증 가드", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("/mypage 진입 시 크래시 없이 로그인 필요 모달을 보여준다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/mypage"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
  });

  it("로그인된 상태로 /mypage 진입 시 크래시 없이 탭 콘텐츠가 렌더된다", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "test@togather.com" }));
    const router = createMemoryRouter(routes, { initialEntries: ["/mypage"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(await screen.findByText("내 프로필")).toBeInTheDocument();
  });
});

/**
 * 회귀 방지 테스트: /register, /register/next는 RootLayout(AuthProvider 제공처) 하위이므로
 * useAuth()가 정상 동작해야 한다. 이 테스트는 실제 routes 배열을 createMemoryRouter에 그대로
 * 꽂아 렌더링함으로써, Provider 트리 구성이 실제로 맞는지 확인한다(개별 컴포넌트 테스트는
 * renderWithChurch로 Provider를 직접 감싸므로 이 문제를 못 잡는다 — 이전 사이클들에서
 * 반복적으로 나온 함정).
 */
describe("routes — /register, /register/next의 Provider 트리 확인", () => {
  it("/register 진입 시 크래시 없이 회원가입 폼이 렌더된다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/register"] });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByRole("heading", { name: "회원가입" })).toBeInTheDocument();
  });

  it("/register/next?token=... 진입 시 크래시 없이 계정 생성 폼이 렌더된다", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/register/next?token=test-token"],
    });
    render(
      <ChurchProvider>
        <SearchProvider>
          <RouterProvider router={router} />
        </SearchProvider>
      </ChurchProvider>,
    );
    expect(screen.getByRole("heading", { name: "계정 만들기" })).toBeInTheDocument();
  });
});
