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

/**
 * 발행된 주보 목록(최신순) — 백엔드에 과거 발행 이력 목록/개별 조회 API가 아직 없어
 * 더미 모드 전용으로만 존재한다. 실 API 연동 시 계약에 맞춰 응답 매핑을 다시 확인해야 한다.
 * @type {import('@/services/juboService').JuboIssue[]}
 */
export const DUMMY_JUBO_ISSUES = [
  {
    id: 10,
    issueNo: "제10-8",
    date: "2026-08-09",
    dateLabel: "2026년 8월 9일",
    sermonTitle: "이러한 율법을 행하는 이방인이 정죄하리라",
    verse: "로마서 2장 27절",
    current: true,
  },
  {
    id: 9,
    issueNo: "제10-7",
    date: "2026-08-02",
    dateLabel: "2026년 8월 2일",
    sermonTitle: "믿음으로 사는 의인",
    verse: "로마서 1장 17절",
  },
  {
    id: 8,
    issueNo: "제10-6",
    date: "2026-07-26",
    dateLabel: "2026년 7월 26일",
    sermonTitle: "하나님의 진노가 나타나나니",
    verse: "로마서 1장 18절",
  },
  {
    id: 7,
    issueNo: "제10-5",
    date: "2026-07-19",
    dateLabel: "2026년 7월 19일",
    sermonTitle: "복음을 부끄러워하지 아니하노니",
    verse: "로마서 1장 16절",
  },
  {
    id: 6,
    issueNo: "제10-4",
    date: "2026-07-12",
    dateLabel: "2026년 7월 12일",
    sermonTitle: "하나님의 부르심",
    verse: "로마서 1장 7절",
  },
  {
    id: 5,
    issueNo: "제10-3",
    date: "2026-07-05",
    dateLabel: "2026년 7월 5일",
    sermonTitle: "이방인과 유대인 모두에게",
    verse: "로마서 1장 14절",
  },
  {
    id: 4,
    issueNo: "제10-2",
    date: "2026-06-28",
    dateLabel: "2026년 6월 28일",
    sermonTitle: "복음을 부끄러워하지 않음",
    verse: "로마서 1장 16절",
  },
  {
    id: 3,
    issueNo: "제10-1",
    date: "2026-06-21",
    dateLabel: "2026년 6월 21일",
    sermonTitle: "은혜로 받은 사도직",
    verse: "로마서 1장 5절",
  },
  {
    id: 2,
    issueNo: "제9-12",
    date: "2026-06-14",
    dateLabel: "2026년 6월 14일",
    sermonTitle: "복음 안에서 나타난 하나님의 의",
    verse: "로마서 1장 17절",
  },
  {
    id: 1,
    issueNo: "제9-11",
    date: "2026-06-07",
    dateLabel: "2026년 6월 7일",
    sermonTitle: "성령 안에서 하나님을 섬김",
    verse: "로마서 1장 9절",
  },
];

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

export const DUMMY_COVER = {
  photos: { church: null, panorama: null, group: null },
};

export const DUMMY_NEWS = [
  { title: "담임목사 방송 설교", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  { title: "정기모임", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  {
    title: "오늘의 모임",
    items: ["제목을 입력하세요.", "제목을 입력하세요.", "제목을 입력하세요."],
  },
  { title: "공지사항", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  { title: "헌금안내", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  { title: "일정안내", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
];

export const DUMMY_PRAYER_TOPICS = [
  { title: "다음 세대를 위한 기도", subtitle: "주일학교 교사 헌신자", category: "사역" },
  { title: "투병 중인 성도를 위한 기도", subtitle: "OOO 권사님", category: "병중" },
  { title: "선교사 파송을 위한 기도", subtitle: "단기선교팀", category: "선교" },
  { title: "구역 모임 부흥을 위한 기도", subtitle: "1구역", category: "소그룹" },
];

export const DUMMY_SERMON_NOTE = {
  title: "이러한 율법을 행하는 이방인이 정죄하리라",
  scripture: "로마서 2장 27절",
  outline: ["율법의 참된 의미", "마음의 할례", "이방인과 유대인의 구별 없음"],
};
