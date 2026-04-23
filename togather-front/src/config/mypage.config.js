/**
 * MyPage Configuration
 * 실제 서비스에서는 API/AuthContext로 대체 예정
 */

export const MOCK_USER = {
  name: "홍길동",
  email: "hong@gmail.com",
  community: "청년부",
  joinDate: "2024.03.01",
};

export const MYPAGE_STATS = [
  { label: "성경 읽기", value: "34절", sub: "이번 주" },
  { label: "성경 쓰기", value: "12절", sub: "이번 주" },
  { label: "연속 출석", value: "7일",  sub: "streak" },
];

export const MYPAGE_MENUS = [
  { label: "내 정보 수정",      icon: "✏️" },
  { label: "비밀번호 변경",     icon: "🔒" },
  { label: "알림 설정",         icon: "🔔" },
  { label: "개인정보 처리방침",  icon: "📄" },
  { label: "이용약관",           icon: "📋" },
  { label: "로그아웃",           icon: "🚪", danger: true },
];
