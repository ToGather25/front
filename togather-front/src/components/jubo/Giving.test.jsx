import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import Giving from "./Giving";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const PROFILE = {
  offeringBankName: "국민은행",
  offeringAccountNumber: "123456-78-901234",
  offeringAccountHolder: "옥길교회",
};

describe("Giving — 헌금", () => {
  let writeText;

  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom의 navigator.clipboard는 getter만 있는 접근자 프로퍼티라 Object.assign으로는
    // 덮어쓸 수 없다 — Register.test.jsx에서 이미 검증된 패턴대로 configurable: true인
    // 값 프로퍼티로 재정의한다. writeText는 로컬 변수로 잡아두고 단언에 사용한다
    // (navigator.clipboard.writeText를 직접 참조하면 oxlint의 unbound-method 경고가 뜬다).
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
  });

  it("은행명·계좌번호·예금주와 연말정산 안내 문구를 렌더한다", async () => {
    api.get.mockResolvedValue({ data: { data: PROFILE } });
    renderWithChurch(<Giving />);

    expect(await screen.findByText(PROFILE.offeringBankName)).toBeInTheDocument();
    expect(screen.getByText(PROFILE.offeringAccountNumber)).toBeInTheDocument();
    expect(screen.getByText(/예금주/)).toBeInTheDocument();
    expect(screen.getByText(/연말정산/)).toBeInTheDocument();
  });

  it("계좌 카드를 클릭하면 계좌번호가 클립보드에 복사되고 '복사되었습니다'가 표시된다", async () => {
    api.get.mockResolvedValue({ data: { data: PROFILE } });
    renderWithChurch(<Giving />);

    fireEvent.click(await screen.findByText(PROFILE.offeringAccountNumber));

    expect(await screen.findByText("복사되었습니다")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(PROFILE.offeringAccountNumber);
  });

  it("QR 코드는 아직 백엔드에 없으므로 렌더되지 않는다", async () => {
    api.get.mockResolvedValue({ data: { data: PROFILE } });
    renderWithChurch(<Giving />);

    await screen.findByText(PROFILE.offeringBankName);
    expect(screen.queryByAltText("헌금 QR 코드")).not.toBeInTheDocument();
  });

  it("등록된 계좌 정보가 없으면 안내 문구를 보여준다", async () => {
    api.get.mockResolvedValue({
      data: { data: { offeringBankName: null, offeringAccountNumber: null, offeringAccountHolder: null } },
    });
    renderWithChurch(<Giving />);

    expect(await screen.findByText("등록된 헌금 계좌 안내가 없습니다.")).toBeInTheDocument();
  });
});
