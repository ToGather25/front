import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MenusManage from "./MenusManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

import api from "@/services/api";

const TREE = [
  {
    code: "INTRO",
    label: "교회소개",
    to: "/교회소개",
    visible: true,
    orderNo: 0,
    children: [{ code: "GREETING", label: "인사말", to: "/교회소개?tab=인사말", visible: true, orderNo: 0, children: [] }],
  },
];

describe("MenusManage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: TREE } });
    api.put.mockResolvedValue({ data: null });
  });

  it("관리자 메뉴 트리를 조회해 코드·이름·경로를 보여준다", async () => {
    renderWithChurch(<MenusManage />);
    expect(api.get).toHaveBeenCalledWith("/church/admin/menus");
    expect(await screen.findByDisplayValue("INTRO")).toBeInTheDocument();
    expect(screen.getByDisplayValue("교회소개")).toBeInTheDocument();
    expect(screen.getByDisplayValue("GREETING")).toBeInTheDocument();
  });

  it("메뉴를 추가하고 저장하면 orderNo가 배열 순서로 매겨져 전체 트리가 PUT된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MenusManage />);
    await screen.findByDisplayValue("INTRO");

    await user.click(screen.getByRole("button", { name: "+ 메뉴 추가" }));
    const codeInputs = screen.getAllByLabelText("메뉴 코드");
    await user.type(codeInputs[codeInputs.length - 1], "GALLERY");

    await user.click(screen.getByRole("button", { name: "변경사항 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith("/church/admin/menus", [
        {
          code: "INTRO",
          label: "교회소개",
          to: "/교회소개",
          visible: true,
          orderNo: 0,
          children: [
            {
              code: "GREETING",
              label: "인사말",
              to: "/교회소개?tab=인사말",
              visible: true,
              orderNo: 0,
              children: [],
            },
          ],
        },
        { code: "GALLERY", label: "", to: "", visible: true, orderNo: 1, children: [] },
      ]),
    );
  });

  it("메뉴를 삭제할 수 있다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MenusManage />);
    await screen.findByDisplayValue("INTRO");

    const deleteButtons = screen.getAllByRole("button", { name: "삭제" });
    await user.click(deleteButtons[deleteButtons.length - 1]); // GREETING(하위) 삭제

    expect(screen.queryByDisplayValue("GREETING")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("INTRO")).toBeInTheDocument();
  });

  it("노출 체크를 해제할 수 있다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<MenusManage />);
    await screen.findByDisplayValue("INTRO");

    const checkboxes = screen.getAllByRole("checkbox", { name: "노출" });
    expect(checkboxes[0]).toBeChecked();
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });
});
