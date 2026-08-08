import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import FallbackImage from "./FallbackImage";

describe("FallbackImage", () => {
  it("src가 있으면 이미지를 렌더한다", () => {
    render(
      <FallbackImage
        src="/photo.jpg"
        alt="사진"
        className="w-10 h-10"
        fallback={<div>대체 이미지</div>}
      />,
    );
    const img = screen.getByAltText("사진");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/photo.jpg");
  });

  it("src가 없으면 fallback을 렌더한다", () => {
    render(<FallbackImage src={null} alt="사진" fallback={<div>대체 이미지</div>} />);
    expect(screen.getByText("대체 이미지")).toBeInTheDocument();
    expect(screen.queryByAltText("사진")).not.toBeInTheDocument();
  });

  it("이미지 로드가 실패하면 fallback으로 전환된다", () => {
    render(<FallbackImage src="/broken.jpg" alt="사진" fallback={<div>대체 이미지</div>} />);
    const img = screen.getByAltText("사진");
    fireEvent.error(img);
    expect(screen.getByText("대체 이미지")).toBeInTheDocument();
    expect(screen.queryByAltText("사진")).not.toBeInTheDocument();
  });
});
