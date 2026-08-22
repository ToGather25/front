/** @type {{id:string,title:string,scripture:string,preacher:string,worshipType:string,youtubeVideoId:string|null,sermonDate:string}[]} */
export const DUMMY_ADMIN_SERMONS = [
  { id: "s1", sermonDate: "2026-05-25", worshipType: "주일 1부", title: "부활의 능력", preacher: "김영수 담임목사", scripture: "롬 8:11", youtubeVideoId: null },
  { id: "s2", sermonDate: "2026-05-25", worshipType: "주일 2부", title: "성령으로 충만하라", preacher: "박성민 부목사", scripture: "엡 5:18", youtubeVideoId: null },
  { id: "s3", sermonDate: "2026-05-18", worshipType: "주일 1부", title: "참된 예배", preacher: "김영수 담임목사", scripture: "요 4:23-24", youtubeVideoId: null },
  { id: "s4", sermonDate: "2026-05-14", worshipType: "수요 예배", title: "기도의 능력", preacher: "이은혜 전도사", scripture: "약 5:16", youtubeVideoId: null },
  { id: "s5", sermonDate: "2026-05-11", worshipType: "주일 1부", title: "새 힘을 얻으리니", preacher: "김영수 담임목사", scripture: "사 40:31", youtubeVideoId: null },
  { id: "s6", sermonDate: "2026-05-07", worshipType: "수요 예배", title: "하나님의 뜻", preacher: "박성민 부목사", scripture: "롬 12:2", youtubeVideoId: null },
];

/**
 * @typedef {{ state:string, youtubeLiveUrl:string|null, sermon:object|null,
 *   bulletinAvailable:boolean, recentSermons:object[] }} LiveScreenResponse
 */

/** @type {LiveScreenResponse} */
export const DUMMY_LIVE_SCREEN = {
  state: "NONE",
  youtubeLiveUrl: null,
  sermon: null,
  bulletinAvailable: false,
  recentSermons: DUMMY_ADMIN_SERMONS.slice(0, 6),
};
