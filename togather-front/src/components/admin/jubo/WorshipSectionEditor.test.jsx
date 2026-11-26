import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorshipSectionEditor from "./WorshipSectionEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

function mockPrefill() {
  api.get.mockImplementation((url) => {
    if (url.includes("worship-services")) {
      return Promise.resolve({ data: { data: [{ label: "주일 오전예배", time: "오전 9:00" }] } });
    }
    if (url.includes("worship-order")) {
      return Promise.resolve({
        data: { data: { "주일 오전예배": [{ role: "예배 부름", name: "성가대" }] } },
      });
    }
    return Promise.reject(new Error(`unexpected url: ${url}`));
  });
}

describe("WorshipSectionEditor — 라벨 없이 여러 예배를 추가해도 순서표가 서로 덮어쓰지 않는다", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrefill();
  });

  it("라벨을 입력하지 않은 예배를 두 개 추가하고 각각 순서를 입력해도 서로의 데이터가 섞이지 않는다", async () => {
    const user = userEvent.setup();
    render(<WorshipSectionEditor churchId="church-1" juboId={1} />);
    await screen.findByDisplayValue("주일 오전예배");

    await user.click(screen.getByRole("button", { name: "+ 예배 추가" }));
    await user.click(screen.getByRole("button", { name: "+ 예배 추가" }));

    // 새로 추가된 두 예배는 라벨이 비어있으므로 "(이름 없음)" 칩이 두 개 보인다
    const unnamedChips = screen.getAllByRole("button", { name: "(이름 없음)" });
    expect(unnamedChips).toHaveLength(2);

    // 첫 번째 "(이름 없음)" 예배를 선택해 순서를 하나 추가한다
    await user.click(unnamedChips[0]);
    await user.click(screen.getByRole("button", { name: "+ 순서 추가" }));
    const roleInputsAfterFirst = screen.getAllByLabelText("역할");
    await user.type(roleInputsAfterFirst[roleInputsAfterFirst.length - 1], "첫번째예배순서");

    // 두 번째 "(이름 없음)" 예배로 전환해도 방금 입력한 순서가 보이면 안 된다(id 기반 분리 확인)
    const unnamedChipsAfter = screen.getAllByRole("button", { name: "(이름 없음)" });
    await user.click(unnamedChipsAfter[1]);
    expect(screen.queryByDisplayValue("첫번째예배순서")).not.toBeInTheDocument();
  });
});
