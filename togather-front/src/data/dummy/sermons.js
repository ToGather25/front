/** @type {import('@/services/sermonService').LiveSermon|null} */
export const DUMMY_LIVE_SERMON = null;

/** @type {import('@/services/sermonService').PastSermon[]} */
export const DUMMY_PAST_SERMONS = [
  {
    id: "1",
    videoId: null,
    title: "하나님의 선하심을 신뢰하라 - 주일예배",
    date: "2026.04.27",
    thumbnail: null,
  },
  {
    id: "2",
    videoId: null,
    title: "함께함의 능력 - 새벽기도회",
    date: "2026.04.20",
    thumbnail: null,
  },
  {
    id: "3",
    videoId: null,
    title: "고난 너머의 영광 - 수요기도회",
    date: "2026.04.13",
    thumbnail: null,
  },
  {
    id: "4",
    videoId: null,
    title: "은혜로 충분하다 - 금요기도회",
    date: "2026.04.06",
    thumbnail: null,
  },
  {
    id: "5",
    videoId: null,
    title: "믿음으로 나아가라 - 주일예배",
    date: "2026.03.30",
    thumbnail: null,
  },
  { id: "6", videoId: null, title: "십자가의 도 - 주일예배", date: "2026.03.23", thumbnail: null },
];

/** @type {{id:string,title:string,scripture:string,preacher:string,worshipType:string,youtubeVideoId:string|null,sermonDate:string}[]} */
export const DUMMY_ADMIN_SERMONS = [
  { id: "s1", sermonDate: "2026-05-25", worshipType: "주일 1부", title: "부활의 능력", preacher: "김영수 담임목사", scripture: "롬 8:11", youtubeVideoId: null },
  { id: "s2", sermonDate: "2026-05-25", worshipType: "주일 2부", title: "성령으로 충만하라", preacher: "박성민 부목사", scripture: "엡 5:18", youtubeVideoId: null },
  { id: "s3", sermonDate: "2026-05-18", worshipType: "주일 1부", title: "참된 예배", preacher: "김영수 담임목사", scripture: "요 4:23-24", youtubeVideoId: null },
  { id: "s4", sermonDate: "2026-05-14", worshipType: "수요 예배", title: "기도의 능력", preacher: "이은혜 전도사", scripture: "약 5:16", youtubeVideoId: null },
  { id: "s5", sermonDate: "2026-05-11", worshipType: "주일 1부", title: "새 힘을 얻으리니", preacher: "김영수 담임목사", scripture: "사 40:31", youtubeVideoId: null },
  { id: "s6", sermonDate: "2026-05-07", worshipType: "수요 예배", title: "하나님의 뜻", preacher: "박성민 부목사", scripture: "롬 12:2", youtubeVideoId: null },
];
