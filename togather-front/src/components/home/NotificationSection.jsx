import { useNavigate } from "react-router";

export default function NotificationSection() {
  const navigate = useNavigate();

  const notices = [
    {
      id: 1,
      title: "옥길교회 웹사이트 2026 ver.가 업데이트 되었습니다.",
      date: "2026. 10. 10",
      isNew: true,
    },
    {
      id: 2,
      title: "첫번째 공지 제목을 입력해 주세요.",
      date: "2026. 09. 03",
    },
    {
      id: 3,
      title: "두번째 공지 제목을 입력해 주세요.",
      date: "2026. 09. 03",
    },
  ];

  const jubo = [
    { title: "9월 4주차 주일예배 주보", date: "2026. 09. 03" },
    { title: "첫번째 공지 제목을 입력해 주세요.", date: "2026. 09. 03" },
    { title: "첫번째 공지 제목을 입력해 주세요.", date: "2026. 09. 03" },
  ];

  return (
    <div className="pb-[140px] px-[200px] flex justify-center w-full">
      <div className="w-[1520px]">
        {/* 타이틀 */}
        <div className="text-center mb-14">
          <p className="text-pale text-[30px] font-bold mb-4">Notice</p>
          <h2 className="text-grey-12 text-[40px] font-bold">주요 알림</h2>
        </div>

        {/* 공지 + 주보 */}
        <div className="grid grid-cols-2 gap-10">
          {/* 공지 알림 */}
          <div className="bg-bluegrey-1 rounded-2xl p-12">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-grey-12 text-headline-4 font-bold">공지사항</h3>
              <button
                onClick={() => navigate("/교회행사")}
                className="border border-grey-6 rounded-full p-2 hover:bg-grey-1 transition-colors"
              >
                ↗
              </button>
            </div>

            <div className="space-y-8">
              {notices.map((notice, i) => (
                <div key={notice.id}>
                  <div className="flex gap-5 items-start">
                    <div
                      className={`w-2 h-8 rounded-sm shrink-0 ${
                        notice.isNew ? "bg-primary" : "bg-grey-4"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-grey-11 text-body-1 font-medium mb-2 line-clamp-2">
                        {notice.title}
                      </p>
                      <p className="text-grey-6 text-body-2">{notice.date}</p>
                    </div>
                  </div>
                  {i < notices.length - 1 && (
                    <div className="mt-4 ml-7 border-t border-dotted border-bluegrey-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 스마트 주보 */}
          <div className="bg-bluegrey-1 rounded-2xl p-12">
            <div className="flex items-center justify-between mb-9">
              <h3 className="text-grey-12 text-headline-4 font-bold">스마트 주보</h3>
              <button
                onClick={() => navigate("/주보")}
                className="border border-white rounded-full p-3 hover:bg-white/20 transition-colors"
              >
                ↗
              </button>
            </div>

            <div className="space-y-6">
              {jubo.map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-[140px] h-[90px] bg-grey-3 rounded-[10px] shrink-0" />
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-grey-11 text-body-1 font-medium mb-2 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-grey-6 text-body-2">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
