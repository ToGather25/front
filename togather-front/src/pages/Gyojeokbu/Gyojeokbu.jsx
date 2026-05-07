import { useState, useMemo } from "react";
import { Link } from "react-router";
import MEMBERS from "@/config/members.config";

/* ── Avatar ── */
const AVATAR_COLORS = [
  ["#3d5588", "#eceef3"],
  ["#2b3c61", "#d0d6e2"],
  ["#60749d", "#eceef3"],
  ["#344874", "#d0d6e2"],
  ["#4b3734", "#f5ede9"],
  ["#cc6600", "#fff0e0"],
  ["#1a7bc0", "#e3f2fd"],
  ["#008848", "#e0f5eb"],
];

function Avatar({ name, tone = 1, size = "sm" }) {
  const [bg, fg] = AVATAR_COLORS[(tone - 1) % AVATAR_COLORS.length];
  const dim = size === "lg" ? "w-16 h-16 text-[24px]" : "w-9 h-9 text-[14px]";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: bg, color: fg }}
    >
      {(name || "?").slice(0, 1)}
    </div>
  );
}

/* ── Role chip ── */
function RoleChip({ role }) {
  const isElder = /장로|권사/.test(role);
  const isDeacon = /집사/.test(role);
  const isYouth = /청년|고등부|대학/.test(role);
  const cls = isElder
    ? "bg-blue-1 text-blue-8"
    : isDeacon
    ? "bg-[#fff0e0] text-[#cc6600]"
    : isYouth
    ? "bg-[#e0f5eb] text-[#008848]"
    : "bg-bluegrey-1 text-grey-7";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-[12px] font-semibold ${cls}`}>
      {role}
    </span>
  );
}

/* ── Attendance bar ── */
function AttendBar({ ytd }) {
  if (!ytd || !ytd.includes("/")) return null;
  const [a, b] = ytd.split("/").map(Number);
  const pct = Math.round((a / b) * 100);
  const fillCls = pct < 60 ? "bg-red-400" : pct < 85 ? "bg-yellow-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-bluegrey-2">
        <div className={`h-full rounded-full ${fillCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[12px] text-grey-6 font-mono shrink-0">{a}/{b}</span>
    </div>
  );
}

