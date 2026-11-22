import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
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

/**
 * ImageCropModal은 치수 측정을 화면에 보이는 <img>가 아니라 별도 `new Image()`로 한다.
 * jsdom은 이미지를 실제로 디코딩하지 않으므로, 전역 Image 생성자를 이 가짜로 바꿔 src가
 * 설정되면 다음 마이크로태스크에 onload를 호출하도록 흉내낸다(ImageCropModal.test.jsx와 동일).
 */
class FakeImage {
  set src(value) {
    this._src = value;
    queueMicrotask(() => {
      this.naturalWidth = 1600;
      this.naturalHeight = 900;
      this.onload?.();
    });
  }
  get src() {
    return this._src;
  }
}

let originalGetContext;
let originalToBlob;

/** 파일 선택 → 크롭 모달에서 치수 측정이 끝나길 기다렸다가 적용까지 끝낸다. */
async function selectAndConfirmCrop(user, input, file) {
  await user.upload(input, file);
  await waitFor(() => expect(screen.getByRole("button", { name: "적용" })).not.toBeDisabled());
  await user.click(screen.getByRole("button", { name: "적용" }));
}

describe("ImageUploadField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("Image", FakeImage);
    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-preview");
    globalThis.URL.revokeObjectURL = vi.fn();
    // 크롭 모달이 쓰는 canvas 2D 컨텍스트는 jsdom이 지원하지 않으므로 최소한만 흉내낸다
    // (실제로 그려지는 픽셀은 테스트 관심사가 아니다 — 업로드 흐름에 File이 제대로
    // 넘어가는지만 본다). 다른 테스트 파일에 영향 주지 않도록 afterEach에서 복원한다.
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }));
    HTMLCanvasElement.prototype.toBlob = vi.fn(function toBlob(callback, type) {
      callback(new Blob(["cropped"], { type: type || "image/png" }));
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    vi.unstubAllGlobals();
  });

  it("파일을 고르면 크롭 모달을 띄우고, 적용하면 업로드 API를 호출해 반환된 URL로 onChange한다", async () => {
    api.post.mockResolvedValue({ data: { data: { url: "https://cdn.example.com/a.png" } } });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadField id="banner" label="배너 이미지" value="" onChange={onChange} />);

    const input = document.querySelector('input[type="file"]');
    await selectAndConfirmCrop(user, input, makeImageFile());

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
    await selectAndConfirmCrop(user, input, makeImageFile());

    expect(
      await screen.findByText("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("크롭 모달에서 취소하면 업로드를 시도하지 않는다", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ImageUploadField id="banner" label="배너 이미지" value="" onChange={onChange} />);

    const input = document.querySelector('input[type="file"]');
    await user.upload(input, makeImageFile());
    await screen.findByTestId("image-crop-source");
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByTestId("image-crop-source")).not.toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("이미지가 아닌 파일을 고르면 크롭 모달 없이 바로 안내한다", async () => {
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
    expect(screen.queryByTestId("image-crop-source")).not.toBeInTheDocument();
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

  it("비어있지 않은(non-compact) 필드는 박스 전체가 버튼이고 별도 업로드 버튼이 없다", () => {
    render(
      <ImageUploadField id="banner" label="배너 이미지" value="" onChange={vi.fn()} />,
    );
    expect(screen.queryByText("이미지 업로드")).not.toBeInTheDocument();
    expect(screen.getByText("이미지 없음")).toBeInTheDocument();
    expect(screen.getByText("클릭하여 업로드")).toBeInTheDocument();
  });
});
