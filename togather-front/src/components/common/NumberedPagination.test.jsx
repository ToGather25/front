import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberedPagination from "./NumberedPagination";

describe("NumberedPagination", () => {
  it("total/perPage로 계산된 페이지 수만큼 버튼을 렌더링한다", () => {
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "4" })).not.toBeInTheDocument();
  });

  it("첫 페이지에서는 이전 버튼이 비활성화된다", () => {
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
  });

  it("마지막 페이지에서는 다음 버튼이 비활성화된다", () => {
    render(<NumberedPagination total={25} perPage={10} current={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
  });

  it("페이지 번호를 클릭하면 onChange가 해당 번호로 호출된다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberedPagination total={25} perPage={10} current={1} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "2" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
