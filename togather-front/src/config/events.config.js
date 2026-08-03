/**
 * Events Configuration
 * 실제 서비스에서는 API로 대체 예정
 */

export const EVENT_CATEGORIES = ["예배", "청년부", "선교회", "내 공동체"];

/**
 * 부서별 뱃지/텍스트 색상 매핑.
 * tokens.css에 green 계열 토큰이 없어 "선교회"만 하드코딩 hex 사용
 * (Notice.jsx의 TAG_STYLES와 동일한 관례).
 */
export const DEPARTMENT_STYLES = {
  예배: {
    chip: "bg-blue-1 text-blue-8",
    dot: "bg-blue-7",
    text: "text-blue-7",
  },
  청년부: {
    chip: "bg-[#e3f2fd] text-[#1a7bc0]",
    dot: "bg-blue-11",
    text: "text-[#1a7bc0]",
  },
  선교회: {
    chip: "bg-[#e0f5eb] text-[#00713c]",
    dot: "bg-[#008848]",
    text: "text-[#00713c]",
  },
  "내 공동체": {
    chip: "bg-point-1 text-point-8",
    dot: "bg-point-7",
    text: "text-point-8",
  },
};

export const DEFAULT_DEPARTMENT_STYLE = {
  chip: "bg-bluegrey-1 text-bluegrey-7",
  dot: "bg-bluegrey-5",
  text: "text-bluegrey-7",
};

export const getDepartmentStyle = (dept) => DEPARTMENT_STYLES[dept] ?? DEFAULT_DEPARTMENT_STYLE;

/** 검색 결과 정렬 옵션 */
export const EVENT_SORT_OPTIONS = [
  { value: "date", label: "일정 빠른순" },
  { value: "createdAt", label: "등록일 순" },
];
