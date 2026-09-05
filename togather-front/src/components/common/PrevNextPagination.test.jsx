import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrevNextPagination from "./PrevNextPagination";

describe("PrevNextPagination", () => {
  it("현재 페이지 번호를 보여준다", () => {
    render(<PrevNextPagination page={2} hasNext={true} onChange={() => {}} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("1페이지에서는 이전 버튼이 비활성화된다", () => {
    render(<PrevNextPagination page={1} hasNext={true} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("hasNext가 false면 다음 버튼이 비활성화된다", () => {
    render(<PrevNextPagination page={1} hasNext={false} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("다음 버튼을 클릭하면 onChange가 page+1로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PrevNextPagination page={2} hasNext={true} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "다음 페이지" }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("이전 버튼을 클릭하면 onChange가 page-1로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PrevNextPagination page={2} hasNext={true} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "이전 페이지" }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
