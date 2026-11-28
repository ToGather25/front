import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import BibleSourceNotice from "./BibleSourceNotice";
import BibleRankingView from "./BibleRankingView";
import BibleVersesView from "./BibleVersesView";
import BibleStatusView from "./BibleStatusView";
import { getBibleProgress, updateBibleProgress, updateBiblePosition } from "@/services/bibleService";
import bibleData from "@/data/bible.json";
import { BOOK_MAP, BOOK_ABBREV, OT, NT } from "@/config/bible.config";

/** 데스크톱(BibleRead.jsx/BibleWrite.jsx)과 동일한 목업 상수 — 백엔드에 랭킹/목표·스트릭
 * 데이터가 아직 없어 두 화면 모두 같은 자리표시 숫자를 쓴다. 실제 연동 전까지는
 * 모바일/데스크톱 표시가 어긋나지 않도록 값을 그대로 맞춘다. */
const MY_RANK = { rank: 22, name: "나", count: 20511, trend: 0 };
const READ_NEIGHBORS = [
  { rank: MY_RANK.rank + 1, name: "임예원", count: 14408, trend: -1 },
  MY_RANK,
  { rank: MY_RANK.rank - 1, name: "임예빈", count: 21511, trend: 1 },
];
const READ_MONTHLY = [];
const READ_TOTAL = [
  { rank: 1, name: "요한", count: 12345566, trend: 0 },
  { rank: 2, name: "베드로", count: 12344433, trend: 1 },
  { rank: 3, name: "김미정", count: 3342343, trend: -1 },
  { rank: 4, name: "김수빈", count: 5638383, trend: 2 },
  { rank: 5, name: "이미자", count: 234324, trend: 0 },
];
const MY_WRITE_RANK = { rank: 6, name: "나", count: 93, trend: 0 };
const WRITE_NEIGHBORS = [
  { rank: 7, name: "강민서", count: 71, trend: -1 },
  MY_WRITE_RANK,
  { rank: 5, name: "최유진", count: 154, trend: 1 },
];
const WRITE_MONTHLY = [
  { rank: 1, name: "박지호", count: 312 },
  { rank: 2, name: "김민준", count: 278 },
  { rank: 6, name: "나", count: 93 },
];
const WRITE_TOTAL = [
  { rank: 1, name: "박지호", count: 2841 },
  { rank: 2, name: "이서연", count: 2234 },
  { rank: 6, name: "나", count: 934 },
];
const MOCK_SAVED_VERSES = [
  {
    key: "로마서-8-28",
    book: "로마서",
    chapter: 8,
    num: 28,
    text: "우리가 알거니와 하나님을 사랑하는 자 곧 그 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
  },
  {
    key: "마가복음-12-29",
    book: "마가복음",
    chapter: 12,
    num: "29~31",
    text: "예수께서 대답하시되 첫째는 이것이니 이스라엘아 들으라 주 곧 우리 하나님은 유일한 주시라 네 마음을 다하고 목숨을 다하고 뜻을 다하고 힘을 다하여 주 너의 하나님을 사랑하라 하신 것이요 둘째는 이것이니 네 이웃을 네 몸과 같이 사랑하라 하신 것이라 이에서 더 큰 계명이 없느니라",
  },
];
const BOOK_PROGRESS_READ = {
  창: 100, 출: 85, 레: 40, 민: 100, 신: 60, 수: 30, 삿: 0, 룻: 100, 삼상: 0, 삼하: 0,
  왕상: 0, 왕하: 0, 대상: 0, 대하: 0, 스: 0, 느: 0, 에: 0, 욥: 0, 시: 55, 잠: 20,
  전: 0, 아: 0, 사: 0, 렘: 0, 애: 0, 겔: 0, 단: 0, 호: 0, 욜: 0, 암: 0,
  옵: 0, 욘: 100, 미: 0, 나: 0, 합: 0, 습: 0, 학: 0, 슥: 0, 말: 0, 마: 70,
  막: 100, 눅: 0, 요: 100, 행: 0, 롬: 45, 고전: 0, 고후: 0, 갈: 100, 엡: 100, 빌: 100,
  골: 0, 살전: 0, 살후: 0, 딤전: 0, 딤후: 0, 딛: 0, 몬: 0, 히: 0, 약: 0, 벧전: 0,
  벧후: 0, 요일: 0, 요이: 0, 요삼: 0, 유: 0, 계: 0,
};
const BOOK_PROGRESS_WRITE = {
  창: 100, 출: 100, 레: 73, 민: 100, 신: 73, 수: 17, 삿: 21, 룻: 0, 삼상: 0, 삼하: 0,
  왕상: 0, 왕하: 0, 대상: 0, 대하: 0, 스: 0, 느: 0, 에: 0, 욥: 0, 시: 32, 잠: 0,
  전: 0, 아: 0, 사: 0, 렘: 0, 애: 0, 겔: 0, 단: 0, 호: 0, 욜: 0, 암: 0,
  옵: 0, 욘: 0, 미: 0, 나: 0, 합: 0, 습: 0, 학: 0, 슥: 0, 말: 0, 마: 45,
  막: 0, 눅: 0, 요: 100, 행: 0, 롬: 60, 고전: 0, 고후: 0, 갈: 100, 엡: 100, 빌: 0,
  골: 0, 살전: 0, 살후: 0, 딤전: 0, 딤후: 0, 딛: 0, 몬: 0, 히: 0, 약: 0, 벧전: 0,
  벧후: 0, 요일: 0, 요이: 0, 요삼: 0, 유: 0, 계: 0,
};
const READ_STATUS_CONFIG = {
  totalLabel: "읽은 구절 수 총합", totalValue: "128,450 절", visitCount: "215 일",
  completeCount: "1번", monthVerse: "248절", monthVerseLabel: "이번달 읽은 구절수",
};
const WRITE_STATUS_CONFIG = {
  totalLabel: "작성한 구절 수 총합", totalValue: "240,021절", visitCount: "320일",
  completeCount: "1번", monthVerse: "360절", monthVerseLabel: "이번달 필사 구절수",
};

