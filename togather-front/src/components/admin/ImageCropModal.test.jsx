import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageCropModal from "./ImageCropModal";

// jsdom 기본 window 크기(1024x768) 기준 — 16:9 크롭이면 viewport는 min(560, 960)=560
// 너비, 560/(16/9)=315 높이로 고정된다(ImageCropModal의 뷰포트 계산 로직과 동일).
const VIEWPORT = { width: 560, height: 315 };

/**
 * ImageCropModal은 치수 측정을 화면에 보이는 <img>가 아니라 별도 `new Image()`로 한다
 * (실제 브라우저에서 width/height:0으로 렌더되는 <img>는 디코딩이 미뤄질 수 있어서다).
 * jsdom은 이미지를 실제로 디코딩하지 않으므로, 전역 Image 생성자를 이 가짜로 바꿔
 * src가 설정되면 다음 마이크로태스크에 onload를 호출하도록 흉내낸다.
 */
class FakeImage {
  set src(value) {
    this._src = value;
    queueMicrotask(() => {
      this.naturalWidth = FakeImage.width;
      this.naturalHeight = FakeImage.height;
      this.onload?.();
    });
  }
  get src() {
    return this._src;
  }
}
FakeImage.width = 1600;
FakeImage.height = 900;

/** natural 치수가 반영되어 화면 이미지 크기가 계산될 때까지 기다린다. */
async function waitForCropReady() {
  await waitFor(() => {
    expect(screen.getByTestId("image-crop-source").style.width).not.toBe("0px");
  });
  return screen.getByTestId("image-crop-source");
}

describe("ImageCropModal", () => {
  let canvasContext;
  let originalGetContext;
  let originalToBlob;

  beforeEach(() => {
    vi.stubGlobal("Image", FakeImage);
    FakeImage.width = 1600;
    FakeImage.height = 900;
    // getContext()가 호출마다 같은 객체를 반환해야 핸들러가 실제로 쓴 drawImage mock을
    // 테스트에서 같은 참조로 검사할 수 있다. HTMLCanvasElement.prototype은 전역이라
    // 다른 테스트 파일에 새지 않도록 원래 구현을 저장해뒀다가 afterEach에서 복원한다.
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    canvasContext = { drawImage: vi.fn() };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasContext);
    HTMLCanvasElement.prototype.toBlob = vi.fn(function toBlob(callback, type) {
      callback(new Blob(["x"], { type: type || "image/png" }));
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
    vi.unstubAllGlobals();
  });

  it("이미지 비율이 뷰포트와 같으면 로드 직후 전체 이미지가 뷰포트를 꽉 채운다(오프셋 0)", async () => {
    render(<ImageCropModal file={new File([], "a.png")} aspect={16 / 9} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    const img = await waitForCropReady();

    expect(img.style.width).toBe(`${VIEWPORT.width}px`);
    expect(img.style.height).toBe(`${VIEWPORT.height}px`);
    expect(img.style.left).toBe("0px");
    expect(img.style.top).toBe("0px");
  });

  it("적용을 누르면 현재 보이는 영역만큼만 canvas에 그려 onConfirm으로 넘긴다", async () => {
    const onConfirm = vi.fn();
    render(<ImageCropModal file={new File([], "a.png")} aspect={16 / 9} onCancel={vi.fn()} onConfirm={onConfirm} />);
    await waitForCropReady();
    const { drawImage } = canvasContext;

    fireEvent.click(screen.getByRole("button", { name: "적용" }));

    expect(drawImage).toHaveBeenCalledTimes(1);
    const [, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = drawImage.mock.calls[0];
    expect(sx).toBeCloseTo(0);
    expect(sy).toBeCloseTo(0);
    expect(sWidth).toBeCloseTo(1600);
    expect(sHeight).toBeCloseTo(900);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
    expect(dWidth).toBe(Math.round(VIEWPORT.width * 2));
    expect(dHeight).toBe(Math.round(Math.round(VIEWPORT.width * 2) / (16 / 9)));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it("확대하면 이미지가 커지고, 드래그하면 보이는 영역이 옮겨간 만큼만 잘라낸다", async () => {
    render(<ImageCropModal file={new File([], "a.png")} aspect={16 / 9} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    await waitForCropReady();
    const { drawImage } = canvasContext;
    const viewport = screen.getByTestId("image-crop-source").parentElement;

    // 확대 2배 — scale은 baseScale(0.35)*2 = 0.7, 이미지 표시 크기는 1120x630
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    const img = screen.getByTestId("image-crop-source");
    expect(img.style.width).toBe("1120px");

    // 왼쪽으로 100px 드래그 — 이미지가 왼쪽으로 밀리므로(offset.x 음수) 잘려나가는
    // 영역은 원본 기준 오른쪽으로 이동한다.
    fireEvent.pointerDown(viewport, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(viewport, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(viewport, { pointerId: 1 });

    fireEvent.click(screen.getByRole("button", { name: "적용" }));

    const [, sx, sy, sWidth, sHeight] = drawImage.mock.calls[0];
    const scale = 0.35 * 2; // baseScale(560/1600=0.35) * zoom(2)
    expect(sx).toBeCloseTo(100 / scale, 1);
    expect(sy).toBeCloseTo(0);
    expect(sWidth).toBeCloseTo(VIEWPORT.width / scale, 1);
    expect(sHeight).toBeCloseTo(VIEWPORT.height / scale, 1);
  });

  it("취소를 누르면 onCancel만 호출하고 onConfirm은 호출하지 않는다", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<ImageCropModal file={new File([], "a.png")} aspect={16 / 9} onCancel={onCancel} onConfirm={onConfirm} />);
    await waitForCropReady();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("적용 버튼은 치수 측정이 끝나기 전까지 비활성화되어 있다", () => {
    render(<ImageCropModal file={new File([], "a.png")} aspect={16 / 9} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();
  });
});
