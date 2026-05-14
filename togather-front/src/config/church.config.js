/**
 * Church Tenant Configuration
 *
 * SaaS 환경에서는 이 설정이 서브도메인/도메인 기반으로 서버에서 주입됩니다.
 * 예: GET /api/tenant?domain=togather.church
 *
 * 현재는 로컬 설정 파일 사용 (개발 단계)
 */

const churchConfig = {
  // ── 식별자 ────────────────────────────────────────────
  id: "togather-church",          // API 요청 시 churchId로 사용
  slug: "togather",               // 서브도메인/URL 슬러그

  // ── 교회 기본 정보 ────────────────────────────────────
  name: "알곡교회",
  shortName: "알곡",
  address: "서울 관악구 난곡로24길 42 (신림동)",
  tel: "02) 2615-4067",
  fax: "02) 2683-4326",
  email: "algok@gmail.com",
  pastor: "유상현",
  denomination: "대한예수교장로회 고신교단",

  // ── 지도 설정 (카카오맵) ──────────────────────────────
  location: {
    level: 3,   // 확대 수준 (낮을수록 확대)
  },

  // ── 브랜드 ────────────────────────────────────────────
  // logoUrl: "/icons/512x512.png"  // CDN URL로 교체 가능
  logoUrl: null,   // null이면 기본 로고 사용

  // ── SNS ───────────────────────────────────────────────
  social: {
    youtube: "https://www.youtube.com/channel/UCEqVXU3lm5RbDRWbTSPc_yg",           // 채널 URL (푸터 링크용)
    youtubeChannelId: "UCEqVXU3lm5RbDRWbTSPc_yg",           // UC로 시작하는 채널 ID (예: UCxxxxxxxxxxxxxxxxxx)
    instagram:        null,
    facebook:         null,
  },

  // ── 네비게이션 (교회별 커스텀 가능) ──────────────────
  nav: [
    {
      label: "교회소개",
      to: "/교회소개",
      children: [
        { label: "인사말",        to: "/교회소개?tab=인사말" },
        { label: "교회 연혁·비전", to: "/교회소개?tab=교회 연혁·비전" },
        { label: "예배 안내",     to: "/교회소개?tab=예배 안내" },
        { label: "섬기는 사람들", to: "/교회소개?tab=섬기는 사람들" },
        { label: "층별 안내",     to: "/교회소개?tab=층별 안내" },
        { label: "오시는 길",     to: "/교회소개?tab=오시는 길" },
        { label: "차량운행 안내", to: "/교회소개?tab=차량운행 안내" },
      ],
    },
    {
      label: "말씀·찬양",
      children: [
        { label: "실시간 방송 (ON-AIR)", to: "/말씀/방송" },
        { label: "설교 소개",           to: "/말씀/설교" },
        { label: "찬양 플레이리스트",    to: "/말씀/찬양" },
      ],
    },
    {
      label: "주일학교",
      children: [
        { label: "유치부",      to: "/주일학교/유치부" },
        { label: "초등부",      to: "/주일학교/초등부" },
        { label: "중·고등부",   to: "/주일학교/중고등부" },
        { label: "대학·청년부", to: "/주일학교/청년부" },
      ],
    },
    {
      label: "전도·선교",
      children: [
        { label: "전도회 소개", to: "/전도선교/전도회" },
        { label: "국내 선교",   to: "/전도선교/국내" },
        { label: "해외 선교",   to: "/전도선교/해외" },
        { label: "선교지 소식", to: "/전도선교/소식" },
      ],
    },
    {
      label: "양육·훈련",
      children: [
        { label: "구역 모임",        to: "/양육훈련/구역" },
        { label: "오늘의 묵상",      to: "/양육훈련/묵상" },
        { label: "제자훈련",         to: "/양육훈련/제자훈련" },
        { label: "양육 프로그램",    to: "/양육훈련/프로그램" },
        { label: "양육·훈련 게시판", to: "/양육훈련/게시판" },
        { label: "성경 읽기·쓰기",   to: "/말씀" },
      ],
    },
    {
      label: "교회소식",
      children: [
        { label: "스마트 주보", to: "/주보" },
        { label: "교회행사",   to: "/교회행사" },
        { label: "갤러리",     to: "/갤러리" },
      ],
    },
  ],

  // ── 기능 플래그 (SaaS 플랜별 ON/OFF) ────────────────
  features: {
    jubo:    true,    // 스마트 주보
    events:  true,    // 교회행사 캘린더
    gallery: true,    // 갤러리
    bible:   true,    // 성경 읽기/필사
    mypage:  true,    // 마이페이지
  },

  // ── 히어로 배너 텍스트 ────────────────────────────────
  mainBanner: {
    url: "",
    title: "하나님의 사랑이 우리에게\n이렇게 나타난 바 되었으니",
    subtitle: "하나님의 자기의 독생자를 세상에 보내심은\n저로 말미암아 우리를 살리려 하심이니라 (요일 4:9)",
  },

  // ── 인사말 ────────────────────────────────────────────
  greeting: {
    title: "할렐루야!",
    paragraphs: [
      "알곡교회 홈페이지를 방문해 주셔서 감사합니다.",
      "저희 교회를 소개하겠습니다.",
      "첫째, 저희 교회는 대한예수교장로회 고신교단에 속한 보수적인 교회입니다.\n1938년 9월 10일 대한예수교장로회 제27차 총회는 일제의 악랄하여 신사참배를 가결하였고 한상동 목사, 주남선 목사, 손명복 전도사 등 신실한 형들은 신사참배를 반대하여 투옥되었습니다. 그들은 해방 후 출옥하여 한국교회를 재건하기 위해 1946년 9월 20일에 개혁주의 보수인 신학교를 개교하였고, 이 학교는 후에 고려신학대학교로 발전하여 현재는 고신교단으로 발전하였습니다.",
      "둘째, 저희 교회는 순수한 복음을 선포하고 가르치는 교회입니다.\n개혁주의 신앙과 신학의 기초 위에 그리스도 중심의 말씀을 선포하며, 순수한 복음을 가르치는 교회입니다.",
      "셋째, 저희 교회는 다음세대를 길러내는 교회입니다.\n저희 교회는 유치부, 초등부, 중·고등부, 대학부, 청년부들에게 하나님의 말씀인 성경을 가르치고, 보수적인 신앙을 전수하고 또 받아 자라도록 노력하는 주님의 교회입니다.",
      "이렇게 저희 알곡교회는 주의 복음과 사랑을 자녀들에게 전수하고, 이곳과 세계에 전파 하기 위해 노력하는 주님의 교회입니다. 감사합니다.",
    ],
    signature: {
      church: "알곡교회",
      title: "담임목사",
      name: "김함께",
    },
  },

  // ── 교회 비전 ─────────────────────────────────────────
  vision: {
    year: 2026,
    mainTitle: "알곡교회 공동체 비전 ToGather",
    mainVerse: '"함께 모여 하나님 아버지께로"',
    items: [
      { label: "Together",  description: "첫번째 비전에 대한 내용을 입력하세요." },
      { label: "To father", description: "두번째 비전에 대한 내용을 입력하세요." },
      { label: "To gather", description: "세번째 비전에 대한 내용을 입력하세요." },
    ],
  },

  // ── 예배 시간표 ───────────────────────────────────────
  worshipSchedule: {
    regular: [
      { name: "1부 예배",   time: "주일 오전 9시",     location: "본당" },
      { name: "2부 예배",   time: "주일 오전 11시",    location: "본당" },
      { name: "오후 예배",  time: "주일 오후 2시",     location: "본당" },
      { name: "수요 예배",  time: "수요일 오전 10시",  location: "본당" },
      { name: "금요기도회", time: "금요일 오후 8시",   location: "본당" },
      { name: "새벽기도회", time: "매일 오전 5시반",   location: "본당" },
    ],
    departments: [
      { name: "유치부",      time: "주일 오전 11시", location: "1층 유치부실" },
      { name: "초등부",      time: "주일 오전 11시", location: "B1층 초등부실" },
      { name: "중등부",      time: "주일 오전 11시", location: "B1층 초등부실" },
      { name: "대학·청년부", time: "주일 오후 3시",  location: "1층 카페" },
    ],
  },

  // ── 섬기는 사람들 ─────────────────────────────────────
  staff: {
    filterTags: ["#담임목사", "#간사", "#협동장로", "#부목사"],
    headPastor: {
      name: "김함께 목사",
      tel: "02-1234-5678",
      email: "gather@gmail.com",
      role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
      education: [
        "OOO대학교 졸업",
        "OOO신대학원 졸업",
        "미국 OOO대학교 신학대학원",
      ],
      career: [
        "OO교회 nnn사 사역",
        "전 OO교회 담임목사",
        "2008' OO역 박사 취득",
      ],
    },
    clergy: [
      { name: "김무리 목사",   tel: "02-1234-5678", email: "gather@gmail.com", role: "교회 내 역할 및 소속 부서 등을 입력하세요." },
      { name: "김모두 전도사", tel: "02-1234-5678", email: "gather@gmail.com", role: "교회 내 역할 및 소속 부서 등을 입력하세요." },
      { name: "임축복 목사",   tel: "02-1234-5678", email: "gather@gmail.com", role: "교회 내 역할 및 소속 부서 등을 입력하세요." },
      { name: "이행복 전도사", tel: "02-1234-5678", email: "gather@gmail.com", role: "교회 내 역할 및 소속 부서 등을 입력하세요." },
    ],
  },

  // ── 교회 연혁 ─────────────────────────────────────────
  history: [
    {
      era: "2020~",
      events: [
        { date: "2026.01.01", content: "내용을 입력하세요." },
        { date: "2025.12.01", content: "내용을 입력하세요." },
        { date: "2025.01.01", content: "내용을 입력하세요." },
        { date: "2024.12.01", content: "내용을 입력하세요." },
        { date: "2024.07.01", content: "내용을 입력하세요." },
        { date: "2024.02.22", content: "내용을 입력하세요." },
        { date: "2023.11.13", content: "내용을 입력하세요." },
        { date: "2023.02.01", content: "내용을 입력하세요." },
        { date: "2022.12.06", content: "내용을 입력하세요." },
        { date: "2022.03.20", content: "내용을 입력하세요." },
        { date: "2021.10.13", content: "내용을 입력하세요." },
        { date: "2020.01.01", content: "내용을 입력하세요." },
      ],
    },
    {
      era: "2010~",
      events: [
        { date: "2019.01.01", content: "내용을 입력하세요." },
        { date: "2019.12.01", content: "내용을 입력하세요." },
        { date: "2018.12.01", content: "내용을 입력하세요." },
        { date: "2017.07.01", content: "내용을 입력하세요." },
        { date: "2017.02.22", content: "내용을 입력하세요." },
        { date: "2016.11.13", content: "내용을 입력하세요." },
        { date: "2016.02.01", content: "내용을 입력하세요." },
        { date: "2015.12.08", content: "내용을 입력하세요." },
        { date: "2014.03.20", content: "내용을 입력하세요." },
        { date: "2013.10.13", content: "내용을 입력하세요." },
        { date: "2013.01.01", content: "내용을 입력하세요." },
      ],
    },
  ],

  // ── 층별 안내 ─────────────────────────────────────────
  floorGuide: [
    { floor: "4층",  rooms: "청년부실, 사무실" },
    { floor: "3층",  rooms: "목양실, 당회실, 방송실, 재정부실" },
    { floor: "2층",  rooms: "본당, 자모실" },
    { floor: "1층",  rooms: "식당, 새가족실, 카페, 유치부실" },
    { floor: "B1층", rooms: "중·고등부실, 초등부실, 소회의실1, 소회의실2, 소회의실3" },
  ],

  // ── 소속 공동체 목록 (회원가입 선택지) ───────────────
  communities: ["알곡교회", "청년부", "투게더", "유치부", "초등부", "중·고등부"],

  // ── 주차 안내 ─────────────────────────────────────────
  parking: {
    details: [
      { label: "주차 가능 대수", value: "00대" },
      { label: "주차 요금", value: "무료" },
      { label: "주차 가능 시간", value: "주일 오전 9시 ~ 오후 2시" },
      { label: "안내", value: "주차 공간이 협소하니 가급적 대중교통을 이용해 주세요." },
    ],
  },

  // ── 차량운행 안내 ─────────────────────────────────────
  // waypoints: 각 경유지의 위도(lat)·경도(lng)·표시명(label) 입력 시 지도에 경로가 표시됩니다.
  // 좌표는 카카오맵(map.kakao.com)에서 원하는 지점 우클릭 → "이 위치" 로 확인 가능합니다.
  transportGuide: {
    routes: [
      {
        name: "운행코스 1",
        schedule: "시간을 입력하세요.",
        color: "#3B5280",
        waypoints: [
          // { lat: 37.123, lng: 126.123, label: "출발지명" },
        ],
      },
      {
        name: "운행코스 2",
        schedule: "시간을 입력하세요.",
        color: "#E05C2D",
        waypoints: [],
      },
      {
        name: "운행코스 3",
        schedule: "시간을 입력하세요.",
        color: "#2D9E6B",
        waypoints: [],
      },
      {
        name: "운행코스 4",
        schedule: "시간을 입력하세요.",
        color: "#9B51E0",
        waypoints: [],
      },
      {
        name: "운행코스 5",
        schedule: "시간을 입력하세요.",
        color: "#E0A82D",
        waypoints: [],
      },
    ],
  },
};

export default churchConfig;
