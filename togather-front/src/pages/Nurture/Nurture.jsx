import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import ArrowLeft from "@/assets/icon-svg/arrow-narrow-left.svg";

const TABS = [
  "구역모임",
  "오늘의 묵상",
  "제자훈련",
  "양육프로그램",
  "양육/훈련 게시판",
  "성경읽기/쓰기",
];



const QT_URL = "https://www.qtland.com/quiet/quiet.php?cate=A";





const BOARD_PAGE_SIZE = 10;

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
  const [selectedZone, setSelectedZone] = useState("전체");
  const [selectedProgram, setSelectedProgram] = useState("전체");
  const [selectedPost, setSelectedPost] = useState(null);

  // 양육·훈련 게시판 — 공지 도메인의 boardType=NURTURE를 그대로 쓴다(공지/후기/나눔은
  // notice의 type 필드, 이 화면에서는 "분류"로 부른다).
  const { data: boardResponse = { data: [] } } = useFetch(
    () => getNotices(church.id, { boardType: "NURTURE", limit: 100 }),
    [church.id],
    { data: [] },
  );
  const BOARD_POSTS = (boardResponse.data ?? []).map((n) => ({
    id: n.id,
    category: n.type,
    title: n.title,
    author: n.author,
    date: n.date,
    body: n.body,
  }));

  const filteredBoardPosts = BOARD_POSTS.filter(
    (post) => !boardQuery || post.title.toLowerCase().includes(boardQuery.toLowerCase()),
  );
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
        className="border-b border-bluegrey-3 bg-white sticky z-40 transition-[top] duration-300 ease-in-out"
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
                <div key={zone.name} className="border border-bluegrey-3 rounded-2xl p-6 bg-white">
                  <h3 className="text-sub-tit-5 font-bold text-grey-11 mb-4">{zone.name}</h3>
                  <dl className="space-y-3 text-body-4">
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">구역장</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9 font-medium">{zone.leader}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">모임</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">{zone.time}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">장소</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">{zone.location}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">인원</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">총 {zone.members}명</dd>
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
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-bluegrey-3"
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
                  className="w-10 h-12 text-bluegrey-4"
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
              <div className="rounded-2xl border border-bluegrey-3 bg-white px-8 py-10 h-full flex flex-col gap-8">
                <div>
                  <h3 className="text-sub-tit-2 font-bold text-grey-11 mb-10">
                    {church.name} 제자훈련학교
                  </h3>
                  <dl className="flex flex-col gap-2">
                    {DISCIPLE_TRAINING_INFO.map(({ label, value }) => (
                      <div key={label} className="flex gap-3 text-body-3">
                        <dt className="text-grey-5 font-medium w-10 shrink-0">{label}</dt>
                        <div className="text-grey-4">|</div>
                        <dd className="text-grey-9 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <p className="text-body-4 text-primary leading-relaxed whitespace-pre-line rounded-xl">
                  {DISCIPLE_TRAINING_NOTE}
                </p>
              </div>

              {/* 단계별 과정 — 타임라인 */}
              <ol className="rounded-2xl border border-bluegrey-3 bg-white px-8 py-10">
                {DISCIPLE_TRAINING.map(({ name, schedule, location, desc }, idx) => (
                  <li key={name} className="group relative flex gap-4">
                    {/* rail: 점 + 세로선 */}
                    <div className="flex flex-col items-center w-3 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-bluegrey-4 mt-1.5 shrink-0 transition-all group-hover:bg-primary group-hover:shadow-[0_0_0_4px_rgba(59,82,128,0.15)]" />
                      {idx < DISCIPLE_TRAINING.length - 1 && (
                        <span className="flex-1 w-0.5 bg-bluegrey-3" />
                      )}
                    </div>
                    {/* 내용 */}
                    <div
                      className={`flex-1 -mt-0.5 ${idx < DISCIPLE_TRAINING.length - 1 ? "mb-8" : ""}`}
                    >
                      <h3 className="text-sub-tit-5 font-bold text-grey-11 mb-1 transition-colors group-hover:text-primary">
                        {name}
                      </h3>
                      <p className="text-body-4 text-grey-6 mb-2">{desc}</p>
                      <p className="text-body-5 text-grey-5">
                        {schedule} · {location}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
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
                <div key={prog.title} className="border border-bluegrey-3 rounded-2xl p-6 bg-white">
                  <h3 className="text-sub-tit-5 font-bold text-grey-11 mb-4">{prog.title}</h3>
                  <dl className="space-y-2 text-body-4">
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">난이도</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">{prog.level}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">기간</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">{prog.duration}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-grey-5 font-medium w-10 shrink-0">일정</dt>
                      <div className="text-grey-5">|</div>
                      <dd className="text-grey-9">{prog.schedule}</dd>
                    </div>
                  </dl>
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
              <div>
                {/* 목록으로 버튼 */}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex items-center gap-3 text-bluegrey-8 hover:text-primary transition-colors text-body-4 mb-4 group"
                >
                  <img src={ArrowLeft} alt="" className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                  목록으로
                </button>
                <div className="border-b border-bluegrey-3 mb-6" />

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
                    <p className="text-body-3 text-grey-9 whitespace-pre-wrap">
                      {selectedPost.body}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* 목록 보기 — 스마트 주보 목록 화면과 같은 느낌: 제목/필터 없이 검색 바로 아래 표 */
              <div>
                <div className="relative max-w-md mb-8">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full h-[46px] pl-10 pr-4 border border-bluegrey-3 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 outline-none transition-all"
                  />
                </div>

                {boardPosts.length === 0 ? (
                  <div className="border-t border-b border-grey-3 py-24 text-center text-grey-6 text-body-3">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  <>
                    <div className="border-t border-b border-grey-3 mb-8">
                      <div className="grid grid-cols-[100px_1fr_140px_120px] bg-grey-1 border-b border-grey-3 py-4 px-4 text-body-5 font-semibold text-grey-7">
                        <span className="text-center">분류</span>
                        <span className="text-left px-3">제목</span>
                        <span className="text-center">작성자</span>
                        <span className="text-center">날짜</span>
                      </div>
                      {boardPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="w-full grid grid-cols-[100px_1fr_140px_120px] items-center border-b border-grey-3 last:border-b-0 hover:bg-bluegrey-2 transition-colors px-4 py-4 text-left"
                        >
                          <div className="flex justify-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-body-5 font-semibold text-center w-fit ${CATEGORY_COLORS[post.category]}`}
                            >
                              {post.category}
                            </span>
                          </div>
                          <span className="text-body-3 text-grey-10 px-3 truncate text-left">{post.title}</span>
                          <span className="text-body-5 text-grey-6 text-center">{post.author}</span>
                          <span className="text-body-5 text-grey-5 text-center">{post.date}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-1">
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
                  </>
                )}
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
