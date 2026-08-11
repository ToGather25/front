import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Vision from "./Vision";

describe("Vision", () => {
  it("메인 문구를 렌더한다", () => {
    renderWithChurch(<Vision />);
    expect(screen.getByText(churchConfig.vision.mainTitle)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.mainVerse)).toBeInTheDocument();
  });

  it("비전 3항목의 라벨과 설명을 모두 렌더한다", () => {
    renderWithChurch(<Vision />);
    churchConfig.vision.items.forEach(({ label, description }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
