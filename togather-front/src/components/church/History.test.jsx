import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import History from "./History";

describe("History", () => {
  it("처음에는 최신 2개 시대만 노출되고 이전 시대 버튼은 비활성화된다", () => {
    renderWithChurch(<History />);
    expect(screen.getByText("2020~")).toBeInTheDocument();
    expect(screen.getByText("2010~")).toBeInTheDocument();
    expect(screen.queryByText("2000~")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 시대" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 시대" })).toBeEnabled();
  });

  it("다음 시대 버튼을 누르면 다음 2개 시대 그룹으로 이동한다", async () => {
    renderWithChurch(<History />);
    fireEvent.click(screen.getByRole("button", { name: "다음 시대" }));
    await waitFor(() => expect(screen.getByText("2000~")).toBeInTheDocument());
    expect(screen.queryByText("2020~")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 시대" })).toBeEnabled();
  });

  it("마지막 시대 그룹에서는 다음 시대 버튼이 비활성화된다", async () => {
    renderWithChurch(<History />);
    fireEvent.click(screen.getByRole("button", { name: "다음 시대" }));
    await waitFor(() => expect(screen.getByText("2000~")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "다음 시대" }));
    await waitFor(() => expect(screen.getByText("1990~")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "다음 시대" })).toBeDisabled();
  });
});
