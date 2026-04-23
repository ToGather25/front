/** @type {import('@/services/galleryService').Community[]} */
export const DUMMY_COMMUNITIES = [
  { id: 1, name: "알곡교회", desc: "교회 전체 사진을 볼 수 있습니다" },
  { id: 2, name: "청년부",   desc: "젊은 에너지로 하나님을 찾는" },
  { id: 3, name: "투게더",   desc: "ToFather 하나님 아버지께로" },
  { id: 4, name: "유치부",   desc: "어린아이의 순수함으로" },
  { id: 5, name: "초등부",   desc: "하나님의 말씀을 배우는 초등부" },
  { id: 6, name: "중고등부", desc: "믿음으로 자라나는 다음 세대" },
];

/** @type {import('@/services/galleryService').Photo[]} */
export const DUMMY_PHOTOS = [
  {
    id: 1,
    communityId: 2,
    title: "청년부 하계 수련회",
    date: "2025년 8월 2일",
    desc: "하나님의 은혜 안에서 성공적으로 수련회를 마쳤습니다.\n정말로 감사한 시간이었습니다.",
    imageUrl: null,
  },
  {
    id: 2,
    communityId: 1,
    title: "봄 야외 예배",
    date: "2025년 4월 15일",
    desc: "아름다운 봄날에 드린 야외 예배입니다.",
    imageUrl: null,
  },
  {
    id: 3,
    communityId: 1,
    title: "성탄 축하 예배",
    date: "2024년 12월 25일",
    desc: "주님 탄생을 기념하는 예배입니다.",
    imageUrl: null,
  },
  {
    id: 4,
    communityId: 3,
    title: "투게더 수련회",
    date: "2025년 7월 20일",
    desc: "공동체 함께 하는 수련회.",
    imageUrl: null,
  },
  {
    id: 5,
    communityId: 4,
    title: "유치부 성탄 발표회",
    date: "2024년 12월 22일",
    desc: "사랑스러운 유치부 어린이들의 성탄 발표회.",
    imageUrl: null,
  },
];
