import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploadField from "./ImageUploadField";

vi.mock("@/services/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "@/services/api";

function makeImageFile(name = "photo.png") {
  return new File(["fake-bytes"], name, { type: "image/png" });
}

describe("ImageUploadField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-preview");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("파일을 고르면 업로드 API를 호출하고 성공하면 반환된 URL로 onChange한다", async () => {
    api.post.mockResolvedValue({ data: { data: { url: "https://cdn.example.com/a.png" } } });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadField id="banner" label="배너 이미지" value="" onChange={onChange} />);

    const input = document.querySelector('input[type="file"]');
    await user.upload(input, makeImageFile());

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/a.png"));
    expect(api.post).toHaveBeenCalledWith(
      "/church/admin/uploads",
      expect.any(FormData),
      expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } }),
    );
  });

  it("업로드 API가 실패하면 에러 메시지를 보여주고 onChange를 호출하지 않는다", async () => {
    api.post.mockRejectedValue(new Error("network error"));
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadField id="banner" label="배너 이미지" value="" onChange={onChange} />);

    const input = document.querySelector('input[type="file"]');
    await user.upload(input, makeImageFile());

    expect(
      await screen.findByText("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("이미지가 아닌 파일을 고르면 업로드를 시도하지 않고 바로 안내한다", async () => {
    const onChange = vi.fn();
    // accept="image/*" 필터를 통과하지 않는 파일도 직접 넣어볼 수 있도록 끈다 —
    // 운영체제 파일 선택창을 우회해 input에 강제로 파일을 넣는 경우(드래그&드롭 등)에
    // 대한 방어 로직을 검증하는 테스트이므로, 여기서는 user-event의 accept 필터링이
    // 오히려 방해가 된다.
    const user = userEvent.setup({ applyAccept: false });
    render(<ImageUploadField id="banner" label="배너 이미지" value="" onChange={onChange} />);

    const input = document.querySelector('input[type="file"]');
    await user.upload(input, new File(["x"], "doc.pdf", { type: "application/pdf" }));

    expect(await screen.findByText("이미지 파일만 업로드할 수 있습니다.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("compact 모드에서는 라벨/힌트 없이 작은 썸네일과 버튼만 보여준다", () => {
    render(
      <ImageUploadField
        compact
        value="https://cdn.example.com/existing.png"
        onChange={vi.fn()}
        ariaLabel="정기 예배 1 사진"
      />,
    );
    expect(screen.getByRole("button", { name: "변경" })).toBeInTheDocument();
    expect(screen.queryByText("이미지 업로드")).not.toBeInTheDocument();
  });
});
