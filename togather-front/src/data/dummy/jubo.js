/** @type {import('@/services/juboService').JuboTab[]} */
export const DUMMY_JUBO_TABS = [
  "표지",
  "예배",
  "소식",
  "봉사",
  "예물",
  "후원",
  "구역",
  "섬기는 분들",
  "오시는 길",
];

export const DUMMY_JUBO_INFO = {
  issueNo: "제10-7",
  date: "2026년 2월 15일",
};

export const DUMMY_WORSHIP_SERVICES = [
  { label: "주일 오전예배", time: "오전 9:00" },
  { label: "주일 오후예배", time: "오후 2:00" },
  { label: "새벽기도회", time: "오전 5:30" },
  { label: "수요기도회", time: "오전 10:00" },
  { label: "금요기도회", time: "오후 8:00" },
];

export const DUMMY_WORSHIP_ORDER = {
  "주일 오전예배": [
    { role: "예배 부름", name: "성가대" },
    { role: "경배와 찬양", name: "찬양팀" },
    { role: "사도신경", name: "다같이" },
    { role: "찬 송", name: "20장 / 큰 영광 중에 계신 주" },
    { role: "대표기도", name: "OOO집사" },
    { role: "성경봉독", name: "로마서 2장 27절" },
    { role: "설 교", name: "OOO목사" },
    { role: "헌 금", name: "331장 / 영광을 받으신 만왕의 주여" },
    { role: "헌금기도", name: "성가대" },
    { role: "교회소식", name: "성가대" },
    { role: "찬 양", name: "함께" },
    { role: "강복선언", name: "성가대" },
  ],
};

export const DUMMY_VOLUNTEER = [
  { role: "예배인도", part1: "000", part2: "000" },
  { role: "대표기도", part1: "000", part2: "000" },
  { role: "설교", part1: "000목사", part2: "000목사" },
  { role: "성경봉독", part1: "000", part2: "000" },
  { role: "찬양대지휘", part1: "000", part2: "000" },
  { role: "반주", part1: "000", part2: "000" },
  { role: "영상", part1: "000", part2: "000" },
  { role: "음향", part1: "000", part2: "000" },
  { role: "안내(남)", part1: "000, 000", part2: "000, 000" },
  { role: "안내(여)", part1: "000, 000", part2: "000, 000" },
  { role: "주보", part1: "000", part2: "000" },
  { role: "방송", part1: "000", part2: "000" },
];

export const DUMMY_OFFERING = [
  { title: "십일조", items: ["OOO 외 00명"] },
  { title: "감사헌금", items: ["OOO 외 00명", "OOO 외 00명"] },
  { title: "건축헌금", items: ["OOO 외 00명"] },
  { title: "선교헌금", items: ["OOO 외 00명"] },
  { title: "기타헌금", items: ["OOO 외 00명"] },
];

export const DUMMY_SUPPORT = [
  { organization: "베트남 | 호치민", target: "선교사님 성함", region: "후원구역명" },
  { organization: "일본 | 동경", target: "선교사님 성함", region: "후원구역명" },
  { organization: "말레이시아 | 쿠알라룸푸르", target: "선교사님 성함", region: "후원구역명" },
];

export const DUMMY_DISTRICTS = [
  { name: "1구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "2구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  { name: "3구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
];

export const DUMMY_MINISTERS = [
  {
    title: "교역자",
    items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
  },
  {
    title: "장 로",
    items: ["시무장로 | OOO", "시무장로 | OOO", "협동장로 | OOO", "사역장로 | OOO"],
  },
  { title: "찬 양", items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"] },
];
