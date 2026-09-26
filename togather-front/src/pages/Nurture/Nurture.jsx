import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import IcoThumb from "@/assets/icon-svg/none-thumb.png";

const TABS = [
  "구역모임",
  "오늘의 묵상",
  "제자훈련",
  "양육프로그램",
  "양육/훈련 게시판",
  "성경읽기/쓰기",
];

const BOARD_CATEGORIES = ["전체", "공지", "후기", "나눔"];


const QT_URL = "https://www.qtland.com/quiet/quiet.php?cate=A";





const BOARD_POSTS = [
  {
    id: 1,
    category: "공지",
    title: "2026년 상반기 제자훈련 모집 안내",
    author: "교육부",
    date: "2026.04.28",
    body: "2026년 상반기 제자훈련학교를 개설합니다.\n\n제자훈련은 그리스도의 제자로 세워지기 위한 영적 성장의 과정입니다.\n\n관심 있는 성도분들의 많은 참여를 부탁드립니다.\n\n자세한 사항은 교육부로 문의하시기 바랍니다.",
  },
  {
    id: 2,
    category: "후기",
    title: "제자훈련 1단계 수료 소감 나눔",
    author: "이수련 집사",
    date: "2026.04.20",
    body: "3개월간의 제자훈련 1단계를 마무리했습니다.\n\n처음에는 시간을 내기가 어려울까 걱정했지만, 말씀과 기도로 하나되는 시간이 정말 귀했습니다.\n\n무엇보다 함께 믿음의 길을 걷는 교우들과의 깊은 교제가 있어서 영적으로 많이 성장할 수 있었습니다.\n\n2단계도 열심히 참여하겠습니다.",
  },
  {
    id: 3,
    category: "공지",
    title: "5월 구역모임 일정 변경 안내",
    author: "교육부",
    date: "2026.04.18",
    body: "5월 1주 목요일은 어린이날 연휴로 인해 구역모임을 다음 주로 변경합니다.\n\n변경된 일정은 다음과 같습니다:\n- 목요일 구역: 5월 15일 (목)\n- 금요일 구역: 5월 9일 (금)\n\n유의 부탁드립니다.",
  },
  {
    id: 4,
    category: "나눔",
    title: "양육프로그램 참여 후기 공유합니다",
    author: "박믿음 성도",
    date: "2026.04.10",
    body: "신앙의 기초부터 체계적으로 배울 수 있는 좋은 프로그램이었습니다.\n\n매주 만나는 선생님과 교우들의 따뜻한 관심과 격려 속에서 신앙이 자라는 것을 느낄 수 있었습니다.\n\n다음 단계도 계속 참여하고 싶습니다.",
  },
  {
    id: 5,
    category: "공지",
    title: "오늘의 묵상 4월 말씀 자료 배포",
    author: "교육부",
    date: "2026.04.01",
    body: "4월 한 달간 사용할 오늘의 묵상 말씀 자료를 배포합니다.\n\n매일 정해진 성경 본문을 읽고 묵상하며 기도하는 시간이 영적 깊이를 더해줄 것입니다.\n\n교육부에서 받으실 수 있습니다.",
  },
  {
    id: 6,
    category: "나눔",
    title: "성경통독 40일 완주 도전기",
    author: "김소망 성도",
    date: "2026.03.25",
    body: "성경통독 40일 도전을 마쳤습니다!\n\n처음부터 끝까지 하나님의 말씀을 읽으며 느낀 감동과 도전이 일생의 자산이 될 것 같습니다.\n\n작은 실천의 시간이 모여 큰 영적 자산이 된다는 것을 깨달았습니다.\n\n내년에도 함께 도전해요!",
  },
];

