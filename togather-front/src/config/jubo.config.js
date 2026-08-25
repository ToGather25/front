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
      church: null, // 교회 건물 사진 URL
      panorama: null, // 전체 예배 파노라마 사진 URL
      group: null, // 공동체 단체 사진 URL
    },
  },

  // ── 소식 ─────────────────────────────────────────────
  news: [
    { title: "담임목사 방송 설교", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "정기모임", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    {
      title: "오늘의 모임",
      items: ["제목을 입력하세요.", "제목을 입력하세요.", "제목을 입력하세요."],
    },
    { title: "공지사항", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "헌금안내", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
    { title: "일정안내", items: ["제목을 입력하세요.", "제목을 입력하세요."] },
  ],

  // ── 봉사 ─────────────────────────────────────────────
  serviceRoles: [
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
  ],

  // ── 예물 ─────────────────────────────────────────────
  offering: [
    { title: "십일조", items: ["OOO 외 00명"] },
    { title: "감사헌금", items: ["OOO 외 00명", "OOO 외 00명"] },
    { title: "건축헌금", items: ["OOO 외 00명"] },
    { title: "선교헌금", items: ["OOO 외 00명"] },
    { title: "기타헌금", items: ["OOO 외 00명"] },
  ],

  // ── 후원 ─────────────────────────────────────────────
  support: [
    { organization: "베트남 | 호치민", target: "선교사님 성함", region: "후원구역명" },
    { organization: "일본 | 동경", target: "선교사님 성함", region: "후원구역명" },
    { organization: "말레이시아 | 쿠알라룸푸르", target: "선교사님 성함", region: "후원구역명" },
    { organization: "호주 | 시드니", target: "선교사님 성함", region: "후원구역명" },
    { organization: "브라질 | 상갈루스", target: "선교사님 성함", region: "후원구역명" },
    { organization: "태국 | 파티아", target: "선교사님 성함", region: "후원구역명" },
    { organization: "OOO교회", target: "목사님 성함", region: "후원구역명" },
    { organization: "OOO교회", target: "목사님 성함", region: "후원구역명" },
    { organization: "기독교보", target: "기관이름", region: "후원구역명" },
  ],

  // ── 구역 ─────────────────────────────────────────────
  districts: [
    {
      name: "1구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
    {
      name: "2구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
    {
      name: "3구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
    {
      name: "4구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
    {
      name: "5구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
    {
      name: "6구역",
      location: "장소를 입력하세요.",
      time: "시간을 입력하세요.",
      leader: "OOO 집사",
    },
  ],

  // ── 섬기는 분들 ───────────────────────────────────────
  ministers: [
    {
      title: "교역자",
      items: ["담임목사 | OOO", "부 목 사 | OOO", "교육간사 | OOO", "협동목사 | OOO"],
    },
    {
      title: "장 로",
      items: [
        "시무장로 | OOO",
        "시무장로 | OOO",
        "협동장로 | OOO",
        "사역장로 | OOO",
        "은퇴장로 | OOO",
      ],
    },
    {
      title: "찬 양",
      items: ["지휘자 | OOO", "피아노 | OOO", "오르간 | OOO"],
    },
  ],

  // ── 말씀 ─────────────────────────────────────────────
  sermon: {
    title: "이러한 율법을 행하는 이방인이 정죄하리라",
    scripture: "로마서 2장 27절",
    outline: ["율법의 참된 의미", "마음의 할례", "이방인과 유대인의 구별 없음"],
  },

  // ── 헌금 ─────────────────────────────────────────────
  giving: {
    bankAccount: {
      bank: "국민은행",
      accountNumber: "123456-78-901234",
      holder: "알곡교회",
    },
    qrCodeUrl: null,
  },

  // ── 기도제목 ──────────────────────────────────────────
  prayerTopics: [
    { title: "다음 세대를 위한 기도", subtitle: "주일학교 교사 헌신자", category: "사역" },
    { title: "투병 중인 성도를 위한 기도", subtitle: "OOO 권사님", category: "병중" },
    { title: "선교사 파송을 위한 기도", subtitle: "단기선교팀", category: "선교" },
    { title: "구역 모임 부흥을 위한 기도", subtitle: "1구역", category: "소그룹" },
  ],
};

export default juboConfig;
