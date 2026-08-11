import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Worship from "./Worship";

describe("Worship — 예배", () => {
  it("기본값(주일 오전예배)의 예배 순서와 안내 요약을 렌더한다", () => {
    render(<Worship />);
    expect(
      screen.getByText("주일 오전 예배 (1부 - 오전 09:00, 2부 - 오전 11:00)"),
    ).toBeInTheDocument();
    expect(screen.getByText(juboConfig.worshipOrder[0].order)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.worshipScheduleSummary[0].label)).toBeInTheDocument();
  });

  it("사이드바에서 다른 예배를 선택하면 안내 문구가 바뀐다", () => {
    render(<Worship />);
    fireEvent.click(screen.getByRole("button", { name: "수요예배" }));
    expect(screen.getByText("수요 예배 (오전 11:00)")).toBeInTheDocument();
  });
});
