import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import PrayerTopics from "./PrayerTopics";

describe("PrayerTopics — 기도제목", () => {
  it("모든 기도제목 항목과 카테고리 이모지를 렌더한다", () => {
    render(<PrayerTopics />);
    juboConfig.prayerTopics.forEach(({ title, subtitle }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(subtitle)).toBeInTheDocument();
    });
    expect(screen.getByText("🙏")).toBeInTheDocument();
  });

  it("기도제목이 없으면 빈 상태 문구를 표시한다", async () => {
    // 실제 jubo.config.js 파일과 다른 테스트의 정적 import는 건드리지 않고,
    // 이 테스트에만 국한된 모듈 인스턴스를 vi.doMock + 동적 import로 만든다.
    // (Giving.test.jsx의 qrCodeUrl 주입 테스트와 동일한 패턴)
    vi.resetModules();
    vi.doMock("@/config/jubo.config", async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        default: {
          ...actual.default,
          prayerTopics: [],
        },
      };
    });

    const { default: PrayerTopicsEmpty } = await import("./PrayerTopics");
    render(<PrayerTopicsEmpty />);

    expect(screen.getByText("이번 주 기도제목을 준비 중입니다")).toBeInTheDocument();

    vi.doUnmock("@/config/jubo.config");
    vi.resetModules();
  });
});
