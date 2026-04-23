/** @type {import('@/services/juboService').JuboTab[]} */
export const DUMMY_JUBO_TABS = [
  "표지", "예배", "소식", "봉사", "예물", "후원", "구역", "섬기는 분들", "오시는 길",
];

/** @type {import('@/services/juboService').JuboInfo} */
export const DUMMY_JUBO_INFO = {
  issueNo: "제10-7",
  date: "2026년 2월 15일",
};

/** @type {import('@/services/juboService').WorshipOrder[]} */
export const DUMMY_WORSHIP_SERVICES = [
  "주일 오전예배",
  "주일 오후예배",
  "새벽기도회",
  "수요기도회",
  "금요기도회",
];

export const DUMMY_WORSHIP_ORDER = [
  ["예배 부름",  "성가대"],
  ["경배와 찬양","찬양팀"],
  ["사도신경",   "다같이"],
  ["찬 송",      "20장 / 큰 영광 중에 계신 주"],
  ["기 도",      "000목사 / 000목사"],
  ["성경봉독",   "시편 23장 1절"],
  ["설 교",      "000목사"],
  ["헌 금",      "331장 / 영광을 받으신 만왕의 주여"],
  ["헌금기도",   "성가대"],
  ["교회소식",   "성가대"],
  ["찬 양",      "함께"],
  ["강복선언",   "000목사"],
];

export const DUMMY_VOLUNTEER = {
  weeks: [
    {
      label: "이번주",
      roles: [
        { role: "사회",     name: "000 집사" },
        { role: "설교",     name: "000 목사" },
        { role: "기도",     name: "000 장로" },
        { role: "성가대",   name: "찬양대" },
        { role: "헌금위원", name: "000 외 2명" },
        { role: "주차봉사", name: "000 외 3명" },
        { role: "안내봉사", name: "000 외 2명" },
      ],
    },
    {
      label: "다음주",
      roles: [
        { role: "사회",     name: "000 집사" },
        { role: "설교",     name: "000 목사" },
        { role: "기도",     name: "000 장로" },
        { role: "성가대",   name: "찬양대" },
        { role: "헌금위원", name: "000 외 2명" },
        { role: "주차봉사", name: "000 외 3명" },
        { role: "안내봉사", name: "000 외 2명" },
      ],
    },
  ],
};

export const DUMMY_OFFERING = [
  { title: "십일조",   items: ["OOO 외 00명"] },
  { title: "감사헌금", items: ["OOO 외 00명", "OOO 외 00명"] },
  { title: "건축헌금", items: ["OOO 외 00명"] },
  { title: "선교헌금", items: ["OOO 외 00명"] },
  { title: "기타헌금", items: ["OOO 외 00명"] },
];

export const DUMMY_SUPPORT = [
  { category: "국내 선교", items: ["기관명을 입력하세요.", "기관명을 입력하세요."] },
  { category: "해외 선교", items: ["기관명을 입력하세요.", "기관명을 입력하세요.", "기관명을 입력하세요."] },
  { category: "사회복지",  items: ["기관명을 입력하세요.", "기관명을 입력하세요."] },
];

export const DUMMY_DISTRICTS = [
  { zone: "1구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { zone: "2구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { zone: "3구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { zone: "4구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { zone: "5구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { zone: "6구역", place: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
];

export const DUMMY_MINISTERS = {
  clergy: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
  elders: ["시무장로 | OOO", "시무장로 | OOO", "협동장로 | OOO", "사역장로 | OOO", "은퇴장로 | OOO"],
  praise: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"],
};
