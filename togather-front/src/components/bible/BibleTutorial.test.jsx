import { describe, it, expect, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BibleTutorial from "./BibleTutorial";

describe("BibleTutorial", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("처음 방문 시 튜토리얼을 보여준다", () => {
    render(<BibleTutorial />);
    expect(screen.getByText("성경 읽기 이용 방법")).toBeInTheDocument();
  });

  it("확인 버튼을 누르면 사라지고 localStorage에 기록된다", async () => {
    const user = userEvent.setup();
    render(<BibleTutorial />);
    await user.click(screen.getByRole("button", { name: "확인했습니다" }));
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
    expect(localStorage.getItem("bible-tutorial-seen")).toBe("true");
  });

  it("이미 본 적 있으면 다시 렌더하지 않는다", () => {
    localStorage.setItem("bible-tutorial-seen", "true");
    render(<BibleTutorial />);
    expect(screen.queryByText("성경 읽기 이용 방법")).not.toBeInTheDocument();
  });
});
