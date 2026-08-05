/** @type {import('@/services/galleryService').Community[]} */
export const DUMMY_COMMUNITIES = [
  { id: 1, name: "알곡교회", desc: "교회 전체 사진을 볼 수 있습니다" },
  { id: 2, name: "청년부",   desc: "젊은 에너지로 하나님을 찾는" },
  { id: 3, name: "유치부",   desc: "어린아이의 순수함으로" },
  { id: 4, name: "초등부",   desc: "하나님의 말씀을 배우는 초등부" },
  { id: 5, name: "중·고등부", desc: "믿음으로 자라나는 다음 세대" },
  { id: 6, name: "새가족부", desc: "처음 만나는 반가운 얼굴들" },
  { id: 7, name: "전도회",   desc: "복음을 이웃에게 전하는 발걸음" },
  { id: 8, name: "남선교회", desc: "섬김으로 하나 되는 남성 성도들" },
  { id: 9, name: "여전도회", desc: "기도와 섬김으로 세워가는" },
  { id: 10, name: "권사회",  desc: "기도로 교회를 든든히 세우는" },
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
    title: "유치부 성탄 발표회",
    date: "2024년 12월 22일",
    desc: "사랑스러운 유치부 어린이들의 성탄 발표회.",
    imageUrl: null,
  },
];
