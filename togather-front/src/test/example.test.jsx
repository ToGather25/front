import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@testing-library/react";

describe("example", () => {
  it("renders text", () => {
    render(<div>ToGather</div>);
    expect(screen.getByText("ToGather")).toBeInTheDocument();
  });
});
