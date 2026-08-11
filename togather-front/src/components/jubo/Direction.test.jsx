import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Direction from "./Direction";

describe("Direction — 오시는 길", () => {
  it("교회 주소와 셔틀 운행 코스를 렌더한다", () => {
    renderWithChurch(<Direction />);
    expect(screen.getByText(churchConfig.address)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.transportGuide.routes[0].name)).toBeInTheDocument();
  });
});
