/**
 * Jubo (스마트 주보) Configuration
 * 실제 서비스에서는 API로 대체 예정
 */

const juboConfig = {
  // ── 표지 ─────────────────────────────────────────────
  cover: {
    issueNumber: "제10-7",
    date: "2026년 2월 15일",
    photos: {
      church:   null,  // 교회 건물 사진 URL
      panorama: null,  // 전체 예배 파노라마 사진 URL
      group:    null,  // 공동체 단체 사진 URL
    },
  },

  // ── 예배 순서 ─────────────────────────────────────────
  worshipServices: [
    "주일 오전예배",
    "주일 오후예배",
    "새벽기도회",
    "수요기도회",
    "금요기도회",
  ],

  worshipOrder: [
    { order: "예배 부름",  part1: "성가대",                     part2: "성가대" },
    { order: "경배와 찬양", part1: "찬양팀",                    part2: "찬양팀" },
    { order: "사도신경",   part1: "다같이",                     part2: "다같이" },
    { order: "찬 송",     part1: "20장 / 큰 영광 중에 계신 주", part2: "OOO장 / OOO" },
    { order: "대표기도",   part1: "(1부) OOO집사, (2부) OOO집사", part2: "OOO 집사" },
    { order: "찬 송",     part1: "OOO장 /* 큰 영광 중에 계신 주 *", part2: "OOO장" },
    { order: "성경봉독",   part1: "로마서 2장 27절 (구역 2:111)", part2: "OOO장 OOO절" },
    { order: "설 교",     part1: "이러한 율법을 행하는 이방인이 정죄하리라\n(제3개혁)", part2: "OOO목사" },
    { order: "헌 금",     part1: "331장 / 영광을 받으신 만왕의 주여", part2: "OOO장" },
    { order: "헌금기도",   part1: "성가대",                     part2: "성가대" },
    { order: "교회소식",   part1: "성가대",                     part2: "성가대" },
    { order: "찬 양",     part1: "함께",                        part2: "함께" },
    { order: "강복선언",   part1: "성가대",                     part2: "성가대" },
  ],

  // 예배 시간 요약 (주보 우측 사이드 표시용)
  worshipScheduleSummary: [
    { label: "주일 1부",  time: "오전 9:00" },
    { label: "주일 2부",  time: "오전 11:00" },
    { label: "주일 오후", time: "오후 2:00" },
    { label: "수요기도회", time: "오전 10:00" },
    { label: "금요기도회", time: "오후 8:00" },
    { label: "새벽기도회", time: "오전 5:30 (월~토)" },
  ],

  // ── 소식 ─────────────────────────────────────────────
  news: [
    { title: "담임목사 방송 설교", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "정기모임",          items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "오늘의 모임",        items: ["제목을 입력하세요.", "제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "공지사항",           items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "헌금안내",           items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "일정안내",           items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  ],

  // ── 봉사 ─────────────────────────────────────────────
  serviceRoles: [
    { role: "예배인도",  part1: "000",      part2: "000" },
    { role: "대표기도",  part1: "000",      part2: "000" },
    { role: "설교",     part1: "000목사",   part2: "000목사" },
    { role: "성경봉독",  part1: "000",      part2: "000" },
    { role: "찬양대지휘", part1: "000",     part2: "000" },
    { role: "반주",     part1: "000",      part2: "000" },
    { role: "영상",     part1: "000",      part2: "000" },
    { role: "음향",     part1: "000",      part2: "000" },
    { role: "안내(남)",  part1: "000, 000", part2: "000, 000" },
    { role: "안내(여)",  part1: "000, 000", part2: "000, 000" },
    { role: "주보",     part1: "000",      part2: "000" },
    { role: "방송",     part1: "000",      part2: "000" },
  ],

  // ── 예물 ─────────────────────────────────────────────
  offering: [
    { title: "십일조",   items: ["OOO 외 00명"] },
    { title: "감사헌금",  items: ["OOO 외 00명", "OOO 외 00명"] },
    { title: "건축헌금",  items: ["OOO 외 00명"] },
    { title: "선교헌금",  items: ["OOO 외 00명"] },
    { title: "기타헌금",  items: ["OOO 외 00명"] },
  ],

  // ── 후원 ─────────────────────────────────────────────
  support: [
    { organization: "베트남 | 호치민",          target: "선교사님 성함", region: "후원구역명" },
    { organization: "일본 | 동경",              target: "선교사님 성함", region: "후원구역명" },
    { organization: "말레이시아 | 쿠알라룸푸르", target: "선교사님 성함", region: "후원구역명" },
    { organization: "호주 | 시드니",            target: "선교사님 성함", region: "후원구역명" },
    { organization: "브라질 | 상갈루스",         target: "선교사님 성함", region: "후원구역명" },
    { organization: "태국 | 파티아",            target: "선교사님 성함", region: "후원구역명" },
    { organization: "OOO교회",                 target: "목사님 성함",   region: "후원구역명" },
    { organization: "OOO교회",                 target: "목사님 성함",   region: "후원구역명" },
    { organization: "기독교보",                 target: "기관이름",      region: "후원구역명" },
  ],

  // ── 구역 ─────────────────────────────────────────────
  districts: [
    { name: "1구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
    { name: "2구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
    { name: "3구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
    { name: "4구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
    { name: "5구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
    { name: "6구역", location: "장소를 입력하세요.", time: "시간을 입력하세요.", leader: "OOO 집사" },
  ],

  // ── 섬기는 분들 ───────────────────────────────────────
  ministers: [
    {
      title: "교역자",
      items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
    },
    {
      title: "장 로",
      items: ["시무장로 | OOO", "시무장로 | OOO", "협동장로 | OOO", "사역장로 | OOO", "은퇴장로 | OOO"],
    },
    {
      title: "찬 양",
      items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"],
    },
  ],
};

export default juboConfig;