const FONT_SIZE_CLASS = { s: "text-body-5", m: "text-body-3", l: "text-sub-tit-5" };

function getChapters(bookAbbr) {
  const re = new RegExp(`^${bookAbbr}(\\d+):\\d+$`);
  const set = new Set();
  for (const key of Object.keys(bibleData)) {
    const m = key.match(re);
    if (m) set.add(Number(m[1]));
  }
  return [...set].sort((a, b) => a - b);
}
function getVerses(bookAbbr, chapter) {
  const re = new RegExp(`^${bookAbbr}${chapter}:(\\d+)$`);
  const arr = [];
  for (const [key, text] of Object.entries(bibleData)) {
    const m = key.match(re);
    if (m) arr.push({ num: Number(m[1]), text: text.trim() });
  }
  return arr.sort((a, b) => a.num - b.num);
}

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

function TopBar({ title, onBack, onMenu }) {
  return (
    <header className="h-14 grid grid-cols-[36px_1fr_36px] items-center px-2 border-b border-bluegrey-2 shrink-0">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center text-grey-9">
          <Icon d="M15 18l-6-6 6-6" size={22} strokeWidth={2} />
        </button>
      ) : (
        <span />
      )}
      <h2 className="text-center text-body-3 font-bold text-grey-11 truncate">{title}</h2>
      {onMenu ? (
        <button type="button" onClick={onMenu} aria-label="메뉴" className="w-9 h-9 flex items-center justify-center text-grey-9 justify-self-end">
          <Icon d="M4 7h16M4 12h16M4 17h16" size={22} />
        </button>
      ) : (
        <span />
      )}
    </header>
  );
}

