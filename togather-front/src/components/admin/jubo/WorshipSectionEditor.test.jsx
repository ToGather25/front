import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorshipSectionEditor from "./WorshipSectionEditor";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
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

  it("모든 예배에 이름을 입력하지 않으면 저장을 막고 안내 메시지를 보여준다", async () => {
    const user = userEvent.setup();
    render(<WorshipSectionEditor churchId="church-1" juboId={1} />);
    await screen.findByDisplayValue("주일 오전예배");

    await user.click(screen.getByRole("button", { name: "+ 예배 추가" }));
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("모든 예배에 이름을 입력해주세요."),
    ).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it("예배명이 중복되면 저장을 막고 중복된 이름을 안내한다", async () => {
    const user = userEvent.setup();
    render(<WorshipSectionEditor churchId="church-1" juboId={1} />);
    await screen.findByDisplayValue("주일 오전예배");

    await user.click(screen.getByRole("button", { name: "+ 예배 추가" }));
    const labelInputs = screen.getAllByLabelText("예배명");
    await user.type(labelInputs[labelInputs.length - 1], "주일 오전예배");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText('예배명이 중복되었습니다: "주일 오전예배"'),
    ).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });

  it("이름을 유일하게 채우면 저장이 정상적으로 진행된다", async () => {
    api.put.mockResolvedValue({ data: null });
    const user = userEvent.setup();
    render(<WorshipSectionEditor churchId="church-1" juboId={1} />);
    await screen.findByDisplayValue("주일 오전예배");

    await user.click(screen.getByRole("button", { name: "+ 예배 추가" }));
    const labelInputs = screen.getAllByLabelText("예배명");
    await user.type(labelInputs[labelInputs.length - 1], "수요예배");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/jubo/1/sections/WORSHIP_SERVICES",
        expect.arrayContaining([
          { label: "주일 오전예배", time: "오전 9:00" },
          { label: "수요예배", time: "" },
        ]),
      ),
    );
    expect(await screen.findByText("저장됨")).toBeInTheDocument();
  });
});
