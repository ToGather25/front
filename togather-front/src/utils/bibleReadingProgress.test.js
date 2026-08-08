import { describe, it, expect, beforeEach } from "vite-plus/test";
import { saveLastPosition, getLastPosition } from "./bibleReadingProgress";

describe("bibleReadingProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("저장된 적 없는 책은 null을 반환한다", () => {
    expect(getLastPosition("창세기")).toBeNull();
  });

  it("저장한 책의 마지막 장을 조회할 수 있다", () => {
    saveLastPosition("창세기", 5);
    expect(getLastPosition("창세기")).toBe(5);
  });

  it("여러 책의 위치를 각각 독립적으로 저장한다", () => {
    saveLastPosition("창세기", 5);
    saveLastPosition("출애굽기", 12);
    expect(getLastPosition("창세기")).toBe(5);
    expect(getLastPosition("출애굽기")).toBe(12);
  });

  it("같은 책을 다시 저장하면 값을 덮어쓴다", () => {
    saveLastPosition("창세기", 5);
    saveLastPosition("창세기", 8);
    expect(getLastPosition("창세기")).toBe(8);
  });

  it("localStorage에 잘못된 JSON이 있어도 크래시하지 않는다", () => {
    localStorage.setItem("bible-reading-progress", "{invalid json");
    expect(getLastPosition("창세기")).toBeNull();
  });
});
