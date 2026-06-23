import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const EDITIONS = [
  "2026년 5월 25일 (21주차)",
  "2026년 5월 18일 (20주차)",
  "2026년 5월 11일 (19주차)",
  "2026년 5월 4일 (18주차)",
];

function SectionCard({ title, children, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-1 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-sub-tit-5 font-bold text-grey-10">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-grey-2 last:border-0">
      <span className="w-28 shrink-0 text-body-5 font-semibold text-grey-6 pt-2.5">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const inputCls = "w-full border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-10 focus:outline-none focus:border-primary transition-colors";

export default function JuboManage() {
  const [edition, setEdition] = useState(EDITIONS[0]);
  const [saved, setSaved] = useState(false);
  const [worship, setWorship] = useState({
    verse: "여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요",
    verseRef: "시편 27:1",
    pastor: "김영수 담임목사",
    title: "부활의 능력",
    scripture: "로마서 8:11",
    praise: "찬양대 특별 찬양",
  });
  const [notice, setNotice] = useState({
    item1: "이번 주 심방: 평일 오후 방문",
    item2: "어린이부 여름 성경학교 신청 접수 중",
    item3: "청년부 정기 모임: 매주 토요일 오후 2시",
    item4: "",
  });
  const [service, setService] = useState({
    prayer: "집사 이철수",
    scripture: "장로 윤서현",
    offering: "권사 이미영",
    flower: "○○ 성도 가정",
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">스마트 주보 관리</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-grey-3 text-body-4 font-medium text-grey-7 hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
            <img src={IcoSearch} className="w-[15px] h-[15px]" alt="" />
            미리보기
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors">
            {saved ? "저장 완료 ✓" : "저장"}
          </button>
        </div>
      </div>

      {/* Edition selector */}
      <div className="bg-white rounded-2xl border border-grey-2 p-5 mb-5 flex items-center gap-4">
        <span className="text-body-4 font-semibold text-grey-8 shrink-0">주보 호수</span>
        <select
          className="border border-grey-3 rounded-xl px-4 py-2.5 text-body-4 text-grey-9 focus:outline-none focus:border-primary bg-white"
          value={edition}
          onChange={e => setEdition(e.target.value)}
        >
          {EDITIONS.map(e => <option key={e}>{e}</option>)}
        </select>
        <button className="ml-2 px-4 py-2.5 rounded-xl border border-grey-3 text-body-4 font-medium text-grey-7 hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          새 주보 생성
        </button>
      </div>

      <div className="grid gap-5">
        {/* 예배 순서 */}
        <SectionCard title="예배 순서 및 설교" icon={
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        }>
          <div>
            <FieldRow label="주제 말씀">
              <input className={inputCls} value={worship.verse} onChange={e => setWorship(p => ({...p, verse: e.target.value}))} />
            </FieldRow>
            <FieldRow label="말씀 출처">
              <input className={inputCls} value={worship.verseRef} onChange={e => setWorship(p => ({...p, verseRef: e.target.value}))} />
            </FieldRow>
            <FieldRow label="설교자">
              <input className={inputCls} value={worship.pastor} onChange={e => setWorship(p => ({...p, pastor: e.target.value}))} />
            </FieldRow>
            <FieldRow label="설교 제목">
              <input className={inputCls} value={worship.title} onChange={e => setWorship(p => ({...p, title: e.target.value}))} />
            </FieldRow>
            <FieldRow label="본문 말씀">
              <input className={inputCls} value={worship.scripture} onChange={e => setWorship(p => ({...p, scripture: e.target.value}))} />
            </FieldRow>
            <FieldRow label="찬양">
              <input className={inputCls} value={worship.praise} onChange={e => setWorship(p => ({...p, praise: e.target.value}))} />
            </FieldRow>
          </div>
        </SectionCard>

        {/* 주요 공지 */}
        <SectionCard title="주요 공지 사항" icon={
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/>
          </svg>
        }>
          <div>
            {["item1","item2","item3","item4"].map((key, i) => (
              <FieldRow key={key} label={`공지 ${i + 1}`}>
                <input className={inputCls} value={notice[key]} onChange={e => setNotice(p => ({...p, [key]: e.target.value}))} placeholder="공지 내용 (비워두면 미표시)" />
              </FieldRow>
            ))}
          </div>
        </SectionCard>

        {/* 섬기는 분들 */}
        <SectionCard title="이 주 섬기는 분들" icon={
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
        }>
          <div>
            <FieldRow label="대표 기도">
              <input className={inputCls} value={service.prayer} onChange={e => setService(p => ({...p, prayer: e.target.value}))} />
            </FieldRow>
            <FieldRow label="성경 봉독">
              <input className={inputCls} value={service.scripture} onChange={e => setService(p => ({...p, scripture: e.target.value}))} />
            </FieldRow>
            <FieldRow label="헌금 위원">
              <input className={inputCls} value={service.offering} onChange={e => setService(p => ({...p, offering: e.target.value}))} />
            </FieldRow>
            <FieldRow label="꽃꽂이">
              <input className={inputCls} value={service.flower} onChange={e => setService(p => ({...p, flower: e.target.value}))} />
            </FieldRow>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
