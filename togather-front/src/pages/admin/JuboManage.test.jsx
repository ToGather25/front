import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import JuboManage from "./JuboManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

function mockPrefillGets() {
  api.get.mockImplementation((url) => {
    if (url.includes("/draft")) {
      return Promise.reject({ response: { status: 404 } });
    }
    if (url.includes("/settings")) {
      return Promise.resolve({ data: { data: { juboTemplateVersion: "v1" } } });
    }
    if (url.includes("/current")) {
      return Promise.resolve({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
    }
    if (url.includes("worship-services")) {
      return Promise.resolve({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    }
    if (url.includes("worship-order")) {
      return Promise.resolve({
        data: { data: { "주일 오전예배": [{ role: "예배 부름", name: "성가대" }] } },
      });
    }
    if (url.includes("volunteer")) {
      return Promise.resolve({
        data: { data: [{ role: "대표기도", part1: "000", part2: "000" }] },
      });
    }
    if (url.includes("offering")) {
      return Promise.resolve({ data: { data: [{ title: "십일조", items: ["OOO 외 00명"] }] } });
    }
    if (url.includes("support")) {
      return Promise.resolve({
        data: { data: [{ organization: "베트남", target: "선교사님", region: "구역명" }] },
      });
    }
    if (url.includes("districts")) {
      return Promise.resolve({
        data: { data: [{ name: "1구역", location: "장소", time: "시간", leader: "OOO 집사" }] },
      });
    }
    if (url.includes("ministers")) {
      return Promise.resolve({ data: { data: [{ title: "교역자", items: ["담임목사 | OOO"] }] } });
    }
    if (url.includes("cover")) {
      return Promise.resolve({
        data: { data: { photos: { church: "https://example.com/church.jpg" } } },
      });
    }
    if (url.includes("news")) {
      return Promise.resolve({
        data: { data: [{ title: "정기모임", items: ["금요기도회"] }] },
      });
    }
    if (url.includes("prayer-topics")) {
      return Promise.resolve({
        data: { data: [{ title: "다음 세대를 위한 기도", subtitle: "교사 헌신자", category: "사역" }] },
      });
    }
    if (url.includes("sermon-note")) {
      return Promise.resolve({
        data: { data: { title: "은혜 위에 은혜러라", scripture: "요한복음 1장 16절", outline: [] } },
      });
    }
    return Promise.reject(new Error(`unexpected GET url: ${url}`));
  });
}

function mockCreateOnce() {
  api.post.mockResolvedValueOnce({
    data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: false } },
  });
}

async function createIssue(user) {
  await user.type(screen.getByLabelText("호수"), "제10-8");
  fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
  await user.click(screen.getByRole("button", { name: "작성 시작" }));
  await screen.findByRole("button", { name: "완료" });
}

describe("JuboManage — 주보 관리", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefillGets();
  });

  it("마운트 시 현재 발행된 주보 정보를 보여준다", async () => {
    renderWithChurch(<JuboManage />);
    expect(await screen.findByText("제10-7 · 2026년 2월 15일")).toBeInTheDocument();
  });

  it("호수/날짜를 입력해 작성 시작하면 createJuboIssue를 호출하고 섹션 에디터가 나타난다", async () => {
    mockCreateOnce();
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await createIssue(user);

    expect(api.post).toHaveBeenCalledWith("/church/admin/jubo", {
      issueNo: "제10-8",
      juboDate: "2026-06-01",
      juboTemplateVersion: "v1",
    });
    expect(screen.getByText("예배")).toBeInTheDocument();
    expect(screen.getByText("봉사")).toBeInTheDocument();
  });

  it("미발행 초안이 있으면 새로고침 후에도 작성 폼 대신 같은 초안의 섹션 에디터를 바로 보여준다", async () => {
    api.get.mockImplementation((url) => {
      if (url.includes("/draft")) {
        return Promise.resolve({
          data: { data: { id: 99, issueNo: "제10-9", juboDate: "2026-07-01", published: false } },
        });
      }
      if (url.includes("/settings")) {
        return Promise.resolve({ data: { data: { juboTemplateVersion: "v1" } } });
      }
      if (url.includes("/current")) {
        return Promise.resolve({ data: { data: { issueNo: "제10-7", date: "2026년 2월 15일" } } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
    renderWithChurch(<JuboManage />);

    expect(await screen.findByText("예배")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "작성 시작" })).not.toBeInTheDocument();
  });

  it("주보 생성이 실패하면 에러 메시지를 보여준다", async () => {
    api.post.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");

    await user.type(screen.getByLabelText("호수"), "제10-8");
    fireEvent.change(screen.getByLabelText("날짜"), { target: { value: "2026-06-01" } });
    await user.click(screen.getByRole("button", { name: "작성 시작" }));

    expect(
      await screen.findByText("주보 생성에 실패했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("우측 하단 임시저장 버튼을 누르면 전체 호를 한 번에 저장하고 이 기기에도 백업한다", async () => {
    localStorage.removeItem("jubo-draft-42");
    mockCreateOnce();
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await waitFor(() =>
      expect(document.querySelector('img[src="https://example.com/church.jpg"]')).toBeTruthy(),
    );

    await user.click(screen.getByRole("button", { name: "임시저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/42/draft",
        expect.objectContaining({
          issueNo: "제10-8",
          juboDate: "2026-06-01",
          sections: expect.objectContaining({
            COVER: expect.any(Object),
            WORSHIP_SERVICES: expect.any(Array),
            DISTRICTS: expect.any(Array),
          }),
        }),
      ),
    );
    expect(await screen.findByText("임시저장 완료")).toBeInTheDocument();

    const local = JSON.parse(localStorage.getItem("jubo-draft-42"));
    expect(local.issueNo).toBe("제10-8");
    expect(local.sections.COVER).toBeTruthy();
  });

  it("임시저장 API가 실패해도 이 기기에는 백업하고 실패를 토스트로 알린다", async () => {
    localStorage.removeItem("jubo-draft-42");
    mockCreateOnce();
    api.put.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);
    await waitFor(() =>
      expect(document.querySelector('img[src="https://example.com/church.jpg"]')).toBeTruthy(),
    );

    await user.click(screen.getByRole("button", { name: "임시저장" }));

    expect(await screen.findByText("임시저장 실패 — 이 기기에는 백업해 두었습니다")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("jubo-draft-42")).issueNo).toBe("제10-8");
  });

  it("5분(300초) 카운트다운이 끝나면 임시저장이 자동으로 실행되고, 다음 5분으로 리셋된다", async () => {
    mockCreateOnce();
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(screen.getByText("05:00")).toBeInTheDocument();

    // 등록된 1초 틱 콜백을 300번 직접 호출해 카운트다운이 0에 도달하는 상황을 재현한다.
    api.put.mockResolvedValue({ data: null });
    api.put.mockClear();
    const [tickCallback] = setIntervalSpy.mock.calls.find(([, ms]) => ms === 1000);
    act(() => {
      for (let i = 0; i < 300; i++) tickCallback();
    });

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/jubo/42/draft", expect.any(Object)),
    );
    expect(screen.getByText("05:00")).toBeInTheDocument();
  });

  it("상단 경고 문구 없이 완료 옆에 취소 버튼이 있고, 누르면 유실 경고 후 확인해야 닫힌다", async () => {
    mockCreateOnce();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    expect(
      screen.queryByText("작성 중 새로고침하면 저장하지 않은 내용은 유실됩니다."),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(window.confirm).toHaveBeenCalledWith(
      "작성 중인 주보를 닫으시겠습니까? 저장하지 않은 섹션 내용은 사라집니다.",
    );
    // 취소를 확인하지 않았으므로(window.confirm → false) 섹션 에디터가 그대로 남아있어야 한다.
    expect(screen.getByText("예배")).toBeInTheDocument();
  });

  it("완료를 누르면 확인 후 publishJubo를 호출하고 완료됨 상태가 된다", async () => {
    mockCreateOnce();
    api.post.mockResolvedValueOnce({
      data: { data: { id: 42, issueNo: "제10-8", juboDate: "2026-06-01", published: true } },
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    await user.click(screen.getByRole("button", { name: "완료" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "주보를 발행하시겠습니까? 발행 즉시 공개 화면에 반영됩니다.",
    );
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/church/admin/jubo/42/publish"));
    expect(await screen.findByRole("button", { name: "완료됨" })).toBeInTheDocument();
  });

  it("작성 취소를 확인하면 새 주보 작성 폼으로 돌아간다", async () => {
    mockCreateOnce();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "작성 중인 주보를 닫으시겠습니까? 저장하지 않은 섹션 내용은 사라집니다.",
    );
    expect(screen.getByRole("button", { name: "작성 시작" })).toBeInTheDocument();
    expect(screen.queryByText("예배")).not.toBeInTheDocument();
  });

  it("발행 확인을 취소하면 publishJubo를 호출하지 않는다", async () => {
    mockCreateOnce();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    renderWithChurch(<JuboManage />);
    await screen.findByText("제10-7 · 2026년 2월 15일");
    await createIssue(user);

    await user.click(screen.getByRole("button", { name: "완료" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalledWith("/church/admin/jubo/42/publish");
    expect(screen.getByRole("button", { name: "완료" })).toBeInTheDocument();
  });
});
