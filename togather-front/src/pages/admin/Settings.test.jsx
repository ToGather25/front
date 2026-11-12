import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Settings from "./Settings";

describe("Settings — 교회 기본 정보 (조회 전용)", () => {
  it("church context 값을 읽기 전용으로 보여준다", () => {
    renderWithChurch(<Settings />, {
      church: {
        name: "옥길교회",
        denomination: "대한예수교장로회 고신교단",
        pastor: "임재호",
        address: "경기도 부천시 양지로 166번길 34",
        tel: "02) 2615-4067",
        fax: "02) 2683-4326",
        email: "okgil@gmail.com",
        social: { youtube: "https://www.youtube.com/@okgilchurch" },
      },
    });

    expect(screen.getByText("옥길교회")).toBeInTheDocument();
    expect(screen.getByText("대한예수교장로회 고신교단")).toBeInTheDocument();
    expect(screen.getByText("임재호")).toBeInTheDocument();
  });

  it("홈 배너/교회소개 수정은 다른 관리 화면으로 안내한다", () => {
    renderWithChurch(<Settings />);

    expect(screen.getByRole("link", { name: "메인 페이지 관리" })).toHaveAttribute(
      "href",
      "/admin/main",
    );
    expect(screen.getByRole("link", { name: "교회소개 관리" })).toHaveAttribute(
      "href",
      "/admin/church-intro",
    );
  });
});
