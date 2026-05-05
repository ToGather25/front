import { useState } from "react";
import { Link } from "react-router";

const TABS = ["구역모임", "오늘의 묵상", "제자훈련", "양육프로그램", "양육/훈련 게시판", "성경읽기/쓰기"];

const ZONES = [
  { name: "1구역", leader: "홍길동 구역장", members: 8, time: "매주 목요일 오후 7:30", location: "구역장 댁" },
  { name: "2구역", leader: "김성실 구역장", members: 7, time: "매주 금요일 오후 7:30", location: "구역장 댁" },
  { name: "3구역", leader: "이믿음 구역장", members: 9, time: "매주 목요일 오후 8:00", location: "구역장 댁" },
  { name: "4구역", leader: "박소망 구역장", members: 6, time: "매주 화요일 오후 7:30", location: "구역장 댁" },
];

const QT_URL = "https://www.qtland.com/quiet/quiet.php?cate=A";

const DISCIPLE_TRAINING = [
  {
    name: "제자훈련 1단계",
    schedule: "매주 수요일 오후 7:30 (20주)",
    location: "교육관 302호",
    desc: "신앙의 기초를 세우는 제자훈련 입문 과정입니다.",
  },
  {
    name: "제자훈련 2단계",
    schedule: "매주 목요일 오후 7:30 (20주)",
    location: "교육관 302호",
    desc: "1단계 수료 후 진행하는 심화 과정입니다.",
  },
  {
    name: "사역훈련",
    schedule: "1, 2단계 수료 후 진행",
    location: "교육관 303호",
    desc: "실제 사역 현장에서 봉사하며 훈련받는 과정입니다.",
  },
];

const NURTURE_PROGRAMS = [
  {
    title: "새가족반",
    level: "기초",
    duration: "4주",
    schedule: "매월 첫째 주 토요일",
    desc: "교회에 처음 오신 분들을 위한 신앙 입문 과정입니다.",
  },
  {
    title: "성장반",
    level: "초급",
    duration: "8주",
    schedule: "매주 화요일 오후 7:00",
    desc: "기독교 신앙의 핵심 교리를 쉽게 배우는 과정입니다.",
  },
  {
    title: "성경탐구반",
    level: "중급",
    duration: "12주",
    schedule: "매주 수요일 오후 7:30",
    desc: "구약부터 신약까지 성경 전체를 체계적으로 탐구합니다.",
  },
  {
    title: "리더십훈련반",
    level: "심화",
    duration: "20주",
    schedule: "매주 목요일 오후 7:30",
    desc: "소그룹 리더 및 교회 봉사자 훈련을 위한 심화 과정입니다.",
  },
];

const BOARD_POSTS = [
  { id: 1, category: "공지", title: "2026년 상반기 제자훈련 모집 안내", author: "교육부", date: "2026.04.28" },
  { id: 2, category: "후기", title: "제자훈련 1단계 수료 소감 나눔", author: "이수련 집사", date: "2026.04.20" },
  { id: 3, category: "공지", title: "5월 구역모임 일정 변경 안내", author: "교육부", date: "2026.04.18" },
  { id: 4, category: "나눔", title: "양육프로그램 참여 후기 공유합니다", author: "박믿음 성도", date: "2026.04.10" },
  { id: 5, category: "공지", title: "오늘의 묵상 4월 말씀 자료 배포", author: "교육부", date: "2026.04.01" },
  { id: 6, category: "나눔", title: "성경통독 40일 완주 도전기", author: "김소망 성도", date: "2026.03.25" },
];

const LEVEL_COLORS = {
  기초: "bg-point-1 text-point-7",
  초급: "bg-blue-1 text-blue-7",
  중급: "bg-blue-2 text-blue-8",
  심화: "bg-primary text-white",
};

const CATEGORY_COLORS = {
  공지: "bg-blue-1 text-blue-7",
  후기: "bg-point-1 text-point-7",
  나눔: "bg-grey-2 text-grey-8",
};

