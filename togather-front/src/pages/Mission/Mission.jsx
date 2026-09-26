import { useState } from "react";
import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";

const TABS = ["전도회 소개", "국내외 선교", "선교지 소식"];




export default function Mission() {
  const { church } = useChurch();
  const EVANGELISM_INFO = church.evangelism;
  const MISSION_CONTENT = church.missions;
  const MISSION_NEWS = church.missionNews ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "전도회 소개";
  const [selectedNews, setSelectedNews] = useState(null);

  return (
    <div>
      {/* News Modal Overlay */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] animate-fadeIn"
          onClick={() => setSelectedNews(null)}
        />
      )}

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-bluegrey-2 flex items-center justify-between p-6 rounded-t-2xl">
              <h3 className="text-sub-tit-3 font-bold text-grey-11">{selectedNews.title}</h3>
              <button
                onClick={() => setSelectedNews(null)}
                className="flex items-center justify-center w-8 h-8 text-grey-6 hover:text-grey-8 transition-colors"
                aria-label="닫기"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="relative h-64 bg-bluegrey-1 rounded-xl flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-bluegrey-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="absolute top-3 right-3 px-3 py-1 bg-blue-1 text-blue-7 text-body-4 font-semibold rounded-full">
                  {selectedNews.location}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-body-3 font-semibold text-grey-11">{selectedNews.missionary}</p>
                <span className="text-body-4 text-grey-5">{selectedNews.date}</span>
              </div>
              <p className="text-body-3 text-grey-7 leading-relaxed">{selectedNews.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">전도·선교</h1>
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
      <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-15 md:px-8 md:pt-15 md:pb-25">
        {/* 전도회 소개 */}
        {activeTab === "전도회 소개" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">전도회 소개</h2>
            <p className="text-body-2 text-grey-7 mb-8 whitespace-pre-line">
              {EVANGELISM_INFO.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-2xl">
              <div className="border border-bluegrey-2 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-body-5 text-grey-5 mb-0.5">회장</p>
                  <p className="text-body-3 font-semibold text-grey-11">
                    {EVANGELISM_INFO.leader.name}
                  </p>
                  <p className="text-body-5 text-grey-6">{EVANGELISM_INFO.leader.tel}</p>
                </div>
              </div>
              <div className="border border-bluegrey-2 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-7" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-body-5 text-grey-5 mb-0.5">정기 집결</p>
                  <p className="text-body-3 font-semibold text-grey-11">
                    {EVANGELISM_INFO.schedule}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-sub-tit-4 font-semibold text-grey-10 mb-4">주요 사역</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVANGELISM_INFO.activities.map(({ name, schedule, location }) => (
                <div
                  key={name}
                  className="border border-bluegrey-2 rounded-2xl p-6 flex items-start gap-6"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-body-2 font-semibold text-grey-11 mb-1">{name}</p>
                    <p className="text-body-4 text-grey-6">{schedule}</p>
                    <p className="text-body-4 text-grey-7 mt-0.5">{location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 국내외 선교 */}
        {activeTab === "국내외 선교" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {["국내", "해외"].map((type) => (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-primary rounded-sm" />
                    <h2 className="text-sub-tit-2 font-bold text-grey-11">
                      {MISSION_CONTENT[type].title}
                    </h2>
                  </div>

                  <p className="text-body-2 text-grey-7 mb-6">
                    {MISSION_CONTENT[type].description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {MISSION_CONTENT[type].items.map(({ name, schedule, location }) => (
                      <div
                        key={name}
                        className="border border-bluegrey-2 rounded-2xl p-6 flex items-start gap-6"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-1 flex items-center justify-center shrink-0">
                          <svg
                            className="w-5 h-5 text-blue-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-3 font-semibold text-grey-11 mb-1 line-clamp-2">{name}</p>
                          <p className="text-body-5 text-grey-6">{schedule}</p>
                          <p className="text-body-5 text-grey-7 mt-0.5">{location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 선교지 소식 */}
        {activeTab === "선교지 소식" && (
          <div>
            <h2 className="text-sub-tit-2 font-bold text-grey-11 mb-2">선교지 소식</h2>
            <p className="text-body-2 text-grey-7 mb-8">
              현지에서 전해오는 생생한 선교 소식을 전합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MISSION_NEWS.map((news) => (
                <div
                  key={news.id}
                  onClick={() => setSelectedNews(news)}
                  className="border border-bluegrey-2 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-56 bg-bluegrey-1 flex items-center justify-center">
                    <svg
                      className="w-14 h-14 text-bluegrey-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="p-5">
                    <p className="text-body-2 font-semibold text-grey-11 line-clamp-2">
                      {news.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