/** 책(구약/신약) + 장(또는 절) 선택 바텀시트 — 공용 */
function PickerSheet({ title, tabs, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-grey-12/45" />
      <div className="absolute left-0 right-0 bottom-0 max-h-[80vh] overflow-y-auto bg-white rounded-t-[22px] pt-2.5 px-5 pb-6">
        <div className="w-10 h-1 rounded-full bg-bluegrey-3 mx-auto mb-3.5" />
        <h3 className="text-body-3 font-bold text-grey-11 mb-3">{title}</h3>
        {tabs}
        {children}
      </div>
    </div>
  );
}

function BookSheet({ current, onSelect, onClose }) {
  const [tab, setTab] = useState(OT.includes(current) ? "OT" : "NT");
  const list = tab === "OT" ? OT : NT;
  return (
    <PickerSheet
      title="성경 선택"
      onClose={onClose}
      tabs={
        <div className="grid grid-cols-2 bg-bluegrey-1 rounded-lg p-1 mb-3">
          {[["OT", "구약"], ["NT", "신약"]].map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className={`h-9 rounded-md text-body-5 ${v === tab ? "bg-white text-primary font-bold shadow-sm" : "text-grey-6"}`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-4 gap-2">
        {list.map((abbr) => (
          <button
            key={abbr}
            type="button"
            onClick={() => onSelect(abbr)}
            className={`h-12 rounded-lg border text-body-5 ${
              abbr === current ? "bg-primary border-primary text-white font-bold" : "border-bluegrey-3 text-grey-9"
            }`}
          >
            {BOOK_MAP[abbr]}
          </button>
        ))}
      </div>
    </PickerSheet>
  );
}

function NumberSheet({ title, count, current, onSelect, onClose, labelSuffix }) {
  return (
    <PickerSheet title={title} onClose={onClose}>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`h-11 rounded-lg border text-body-5 ${
              n === current ? "bg-primary border-primary text-white font-bold" : "border-bluegrey-3 text-grey-9"
            }`}
          >
            {n}
            {labelSuffix}
          </button>
        ))}
      </div>
    </PickerSheet>
  );
}

