import { useState } from "react";

const WORSHIP_TIMES = [
  { name: "1부 예배", time: "오전 9:30", place: "본당" },
  { name: "2부 예배", time: "오전 11:00", place: "본당" },
  { name: "청년 예배", time: "오후 2:00", place: "소강당" },
  { name: "저녁 예배", time: "오후 7:00", place: "본당" },
];

const RECENT_NOTICES = [
  { type: "공지", title: "2026년 교회 달력 및 연간 행사 안내", date: "2026.01.01", visible: true },
  { type: "행사", title: "봄 야외 예배 참가 신청", date: "2026.04.07", visible: true },
  { type: "소식", title: "성가대 단원 모집", date: "2026.03.10", visible: false },
];

export default function MainManage() {
  const [headline, setHeadline] = useState("하나님과 함께하는 공동체");
  const [subline, setSubline] = useState("ToGather 알곡교회에 오신 것을 환영합니다");
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/@algok-church");
  const [worshipTimes, setWorshipTimes] = useState(WORSHIP_TIMES);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateTime(i, field, val) {
    setWorshipTimes(prev => prev.map((w, idx) => idx === i ? { ...w, [field]: val } : w));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">메인 페이지 관리</h1>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          {saved ? "저장 완료 ✓" : "변경사항 저장"}
        </button>
      </div>

      <div className="grid gap-5">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">배너 설정</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">메인 헤드라인</label>
              <input
                className="w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">서브 문구</label>
              <input
                className="w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors"
                value={subline}
                onChange={e => setSubline(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">배너 이미지</label>
              <div className="border-2 border-dashed border-grey-3 rounded-xl p-8 flex flex-col items-center gap-2 text-grey-5 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p className="text-body-4">클릭하여 이미지 업로드</p>
                <p className="text-body-5">PNG, JPG (최대 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Worship times */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">예배 시간표</h2>
          <div className="flex flex-col gap-3">
            {worshipTimes.map((w, i) => (
              <div key={i} className="grid gap-3 items-center" style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}>
                <input
                  className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary"
                  value={w.name}
                  onChange={e => updateTime(i, "name", e.target.value)}
                  placeholder="예배명"
                />
                <input
                  className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary"
                  value={w.time}
                  onChange={e => updateTime(i, "time", e.target.value)}
                  placeholder="시간"
                />
                <input
                  className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary"
                  value={w.place}
                  onChange={e => updateTime(i, "place", e.target.value)}
                  placeholder="장소"
                />
                <button
                  onClick={() => setWorshipTimes(prev => prev.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2 hover:text-red-500 transition-colors"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setWorshipTimes(prev => [...prev, { name: "", time: "", place: "" }])}
              className="mt-1 flex items-center gap-2 text-body-4 text-primary font-medium hover:underline"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              예배 추가
            </button>
          </div>
        </div>

        {/* YouTube */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-5">유튜브 채널</h2>
          <div>
            <label className="block text-body-5 font-semibold text-grey-7 mb-1.5">유튜브 채널 URL</label>
            <input
              className="w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/@..."
            />
          </div>
        </div>

        {/* Recent notices visibility */}
        <div className="bg-white rounded-2xl border border-grey-2 p-6">
          <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-4">메인 노출 공지</h2>
          <p className="text-body-5 text-grey-5 mb-4">메인 페이지에 표시할 공지를 선택합니다 (최대 5개)</p>
          <div className="divide-y divide-grey-2">
            {RECENT_NOTICES.map((n, i) => (
              <label key={i} className="flex items-center gap-4 py-3 cursor-pointer">
                <input type="checkbox" defaultChecked={n.visible} className="w-4 h-4 accent-primary" />
                <span className="text-body-5 font-bold px-2 py-0.5 rounded text-primary bg-blue-1">{n.type}</span>
                <span className="flex-1 text-body-4 text-grey-9">{n.title}</span>
                <span className="text-body-5 text-grey-5">{n.date}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