export default function Nurture() {
  const [activeTab, setActiveTab] = useState("구역모임");

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">양육·훈련</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-bluegrey-2 bg-white sticky top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === tab
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1576px] mx-auto px-8 py-10">

        {/* 구역모임 */}
        {activeTab === "구역모임" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">구역모임</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              지역별로 모여 말씀을 나누고 서로를 섬기는 구역 공동체입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
              {ZONES.map((zone) => (
                <div key={zone.name} className="border border-bluegrey-2 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sub-tit-4 font-bold text-grey-11">{zone.name}</h3>
                    <span className="px-2.5 py-1 bg-blue-1 text-blue-7 text-body-5 font-semibold rounded-full">
                      {zone.members}명
                    </span>
                  </div>
                  <dl className="flex flex-col gap-2 text-body-4">
                    <div className="flex gap-2">
                      <dt className="text-grey-5 w-16 shrink-0">구역장</dt>
                      <dd className="text-grey-9 font-medium">{zone.leader}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-grey-5 w-16 shrink-0">모임</dt>
                      <dd className="text-grey-9">{zone.time}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-grey-5 w-16 shrink-0">장소</dt>
                      <dd className="text-grey-9">{zone.location}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오늘의 묵상 */}
        {activeTab === "오늘의 묵상" && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sub-tit-2 font-bold text-grey-11">오늘의 묵상</h2>
              <a
                href={QT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-4 text-blue-6 hover:underline"
              >
                새 탭에서 열기 ↗
              </a>
            </div>
            <div className="relative w-full rounded-2xl overflow-hidden border border-bluegrey-2" style={{ height: "calc(100vh - 260px)", minHeight: "600px" }}>
              <iframe
                src={QT_URL}
                title="오늘의 묵상 - QT Land"
                className="w-full h-full"
                loading="lazy"
              />
              {/* 사이트가 iframe 임베딩을 차단한 경우 표시되는 fallback */}
              <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-4 bg-bluegrey-1 text-grey-7">
                <svg className="w-12 h-12 text-bluegrey-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-body-3">페이지를 불러올 수 없습니다.</p>
                <a
                  href={QT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-primary text-white text-body-3 font-semibold hover:bg-blue-8 transition-colors"
                >
                  QT Land에서 보기
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 제자훈련 */}
        {activeTab === "제자훈련" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">제자훈련</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              그리스도의 제자로 세워지기 위한 체계적인 훈련 과정입니다.
            </p>
            <div className="grid grid-cols-1 gap-4 max-w-2xl">
              {DISCIPLE_TRAINING.map(({ name, schedule, location, desc }) => (
                <div key={name} className="border border-bluegrey-2 rounded-2xl p-6">
                  <h3 className="text-sub-tit-5 font-bold text-grey-11 mb-1">{name}</h3>
                  <p className="text-body-4 text-grey-6 mb-3">{desc}</p>
                  <div className="flex flex-col gap-1 text-body-4">
                    <div className="flex gap-2">
                      <span className="text-grey-5 w-12 shrink-0">일정</span>
                      <span className="text-grey-9">{schedule}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-grey-5 w-12 shrink-0">장소</span>
                      <span className="text-grey-9">{location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 양육프로그램 */}
        {activeTab === "양육프로그램" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">양육프로그램</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              단계별 신앙 성장을 위한 양육 프로그램을 운영합니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {NURTURE_PROGRAMS.map((prog) => (
                <div key={prog.title} className="border border-bluegrey-2 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-body-5 font-semibold ${LEVEL_COLORS[prog.level]}`}>
                      {prog.level}
                    </span>
                    <span className="text-body-5 text-grey-5">{prog.duration}</span>
                  </div>
                  <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-2">{prog.title}</h3>
                  <p className="text-body-4 text-grey-7 mb-4">{prog.desc}</p>
                  <div className="flex gap-2 text-body-4">
                    <span className="text-grey-5 w-12 shrink-0">일정</span>
                    <span className="text-grey-9">{prog.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 양육/훈련 게시판 */}
        {activeTab === "양육/훈련 게시판" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">양육/훈련 게시판</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              양육과 훈련에 관한 공지 및 나눔 게시판입니다.
            </p>
            <div className="border border-bluegrey-2 rounded-2xl overflow-hidden max-w-4xl">
              {/* 헤더 */}
              <div className="grid grid-cols-[80px_1fr_120px_100px] bg-bluegrey-1 px-6 py-3 text-body-5 font-semibold text-grey-7 border-b border-bluegrey-2">
                <span>분류</span>
                <span>제목</span>
                <span className="text-center">작성자</span>
                <span className="text-center">날짜</span>
              </div>
              {BOARD_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="grid grid-cols-[80px_1fr_120px_100px] px-6 py-4 border-b border-bluegrey-2 last:border-0 hover:bg-bluegrey-1 transition-colors cursor-pointer items-center"
                >
                  <span className={`px-2 py-0.5 rounded-full text-body-5 font-semibold text-center w-fit ${CATEGORY_COLORS[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="text-body-3 text-grey-10 px-3 truncate">{post.title}</span>
                  <span className="text-body-5 text-grey-6 text-center">{post.author}</span>
                  <span className="text-body-5 text-grey-5 text-center">{post.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 성경읽기/쓰기 */}
        {activeTab === "성경읽기/쓰기" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">성경읽기/쓰기</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              매일 말씀을 읽고 필사하며 하나님과 더 깊이 만나세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <Link
                to="/말씀/읽기"
                className="group border border-bluegrey-2 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-1 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <svg className="w-8 h-8 text-blue-7 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-1">성경 읽기</h3>
                  <p className="text-body-4 text-grey-6">말씀을 읽고 구절을 체크하며 성경을 통독합니다</p>
                </div>
              </Link>
              <Link
                to="/말씀/필사"
                className="group border border-bluegrey-2 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-1 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <svg className="w-8 h-8 text-blue-7 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-1">성경 필사</h3>
                  <p className="text-body-4 text-grey-6">말씀을 한 글자씩 따라 쓰며 마음에 새깁니다</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
