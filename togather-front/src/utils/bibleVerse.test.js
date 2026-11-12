import { describe, it, expect } from "vite-plus/test";
import { lookupVerseText } from "./bibleVerse";

describe("lookupVerseText", () => {
  it("단일 구절 참조를 본문으로 변환한다", () => {
    expect(lookupVerseText("로마서 9:15")).toEqual(expect.any(String));
  });

  it("범위 참조(-17)는 구절을 이어붙인다", () => {
    const text = lookupVerseText("골로새서 3:15-17");
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("BOOK_ABBREV에 없는 책 이름이면 null을 반환한다", () => {
    expect(lookupVerseText("없는책 1:1")).toBeNull();
  });

  it("파싱 불가능한 문자열이면 null을 반환한다", () => {
    expect(lookupVerseText("")).toBeNull();
    expect(lookupVerseText(undefined)).toBeNull();
  });
});
