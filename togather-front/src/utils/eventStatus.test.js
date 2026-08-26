import { describe, it, expect } from "vite-plus/test";
import { getRegistrationState, getRegistrationMessage, REG_STATUS } from "./eventStatus";

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

  it("신청 시작일 이전이면 NOT_YET_OPEN을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, registrationStart: "2026-06-10" },
      new Date("2026-06-05"),
    );
    expect(state.status).toBe(REG_STATUS.NOT_YET_OPEN);
    expect(state.disabled).toBe(true);
  });

  it("신청 시작일 이후면 OPEN을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, registrationStart: "2026-06-10" },
      new Date("2026-06-10"),
    );
    expect(state.status).toBe(REG_STATUS.OPEN);
  });

  it("신청 마감일이 지났으면 CLOSED를 반환한다(행사일은 아직 남아있어도)", () => {
    const state = getRegistrationState(
      { ...baseEvent, registrationEnd: "2026-06-05" },
      new Date("2026-06-06"),
    );
    expect(state.status).toBe(REG_STATUS.CLOSED);
    expect(state.disabled).toBe(true);
  });

  it("신청 인원이 정원에 도달하면 FULL을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, capacity: 10, registeredCount: 10 },
      new Date("2026-06-01"),
    );
    expect(state.status).toBe(REG_STATUS.FULL);
    expect(state.disabled).toBe(true);
  });

  it("신청 인원이 정원보다 적으면 OPEN을 반환한다", () => {
    const state = getRegistrationState(
      { ...baseEvent, capacity: 10, registeredCount: 9 },
      new Date("2026-06-01"),
    );
    expect(state.status).toBe(REG_STATUS.OPEN);
  });

  it("capacity가 null이면 정원 체크를 건너뛴다", () => {
    const state = getRegistrationState(
      { ...baseEvent, capacity: null, registeredCount: 999 },
      new Date("2026-06-01"),
    );
    expect(state.status).toBe(REG_STATUS.OPEN);
  });
});

describe("getRegistrationMessage", () => {
  it("CLOSED 상태면 종료 안내 문구를 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.CLOSED })).toBe("이미 종료된 행사입니다.");
  });

  it("NOT_YET_OPEN 상태면 안내 문구를 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.NOT_YET_OPEN })).toBe(
      "아직 신청 기간이 아닙니다.",
    );
  });

  it("FULL 상태면 안내 문구를 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.FULL })).toBe("정원이 모두 찼습니다.");
  });

  it("OPEN 상태면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage({ status: REG_STATUS.OPEN })).toBe("");
  });

  it("state가 없으면 빈 문자열을 반환한다", () => {
    expect(getRegistrationMessage(null)).toBe("");
  });
});
