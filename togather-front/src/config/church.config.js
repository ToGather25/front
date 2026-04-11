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
  name: "투게더교회",
  shortName: "투게더",
  address: "경기도 부천시 양지로 166번길 34 (옥길동)",
  tel: "02) 2615-4067",
  fax: "02) 2683-4326",
  email: "okc0120@gmail.com",
  pastor: "김함께",
  denomination: "대한예수교장로회 고신교단",

  // ── 브랜드 ────────────────────────────────────────────
  // logoUrl: "/icons/512x512.png"  // CDN URL로 교체 가능
  logoUrl: null,   // null이면 기본 로고 사용

  // ── SNS ───────────────────────────────────────────────
  social: {
    youtube:   null,
    instagram: null,
    facebook:  null,
  },

  // ── 네비게이션 (교회별 커스텀 가능) ──────────────────
  nav: [
    { label: "교회소개",  to: "/교회소개" },
    { label: "말씀·찬양", to: "/말씀" },
    { label: "전도·선교", to: "#" },
    { label: "양육·훈련", to: "#" },
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

  // ── 예배 시간표 ───────────────────────────────────────
  worshipSchedule: {
    regular: [
      { name: "1부 예배",   time: "주일 오전 9시" },
      { name: "2부 예배",   time: "주일 오전 11시" },
      { name: "오후 예배",  time: "주일 오후 2시" },
      { name: "수요 예배",  time: "수요일 오전 11시" },
      { name: "금요기도회", time: "금요일 오후 8시" },
      { name: "새벽기도회", time: "매일 오전 5시반" },
    ],
    departments: [
      { name: "유치부",     time: "주일 오전 11시" },
      { name: "초등부",     time: "주일 오전 11시" },
      { name: "중고등부",   time: "주일 오전 11시" },
      { name: "대학·청년부",time: "주일 오후 3시" },
    ],
  },

  // ── 연도 표어 ─────────────────────────────────────────
  yearlyVision: {
    year: 2026,
    verse: '"함께 모여 하나님 아버지께로"',
    subtitle: "투게더교회 공동체 비전 ToGather",
    practices: ["Together", "ToFather", "To Gather"],
  },

  // ── 히어로 배너 텍스트 ────────────────────────────────
  heroBanner: {
    title: "하나님의 사랑이 우리에게\n이렇게 나타난 바 되었으니",
    subtitle: "하나님의 자기의 독생자를 세상에 보내심은\n저로 말미암아 우리를 살리려 하심이니라 (요일 4:9)",
  },
};

export default churchConfig;
