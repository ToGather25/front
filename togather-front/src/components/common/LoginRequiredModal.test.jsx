import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import LoginRequiredModal from "./LoginRequiredModal";

function renderModal(props = {}) {
  return render(
    <MemoryRouter>
      <LoginRequiredModal message="테스트 메시지" onCancel={vi.fn()} {...props} />
    </MemoryRouter>,
  );
}

describe("LoginRequiredModal", () => {
  it("제목과 전달받은 메시지를 렌더한다", () => {
    renderModal({ message: "교적부를 이용하려면 로그인해 주세요." });
    expect(screen.getByText("로그인이 필요한 서비스입니다")).toBeInTheDocument();
    expect(screen.getByText("교적부를 이용하려면 로그인해 주세요.")).toBeInTheDocument();
  });

  it("취소 버튼을 누르면 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderModal({ onCancel });
    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("로그인 링크는 /login을 가리키고 클릭 시 onCancel도 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderModal({ onCancel });
    const link = screen.getByRole("link", { name: "로그인" });
    expect(link).toHaveAttribute("href", "/login");
    await user.click(link);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("배경(오버레이) 클릭 시에도 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = renderModal({ onCancel });
    // container.firstChild = 오버레이(배경) div, container.firstChild.firstChild = 모달 카드(클릭 시 stopPropagation)
    await user.click(container.firstChild);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
