import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Staff from "./Staff";

describe("Staff", () => {
  it("기본 진입 시 교역자 칩이 선택되어 담임목사와 교역자 목록을 보여준다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(screen.getByText(churchConfig.staff.headPastor.name)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.staff.clergy[0].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.elders[0].name)).not.toBeInTheDocument();
  });

  it("칩을 클릭하면 해당 그룹으로 전환된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.click(screen.getByRole("button", { name: "시무장로" }));
    expect(screen.getByText(churchConfig.staff.elders[0].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.headPastor.name)).not.toBeInTheDocument();
  });

  it("이름으로 검색하면 일치하는 사람만 남는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.type(
      screen.getByPlaceholderText("이름으로 검색"),
      churchConfig.staff.clergy[1].name,
    );
    expect(screen.getByText(churchConfig.staff.clergy[1].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.clergy[0].name)).not.toBeInTheDocument();
  });

  it("검색 결과가 없으면 안내 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.type(screen.getByPlaceholderText("이름으로 검색"), "존재하지않는이름");
    expect(screen.getByText("해당하는 교역자가 없습니다.")).toBeInTheDocument();
  });

  it("담임목사 카드에 전화번호·이메일 링크를 노출하지 않는다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(screen.queryByRole("link", { name: churchConfig.staff.headPastor.tel })).toBeNull();
    expect(
      document.querySelector(`a[href^="tel:${churchConfig.staff.headPastor.tel}"]`),
    ).toBeNull();
    expect(
      document.querySelector(`a[href^="mailto:${churchConfig.staff.headPastor.email}"]`),
    ).toBeNull();
  });

  it("일반 사역자 카드에도 전화번호·이메일 링크를 노출하지 않는다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
