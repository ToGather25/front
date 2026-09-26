import { useState } from "react";
import { useNavigate } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import { getJuboIssues } from "@/services/juboService";
import BtnArrowDefault from "@/assets/icon-svg/btn-arrow.svg";
import BtnArrowHover from "@/assets/icon-svg/btn-arrow-1.svg";

export default function NotificationSection() {
  const navigate = useNavigate();
  const { church } = useChurch();
  const [hoveredNoticeBtn, setHoveredNoticeBtn] = useState(false);
  const [hoveredJuboBtn, setHoveredJuboBtn] = useState(false);

  // 공지사항 조회 (최근 3개)
  const { data: responseData = { data: [] } } = useFetch(
    () => getNotices(church.id, { page: 1, limit: 3 }),
    [church.id],
    { data: [] }
  );
  const notices = responseData.data;

  // 주보 조회 (최근 3개)
  const { data: allJubos = [] } = useFetch(
    () => getJuboIssues(church.id),
    [church.id],
    []
  );
  const jubo = allJubos.slice(0, 3).map((issue) => ({
    id: issue.id,
    title: issue.dateLabel ? `${issue.dateLabel} 주보` : `${issue.issueNo} 호`,
    date: issue.date?.replace(/-/g, ".") || "",
  }));

  return (
    <div className="pb-[140px] px-[200px] flex justify-center w-full">
      <div className="w-[1520px]">
        {/* 타이틀 */}
        <div className="text-center mb-14">
          <p className="text-pale text-headline-5 font-semibold mb-4">Notice</p>
          <h2 className="text-grey-12 text-section-title font-bold">주요 알림</h2>
        </div>

        {/* 공지 + 주보 */}
        <div className="grid grid-cols-2 gap-10">
          {/* 공지 알림 */}
          <div className="bg-bluegrey-1 rounded-2xl p-12 flex flex-col min-h-[330px] shadow-xl">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-grey-12 text-headline-4 font-bold">공지사항</h3>
              <button
                onClick={() => navigate("/공지사항")}
                onMouseEnter={() => setHoveredNoticeBtn(true)}
                onMouseLeave={() => setHoveredNoticeBtn(false)}
                className="w-8 h-8 flex items-center justify-center transition-colors"
              >
                <img
                  src={hoveredNoticeBtn ? BtnArrowHover : BtnArrowDefault}
                  alt="이동"
                  className="w-8 h-8"
                />
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-grey-6 text-body-2">등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {[...notices].sort((a, b) => {
                  if (a.featured && !b.featured) return -1;
                  if (!a.featured && b.featured) return 1;
                  return 0;
                }).map((notice, i) => (
                  <div key={notice.id}>
                    <button
                      onClick={() => navigate(`/공지사항?id=${notice.id}`)}
                      className="w-full flex gap-5 items-start text-left hover:opacity-70 transition-opacity"
                    >
                      <div
                        className={`w-2 h-8 rounded-sm shrink-0 ${
                          notice.featured ? "bg-primary" : "bg-grey-4"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-grey-11 text-body-1 font-medium mb-2 line-clamp-2">
                          {notice.title}
                        </p>
                        <p className="text-grey-6 text-body-2">{notice.date}</p>
                      </div>
                    </button>
                    {i < notices.length - 1 && (
                      <div className="mt-4 ml-7 border-t border-dotted border-bluegrey-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 스마트 주보 */}
          <div className="bg-bluegrey-1 rounded-2xl p-12 flex flex-col min-h-[330px] shadow-xl">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-grey-12 text-headline-4 font-bold">스마트 주보</h3>
              <button
                onClick={() => navigate("/주보")}
                onMouseEnter={() => setHoveredJuboBtn(true)}
                onMouseLeave={() => setHoveredJuboBtn(false)}
                className="w-8 h-8 flex items-center justify-center transition-colors"
              >
                <img
                  src={hoveredJuboBtn ? BtnArrowHover : BtnArrowDefault}
                  alt="이동"
                  className="w-8 h-8"
                />
              </button>
            </div>

            {jubo.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-grey-6 text-body-2">등록된 주보가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jubo.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/주보?issue=${item.id}`)}
                    className="w-full flex gap-6 text-left hover:opacity-70 transition-opacity"
                  >
                    <div className="w-[140px] h-[90px] bg-grey-3 rounded-[10px] shrink-0" />
                    <div className="flex-1 min-w-0 py-1">
                      <p className="text-grey-11 text-body-1 font-medium mb-2 line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-grey-6 text-body-2">{item.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
