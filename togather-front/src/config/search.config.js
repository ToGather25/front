/** 사이트 전체 검색 대상(내비게이션 단축키 성격) — SearchOverlay와 /검색 결과 페이지가 공유한다. */
export const ALL_KEYWORDS = [
  { label: "주일 예배", to: "/말씀/설교", category: "예배" },
  { label: "주일 2부 예배", to: "/말씀/설교", category: "예배" },
  { label: "새벽 예배", to: "/말씀/설교", category: "예배" },
  { label: "수요 예배", to: "/말씀/설교", category: "예배" },
  { label: "금요 예배", to: "/말씀/설교", category: "예배" },
  { label: "성경 타자", to: "/말씀/필사", category: "말씀" },
  { label: "성경 필사", to: "/말씀/필사", category: "말씀" },
  { label: "성경 읽기", to: "/말씀/읽기", category: "말씀" },
  { label: "스마트 주보", to: "/주보/목록", category: "주보" },
  { label: "헌금 안내", to: "/주보?tab=예물", category: "주보" },
  { label: "봉사 안내", to: "/주보?tab=봉사", category: "주보" },
  { label: "구역모임", to: "/양육훈련/구역", category: "양육" },
  { label: "제자훈련", to: "/양육훈련/제자", category: "양육" },
  { label: "소그룹", to: "/양육훈련", category: "양육" },
  { label: "교회 소개", to: "/교회소개", category: "교회" },
  { label: "예배 안내", to: "/말씀/안내", category: "예배" },
  { label: "오시는 길", to: "/교회소개?tab=오시는 길", category: "교회" },
  { label: "셔틀 안내", to: "/교회소개?tab=차량운행 안내", category: "교회" },
  { label: "주차 안내", to: "/교회소개?tab=오시는 길", category: "교회" },
  { label: "교회 행사", to: "/교회행사", category: "행사" },
  { label: "갤러리", to: "/갤러리", category: "행사" },
  { label: "공지사항", to: "/교회소개", category: "소식" },
  { label: "새 가족 등록", to: "/register", category: "등록" },
  { label: "마이페이지", to: "/mypage", category: "내 정보" },
];

export const QUICK_SUGGESTIONS = [
  { label: "주일 예배", to: "/말씀/설교" },
  { label: "성경 타자", to: "/말씀/필사" },
  { label: "오시는 길", to: "/교회소개?tab=오시는 길" },
  { label: "구역모임", to: "/양육훈련/구역" },
  { label: "헌금 안내", to: "/주보?tab=예물" },
];

export function searchKeywords(query) {
  const q = query.trim();
  if (!q) return [];
  return ALL_KEYWORDS.filter(
    (k) =>
      k.label.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
      k.label.toLowerCase().includes(q.toLowerCase()),
  );
}
