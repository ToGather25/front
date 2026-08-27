/** @typedef {{id:number, title:string, date:string, memo:string}} MySchedule */
/** @typedef {{id:number, type:string, content:string, status:string, createdAt:string}} MyPrayer */
/** @typedef {{id:number, title:string, content:string, status:string, answer:string|null, createdAt:string}} MyInquiry */

/** @type {MySchedule[]} */
export const DUMMY_MY_SCHEDULES = [
  { id: 1, title: "1구역 모임", date: "2026-02-18", memo: "옥길동 박OO 권사 댁 · 19:30" },
  { id: 2, title: "성가대 부활절 연습", date: "2026-02-22", memo: "본당 4층 · 20:00" },
  { id: 3, title: "주일 1·2부 예배", date: "2026-02-23", memo: "본당 · 09:00 / 11:00" },
  { id: 4, title: "개인 — 직장 송별회", date: "2026-02-25", memo: "강남 · 19:00" },
  { id: 5, title: "부활주일 연합 예배", date: "2026-04-05", memo: "본당 · 11:00" },
  { id: 6, title: "주일 1부 예배", date: "2026-04-12", memo: "본당 · 09:00" },
];

/** @type {MyPrayer[]} */
export const DUMMY_MY_PRAYERS = [
  {
    id: 1,
    type: "기도",
    content: "가족 간의 깊은 대화가 필요합니다. 함께 기도해 주세요.",
    status: "답변 완료",
    createdAt: "2026-02-10T09:00:00",
  },
  {
    id: 2,
    type: "상담",
    content: "이직 결정을 앞두고 지혜가 필요합니다.",
    status: "답변 대기",
    createdAt: "2026-02-04T09:00:00",
  },
  {
    id: 3,
    type: "기도",
    content: "수술 잘 끝났습니다. 함께 기도해 주신 모든 분께 감사드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-27T09:00:00",
  },
  {
    id: 4,
    type: "기도",
    content: "큰 아이가 수능을 앞두고 있습니다. 지혜와 평안을 위해 기도 부탁드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-15T09:00:00",
  },
  {
    id: 5,
    type: "상담",
    content: "가정 내 갈등으로 힘든 시간을 보내고 있습니다. 상담을 부탁드립니다.",
    status: "답변 완료",
    createdAt: "2026-01-08T09:00:00",
  },
];

/** @type {MyInquiry[]} */
export const DUMMY_MY_INQUIRIES = [
  {
    id: 1,
    title: "교적 정보 수정 요청 (주소 변경)",
    content: "이사를 하게 되어 주소 변경을 요청드립니다.",
    status: "답변 완료",
    answer: "사무실 — 주소 변경 완료되었습니다. 다음 주보부터 반영됩니다.",
    createdAt: "2026-02-12T09:00:00",
  },
  {
    id: 2,
    title: "새가족부 신청",
    content: "새가족부에 참여하고 싶습니다.",
    status: "진행 중",
    answer: null,
    createdAt: "2026-02-05T09:00:00",
  },
  {
    id: 3,
    title: "심방 일정 요청",
    content: "이번 주 중 심방을 요청드립니다.",
    status: "답변 완료",
    answer: "부목사 — 2/3 화요일 19:00에 방문드리겠습니다.",
    createdAt: "2026-01-20T09:00:00",
  },
  {
    id: 4,
    title: "교육 프로그램 등록",
    content: "제자훈련 1기 등록을 원합니다.",
    status: "답변 완료",
    answer: "교육부 — 제자훈련 1기 등록 완료되었습니다.",
    createdAt: "2026-01-10T09:00:00",
  },
  {
    id: 5,
    title: "구역 변경 신청",
    content: "이사로 인해 구역 변경을 요청드립니다.",
    status: "진행 중",
    answer: null,
    createdAt: "2025-11-30T09:00:00",
  },
];