/* ── Detail drawer body ── */
function DetailBody({ m, onSelect }) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="px-6 py-6 border-b border-bluegrey-2">
        <div className="flex items-start gap-4">
          <Avatar name={m.name} tone={m.avatarTone} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-bold text-grey-12 tracking-[-0.5px] leading-tight">
              {m.name}
              {m.nameRoman && <small className="ml-2 text-[13px] font-normal text-grey-5">{m.nameRoman}</small>}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <RoleChip role={m.role} />
              <span className="text-[13px] text-grey-6">{m.region}</span>
              {m.regionLeader && m.regionLeader !== "-" && (
                <span className="text-[13px] text-grey-5">· {m.regionLeader}</span>
              )}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a
                href={`tel:${m.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bluegrey-1 text-[13px] text-grey-8 hover:bg-blue-1 hover:text-blue-8 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M4 6c0-1 1-2 2-2h2l2 5-2 2a12 12 0 0 0 5 5l2-2 5 2v2c0 1-1 2-2 2A18 18 0 0 1 4 6z" />
                </svg>
                {m.phone}
              </a>
              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bluegrey-1 text-[13px] text-grey-8 hover:bg-blue-1 hover:text-blue-8 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                  </svg>
                  메일
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 기본 정보 */}
        <Section title="기본 정보">
          <InfoRow label="성별" value={m.gender} />
          <InfoRow label="생년월일" value={`${m.birth} (만 ${m.age}세)`} mono />
          <InfoRow label="휴대폰" value={m.phone} mono />
          {m.email && <InfoRow label="이메일" value={m.email} mono />}
          <InfoRow label="주소" value={m.address} />
        </Section>

        {/* 교회 정보 */}
        <Section title="교회 정보">
          <InfoRow label="직분" value={m.role} />
          <InfoRow label="구역" value={`${m.region}${m.regionLeader && m.regionLeader !== "-" ? ` · ${m.regionLeader}` : ""}`} />
          <InfoRow label="소그룹" value={m.smallGroup} />
          <InfoRow label="부서" value={m.department} />
          <InfoRow label="세례일" value={m.baptism} mono />
          <InfoRow label="등록일" value={m.registered} mono />
        </Section>

        {/* 출석 */}
        <Section title="출석 현황">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "최근 출석일", val: m.lastAttend.split(" ")[0], sub: m.lastAttend.split(" ")[1] || "" },
              { label: "2026년 누적", val: m.attendanceYTD, sub: "주일 출석" },
              { label: "소그룹 참여", val: "정상", sub: "최근 4주" },
            ].map(cell => (
              <div key={cell.label} className="bg-bluegrey-1 rounded-xl p-3 text-center">
                <div className="text-[11px] text-grey-6 mb-1">{cell.label}</div>
                <div className="text-[16px] font-bold text-grey-12">{cell.val}</div>
                <div className="text-[11px] text-grey-5 mt-0.5">{cell.sub}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 가족 */}
        {m.family.length > 0 && (
          <Section title={`가족 (${m.family.length})`}>
            <div className="flex flex-col gap-2">
              {m.family.map((f, i) => {
                const target = f.id ? MEMBERS.find(x => x.id === f.id) : null;
                return (
                  <button
                    key={i}
                    disabled={!target}
                    onClick={() => target && onSelect(target.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-bluegrey-2 hover:border-blue-3 hover:bg-blue-1 transition-all text-left disabled:opacity-60 disabled:cursor-default"
                  >
                    <Avatar name={f.name} tone={target?.avatarTone ?? 8} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-grey-5 bg-bluegrey-1 px-1.5 py-0.5 rounded">{f.rel}</span>
                        <span className="text-[14px] font-semibold text-grey-11">{f.name}</span>
                      </div>
                      {(f.phone || target?.phone) && (
                        <div className="text-[12px] text-grey-6 mt-0.5 font-mono">{f.phone || target?.phone}</div>
                      )}
                    </div>
                    {target && (
                      <svg className="w-4 h-4 text-grey-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* 이력 */}
        {m.history.length > 0 && (
          <Section title="이력">
            <div className="flex flex-col gap-2">
              {m.history.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[12px] font-bold text-blue-6 font-mono min-w-[36px] pt-0.5">{h.y}</span>
                  <div className="flex-1 h-px bg-bluegrey-2 self-center mx-2" />
                  <span className="text-[14px] text-grey-9">{h.t}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 메모 */}
        <Section title="목회 메모">
          {m.notes
            ? <p className="text-[14px] text-grey-9 leading-[1.6] bg-bluegrey-1 rounded-xl p-4 m-0">{m.notes}</p>
            : <p className="text-[13px] text-grey-5 m-0">저장된 메모가 없습니다.</p>
          }
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="px-6 py-5 border-b border-bluegrey-2">
      <h4 className="text-[13px] font-bold text-grey-7 uppercase tracking-[0.06em] mb-3 m-0">{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-[13px] text-grey-5 w-20 shrink-0 pt-0.5">{label}</span>
      <span className={`text-[14px] text-grey-11 flex-1 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Table row ── */
function MemberRow({ m, isSelected, searchQ, onClick }) {
  const highlight = (text) => {
    if (!searchQ || !text || !text.includes(searchQ)) return text;
    const i = text.indexOf(searchQ);
    return (
      <>
        {text.slice(0, i)}
        <span className="text-blue-6 font-bold">{searchQ}</span>
        {text.slice(i + searchQ.length)}
      </>
    );
  };

  const lastDate = m.lastAttend.split(" ")[0];

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer border-b border-bluegrey-1 transition-colors ${
        isSelected ? "bg-blue-1" : "hover:bg-bluegrey-1"
      }`}
      style={isSelected ? { boxShadow: "inset 3px 0 0 #3d5588" } : {}}
    >
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={m.name} tone={m.avatarTone} />
          <div>
            <div className="text-[14px] font-semibold text-grey-12">{highlight(m.name)}</div>
            {m.nameRoman && <div className="text-[12px] text-grey-5">{m.nameRoman}</div>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5"><RoleChip role={m.role} /></td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-bluegrey-1 text-[12px] font-semibold text-grey-7">{m.region}</span>
        <div className="text-[12px] text-grey-5 mt-1">{m.smallGroup}</div>
      </td>
      <td className="px-4 py-3.5 font-mono text-[13px] text-grey-8">
        {m.birth}
        <div className="text-[11px] text-grey-5 mt-0.5">만 {m.age}세</div>
      </td>
      <td className="px-4 py-3.5 font-mono text-[13px] text-grey-8">{highlight(m.phone)}</td>
      <td className="px-4 py-3.5 font-mono text-[13px] text-grey-8">
        {lastDate}
        <div className="text-[11px] text-grey-5 mt-0.5">{m.lastAttend.split(" ")[1]}</div>
      </td>
      <td className="px-4 py-3.5 min-w-[90px]">
        <AttendBar ytd={m.attendanceYTD} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <svg className="w-4 h-4 text-grey-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </td>
    </tr>
  );
}

/* ── Main component ── */
const FILTER_DEFS = [
  { k: "전체",     match: () => true },
  { k: "장로/권사", match: m => /장로|권사/.test(m.role) },
  { k: "안수집사",  match: m => /안수집사/.test(m.role) },
  { k: "집사",     match: m => /집사/.test(m.role) && !/안수집사/.test(m.role) },
  { k: "청년",     match: m => /청년/.test(m.role) },
  { k: "1구역",    match: m => m.region === "1구역" },
  { k: "2구역",    match: m => m.region === "2구역" },
  { k: "3구역",    match: m => m.region === "3구역" },
  { k: "5구역",    match: m => m.region === "5구역" },
];

export default function Gyojeokbu() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("전체");
  const [selectedId, setSelectedId] = useState(null);

  const matches = useMemo(() => {
    const norm = q.replace(/[^0-9]/g, "");
    const f = FILTER_DEFS.find(x => x.k === filter);
    return MEMBERS.filter(m => {
      if (f && !f.match(m)) return false;
      if (!q) return true;
      if (norm.length >= 3 && m.phone?.replace(/-/g, "").includes(norm)) return true;
      if (m.name.includes(q)) return true;
      if (m.region?.includes(q)) return true;
      if (m.smallGroup?.includes(q)) return true;
      return false;
    });
  }, [q, filter]);

  const stats = useMemo(() => ({
    total: MEMBERS.length,
    officers: MEMBERS.filter(m => /장로|권사|안수집사|집사/.test(m.role)).length,
    youth: MEMBERS.filter(m => /청년/.test(m.role)).length,
    fams: new Set(MEMBERS.map(m => m.address)).size,
  }), []);

  const member = MEMBERS.find(m => m.id === selectedId);
  const idx = matches.findIndex(m => m.id === selectedId);
  const prevId = idx > 0 ? matches[idx - 1].id : null;
  const nextId = idx >= 0 && idx < matches.length - 1 ? matches[idx + 1].id : null;

  return (
    <div className="min-h-screen bg-bluegrey-1 relative">
      <div className="max-w-[1576px] mx-auto px-8 py-14">
        {/* Page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[14px] text-grey-6 mb-3">
              <Link to="/" className="hover:text-blue-6 transition-colors">홈</Link>
              <span className="text-grey-4">/</span>
              <span className="text-blue-6 font-semibold">교적부</span>
            </div>
            <h1 className="text-[48px] font-bold tracking-[-1.5px] text-grey-12 m-0">교적부</h1>
          </div>
          <div className="flex gap-2.5">
            {[
              { label: "인쇄", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> },
              { label: "엑셀 다운로드", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></svg> },
            ].map(({ label, icon }) => (
              <button key={label} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-bluegrey-2 text-[14px] font-semibold text-grey-8 hover:border-blue-5 hover:text-blue-8 transition-colors">
                {icon}{label}
              </button>
            ))}
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-blue-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              새 교인 등록
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {[
            { label: "전체 교인", val: stats.total, unit: "명", sub: "↑ 4명 (지난달 대비)", color: "text-blue-8" },
            { label: "직분자",   val: stats.officers, unit: "명", sub: "장로 · 권사 · 집사", color: "text-blue-8" },
            { label: "청년부",   val: stats.youth, unit: "명", sub: "19~34세",               color: "text-green-600" },
            { label: "등록 가구", val: stats.fams, unit: "가구", sub: "3개월 이상 미출석 2명", color: "text-yellow-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-bluegrey-2 p-6 flex items-start justify-between">
              <div>
                <div className="text-[13px] text-grey-6 mb-2">{s.label}</div>
                <div className="text-[36px] font-bold text-grey-12 leading-none">
                  {s.val}<small className="text-[16px] font-normal ml-1 text-grey-6">{s.unit}</small>
                </div>
                <div className={`text-[12px] mt-2 ${s.color}`}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-bluegrey-2 px-6 py-4 flex items-center gap-4 mb-4 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-3 h-11 px-4 bg-bluegrey-1 rounded-full border border-transparent focus-within:border-blue-6 focus-within:bg-white transition-all w-[360px]">
            <svg className="w-[18px] h-[18px] text-grey-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="이름 또는 휴대폰 번호로 검색"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-[14px] text-grey-11 placeholder:text-grey-5"
            />
            {q && (
              <button onClick={() => setQ("")} className="w-5 h-5 rounded-full bg-grey-4 text-white text-[12px] flex items-center justify-center">×</button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 flex-wrap flex-1">
            {FILTER_DEFS.map(f => {
              const n = MEMBERS.filter(f.match).length;
              return (
                <button
                  key={f.k}
                  onClick={() => setFilter(f.k)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                    filter === f.k
                      ? "bg-primary text-white"
                      : "bg-bluegrey-1 text-grey-8 hover:bg-blue-1 hover:text-blue-8"
                  }`}
                >
                  {f.k}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${filter === f.k ? "bg-white/20 text-white" : "bg-bluegrey-2 text-grey-6"}`}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Count */}
          <div className="ml-auto shrink-0 text-[14px] text-grey-6">
            <b className="text-grey-12">{matches.length}</b> / {MEMBERS.length}명
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white rounded-2xl border border-bluegrey-2 overflow-hidden transition-all duration-200"
          style={{ marginRight: member ? "536px" : "0" }}
        >
          {matches.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-[72px] h-[72px] rounded-[18px] bg-blue-1 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-6" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
              </div>
              <div className="text-[20px] font-bold text-grey-12 tracking-[-0.5px] mb-2">검색 결과가 없습니다</div>
              <div className="text-[14px] text-grey-5">이름 또는 휴대폰 번호 뒷자리를 다시 확인해 주세요.</div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bluegrey-1 border-b border-bluegrey-2">
                  {["이름", "직분", "구역 / 소그룹", "생년월일", "휴대폰", "최근 출석", "출석률", ""].map((h, i) => (
                    <th
                      key={i}
                      className="text-left text-[12px] font-bold text-grey-6 uppercase tracking-[0.04em] px-4 py-4 whitespace-nowrap"
                      style={i === 0 ? { paddingLeft: "24px" } : i === 7 ? { paddingRight: "24px", width: "36px" } : {}}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map(m => (
                  <MemberRow
                    key={m.id}
                    m={m}
                    isSelected={m.id === selectedId}
                    searchQ={q}
                    onClick={() => setSelectedId(prev => prev === m.id ? null : m.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Side drawer */}
      <aside
        className="fixed top-[72px] right-0 bottom-0 w-[520px] bg-white border-l border-bluegrey-2 z-40 flex flex-col overflow-hidden transition-transform duration-200"
        style={{
          transform: member ? "translateX(0)" : "translateX(520px)",
          boxShadow: member ? "-16px 0 40px -20px rgba(0,0,0,.15)" : "none",
        }}
      >
        {member && (
          <>
            {/* Drawer top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-bluegrey-2 bg-white shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => prevId && setSelectedId(prevId)}
                  disabled={!prevId}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <button
                  onClick={() => nextId && setSelectedId(nextId)}
                  disabled={!nextId}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-4 h-4 -rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>
              <span className="text-[13px] text-grey-5 font-mono">
                <b className="text-grey-12">{idx + 1}</b> / {matches.length}
              </span>
              <div className="flex-1" />
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 transition-colors">
                <svg className="w-4 h-4 text-grey-7" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16zM14 6l4 4"/></svg>
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 transition-colors">
                <svg className="w-4 h-4 text-grey-7" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bluegrey-1 transition-colors"
              >
                <svg className="w-4 h-4 text-grey-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" key={member.id}>
              <DetailBody m={member} onSelect={setSelectedId} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
