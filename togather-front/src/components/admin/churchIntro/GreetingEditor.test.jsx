import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import GreetingEditor from "./GreetingEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const CHURCH = {
  greeting: {
    title: "할렐루야!",
    paragraphs: ["첫 번째 문단입니다.", "두 번째 문단입니다."],
    signature: { church: "옥길교회", title: "담임목사", name: "임재호", signatureImage: null },
  },
  staff: { headPastor: { image: null } },
};

describe("GreetingEditor", () => {
  beforeEach(() => vi.clearAllMocks());

  it("기존 인사말 값을 입력창과 미리보기에 채운다", () => {
    renderWithChurch(<GreetingEditor />, { church: CHURCH });

    expect(screen.getByDisplayValue("할렐루야!")).toBeInTheDocument();
    expect(screen.getByDisplayValue("임재호")).toBeInTheDocument();
    // 미리보기(실제 Greeting 컴포넌트)에도 같은 제목이 렌더링된다
    expect(screen.getByText("할렐루야!")).toBeInTheDocument();
  });

  it("저장하면 문단을 빈 줄 기준으로 나눠 PUT /church/admin/intro/GREETING을 호출한다", async () => {
    api.put.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithChurch(<GreetingEditor />, { church: CHURCH });

    const body = screen.getByPlaceholderText("문단을 나눌 땐 빈 줄을 하나 띄워 주세요.");
    await user.clear(body);
    await user.type(body, "첫 문단{enter}{enter}둘째 문단");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/intro/GREETING",
        expect.objectContaining({ paragraphs: ["첫 문단", "둘째 문단"] }),
      ),
    );
    expect(await screen.findByText("저장됨")).toBeInTheDocument();
  });
});