const BOARD_PAGE_SIZE = 10;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "성경읽기/쓰기";
  const { church } = useChurch();
  const ZONES = church.districtMeetings ?? [];
  const NURTURE_PROGRAMS = church.nurturePrograms ?? [];
  const DISCIPLE_TRAINING = church.discipleTraining?.courses ?? [];
  const DISCIPLE_TRAINING_INFO = church.discipleTraining?.info ?? [];
  const DISCIPLE_TRAINING_NOTE = church.discipleTraining?.note ?? "";
  const { currentUser } = useAuth();
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [boardPage, setBoardPage] = useState(1);
  const [boardQuery, setBoardQuery] = useState("");
  const [boardCategory, setBoardCategory] = useState("전체");
  const [selectedZone, setSelectedZone] = useState("전체");
  const [selectedProgram, setSelectedProgram] = useState("전체");
  const [selectedPost, setSelectedPost] = useState(null);

  const filteredBoardPosts = BOARD_POSTS.filter((post) => {
    const matchesCategory = boardCategory === "전체" || post.category === boardCategory;
    const matchesQuery = !boardQuery || post.title.toLowerCase().includes(boardQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const boardTotalPages = Math.max(1, Math.ceil(filteredBoardPosts.length / BOARD_PAGE_SIZE));
  const boardPosts = filteredBoardPosts.slice(
    (boardPage - 1) * BOARD_PAGE_SIZE,
    boardPage * BOARD_PAGE_SIZE,
  );

  function handleBibleCardClick(e) {
    if (!currentUser) {
      e.preventDefault();
      setShowLoginRequired(true);
    }
  }


  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">양육·훈련</h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="border-b border-bluegrey-2 bg-white sticky z-40 transition-[top] duration-300 ease-in-out"
        style={{ top: "var(--header-offset)" }}
      >
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
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
      <div className="max-w-[1400px] mx-auto px-4 pt-5 pb-15 md:px-8 md:pt-10 md:pb-25">
        {/* 구역모임 */}
        {activeTab === "구역모임" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">구역모임</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              지역별로 모여 말씀을 나누고 서로를 섬기는 구역 공동체입니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {ZONES.map((zone) => (
                <div key={zone.name} className="flex flex-col">
                  <div
                    className="rounded-2xl overflow-hidden text-white flex items-center justify-center h-[190px] bg-primary"
                  >
                    <img src={IcoThumb} alt="" className="w-16 h-16 opacity-50" />
                  </div>
                  <div className="mt-5 text-left px-1">
                    <h3 className="text-sub-tit-5 font-bold text-grey-11 mb-4">{zone.name}</h3>
                    <dl className="space-y-3 text-body-4">
                      <div className="flex gap-3">
                        <dt className="text-grey-5 font-medium w-12 shrink-0">구역장</dt>
                        <div className="text-grey-5">|</div>
                        <dd className="text-grey-9 font-medium">{zone.leader}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="text-grey-5 font-medium w-12 shrink-0">모임</dt>
                        <div className="text-grey-5">|</div>
                        <dd className="text-grey-9">{zone.time}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="text-grey-5 font-medium w-12 shrink-0">장소</dt>
                        <div className="text-grey-5">|</div>
                        <dd className="text-grey-9">{zone.location}</dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="text-grey-5 font-medium w-12 shrink-0">인원</dt>
                        <div className="text-grey-5">|</div>
                        <dd className="text-grey-9">총 {zone.members}명</dd>
                      </div>
                    </dl>
                  </div>
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
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-bluegrey-2"
              style={{ height: "calc(100vh - 260px)", minHeight: "600px" }}
            >
              <iframe
                src={QT_URL}
                title="오늘의 묵상 - QT Land"
                className="w-full h-full"
                loading="lazy"
              />
              {/* 사이트가 iframe 임베딩을 차단한 경우 표시되는 fallback */}
              <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-4 bg-bluegrey-1 text-grey-7">
                <svg
                  className="w-12 h-12 text-bluegrey-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* 안내 배너 */}
              <div className="relative rounded-2xl overflow-hidden bg-blue-8 px-8 py-10 h-full flex flex-col justify-center gap-8">
                <div>
                  <h3 className="text-sub-tit-2 font-bold text-white mb-6">
                    {church.name} 제자훈련학교
                  </h3>
                  <dl className="flex flex-col gap-2.5">
                    {DISCIPLE_TRAINING_INFO.map(({ label, value }) => (
                      <div key={label} className="flex gap-3 text-body-3">
                        <dt className="text-blue-2 font-semibold w-12 shrink-0">· {label}</dt>
                        <dd className="text-white">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <p className="text-body-4 text-blue-1 leading-relaxed whitespace-pre-line border-t border-white/15 pt-6">
                  {DISCIPLE_TRAINING_NOTE}
                </p>
              </div>

              {/* 단계별 과정 */}
              <div className="grid grid-cols-1 gap-4">
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
          </div>
        )}

        {/* 양육프로그램 */}
        {activeTab === "양육프로그램" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">양육프로그램</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              단계별 신앙 성장을 위한 양육 프로그램을 운영합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {NURTURE_PROGRAMS.map((prog) => (
                <div key={prog.title} className="flex flex-col">
                  <div
                    className={`rounded-2xl overflow-hidden text-white flex items-center justify-center h-[190px] ${LEVEL_COLORS[prog.level]}`}
                  >
                    <img src={IcoThumb} alt="" className="w-16 h-16 opacity-70" />
                  </div>
                  <div className="mt-5 text-left px-1">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sub-tit-5 font-bold text-grey-11">{prog.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-body-5 font-semibold ${LEVEL_COLORS[prog.level]}`}>
                          {prog.level}
                        </span>
                        <span className="inline-block px-2.5 py-1 bg-grey-2 text-grey-7 rounded-full text-body-5 font-semibold">
                          {prog.duration}
                        </span>
                      </div>
                    </div>
                    <dl className="space-y-2 text-body-4">
                      <div className="flex gap-3">
                        <dt className="text-grey-5 font-medium w-10 shrink-0">일정</dt>
                        <div className="text-grey-5">|</div>
                        <dd className="text-grey-9">{prog.schedule}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 양육/훈련 게시판 */}
        {activeTab === "양육/훈련 게시판" && (
          <div>
            {selectedPost ? (
              /* 상세 보기 */
              <div className="border border-grey-3 rounded-2xl overflow-hidden">
                {/* 상세 헤더 */}
                <div className="border-b border-grey-3 px-8 py-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-body-5 font-bold px-2.5 py-1 rounded-md ${CATEGORY_COLORS[selectedPost.category]}`}
                    >
                      {selectedPost.category}
                    </span>
                  </div>
                  <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-3">{selectedPost.title}</h2>
                  <div className="flex items-center gap-4 text-body-5 text-grey-6">
                    <span>{selectedPost.author}</span>
                    <span>·</span>
                    <span>{selectedPost.date}</span>
                  </div>
                </div>
                {/* 본문 */}
                <div className="px-8 py-8 min-h-[150px]">
                  <p className="text-body-3 text-grey-9 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.body}
                  </p>
                </div>
                {/* 하단 */}
                <div className="border-t border-grey-3 px-8 py-4 flex justify-end">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="border border-grey-4 text-grey-7 rounded-full px-6 py-2 text-body-4 hover:bg-grey-1 transition-colors"
                  >
                    목록으로
                  </button>
                </div>
              </div>
            ) : (
              /* 목록 보기 */
              <div>
                <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">양육/훈련 게시판</h2>
                <p className="text-body-2 text-grey-7 mb-8">
                  양육과 훈련에 관한 공지 및 나눔 게시판입니다.
                </p>

                {/* 메인 레이아웃 - (검색+필터) 왼쪽 | 콘텐츠 오른쪽 */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  {/* 왼쪽: 검색 + 필터 */}
                  <div className="w-full md:w-[300px] flex flex-col gap-6">
                    {/* 검색 */}
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-5 brightness-75 group-focus-within:brightness-50 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={boardQuery}
                        onChange={(e) => {
                          setBoardQuery(e.target.value);
                          setBoardPage(1);
                        }}
                        placeholder="게시글 검색"
                        className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-primary outline-none transition-all group"
                      />
                    </div>

                    {/* 모바일 필터 */}
                    <div className="flex flex-wrap gap-2 md:hidden">
                      {BOARD_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setBoardCategory(cat);
                            setBoardPage(1);
                          }}
                          className={`px-5 py-2 rounded-full text-body-3 font-semibold transition-all ${
                            boardCategory === cat
                              ? "bg-primary text-white"
                              : "border border-bluegrey-2 text-grey-8 hover:border-blue-5 hover:text-primary"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* 데스크톱 필터 */}
                    <div className="hidden md:flex md:flex-col gap-1 bg-white border border-bluegrey-2 rounded-[20px] p-5">
                      {BOARD_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setBoardCategory(cat);
                            setBoardPage(1);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-body-3 font-semibold text-left transition-colors ${
                            boardCategory === cat
                              ? "bg-primary text-white"
                              : "text-grey-9 hover:bg-blue-1 hover:text-primary"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 오른쪽: 콘텐츠 */}
                  <div className="flex-1 w-full md:w-auto min-w-0">
                    <div className="border border-bluegrey-2 rounded-2xl overflow-hidden flex flex-col min-h-[550px]">
                      {/* 헤더 */}
                      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_120px_100px] bg-bluegrey-1 px-6 py-3 text-body-5 font-semibold text-grey-7 border-b border-bluegrey-2">
                        <span className="text-center">분류</span>
                        <span className="text-center">제목</span>
                        <span className="hidden md:block text-center">작성자</span>
                        <span className="hidden md:block text-center">날짜</span>
                      </div>

                      {boardPosts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-grey-6 text-body-3">
                          검색 결과가 없습니다.
                        </div>
                      ) : (
                        <div className="flex flex-col min-h-[470px]">
                          {boardPosts.map((post) => (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className="w-full grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_120px_100px] px-6 py-4 border-b border-bluegrey-2 hover:bg-bluegrey-1 transition-colors text-left items-center"
                            >
                              <div className="flex items-center justify-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-body-5 font-semibold text-center w-fit ${CATEGORY_COLORS[post.category]}`}
                                >
                                  {post.category}
                                </span>
                              </div>
                              <span className="text-body-3 text-grey-10 px-3 truncate text-center">{post.title}</span>
                              <span className="hidden md:block text-body-5 text-grey-6 text-center">
                                {post.author}
                              </span>
                              <span className="hidden md:block text-body-5 text-grey-5 text-center">
                                {post.date}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-6">
                      <PageBtn
                        onClick={() => setBoardPage((p) => Math.max(1, p - 1))}
                        disabled={boardPage === 1}
                        label="‹"
                      />
                      {Array.from({ length: boardTotalPages }, (_, i) => i + 1).map((p) => (
                        <PageBtn
                          key={p}
                          onClick={() => setBoardPage(p)}
                          active={p === boardPage}
                          label={String(p)}
                        />
                      ))}
                      <PageBtn
                        onClick={() => setBoardPage((p) => Math.min(boardTotalPages, p + 1))}
                        disabled={boardPage === boardTotalPages}
                        label="›"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 성경읽기/쓰기 */}
        {activeTab === "성경읽기/쓰기" && (
          <div className="flex flex-col items-center py-10">
            <h2 className="text-sub-tit-1 font-bold text-grey-12 mb-16 text-center">
              오늘 하실 신앙 생활은 무엇인가요?
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <Link
                to="/말씀/필사"
                onClick={handleBibleCardClick}
                className="w-72 max-w-[90vw] h-80 bg-blue-8 rounded-2xl flex flex-col items-center justify-center gap-6 text-white hover:bg-blue-9 transition-colors"
              >
                <span className="text-sub-tit-3 font-semibold">성경 쓰기</span>
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </Link>
              <Link
                to="/말씀/읽기"
                onClick={handleBibleCardClick}
                className="w-72 max-w-[90vw] h-80 bg-white border-2 border-blue-3 rounded-2xl flex flex-col items-center justify-center gap-6 text-grey-11 hover:bg-blue-1 transition-colors"
              >
                <span className="text-sub-tit-3 font-semibold">성경 읽기</span>
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      {showLoginRequired && (
        <LoginRequiredModal
          message="성경 읽기·쓰기를 이용하려면 로그인해 주세요."
          onCancel={() => setShowLoginRequired(false)}
        />
      )}
    </div>
  );
}

function PageBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg text-body-3 font-medium transition-colors ${
        active
          ? "bg-blue-7 text-white"
          : disabled
            ? "text-grey-4 cursor-not-allowed"
            : "text-grey-8 hover:bg-blue-1 hover:text-blue-7"
      }`}
    >
      {label}
    </button>
  );
}
