import { useState } from "react";
import { useNavigate } from "react-router";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssues } from "@/services/juboService";
import { lookupVerseText } from "@/utils/bibleVerse";

const TABS = ["예배", "소식", "봉사", "예물", "후원"];

function Icon({ d, size = 20, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function BackButton({ onClick, label = "뒤로" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 -ml-2 flex items-center justify-center text-grey-9"
    >
      <Icon d="M15 18l-6-6 6-6" size={22} strokeWidth={2} />
    </button>
  );
}

function cleanRole(role) {
  return (role ?? "").replace(/\s/g, "");
}
function findRoleName(order, name) {
  return order?.find((r) => cleanRole(r.role) === name)?.name;
}
function shortDateLabel(dateLabel) {
  return (dateLabel ?? "").replace(/^\d+년\s*/, "");
}

/** 주보 week-nav: 이전/다음 주보 이동 + 날짜 버튼(지난 주보 시트) + 공유 */
function WeekNav({ issue, canOlder, canNewer, onOlder, onNewer, onOpenWeeks }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 미지원 환경 — 조용히 무시
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOlder}
          disabled={!canOlder}
          aria-label="이전 주보"
          className="w-[30px] h-[30px] rounded-full border border-bluegrey-3 flex items-center justify-center disabled:text-grey-4"
        >
          <Icon d="M15 6l-6 6 6 6" size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenWeeks}
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
        >
          <span className="text-body-3 font-bold text-grey-11">{shortDateLabel(issue?.dateLabel)}</span>
          <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onNewer}
          disabled={!canNewer}
          aria-label="다음 주보"
          className="w-[30px] h-[30px] rounded-full border border-bluegrey-3 flex items-center justify-center disabled:text-grey-4"
        >
          <Icon d="M9 6l6 6-6 6" size={16} />
        </button>
      </div>
      <button type="button" onClick={handleShare} aria-label="공유" className="w-9 h-9 flex items-center justify-center text-grey-8">
        {copied ? <span className="text-caption text-primary font-semibold">복사됨</span> : <Icon d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7" size={21} />}
      </button>
    </div>
  );
}

