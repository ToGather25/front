import { describe, it, expect, beforeEach } from "vite-plus/test";
import {
  getRegistrationState,
  getRegistrationMessage,
  isLocallyRegistered,
  markLocallyRegistered,
  REG_STATUS,
} from "./eventStatus";

const baseEvent = { date: "2026-06-15", canRegister: true };

describe("getRegistrationState", () => {
  it("canRegister가 false면 NONE을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, canRegister: false },
      new Date("2026-06-01"),
    );
    expect(state.status).toBe(REG_STATUS.NONE);
    expect(state.disabled).toBe(true);
  });

  it("행사일이 아직 지나지 않았으면 OPEN을 반환한다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-01"));
    expect(state.status).toBe(REG_STATUS.OPEN);
    expect(state.disabled).toBe(false);
  });

  it("행사일 당일에는 아직 OPEN이다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-15"));
    expect(state.status).toBe(REG_STATUS.OPEN);
  });

  it("행사일이 지났으면 CLOSED를 반환한다", () => {
    const state = getRegistrationState(baseEvent, new Date("2026-06-16"));
    expect(state.status).toBe(REG_STATUS.CLOSED);
    expect(state.disabled).toBe(true);
  });

  it("event가 없으면 NONE을 반환한다", () => {
    const state = getRegistrationState(null);
    expect(state.status).toBe(REG_STATUS.NONE);
  });
});

describe("getRegistrationMessage", () => {
  it("CLOSED 상태면 종료 안내 문구를 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.CLOSED })).toBe("이미 종료된 행사입니다.");
  });

  it("OPEN 상태면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.OPEN })).toBe("");
  });

  it("state가 없으면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage(null)).toBe("");
  });
});

describe("로컬 신청 기록", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("기록이 없으면 isLocallyRegistered는 false를 반환한다", () => {
    expect(isLocallyRegistered("1", "e1", "hong@example.com")).toBe(false);
  });

  it("markLocallyRegistered로 기록하면 isLocallyRegistered가 true를 반환한다", () => {
    markLocallyRegistered("1", "e1", "hong@example.com");
    expect(isLocallyRegistered("1", "e1", "hong@example.com")).toBe(true);
  });

  it("다른 이벤트/사용자 조합에는 영향을 주지 않는다", () => {
    markLocallyRegistered("1", "e1", "hong@example.com");
    expect(isLocallyRegistered("1", "e2", "hong@example.com")).toBe(false);
    expect(isLocallyRegistered("1", "e1", "other@example.com")).toBe(false);
  });

  it("userEmail이 없으면 항상 false를 반환하고 기록하지 않는다", () => {
    markLocallyRegistered("1", "e1", undefined);
    expect(isLocallyRegistered("1", "e1", undefined)).toBe(false);
  });
});
