import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import Contact from "./Contact";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  isDummy: () => false,
}));

import api from "@/services/api";

async function fillForm(user) {
  await user.type(screen.getByLabelText(/이름/), "홍길동");
  await user.type(screen.getByLabelText(/연락처/), "010-0000-0000");
  await user.selectOptions(screen.getByLabelText(/문의 유형/), "예배 및 행사");
  await user.type(screen.getByLabelText(/문의 내용/), "문의합니다");
}

describe("Contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("필수 필드를 채우고 제출하면 문의 API를 호출하고 완료 화면을 보여준다", async () => {
    api.post.mockResolvedValue({ data: { data: { contactId: 1 } } });
    const user = userEvent.setup();
    renderWithChurch(<Contact />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "문의 보내기" }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        expect.stringContaining("/contact"),
        expect.objectContaining({
          name: "홍길동",
          phone: "010-0000-0000",
          category: "예배 및 행사",
          message: "문의합니다",
        }),
      ),
    );
    expect(await screen.findByText("문의가 접수되었습니다.")).toBeInTheDocument();
  });

  it("제출 중에는 버튼이 비활성화되고 '전송 중...'을 보여준다", async () => {
    let resolvePost;
    api.post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );
    const user = userEvent.setup();
    renderWithChurch(<Contact />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "문의 보내기" }));

    expect(await screen.findByRole("button", { name: "전송 중..." })).toBeDisabled();
    resolvePost({ data: { data: { contactId: 1 } } });
  });

  it("API가 실패하면 에러 메시지를 보여주고 완료 화면으로 넘어가지 않는다", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderWithChurch(<Contact />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "문의 보내기" }));

    expect(
      await screen.findByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.queryByText("문의가 접수되었습니다.")).not.toBeInTheDocument();
  });
});