function TabBar({ active, onChange }) {
  return (
    <div className="sticky top-0 z-10 bg-white flex gap-2 px-5 py-3 overflow-x-auto border-b border-bluegrey-2">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`shrink-0 h-9 px-4.5 rounded-full border text-body-5 ${
            t === active ? "bg-primary border-primary text-white font-bold" : "border-bluegrey-3 text-grey-6"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Box({ title, note, children }) {
  return (
    <section className="border border-bluegrey-2 rounded-xl bg-white overflow-hidden">
      {title && (
        <div className="px-4.5 pt-4.5 pb-1">
          <h3 className="text-sub-tit-5 font-bold text-grey-11">{title}</h3>
        </div>
      )}
      {children}
    </section>
  );
}

function LdRow({ label, time, sub }) {
  return (
    <div className="flex items-baseline gap-2.5 py-2.5">
      <b className="text-body-4 font-semibold text-grey-11 shrink-0">{label}</b>
      <i className="flex-1 border-b border-dotted border-bluegrey-4 -translate-y-1" />
      <span className="text-body-5 text-grey-8 text-right">
        {time}
        {sub && <em className="block not-italic text-caption text-grey-5 mt-0.5">{sub}</em>}
      </span>
    </div>
  );
}

/** ────────── 예배 탭 ────────── */
function WorshipPane({ church, issue, onOpenVerse }) {
  const services = issue.sections.worshipServices;
  const [selected, setSelected] = useState(services[0]?.label ?? "");
  const order = issue.sections.worshipOrder[selected] ?? [];
  const sermon = issue.sections.sermonNote?.title
    ? issue.sections.sermonNote
    : { title: issue.sermonTitle, scripture: issue.verse };

  const { regular = [], departments = [] } = church.worshipSchedule ?? {};
  const sundayWorship = regular.slice(0, 3);
  const weekdayWorship = regular.slice(3);

  return (
    <div className="px-5 py-3.5 flex flex-col gap-3">
      {services.length > 0 && (
        <div className="grid gap-1 bg-bluegrey-1 rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${services.length}, 1fr)` }}>
          {services.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSelected(s.label)}
              className={`h-8.5 rounded-md text-body-5 ${
                s.label === selected ? "bg-white text-primary font-bold shadow-sm" : "text-grey-6"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <Box title="예배 순서" note={services.map((s) => `${s.label} ${s.time}`.trim()).join(" · ") || undefined}>
        {services.length > 0 && (
          <div className="grid gap-px mx-4.5 mb-2 border border-bluegrey-2 rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${services.length}, 1fr)` }}>
            {services.map((s) => {
              const o = issue.sections.worshipOrder[s.label] ?? [];
              const leader = findRoleName(o, "사회") ?? "-";
              const preacher = findRoleName(o, "설교") ?? findRoleName(o, "말씀") ?? "-";
              return (
                <div
                  key={s.label}
                  className={`px-2 py-3 text-center text-body-6 text-grey-7 leading-relaxed ${s.label !== selected ? "opacity-35" : ""}`}
                >
                  <b className="block font-bold text-grey-11">{s.label}</b>
                  사회: {leader}
                  <br />
                  설교: {preacher}
                </div>
              );
            })}
          </div>
        )}
        {order.length === 0 && (
          <p className="mx-4.5 mb-3.5 text-body-5 text-grey-6">등록된 예배 순서가 없습니다.</p>
        )}
        <dl className="mx-4.5 mb-2.5">
          {order.map((r, i) => {
            const isScripture = cleanRole(r.role).includes("봉독");
            const isSermon = cleanRole(r.role) === "설교" || cleanRole(r.role) === "말씀";
            return (
              <div key={i} className="grid grid-cols-[84px_1fr] gap-3 py-3 border-t border-bluegrey-1 first:border-t-0 text-body-5">
                <dt className="font-semibold text-grey-11">{r.role}</dt>
                <dd className="text-grey-8">
                  {isScripture ? (
                    <button
                      type="button"
                      onClick={() => onOpenVerse({ scripture: sermon.scripture || r.name, title: sermon.title })}
                      className="inline-flex items-center gap-1 text-primary font-semibold underline"
                    >
                      {sermon.scripture || r.name}
                      <Icon d="M9 6l6 6-6 6" size={16} strokeWidth={2} />
                    </button>
                  ) : isSermon ? (
                    sermon.title || r.name
                  ) : (
                    r.name
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </Box>

      <Box title="예배 및 모임 안내">
        <div className="px-4.5 pb-3.5">
          {sundayWorship.length > 0 && (
            <>
              <h4 className="mt-2.5 mb-0.5 text-caption font-semibold text-primary">주일 예배</h4>
              {sundayWorship.map((w) => (
                <LdRow key={w.name} label={w.name} time={w.time} />
              ))}
            </>
          )}
          {weekdayWorship.length > 0 && (
            <>
              <h4 className="mt-2.5 mb-0.5 text-caption font-semibold text-primary">평일 예배 및 기도회</h4>
              {weekdayWorship.map((w) => (
                <LdRow key={w.name} label={w.name} time={w.time} />
              ))}
            </>
          )}
          {departments.length > 0 && (
            <>
              <h4 className="mt-2.5 mb-0.5 text-caption font-semibold text-primary">부서 예배</h4>
              {departments.map((w) => (
                <LdRow key={w.name} label={w.name} time={w.time} sub={w.location} />
              ))}
            </>
          )}
        </div>
      </Box>
    </div>
  );
}

/** ────────── 소식 탭 ────────── */
function NewsPane({ news }) {
  const [openIndex, setOpenIndex] = useState(news.length > 0 ? 0 : -1);

  if (news.length === 0) {
    return <p className="px-5 py-10 text-center text-body-5 text-grey-5">등록된 소식이 없습니다.</p>;
  }

  return (
    <div className="px-5 py-3.5 flex flex-col gap-3">
      {news.map((group, i) => {
        const open = i === openIndex;
        return (
          <section key={group.title} className="border border-bluegrey-2 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-2 px-4 py-3.5 bg-bluegrey-1"
            >
              <span className="text-body-4 font-bold text-grey-11">
                {group.title}
                <span className="ml-1.5 text-caption font-medium text-grey-5">{group.items.length}건</span>
              </span>
              <Icon d="M6 9l6 6 6-6" size={20} strokeWidth={2} className={open ? "" : "-rotate-90"} />
            </button>
            {open && (
              <ul className="px-4 py-1">
                {group.items.map((item, j) => (
                  <li key={j} className="py-3 border-t border-bluegrey-1 first:border-t-0 text-body-5 text-grey-8 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** ────────── 봉사 탭 ────────── */
function ServePane({ issue }) {
  const volunteer = issue.sections.volunteer;
  if (volunteer.length === 0) {
    return <p className="px-5 py-10 text-center text-body-5 text-grey-5">등록된 봉사 안내가 없습니다.</p>;
  }
  return (
    <div className="px-5 py-3.5 flex flex-col gap-3">
      <p className="text-caption text-grey-6">{shortDateLabel(issue.dateLabel)} 주일 봉사 안내입니다.</p>
      <Box>
        <table className="w-full text-body-5">
          <thead>
            <tr className="bg-bluegrey-1">
              <th className="text-left pl-4 py-2.5 text-caption font-semibold text-grey-7">역할</th>
              <th className="py-2.5 text-caption font-semibold text-grey-7">1부</th>
              <th className="py-2.5 text-caption font-semibold text-grey-7">2부</th>
            </tr>
          </thead>
          <tbody>
            {volunteer.map((r) => (
              <tr key={r.role} className="border-t border-bluegrey-1">
                <td className="pl-4 py-3 font-semibold text-grey-11 whitespace-nowrap">{r.role}</td>
                <td className="text-center py-3 text-grey-8">{r.part1}</td>
                <td className="text-center py-3 text-grey-8">{r.part2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <p className="text-caption text-grey-6 leading-relaxed">일정이 어려우시면 봉사부에 미리 알려 주세요. 서로 바꿔 섬길 수 있어요.</p>
    </div>
  );
}

/** ────────── 예물 탭 ────────── */
function OfferPane({ church, offering }) {
  const [copied, setCopied] = useState(false);
  const profile = church.profile;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profile.offeringAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 미지원 환경 — 조용히 무시
    }
  }

  return (
    <div className="px-5 py-3.5 flex flex-col gap-3">
      <Box title="온라인 헌금 계좌" note="현금을 준비하지 못한 경우 계좌로 드릴 수 있습니다.">
        <div className="mx-4.5 mb-4 p-4 rounded-xl bg-bluegrey-1 flex flex-col gap-1.5">
          {profile?.offeringAccountNumber ? (
            <>
              <small className="text-caption text-grey-6">{profile.offeringBankName}</small>
              <div className="text-sub-tit-5 font-bold text-primary tabular-nums">{profile.offeringAccountNumber}</div>
              <div className="text-body-5 text-grey-7">예금주: {profile.offeringAccountHolder}</div>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-1.5 self-start h-9.5 px-4 rounded-full bg-primary text-white text-body-5 font-semibold flex items-center gap-1.5"
              >
                <Icon d="M8.5 8.5h11v11h-11zM15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" size={16} />
                {copied ? "복사되었습니다" : "계좌번호 복사"}
              </button>
              {profile.offeringNote && <p className="text-caption text-grey-6 mt-1">{profile.offeringNote}</p>}
            </>
          ) : (
            <p className="text-body-5 text-grey-6">등록된 헌금 계좌 안내가 없습니다.</p>
          )}
        </div>
      </Box>

      {offering.map((group) => (
        <Box key={group.title} title={group.title}>
          <ul className="mx-4.5 mb-3.5">
            {group.items.map((item, i) => (
              <li key={i} className="text-body-5 text-grey-7 leading-relaxed py-1">
                · {item}
              </li>
            ))}
          </ul>
        </Box>
      ))}
    </div>
  );
}

/** ────────── 후원 탭 ────────── 웹(Support.jsx)의 "우리 교회가 돕고 있는 곳" 표를 그대로 따른다
 * — 후원 진행률·후원하기 버튼은 실제 데이터가 없는 항목이라 넣지 않는다. */
function SupportPane({ support }) {
  return (
    <div className="px-5 py-3.5 flex flex-col gap-3">
      <Box title="우리 교회가 돕고 있는 곳">
        {support.length === 0 ? (
          <p className="mx-4.5 mb-3.5 text-body-5 text-grey-6">등록된 후원 기관이 없습니다.</p>
        ) : (
          <table className="w-full text-body-5 mt-1">
            <thead>
              <tr className="bg-bluegrey-1">
                <th className="text-left pl-4.5 py-2.5 text-caption font-semibold text-grey-7">기관</th>
                <th className="text-left py-2.5 text-caption font-semibold text-grey-7">대상</th>
                <th className="text-left pr-4.5 py-2.5 text-caption font-semibold text-grey-7">후원구역</th>
              </tr>
            </thead>
            <tbody>
              {support.map((row, i) => (
                <tr key={i} className="border-t border-bluegrey-1">
                  <td className="pl-4.5 py-3 font-semibold text-grey-11">{row.organization}</td>
                  <td className="py-3 text-grey-8">{row.target}</td>
                  <td className="pr-4.5 py-3 text-grey-8">{row.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

/** ────────── 성경 본문 서브스크린 ────────── */
function VerseScreen({ issue, override, onBack }) {
  const navigate = useNavigate();
  const [size, setSize] = useState("m");
  const sermon = issue.sections.sermonNote?.title
    ? issue.sections.sermonNote
    : { title: issue.sermonTitle, scripture: issue.verse };
  // 클릭한 "성경봉독" 행의 표기(worshipOrder)가 sermonNote보다 믿을 수 있는 출처다 —
  // sermonNote가 채워져 있어도 scripture 필드 자체는 비어 있을 수 있다.
  const scripture = override?.scripture || sermon.scripture;
  const title = override?.title || sermon.title;
  const text = lookupVerseText(scripture);
  const sizeClass = { s: "text-body-5", m: "text-body-3", l: "text-sub-tit-5" }[size];

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <header className="h-14 grid grid-cols-[36px_1fr_36px] items-center px-2 shadow-sm shrink-0">
        <BackButton onClick={onBack} />
        <h2 className="text-center text-body-3 font-bold text-grey-11">성경 본문</h2>
        <span />
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 flex flex-col gap-2">
          <span className="self-start px-2.5 py-1 rounded-md bg-bluegrey-1 text-primary text-caption font-semibold">
            이번 주 설교 본문
          </span>
          <h1 className="text-sub-tit-2 font-bold text-grey-11">{scripture}</h1>
          <p className="text-body-5 text-grey-6">{title}</p>
        </div>
        <div className="flex gap-2 px-5 py-3">
          {[["s", "작게"], ["m", "보통"], ["l", "크게"]].map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setSize(v)}
              className={`h-8.5 px-3.5 rounded-lg border text-body-5 ${
                v === size ? "bg-bluegrey-1 border-primary text-primary font-semibold" : "border-bluegrey-3 text-grey-6"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={`mx-5 p-5 rounded-2xl bg-bluegrey-1 leading-loose break-keep ${sizeClass}`}>
          {text ?? <span className="text-grey-5">본문을 찾을 수 없습니다.</span>}
        </div>
        <div className="px-5 pt-5">
          <button
            type="button"
            onClick={() => navigate("/말씀/읽기")}
            className="w-full h-12 rounded-full bg-primary text-white text-body-4 font-bold"
          >
            성경에서 이어 읽기
          </button>
        </div>
      </div>
    </div>
  );
}

/** ────────── 지난 주보 선택 시트 ────────── */
function WeeksSheet({ issues, currentId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-grey-12/45" />
      <div className="absolute left-0 right-0 bottom-0 max-h-[82%] bg-white rounded-t-[22px] pt-2.5 px-5 pb-6 flex flex-col">
        <div className="w-10 h-1 rounded-full bg-bluegrey-3 mx-auto mb-3.5 shrink-0" />
        <h3 className="text-body-3 font-bold text-grey-11 mb-1">지난 주보</h3>
        <p className="text-caption text-grey-6 mb-2.5">날짜를 선택하세요.</p>
        <div className="overflow-y-auto">
          {issues.map((w) => {
            const active = String(w.id) === String(currentId);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => onSelect(w.id)}
                className="w-full grid grid-cols-[1fr_22px] gap-1 items-center py-3 border-t border-bluegrey-1 first:border-t-0 text-left"
              >
                <b className="text-body-4 font-semibold text-grey-11 flex items-center gap-1.5">
                  {shortDateLabel(w.dateLabel)}
                  {w.current && (
                    <span className="h-5 px-1.5 rounded-md bg-bluegrey-1 text-primary text-[10.5px] font-semibold flex items-center">
                      이번 주
                    </span>
                  )}
                </b>
                <span className="text-caption text-grey-6 col-span-1 row-start-2">{w.sermonTitle}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center row-span-2 row-start-1 ${
                    active ? "bg-primary border-primary text-white" : "border-bluegrey-4 text-transparent"
                  }`}
                >
                  <Icon d="M5 12.5l4.5 4.5L19 7" size={12} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MobileJubo({ church, issue, onSelectIssue }) {
  const [tab, setTab] = useState("예배");
  const [subScreen, setSubScreen] = useState(null); // null | "verse" | "weeks"
  const [verseOverride, setVerseOverride] = useState(null);

  const { data: issues = [] } = useFetch(() => getJuboIssues(church.id), [church.id], []);

  if (!issue) return null;

  const currentIndex = issues.findIndex((i) => String(i.id) === String(issue.id));
  const canOlder = currentIndex !== -1 && currentIndex < issues.length - 1;
  const canNewer = currentIndex > 0;

  return (
    <div className="relative w-full min-h-[calc(100dvh-72px-60px)]">
      <h1 className="px-5 pt-4.5 pb-0.5 text-sub-tit-3 font-bold text-grey-11">스마트 주보</h1>
      <WeekNav
        issue={issue}
        canOlder={canOlder}
        canNewer={canNewer}
        onOlder={() => canOlder && onSelectIssue(issues[currentIndex + 1].id)}
        onNewer={() => canNewer && onSelectIssue(issues[currentIndex - 1].id)}
        onOpenWeeks={() => setSubScreen("weeks")}
      />
      <TabBar active={tab} onChange={setTab} />

      {tab === "예배" && (
        <WorshipPane
          church={church}
          issue={issue}
          onOpenVerse={(v) => {
            setVerseOverride(v);
            setSubScreen("verse");
          }}
        />
      )}
      {tab === "소식" && <NewsPane news={issue.sections.news} />}
      {tab === "봉사" && <ServePane issue={issue} />}
      {tab === "예물" && <OfferPane church={church} offering={issue.sections.offering} />}
      {tab === "후원" && <SupportPane support={issue.sections.support} />}

      {subScreen === "verse" && (
        <VerseScreen issue={issue} override={verseOverride} onBack={() => setSubScreen(null)} />
      )}
      {subScreen === "weeks" && (
        <WeeksSheet
          issues={issues}
          currentId={issue.id}
          onSelect={(id) => {
            onSelectIssue(id);
            setSubScreen(null);
          }}
          onClose={() => setSubScreen(null)}
        />
      )}
    </div>
  );
}
