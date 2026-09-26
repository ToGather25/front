/**
 * Church Tenant Configuration
 *
 * SaaS 환경에서는 이 설정이 서브도메인/도메인 기반으로 서버에서 주입됩니다.
 * 예: GET /api/tenant?domain=togather.church
 *
 * 이 파일 자체가 이 배포(이 저장소)의 기본 교회 데이터(옥길교회)이기도 하다 —
 * ChurchProvider는 위 API 호출이 실패해도(백엔드 미배포 등) 이 값을 그대로 보여준다
 * (ChurchContext.jsx 참고). 즉 이 저장소를 그대로 배포하면 "옥길교회 프론트"로 동작한다.
 */

import floor1 from "@/assets/floors/1.png";
import floor2 from "@/assets/floors/2.png";
import floor3 from "@/assets/floors/3.png";
import floor4 from "@/assets/floors/4.png";
import floorB1 from "@/assets/floors/B1.png";
import okcLogo from "@/assets/icons/옥길교회_logo.png";

const churchConfig = {
  // ── 식별자 ────────────────────────────────────────────
  id: 1, // API 요청 시 churchId로 사용 — 백엔드 tenant 테이블의 실제 PK(옥길교회)와 일치해야 한다
  slug: "togather", // 서브도메인/URL 슬러그

  // ── 교회 기본 정보 ────────────────────────────────────
  name: "옥길교회",
  shortName: "알곡",
  address: "경기도 부천시 양지로 166번길 34 (옥길동)",
  tel: "02) 2615-4067",
  fax: "02) 2683-4326",
  email: "okgil@gmail.com",
  pastor: "임재호",
  denomination: "대한예수교장로회 고신교단",

  // ── 지도 설정 (카카오맵) ──────────────────────────────
  location: {
    level: 3, // 확대 수준 (낮을수록 확대)
  },

  // ── 브랜드 ────────────────────────────────────────────
  logoUrl: okcLogo,

  // ── SNS ───────────────────────────────────────────────
  social: {
    youtube: "https://www.youtube.com/@okgilchurch", // 채널 URL (푸터 링크용) — 옥길교회
    youtubeChannelId: "UCEqVXU3lm5RbDRWbTSPc_yg", // UC로 시작하는 채널 ID (옥길교회)
    instagram: null,
    facebook: null,
  },

  // ── 네비게이션 (교회별 커스텀 가능) ──────────────────
  nav: [
    {
      label: "교회소개",
      to: "/교회소개",
      children: [
        { label: "인사말", to: "/교회소개?tab=인사말" },
        { label: "교회 비전", to: "/교회소개?tab=교회 비전" },
        { label: "교회 연혁", to: "/교회소개?tab=교회 연혁" },
        { label: "섬기는 사람들", to: "/교회소개?tab=섬기는 사람들" },
        { label: "층별 안내", to: "/교회소개?tab=층별 안내" },
        { label: "오시는 길", to: "/교회소개?tab=오시는 길" },
        { label: "차량운행 안내", to: "/교회소개?tab=차량운행 안내" },
      ],
    },
    {
      label: "예배·방송",
      children: [
        { label: "예배 안내", to: "/말씀?tab=예배 안내" },
        { label: "예배 목록", to: "/말씀?tab=예배 목록" },
        { label: "스마트 주보", to: "/말씀?tab=스마트 주보" },
      ],
    },
    {
      label: "주일학교",
      children: [
        { label: "유치부", to: "/주일학교?tab=유치부" },
        { label: "초등부", to: "/주일학교?tab=초등부" },
        { label: "중·고등부", to: "/주일학교?tab=중·고등부" },
        { label: "대학·청년부", to: "/주일학교?tab=대학·청년부" },
      ],
    },
    {
      label: "전도·선교",
      children: [
        { label: "전도회 소개", to: "/전도선교?tab=전도회 소개" },
        { label: "국내외 선교", to: "/전도선교?tab=국내외 선교" },
        { label: "선교지 소식", to: "/전도선교?tab=선교지 소식" },
      ],
    },
    {
      label: "양육·훈련",
      children: [
        { label: "구역 모임", to: "/양육훈련?tab=구역모임" },
        { label: "오늘의 묵상", to: "/양육훈련?tab=오늘의 묵상" },
        { label: "제자훈련", to: "/양육훈련?tab=제자훈련" },
        { label: "양육 프로그램", to: "/양육훈련?tab=양육프로그램" },
        { label: "양육·훈련 게시판", to: "/양육훈련?tab=양육/훈련 게시판" },
        { label: "성경 읽기·쓰기", to: "/양육훈련?tab=성경읽기/쓰기" },
      ],
    },
    {
      label: "교회소식",
      children: [
        { label: "공지사항", to: "/공지사항" },
        { label: "교회행사", to: "/교회행사" },
        { label: "갤러리", to: "/갤러리" },
      ],
    },
  ],

  // ── 기능 플래그 (SaaS 플랜별 ON/OFF) ────────────────
  features: {
    jubo: true, // 스마트 주보
    events: true, // 교회행사 캘린더
    gallery: true, // 갤러리
    bible: true, // 성경 읽기/필사
    mypage: true, // 마이페이지
  },

  // ── 히어로 배너 텍스트 (배경 이미지는 churchProfileService의 실API로 대체됨) ──
  mainBanner: {
    title: "거기서 나오라",
    subtitle:
      "또 내가 들으니 하늘로부터 다른 음성이 나서 이르되 내 백성아,\n거기서 나와 그의 죄에 참여하지 말고 그가 받을 재앙들을 받지 말라 (계 18:4)",
  },

  // ── 인사말 ────────────────────────────────────────────
  greeting: {
    title: "할렐루야!",
    paragraphs: [
      "옥길교회 홈페이지를 방문해 주셔서 감사합니다.",
      "저희 교회를 소개하겠습니다.",
      "첫째, 저희 교회는 대한예수교장로회 고신교단에 속한 보수적인 교회입니다.\n1938년 9월 10일 대한예수교장로회 제27차 총회는 일제의 악랄하여 신사참배를 가결하였고 한상동 목사, 주남선 목사, 손명복 전도사 등 신실한 형들은 신사참배를 반대하여 투옥되었습니다. 그들은 해방 후 출옥하여 한국교회를 재건하기 위해 1946년 9월 20일에 개혁주의 보수인 신학교를 개교하였고, 이 학교는 후에 고려신학대학교로 발전하여 현재는 고신교단으로 발전하였습니다.",
      "둘째, 저희 교회는 순수한 복음을 선포하고 가르치는 교회입니다.\n개혁주의 신앙과 신학의 기초 위에 그리스도 중심의 말씀을 선포하며, 순수한 복음을 가르치는 교회입니다.",
      "셋째, 저희 교회는 다음세대를 길러내는 교회입니다.\n저희 교회는 유치부, 초등부, 중·고등부, 대학부, 청년부들에게 하나님의 말씀인 성경을 가르치고, 보수적인 신앙을 전수하고 또 받아 자라도록 노력하는 주님의 교회입니다.",
      "이렇게 저희 옥길교회는 주의 복음과 사랑을 자녀들에게 전수하고, 이곳과 세계에 전파 하기 위해 노력하는 주님의 교회입니다. 감사합니다.",
    ],
    signature: {
      church: "옥길교회",
      title: "담임목사",
      name: "임재호",
      signatureImage: null, // 직인/캘리그라피 서명 이미지 URL — 없으면 교회 로고로 대체
    },
  },

  // ── 교회 표어 ─────────────────────────────────────────
  slogan: {
    year: 2026,
    title: "거기서 나오라!",
    scripture: "또 내가 들으니 하늘로부터 다른 음성이 나서 이르되 내 백성아, 거기서 나와 그의 죄에 참여하지 말고 그가 받을 재앙들을 받지 말라(요한계시록 18:4)",
  },

  // ── 교회 비전 ─────────────────────────────────────────
  vision: {
    year: 2026,
    mainTitle: `안녕하세요!
옥길교회에 찾아와 주신 여러분을 주님의 이름으로 환영합니다.`,
    mainVerse: `옥길교회는
이 땅의 모든 사람들에게 복음의 밝은 빛을 비춰 구원의 길로 초대하고 (Calling),
부름 받은 성도들을 온전한 그리스도인으로 양육하여 (Training),
어두운 세상에서 빛의 역할을 하도록 세상으로 파송하는 교회입니다. (Sending)`,
    items: [
      {
        label: "말씀 공동체",
        description: "말씀으로 인도 선포하여 영혼의 구원 목표로 맺는 교회입니다.",
        detailedDescription: [
          { title: "예배 및 모임", text: "말씀의 은혜와 성령 충만함으로 가정·직장·사회를 변화시키는 일꾼 양성" },
          { title: "주일학교", text: "유치부, 초등부, 중고등부, 대학부, 청년부" },
          { title: "장년 교육", text: "성경공부(바이블 키), 제자훈련, 제직세미나, 새가족 및 학습/세례 교육" },
          { title: "성경읽기", text: "전교인 300독 목표, 통독·타자·필사 대회 및 시상" },
        ],
      },
      {
        label: "기도 공동체",
        description: "하나님과의 깊은 기도로 영혼을 양육하는 교회입니다.",
        detailedDescription: [
          { title: "새벽기도회/수요기도회", text: "성경강해 중심 (서신서, 모세오경, 선지서)" },
          { title: "특별새벽기도회", text: "신년, 고난주간, 여름행사, 새생명축제" },
          { title: "중보/온가족 기도회", text: "당회원·여전도회 중보기도, 매월 마지막 금요일 온가족 기도회" },
        ],
      },
      {
        label: "선도 공동체",
        description: "우리는 사람 있어서 믿음 주심이 지혜로 세상으로 파송하는 교회입니다.",
        detailedDescription: [
          { title: "전도 활동", text: "수요전도팀, 주일전도, 계란전도(부활주일), 전도집회 및 전도축제" },
          { title: "선교 후원", text: "국내 미자립교회 및 선교단체 후원, 주파송·교단 선교사 및 방문 선교사 섬김" },
        ],
      },
      {
        label: "무지개 공동체",
        description: "요람에서 무덤까지 말씀과 실력을 갖추어 모든 대가 조화를 이루는 무지개 공동체를 만듭니다.",
        detailedDescription: [
          { title: "주요 행사", text: "온가족예배(5월 3일), 가정세미나(5월 10일), 총출석주일(10월 18일)" },
          { title: "운영 안내", text: "교회 성장에 따라 시설 및 예산을 지원하여 점진적으로 확대 시행" },
        ],
      },
    ],
  },

  // ── 예배 시간표 디스플레이 설정 ─────────────────────────
  worshipDisplay: [
    { title: "주일예배", regularIndices: [0, 1, 2] },
    { title: "수요예배", regularIndices: [3] },
    { title: "금요기도회", regularIndices: [4] },
    { title: "새벽기도회", regularIndices: [5] },
  ],

  // ── 예배 시간표 ───────────────────────────────────────
  worshipSchedule: {
    regular: [
      { name: "1부 예배", time: "주일 오전 9시", location: "본당" },
      { name: "2부 예배", time: "주일 오전 11시", location: "본당" },
      { name: "오후 예배", time: "주일 오후 2시", location: "본당" },
      { name: "수요 예배", time: "수요일 오전 10시", location: "본당" },
      { name: "금요기도회", time: "금요일 오후 8시", location: "본당" },
      { name: "새벽기도회", time: "오전 5시 30분", location: "본당" },
    ],
    sundayAdditional: [
      { name: "오후 예배", time: "오전 9시", location: "2층 본당" },
      { name: "주일 학교 예배", time: "* 부서 별 상이", location: "부서별 상이" },
    ],
    departments: [
      { name: "유치부", time: "주일 오전 11시", location: "1층 유치부실" },
      { name: "초등부", time: "주일 오전 11시", location: "B1층 초등부실" },
      { name: "중등부", time: "주일 오전 11시", location: "B1층 초등부실" },
      { name: "대학·청년부", time: "주일 오후 3시", location: "1층 카페" },
    ],
  },

  // ── 섬기는 사람들 ─────────────────────────────────────
  staff: {
    filterTags: ["#담임목사", "#간사", "#행정장로", "#부목사"],
    headPastor: {
      name: "임재호 목사",
      tel: "02-1234-5678",
      email: "gather@gmail.com",
      role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
      image: null,
      education: ["OOO대학교 졸업", "OOO신대학원 졸업", "미국 OOO대학교 신학대학원"],
      career: ["OO교회 nnn사 사역", "전 OO교회 담임목사", "2008' OO역 박사 취득"],
    },
    clergy: [
      {
        name: "박보아스 목사",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
        image: null,
      },
      {
        name: "문건민 목사",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
        image: null,
      },
      {
        name: "금진섭 목사",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
        image: null,
      },
      {
        name: "김정희 간사",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "교회 내 역할 및 소속 부서 등을 입력하세요.",
        image: null,
      },
    ],
    elders: [
      {
        name: "유철선 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "시무장로",
        image: null,
      },
      {
        name: "변세건 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "시무장로",
        image: null,
      },
      {
        name: "이영실 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "시무장로",
        image: null,
      },
      {
        name: "이홍섭 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "시무장로",
        image: null,
      },
    ],
    associateElders: [
      {
        name: "김종칠 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "협동장로",
        image: null,
      },
      {
        name: "안현민 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "사역장로",
        image: null,
      },
      {
        name: "권길만 장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "협동장로",
        image: null,
      },
    ],
    retiredElders: [
      {
        name: "김봉석 은퇴장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "은퇴장로",
        image: null,
      },
      {
        name: "임대순 은퇴장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "은퇴장로",
        image: null,
      },
      {
        name: "손철기 은퇴장로",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "은퇴장로",
        image: null,
      },
    ],
    missionaries: [
      {
        name: "오범석(정양숙) 선교사",
        tel: "02-1234-5678",
        email: "gather@gmail.com",
        role: "태국 방콕 파송",
        location: "태국",
        image: null,
      },
    ],
  },

  // ── 교회 연혁 ─────────────────────────────────────────
  history: {
    description: "복음과 함께 걸어온 시간,\n하나님의 인도하심 가운데 걸어온 옥길교회의 발자취를 돌아봅니다.",
    foundedYear: 1985,
    items: [
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
    {
      era: "2000~",
      events: [
        { date: "2009.12.01", content: "내용을 입력하세요." },
        { date: "2008.07.01", content: "내용을 입력하세요." },
        { date: "2005.03.01", content: "내용을 입력하세요." },
        { date: "2002.11.01", content: "내용을 입력하세요." },
        { date: "2000.01.01", content: "내용을 입력하세요." },
      ],
    },
    {
      era: "1990~",
      events: [
        { date: "1999.05.01", content: "내용을 입력하세요." },
        { date: "1996.09.01", content: "내용을 입력하세요." },
        { date: "1993.02.01", content: "내용을 입력하세요." },
        { date: "1990.01.01", content: "내용을 입력하세요." },
      ],
    },
    ],
  },

  // ── 층별 안내 ─────────────────────────────────────────
  floorGuide: [
    { floor: "4층", rooms: "사택, 테라스", image: floor4 },
    { floor: "3층", rooms: "목양실, 당회실, 방송실, 재정부실", image: floor3 },
    { floor: "2층", rooms: "본당, 자모실", image: floor2 },
    { floor: "1층", rooms: "식당, 새가족실, 카페, 유치부실", image: floor1 },
    {
      floor: "B1층",
      rooms: "중·고등부실, 초등부실, 소회의실1, 소회의실2, 소회의실3",
      image: floorB1,
    },
  ],

  // ── 소속 공동체 목록 (회원가입 선택지) ───────────────
  communities: [
    "옥길교회",
    "청년부",
    "유치부",
    "초등부",
    "중·고등부",
    "새가족부",
    "전도회",
    "남선교회",
    "여전도회",
    "권사회",
  ],

  // ── 주차 안내 ─────────────────────────────────────────
  // 주차장이 여러 곳이면 lots 배열에 항목을 추가한다 — 각 항목의 name이 소제목으로 표시된다.
  parking: {
    lots: [
      {
        name: "교회 주차장",
        details: [
          { label: "주차 요금", value: "무료" },
          { label: "주차 가능 시간", value: "종일" },
          { label: "안내", value: "주차 공간이 협소하니 가급적 대중교통을 이용해 주세요." },
        ],
      },
      {
        name: "옥길새길중학교 주차장",
        details: [
          { label: "주차 요금", value: "무료" },
          { label: "주차 가능 시간", value: "오전 9시 ~ 오후 3시" },
          { label: "안내", value: "이용 가능 시간 외에는 주차할 수 없습니다." },
        ],
      },
      {
        name: "옥길 유치원 주차장",
        details: [
          { label: "주차 요금", value: "무료" },
          { label: "주차 가능 시간", value: "오전 9시 ~ 오후 5시" },
          { label: "안내", value: "이용 가능 시간 외에는 주차할 수 없습니다." },
        ],
      },
    ],
  },

  // ── 대중교통 안내 (오시는 길) ──────────────────────────
  publicTransit: [
    { subway: "1호선 역곡역 1번출구", bus: "19번 버스", dropoff: "LH 8단지 하차" },
    { subway: "7호선 광명사거리역 6번출구", bus: "2번 버스", dropoff: "옥길단독2블록 상업지역 하차" },
    { subway: "7호선 천왕역 3번출구", bus: "56-1번 버스", dropoff: "별빛마루도서관.소사경찰서 하차" },
  ],

  // ── 차량운행 안내 ─────────────────────────────────────
  // waypoints: 각 경유지의 위도(lat)·경도(lng)·표시명(label)·출발시각(time) —
  // lat/lng/label을 입력하면 지도에 경로가 표시되고, 표에는 label(위치)과 time(시간)이 열로 나온다.
  // 좌표는 카카오맵(map.kakao.com)에서 원하는 지점 우클릭 → "이 위치" 로 확인 가능합니다.
  transportGuide: {
    routes: [
      {
        name: "청산역 라인",
        color: "#3B5280",
        waypoints: [
          { lat: 37.4847, lng: 126.9291, label: "옥길교회 출발", time: "06:10" },
          { lat: 37.4814, lng: 126.9407, label: "청산역 7호선 1번출구", time: "06:20" },
          { lat: 37.479, lng: 126.931, label: "신림역", time: "06:35" },
          { lat: 37.475, lng: 126.925, label: "신림사거리", time: "06:45" },
          { lat: 37.480, lng: 126.935, label: "옥길교회 도착", time: "06:55" },
        ],
      },
      {
        name: "천왕역 라인",
        color: "#E05C2D",
        waypoints: [
          { lat: 37.4847, lng: 126.9291, label: "옥길교회 출발", time: "07:40" },
          { lat: 37.4814, lng: 126.9407, label: "천왕역 7호선 3번출구", time: "07:52" },
          { lat: 37.479, lng: 126.931, label: "철산역", time: "08:05" },
          { lat: 37.475, lng: 126.925, label: "명파역", time: "08:18" },
          { lat: 37.480, lng: 126.935, label: "옥길교회 도착", time: "08:30" },
        ],
      },
      {
        name: "광명시청 라인",
        color: "#2D9E6B",
        waypoints: [
          { lat: 37.4847, lng: 126.9291, label: "옥길교회 출발", time: "06:30" },
          { lat: 37.4814, lng: 126.9407, label: "광명시거리역", time: "06:42" },
          { lat: 37.479, lng: 126.931, label: "광명시청", time: "06:55" },
          { lat: 37.475, lng: 126.925, label: "오금역", time: "07:08" },
          { lat: 37.480, lng: 126.935, label: "옥길교회 도착", time: "07:20" },
        ],
      },
    ],
    notes: [
      "차량 운행 관련 공지사항을 이곳에 입력하세요.",
      "차량 운행 관련 추가 공지사항을 이곳에 입력하세요.",
    ],
  },
};

export default churchConfig;
