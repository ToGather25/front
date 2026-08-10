import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import churchConfig from "@/config/church.config";
import Church from "./Church";

function renderChurch() {
  return render(
    <MemoryRouter initialEntries={["/교회소개"]}>
      <ChurchProvider>
        <Church />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("Church 셸", () => {
  it("초기 탭은 인사말이고 Greeting 콘텐츠가 보인다", () => {
    renderChurch();
    expect(screen.getByRole("button", { name: "인사말" })).toHaveClass("border-blue-8");
    expect(screen.getByText(churchConfig.greeting.title)).toBeInTheDocument();
  });

  it("탭 버튼을 클릭하면 해당 섹션으로 전환된다", () => {
    renderChurch();
    fireEvent.click(screen.getByRole("button", { name: "섬기는 사람들" }));
    expect(screen.getByText(churchConfig.staff.headPastor.name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.greeting.title)).not.toBeInTheDocument();
  });

  it("7개 탭 버튼이 렌더되고 예배 안내 탭은 없다(예배·방송으로 이전됨)", () => {
    renderChurch();
    [
      "인사말",
      "교회 비전",
      "교회 연혁",
      "섬기는 사람들",
      "층별 안내",
      "오시는 길",
      "차량운행 안내",
    ].forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "예배 안내" })).not.toBeInTheDocument();
  });
});
