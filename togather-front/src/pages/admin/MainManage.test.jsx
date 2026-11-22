import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import MainManage from "./MainManage";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

const PROFILE = {
  representativeImageUrl: "https://example.com/hero.jpg",
  instagramUrl: "https://www.instagram.com/okgil",
  websiteUrl: "https://okgil.church",
  offeringBankName: "국민은행",
  offeringAccountNumber: "000-000000-00-000",
  offeringAccountHolder: "옥길교회",
  offeringNote: "헌금은 예배 전후에 안내함을 이용해 주세요.",
};

function mockGet({ schedule = { regular: [], departments: [] }, profile = PROFILE } = {}) {
  api.get.mockImplementation((url) => {
    if (url === "/church/worship-schedule") return Promise.resolve({ data: { data: schedule } });
    if (url === "/church/profile") return Promise.resolve({ data: { data: profile } });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
}

describe("MainManage — 홈 배너 · 헌금 안내 (실API 연동)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("마운트 시 배너 이미지/인스타그램/헌금 계좌를 조회해 입력값에 채운다", async () => {
    mockGet();
    renderWithChurch(<MainManage />);

    expect(await screen.findByAltText("")).toHaveAttribute("src", "https://example.com/hero.jpg");
    expect(screen.getByDisplayValue("https://www.instagram.com/okgil")).toBeInTheDocument();
    expect(screen.getByDisplayValue("국민은행")).toBeInTheDocument();
    expect(screen.getByDisplayValue("000-000000-00-000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("옥길교회")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://okgil.church")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("헌금은 예배 전후에 안내함을 이용해 주세요."),
    ).toBeInTheDocument();
  });

  it("저장을 누르면 예배 시간표와 교회 프로필(배너·인스타그램·헌금 안내문구·웹사이트)을 함께 저장한다", async () => {
    mockGet({ profile: { representativeImageUrl: "", instagramUrl: "", offeringBankName: "" } });
    api.put.mockResolvedValue({ data: { data: {} } });
    api.patch.mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    renderWithChurch(<MainManage />);

    const bankInput = await screen.findByLabelText("은행명");
    await user.type(bankInput, "신한은행");
    await user.type(screen.getByLabelText("웹사이트 URL"), "https://okgil.church");
    await user.type(screen.getByLabelText("안내 문구"), "현장 헌금함을 이용해 주세요.");
    await user.click(screen.getByRole("button", { name: "변경사항 저장" }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith("/church/admin/profile", {
        representativeImageUrl: null,
        instagramUrl: null,
        websiteUrl: "https://okgil.church",
        offeringBankName: "신한은행",
        offeringAccountNumber: null,
        offeringAccountHolder: null,
        offeringNote: "현장 헌금함을 이용해 주세요.",
      }),
    );
    expect(api.put).toHaveBeenCalledWith("/church/admin/worship-schedule", expect.anything());
    expect(await screen.findByText("저장 완료 ✓")).toBeInTheDocument();
  });

  it("요일 체크박스 + 시간 선택으로 예배 시간표 한 줄을 만들어 저장한다", async () => {
    mockGet();
    api.put.mockResolvedValue({ data: { data: {} } });
    api.patch.mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    renderWithChurch(<MainManage />);

    await user.click(await screen.findByText("정기 예배 추가"));
    await user.type(screen.getByLabelText("정기 예배 1 예배명"), "2부 예배");
    await user.click(screen.getByRole("button", { name: "주일" }));
    await user.click(screen.getByRole("button", { name: "수" }));
    await user.click(screen.getByLabelText("정기 예배 1 시간"));
    await user.click(screen.getByRole("button", { name: "14시" }));
    await user.click(screen.getByRole("button", { name: "00분" }));

    await user.click(screen.getByRole("button", { name: "변경사항 저장" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        "/church/admin/worship-schedule",
        expect.objectContaining({
          regular: [{ name: "2부 예배", time: "매주 주일·수 오후 2시", location: "" }],
        }),
      ),
    );
  });
});
