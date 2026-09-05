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
    </div>
  );
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