function FontSizeRow({ size, onChange }) {
  return (
    <div className="flex gap-2 px-5 py-2.5">
      {[["s", "작게"], ["m", "보통"], ["l", "크게"]].map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`h-8.5 px-3.5 rounded-lg border text-body-5 ${
            v === size ? "bg-bluegrey-1 border-primary text-primary font-semibold" : "border-bluegrey-3 text-grey-6"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** ────────── 읽기 본문 ────────── */
function ReadMain({
  book,
  chapter,
  fontSize,
  onOpenBook,
  onOpenChapter,
  onFontSize,
  savedVerses,
  onToggleSave,
  completedChapters,
  setCompletedChapters,
}) {
  const { currentUser } = useAuth();
  const [checkedVerses, setCheckedVerses] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    updateBiblePosition("READ", { book, chapter }).catch((err) =>
      console.error("[MobileBible] 위치 저장 실패:", err),
    );
  }, [currentUser, book, chapter]);

  const verses = useMemo(() => getVerses(book, chapter), [book, chapter]);
  const allChecked = verses.length > 0 && verses.every((_, idx) => !!checkedVerses[idx]);

  useEffect(() => {
    if (completedChapters === null) return;
    if (!completedChapters.has(`${book}-${chapter}`)) {
      setCheckedVerses({});
      return;
    }
    const all = {};
    verses.forEach((_, idx) => {
      all[idx] = true;
    });
    setCheckedVerses(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedChapters, book, chapter]);

  useEffect(() => {
    if (!currentUser || completedChapters === null) return;
    const key = `${book}-${chapter}`;
    if (completedChapters.has(key) === allChecked) return;
    updateBibleProgress("READ", { book, chapter, completed: allChecked })
      .then(() => {
        setCompletedChapters((prev) => {
          const next = new Set(prev);
          if (allChecked) next.add(key);
          else next.delete(key);
          return next;
        });
      })
      .catch((err) => console.error("[MobileBible] 진도 저장 실패:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecked]);

  const toggleVerse = useCallback((idx) => setCheckedVerses((prev) => ({ ...prev, [idx]: !prev[idx] })), []);
  const toggleAll = () => {
    if (allChecked) setCheckedVerses({});
    else {
      const all = {};
      verses.forEach((_, idx) => {
        all[idx] = true;
      });
      setCheckedVerses(all);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-5 py-2.5">
        <button type="button" onClick={onOpenBook} className="flex items-center gap-1 text-body-3 font-bold text-grey-11">
          {BOOK_MAP[book]} {chapter}장
          <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2} />
        </button>
        <button type="button" onClick={onOpenChapter} className="h-8.5 px-3 rounded-lg border border-bluegrey-3 text-body-5 text-grey-7">
          장 선택
        </button>
      </div>
      <FontSizeRow size={fontSize} onChange={onFontSize} />
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-caption text-grey-6">{verses.length}개 구절</span>
        <button type="button" onClick={toggleAll} className="text-caption font-semibold text-primary">
          {allChecked ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="flex-1 px-5 flex flex-col gap-3 pb-6">
        {verses.map((v, idx) => {
          const saveKey = `${book}-${chapter}-${v.num}`;
          return (
            <div key={v.num} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggleVerse(idx)}
                aria-pressed={!!checkedVerses[idx]}
                aria-label={`${v.num}절 완료 체크`}
                className={`mt-0.5 w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
                  checkedVerses[idx] ? "bg-primary border-primary text-white" : "border-bluegrey-4 text-transparent"
                }`}
              >
                <Icon d="M5 12.5l4.5 4.5L19 7" size={12} strokeWidth={3} />
              </button>
              <p className={`flex-1 ${FONT_SIZE_CLASS[fontSize]} text-grey-10 leading-loose break-keep`}>
                <sup className="text-primary font-bold mr-1 text-[0.65em]">{v.num}</sup>
                {v.text}
              </p>
              <button
                type="button"
                onClick={() => onToggleSave(v)}
                aria-label="구절 저장"
                aria-pressed={!!savedVerses[saveKey]}
                className={`mt-0.5 shrink-0 ${savedVerses[saveKey] ? "text-red-400" : "text-grey-4"}`}
              >
                <Icon d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" size={18} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="px-5 pb-6">
        <BibleSourceNotice />
      </div>
    </div>
  );
}

/** ────────── 필사 본문 ────────── */
function WriteMain({ book, chapter, verse, fontSize, onOpenBook, onOpenChapter, onOpenVerse, onFontSize, onCompleted }) {
  const { currentUser } = useAuth();
  const [typed, setTyped] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setTyped("");
    setIsCorrect(null);
  }, [book, chapter, verse]);

  useEffect(() => {
    if (!currentUser) return;
    updateBiblePosition("WRITE", { book, chapter, verse }).catch((err) =>
      console.error("[MobileBible] 위치 저장 실패:", err),
    );
  }, [currentUser, book, chapter, verse]);

  const verses = useMemo(() => getVerses(book, chapter), [book, chapter]);
  const current = verses.find((v) => v.num === verse);
  const target = current?.text ?? "";
  const idx = verses.findIndex((v) => v.num === verse);
  const nextVerse = verses[idx + 1] ?? null;
  const isDone = isCorrect === true;

  useEffect(() => {
    if (!isDone || !nextVerse) return;
    const t = setTimeout(() => onOpenVerse(nextVerse.num), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, nextVerse]);

  function handleChange(e) {
    const val = e.target.value;
    if (val.length > target.length) return;
    setTyped(val);
    if (val.length === 0) {
      setIsCorrect(null);
      return;
    }
    if (val === target) {
      setIsCorrect(true);
      updateBibleProgress("WRITE", { book, chapter, verse, completed: true })
        .then(() => onCompleted({ book, chapter, verse, text: target }))
        .catch((err) => console.error("[MobileBible] 진도 저장 실패:", err));
    } else {
      setIsCorrect(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-5 py-2.5">
        <button type="button" onClick={onOpenBook} className="flex items-center gap-1 text-body-3 font-bold text-grey-11">
          {BOOK_MAP[book]} {chapter}장 {verse}절
          <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2} />
        </button>
        <button type="button" onClick={onOpenChapter} className="h-8.5 px-3 rounded-lg border border-bluegrey-3 text-body-5 text-grey-7">
          장·절 선택
        </button>
      </div>
      <FontSizeRow size={fontSize} onChange={onFontSize} />
      <div className="flex-1 px-5 py-2 cursor-text" onClick={() => !isDone && textareaRef.current?.focus()}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-caption font-semibold text-primary">
            {BOOK_MAP[book]} {chapter}장 {verse}절
          </span>
          {isDone && (
            <>
              <span className="w-1 h-1 rounded-full bg-grey-3" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTyped("");
                  setIsCorrect(null);
                  textareaRef.current?.focus();
                }}
                className="text-caption text-grey-4"
              >
                다시 쓰기
              </button>
            </>
          )}
        </div>
        {target ? (
          <div className="relative">
            {/* 구절을 연하게 깔아두고 입력한 만큼 진하게 채워 넣는다 — 웹 성경 쓰기와 동일한
             * "구절 위에 그대로 덧쓰는" 느낌. 실제 입력은 투명 textarea가 이 위에서 받는다. */}
            <div className={`${FONT_SIZE_CLASS[fontSize]} whitespace-pre-wrap tracking-wide select-none leading-loose break-keep`}>
              {target.split("").map((char, i) => {
                if (i < typed.length) {
                  return (
                    <span key={i} className={typed[i] === char ? "text-grey-11" : "text-red-400"}>
                      {typed[i]}
                    </span>
                  );
                }
                if (i === typed.length && !isDone) {
                  return (
                    <span key={i} className="relative">
                      <span className="absolute -left-px top-0 bottom-0 w-0.5 bg-primary animate-pulse" />
                      <span className="text-grey-3">{char}</span>
                    </span>
                  );
                }
                return (
                  <span key={i} className={isDone ? "text-grey-11" : "text-grey-3"}>
                    {char}
                  </span>
                );
              })}
            </div>
            {!isDone && (
              <textarea
                ref={textareaRef}
                value={typed}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                autoFocus
                rows={1}
                className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text"
              />
            )}
          </div>
        ) : (
          <p className="text-body-5 text-grey-6">해당 구절이 없습니다.</p>
        )}
        {isDone && (
          <p className="mt-4 text-caption font-semibold text-primary">
            {nextVerse ? "완료! 다음 구절로 넘어갑니다." : "이 장의 마지막 구절을 완료했어요."}
          </p>
        )}
      </div>
      <div className="px-5 pb-6">
        <BibleSourceNotice />
      </div>
    </div>
  );
}

export default function MobileBible({ mode }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState("choose");
  const [book, setBook] = useState("창");
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [fontSize, setFontSize] = useState("m");
  const [sheet, setSheet] = useState(null); // null | "book" | "chapter" | "verse"
  const [savedVerses, setSavedVerses] = useState({});
  const [completedVerses, setCompletedVerses] = useState([]);
  const [completedChapters, setCompletedChapters] = useState(null);
  // 마지막 위치 복원이 끝나기 전에 읽기/쓰기 화면이 먼저 열리면, 그 화면의 위치 저장
  // effect가 기본값(창 1장)으로 서버를 덮어써 버린다 — 복원이 끝날 때까지 화면 진입을
  // 막아 이 경합을 없앤다.
  const [progressLoaded, setProgressLoaded] = useState(false);
  const loadedProgress = useRef(false);

  // 읽기 모드: 완료한 장 목록 + 마지막 위치를 진입 시 한 번 받아온다.
  useEffect(() => {
    if (mode !== "READ" || !currentUser || loadedProgress.current) return;
    loadedProgress.current = true;
    getBibleProgress("READ")
      .then(({ completed, lastPosition }) => {
        setCompletedChapters(new Set((completed ?? []).map((c) => `${c.book}-${c.chapter}`)));
        if (lastPosition?.book) {
          setBook(lastPosition.book);
          setChapter(lastPosition.chapter || 1);
        }
      })
      .catch((err) => {
        console.error("[MobileBible] 진도 조회 실패:", err);
        setCompletedChapters(new Set());
      })
      .finally(() => setProgressLoaded(true));
  }, [mode, currentUser]);

  // 필사 모드의 "내 구절"은 실제로 완료된 절 기록이다 — 진입 시 한 번 받아온다.
  useEffect(() => {
    if (mode !== "WRITE" || !currentUser || loadedProgress.current) return;
    loadedProgress.current = true;
    getBibleProgress("WRITE")
      .then(({ completed, lastPosition }) => {
        setCompletedVerses(
          (completed ?? []).map((c) => ({
            key: `${c.book}-${c.chapter}-${c.verse}`,
            bookName: BOOK_MAP[c.book] ?? c.book,
            chapter: c.chapter,
            num: c.verse,
            text: getVerses(c.book, c.chapter).find((v) => v.num === c.verse)?.text ?? "",
          })),
        );
        if (lastPosition?.book) {
          setBook(lastPosition.book);
          setChapter(lastPosition.chapter || 1);
          setVerse(lastPosition.verse || 1);
        }
      })
      .catch((err) => console.error("[MobileBible] 진도 조회 실패:", err))
      .finally(() => setProgressLoaded(true));
  }, [mode, currentUser]);

  const chapters = useMemo(() => getChapters(book), [book]);
  const verses = useMemo(() => getVerses(book, chapter), [book, chapter]);

  function openModeRoute(targetMode) {
    if (targetMode === mode) {
      setScreen("main");
      return;
    }
    void navigate(targetMode === "READ" ? "/말씀/읽기" : "/말씀/필사");
  }

  function selectBook(abbr) {
    setBook(abbr);
    setChapter(1);
    setVerse(1);
    setSheet(null);
  }
  function selectChapter(n) {
    setChapter(n);
    setVerse(1);
    setSheet(null);
  }

  function toggleSaveVerse(v) {
    const key = `${book}-${chapter}-${v.num}`;
    setSavedVerses((prev) => {
      if (prev[key]) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { key, book: BOOK_MAP[book], chapter, num: v.num, text: v.text } };
    });
  }

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message={`성경 ${mode === "READ" ? "읽기" : "필사"}를 이용하려면 로그인해 주세요.`}
        onCancel={() => navigate("/")}
      />
    );
  }

  const modeLabel = mode === "READ" ? "읽기" : "필사";

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-10">
      {screen === "choose" && (
        <>
          <TopBar title="성경" onBack={() => navigate(-1)} />
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
            <p className="text-body-3 text-grey-7 mb-2">오늘 하실 신앙 생활은 무엇인가요?</p>
            <button
              type="button"
              onClick={() => openModeRoute("READ")}
              className="w-full h-16 rounded-2xl bg-primary text-white text-sub-tit-5 font-bold"
            >
              성경 읽기
            </button>
            <button
              type="button"
              onClick={() => openModeRoute("WRITE")}
              className="w-full h-16 rounded-2xl border border-bluegrey-3 text-grey-10 text-sub-tit-5 font-bold"
            >
              성경 필사
            </button>
          </div>
        </>
      )}

      {screen === "main" && (
        <>
          <TopBar title={`성경 ${modeLabel}`} onBack={() => setScreen("choose")} onMenu={() => setScreen("menu")} />
          {!progressLoaded ? (
            <div className="flex-1" />
          ) : mode === "READ" ? (
            <ReadMain
              book={book}
              chapter={chapter}
              fontSize={fontSize}
              onOpenBook={() => setSheet("book")}
              onOpenChapter={() => setSheet("chapter")}
              onFontSize={setFontSize}
              savedVerses={savedVerses}
              onToggleSave={toggleSaveVerse}
              completedChapters={completedChapters}
              setCompletedChapters={setCompletedChapters}
            />
          ) : (
            <WriteMain
              book={book}
              chapter={chapter}
              verse={verse}
              fontSize={fontSize}
              onOpenBook={() => setSheet("book")}
              onOpenChapter={() => setSheet("verse")}
              onOpenVerse={(n) => setVerse(n)}
              onFontSize={setFontSize}
              onCompleted={(v) =>
                setCompletedVerses((prev) =>
                  prev.some((p) => p.key === `${v.book}-${v.chapter}-${v.verse}`)
                    ? prev
                    : [
                        ...prev,
                        {
                          key: `${v.book}-${v.chapter}-${v.verse}`,
                          bookName: BOOK_MAP[v.book],
                          chapter: v.chapter,
                          num: v.verse,
                          text: v.text,
                        },
                      ],
                )
              }
            />
          )}
        </>
      )}

      {screen === "ranking" && (
        <>
          <TopBar title="랭킹" onBack={() => setScreen("main")} />
          <BibleRankingView
            neighbors={mode === "READ" ? READ_NEIGHBORS : WRITE_NEIGHBORS}
            monthly={mode === "READ" ? READ_MONTHLY : WRITE_MONTHLY}
            total={mode === "READ" ? READ_TOTAL : WRITE_TOTAL}
          />
        </>
      )}

      {screen === "verses" && (
        <>
          <TopBar title="내 구절" onBack={() => setScreen("main")} />
          <BibleVersesView
            mode={mode === "READ" ? "read" : "write"}
            items={mode === "READ" ? Object.values(savedVerses) : completedVerses}
            mockItems={mode === "READ" ? MOCK_SAVED_VERSES : []}
            onRemove={
              mode === "READ"
                ? (key) =>
                    setSavedVerses((prev) => {
                      const { [key]: _removed, ...rest } = prev;
                      return rest;
                    })
                : undefined
            }
            onSelect={(v) => {
              const abbr = BOOK_ABBREV[v.book] ?? BOOK_ABBREV[v.bookName] ?? book;
              setBook(abbr);
              setChapter(v.chapter);
              if (mode === "WRITE") setVerse(typeof v.num === "number" ? v.num : 1);
              setScreen("main");
            }}
          />
        </>
      )}

      {screen === "status" && (
        <>
          <TopBar title="내 현황" onBack={() => setScreen("main")} />
          <BibleStatusView
            mode={mode === "READ" ? "read" : "write"}
            bookProgress={mode === "READ" ? BOOK_PROGRESS_READ : BOOK_PROGRESS_WRITE}
            config={mode === "READ" ? READ_STATUS_CONFIG : WRITE_STATUS_CONFIG}
          />
        </>
      )}

      {screen === "menu" && (
        <>
          <TopBar title="메뉴" onBack={() => setScreen("main")} />
          <div className="flex-1 flex flex-col px-5 py-2">
            {[
              ["성경 읽기", () => openModeRoute("READ")],
              ["성경 필사", () => openModeRoute("WRITE")],
              ["랭킹", () => setScreen("ranking")],
              ["내 구절", () => setScreen("verses")],
              ["내 현황", () => setScreen("status")],
            ].map(([label, action]) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="py-4 border-b border-bluegrey-1 text-left text-body-3 font-semibold text-grey-10"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {sheet === "book" && <BookSheet current={book} onSelect={selectBook} onClose={() => setSheet(null)} />}
      {sheet === "chapter" && (
        <NumberSheet
          title="장 선택"
          count={chapters.length || 1}
          current={chapter}
          onSelect={selectChapter}
          onClose={() => setSheet(null)}
          labelSuffix="장"
        />
      )}
      {sheet === "verse" && (
        <NumberSheet
          title="절 선택"
          count={verses.length || 1}
          current={verse}
          onSelect={(n) => {
            setVerse(n);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
          labelSuffix="절"
        />
      )}
    </div>
  );
}
