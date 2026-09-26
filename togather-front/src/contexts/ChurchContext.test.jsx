import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import { ChurchProvider, useChurch } from "./ChurchContext";
import defaultConfig from "@/config/church.config";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn() },
  setCurrentChurchId: vi.fn(),
}));

import api, { setCurrentChurchId } from "@/services/api";

function Probe() {
  const { church, loading } = useChurch();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="name">{church.name}</span>
      <span data-testid="tel">{church.tel}</span>
      <span data-testid="navCount">{church.nav.length}</span>
      <span data-testid="instagram">{church.social?.instagram ?? "none"}</span>
      <span data-testid="greetingTitle">{church.greeting?.title}</span>
      <span data-testid="firstWorship">{church.worshipSchedule?.regular?.[0]?.name}</span>
    </div>
  );
}

/**
 * ChurchProvider는 tenant 조회 후 intro/worship-schedule/profile을 병렬로 부른다.
 * url별로 응답을 지정하고, 지정하지 않은 url은 거부(=미설정)시킨다.
 */
function mockEndpoints({ tenant, intro, schedule, profile }) {
  api.get.mockImplementation((url) => {
    if (url === "/tenant") {
      return tenant ? Promise.resolve({ data: { data: tenant } }) : Promise.reject(new Error("no tenant"));
    }
    if (url.endsWith("/intro")) {
      return intro ? Promise.resolve({ data: { data: intro } }) : Promise.reject(new Error("no intro"));
    }
    if (url === "/church/worship-schedule") {
      return schedule
        ? Promise.resolve({ data: { data: schedule } })
        : Promise.reject(new Error("no schedule"));
    }
    if (url === "/church/profile") {
      return profile
        ? Promise.resolve({ data: { data: profile } })
        : Promise.reject(new Error("no profile"));
    }
    return Promise.reject(new Error(`unexpected url: ${url}`));
  });
}

describe("ChurchContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기 렌더 시 defaultConfig로 즉시 보여준다(로딩 중에도 화면이 비지 않음)", () => {
    api.get.mockReturnValue(new Promise(() => {})); // 영구 대기 — 아직 응답 없음
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("name").textContent).toBe(defaultConfig.name);
  });

  it("tenant 조회 성공 시 응답 데이터로 교체되고 setCurrentChurchId가 호출된다", async () => {
    api.get.mockResolvedValue({
      data: { data: { id: 42, name: "테스트교회", tel: "02-0000-0000" } },
    });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("테스트교회"));
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(setCurrentChurchId).toHaveBeenCalledWith(42);
  });

  it("tenant 응답에 없는 필드는 defaultConfig 값으로 fallback된다", async () => {
    // API가 nav 필드를 안 내려줘도(예: address 등 일부 필드 누락) church.nav는 defaultConfig 값을 유지해야 한다
    api.get.mockResolvedValue({ data: { data: { id: 1, name: "부분응답교회" } } });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("부분응답교회"));
    // tel은 응답에 없었으므로 defaultConfig.tel 그대로여야 한다
    expect(screen.getByTestId("tel").textContent).toBe(defaultConfig.tel);
  });

  it("tenant 응답이 nav를 빈 배열로 내려줘도 defaultConfig.nav를 유지한다(백엔드-프론트 필드명 충돌 방지)", async () => {
    // 백엔드 /api/tenant가 관련 없는 용도로 nav: []를 내려주는 경우가 있음 —
    // 얕은 병합이 이를 그대로 받아들이면 GNB 메뉴 전체가 사라진다(실제 버그 재현).
    api.get.mockResolvedValue({ data: { data: { id: 1, name: "충돌교회", nav: [] } } });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("충돌교회"));
    expect(screen.getByTestId("navCount").textContent).toBe(String(defaultConfig.nav.length));
  });

  it("tenant 조회 실패 시 에러 화면 대신 defaultConfig로 폴백한다(백엔드 미배포 환경 대응)", async () => {
    api.get.mockRejectedValue(new Error("network error"));
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("name").textContent).toBe(defaultConfig.name);
    expect(screen.queryByText("교회 정보를 찾을 수 없습니다.")).not.toBeInTheDocument();
  });

  it("교회 프로필의 instagramUrl이 social.instagram으로 병합된다", async () => {
    mockEndpoints({
      tenant: { id: 1, name: "인스타교회" },
      profile: { instagramUrl: "https://www.instagram.com/okgil" },
    });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("instagram").textContent).toBe("https://www.instagram.com/okgil"),
    );
  });

  it("프로필에 인스타그램이 없으면 기본 설정값을 유지한다", async () => {
    mockEndpoints({ tenant: { id: 1, name: "무인스타교회" }, profile: { instagramUrl: null } });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("instagram").textContent).toBe(
      defaultConfig.social.instagram ?? "none",
    );
  });

  it("교회소개 섹션(GREETING 등)이 내려오면 church의 해당 블록을 덮어쓴다", async () => {
    mockEndpoints({
      tenant: { id: 1, name: "소개교회" },
      intro: { GREETING: { title: "서버 인사말", paragraphs: [] } },
    });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("greetingTitle").textContent).toBe("서버 인사말"));
  });

  it("설정되지 않은 교회소개 섹션은 기본 설정을 유지한다", async () => {
    // 백엔드는 설정된 섹션만 내려준다 — VISION만 와도 GREETING이 지워지면 안 된다
    mockEndpoints({ tenant: { id: 1, name: "부분소개교회" }, intro: { VISION: { year: 2030 } } });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("greetingTitle").textContent).toBe(defaultConfig.greeting.title);
  });

  it("예배 시간표가 내려오면 교체하고, 비어 있으면 기본 설정을 유지한다", async () => {
    mockEndpoints({
      tenant: { id: 1, name: "예배교회" },
      schedule: { regular: [{ name: "서버 1부", time: "9시", location: "본당" }], departments: [] },
    });
    const { unmount } = render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("firstWorship").textContent).toBe("서버 1부"));
    unmount();

    mockEndpoints({
      tenant: { id: 1, name: "예배교회" },
      schedule: { regular: [], departments: [] },
    });
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("firstWorship").textContent).toBe(
      defaultConfig.worshipSchedule.regular[0].name,
    );
  });

  it("콘텐츠 조회가 모두 실패해도 기본 설정으로 ready 상태가 된다", async () => {
    mockEndpoints({ tenant: { id: 1, name: "실패교회" } }); // intro/schedule/profile 전부 거부
    render(
      <ChurchProvider>
        <Probe />
      </ChurchProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("name").textContent).toBe("실패교회");
    expect(screen.getByTestId("greetingTitle").textContent).toBe(defaultConfig.greeting.title);
  });

  it("initialChurch가 주어지면 fetch를 생략하고 즉시 ready 상태다(테스트 주입용)", () => {
    render(
      <ChurchProvider initialChurch={{ ...defaultConfig, name: "주입교회" }}>
        <Probe />
      </ChurchProvider>,
    );
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("name").textContent).toBe("주입교회");
    expect(api.get).not.toHaveBeenCalled();
  });
});
