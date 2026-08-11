import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import juboConfig from "@/config/jubo.config";
import Giving from "./Giving";

describe("Giving — 헌금", () => {
  beforeEach(() => {
    // jsdom의 navigator.clipboard는 getter만 있는 접근자 프로퍼티라 Object.assign으로는
    // 덮어쓸 수 없다 — Register.test.jsx에서 이미 검증된 patterns대로 configurable: true인
    // 값 프로퍼티로 재정의한다.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it("은행명·계좌번호·예금주와 연말정산 안내 문구를 렌더한다", () => {
    render(<Giving />);
    expect(screen.getByText(juboConfig.giving.bankAccount.bank)).toBeInTheDocument();
    expect(screen.getByText(juboConfig.giving.bankAccount.accountNumber)).toBeInTheDocument();
    expect(screen.getByText(/예금주/)).toBeInTheDocument();
    expect(screen.getByText(/연말정산/)).toBeInTheDocument();
  });

  it("계좌 카드를 클릭하면 계좌번호가 클립보드에 복사되고 '복사되었습니다'가 표시된다", async () => {
    render(<Giving />);
    fireEvent.click(screen.getByText(juboConfig.giving.bankAccount.accountNumber));

    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      juboConfig.giving.bankAccount.accountNumber,
    );
  });

  it("qrCodeUrl이 없으면 QR 카드가 렌더되지 않는다", () => {
    render(<Giving />);
    expect(screen.queryByAltText("헌금 QR 코드")).not.toBeInTheDocument();
  });

  it("qrCodeUrl이 있으면 QR 카드가 렌더된다", async () => {
    // 이 테스트 안에서만 jubo.config의 giving.qrCodeUrl에 임시 URL을 주입한다.
    // 실제 jubo.config.js 파일은 건드리지 않고, vi.doMock + 동적 import로
    // 이 테스트에만 국한된 모듈 인스턴스를 만든다(다른 테스트의 정적 import에는 영향 없음).
    vi.resetModules();
    vi.doMock("@/config/jubo.config", async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        default: {
          ...actual.default,
          giving: {
            ...actual.default.giving,
            qrCodeUrl: "https://example.com/giving-qr.png",
          },
        },
      };
    });

    const { default: GivingWithQrCode } = await import("./Giving");
    render(<GivingWithQrCode />);

    const qrImage = screen.getByAltText("헌금 QR 코드");
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute("src", "https://example.com/giving-qr.png");

    vi.doUnmock("@/config/jubo.config");
    vi.resetModules();
  });
});
