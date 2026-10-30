import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import NumberedPagination from "@/components/common/NumberedPagination";
import MEMBERS from "@/config/members.config";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import { Avatar, RoleChip } from "./shared";

const PAGE_SIZE = 8;

/* ── Mobile card row ── */
function MemberCard({ m, searchQ, onClick }) {
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

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-bluegrey-1 text-left transition-colors active:bg-bluegrey-1"
    >
      <Avatar name={m.name} tone={m.avatarTone} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-body-3 font-semibold text-grey-12">{highlight(m.name)}</span>
          <RoleChip role={m.role} />
        </div>
        <div className="flex items-center gap-1.5 text-body-5 text-grey-5">
          <span>
            {m.region}
            {m.smallGroup ? ` · ${m.smallGroup}` : ""}
          </span>
          <span>·</span>
          <span className="font-mono">{highlight(m.phone)}</span>
        </div>
      </div>
      <svg
        className="w-4 h-4 text-grey-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

/* ── Table row ── */
function MemberRow({ m, isAlt, searchQ, onClick }) {
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

  const rowBg = isAlt ? "bg-bluegrey-2" : "bg-white";

  return (
    <tr
      onClick={onClick}
      className={`h-[87px] cursor-pointer border-b border-bluegrey-3 transition-colors [&>td]:align-middle ${rowBg} hover:bg-blue-1`}
    >
      <td className="pl-10 pr-4 text-body-2 font-semibold whitespace-nowrap text-grey-12">
        {highlight(m.name)}
      </td>
      <td className="px-4 whitespace-nowrap text-center">
        <RoleChip role={m.role} />
      </td>
      <td className="px-4 whitespace-nowrap">
        <span className="text-body-2 font-semibold text-grey-9">{m.region}</span>
        <span className="text-body-4 font-medium text-bluegrey-7 ml-2">{m.smallGroup || "-"}</span>
      </td>
      <td className="px-4 whitespace-nowrap">
        <span className="text-body-2 font-semibold text-grey-9">{m.birth}</span>
        <span className="text-body-4 font-medium text-bluegrey-7 ml-2">만 {m.age}세</span>
      </td>
      <td className="px-4 whitespace-nowrap text-body-2 font-semibold text-grey-9">{highlight(m.phone)}</td>
      <td className="px-4 whitespace-nowrap text-center text-body-4 font-medium text-bluegrey-7">{m.address}</td>
      <td className="pl-4 pr-10 text-body-3 font-semibold text-bluegrey-6">
        {m.family.length > 0 ? `${m.family.length}명` : "-"}
      </td>
    </tr>
  );
}

/* ── Main component ── */
const FILTER_DEFS = [
  { k: "전체", match: () => true },
  { k: "장로/권사", match: (m) => /장로|권사/.test(m.role) },
  { k: "안수집사", match: (m) => /안수집사/.test(m.role) },
  { k: "집사", match: (m) => /집사/.test(m.role) && !/안수집사/.test(m.role) },
  { k: "청년", match: (m) => /청년/.test(m.role) },
  { k: "1구역", match: (m) => m.region === "1구역" },
  { k: "2구역", match: (m) => m.region === "2구역" },
  { k: "3구역", match: (m) => m.region === "3구역" },
  { k: "5구역", match: (m) => m.region === "5구역" },
];

export default function Gyojeokbu({ onOpenMember }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  // 독립된 /교적부 라우트에서는 상세 페이지로 이동하고, 홈 화면 슬라이드 패널 등
  // 임베드된 맥락에서는 onOpenMember로 같은 패널 안에서 화면만 바꾼다.
  const openMember = onOpenMember ?? ((id) => navigate(`/교적부/${id}`));

  const matches = useMemo(() => {
    const norm = q.replace(/[^0-9]/g, "");
    const f = FILTER_DEFS.find((x) => x.k === filter);
    return MEMBERS.filter((m) => {
      if (f && !f.match(m)) return false;
      if (!q) return true;
      if (norm.length >= 3 && m.phone?.replace(/-/g, "").includes(norm)) return true;
      if (m.name.includes(q)) return true;
      if (m.region?.includes(q)) return true;
      if (m.smallGroup?.includes(q)) return true;
      return false;
    });
  }, [q, filter]);

  const pageItems = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="교적부를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-[1400px] mx-auto px-4 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
        {/* Page title */}
        <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.72px] text-black mb-8 md:mb-10">
          교적부
        </h1>

        {/* Filter + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex gap-2.5 flex-wrap">
            {FILTER_DEFS.map((f) => {
              return (
                <button
                  key={f.k}
                  onClick={() => {
                    setFilter(f.k);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-body-4 font-semibold whitespace-nowrap transition-colors ${
                    filter === f.k
                      ? "bg-primary text-white"
                      : "bg-bluegrey-2 text-bluegrey-9 hover:bg-blue-1 hover:text-blue-6"
                  }`}
                >
                  {f.k}
                </button>
              );
            })}
          </div>

          <div
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-bluegrey-2 border w-full md:w-[280px] shrink-0 transition-colors ${
              searchFocused ? "border-blue-6" : "border-transparent"
            }`}
          >
            <img src={IcoSearch} className="w-5 h-5 shrink-0" alt="" />
            <input
              type="text"
              placeholder="이름 또는 휴대폰 번호로 검색"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-body-4 text-grey-11 placeholder:text-bluegrey-9"
            />
            {q && (
              <button
                onClick={() => {
                  setQ("");
                  setPage(1);
                }}
                aria-label="검색어 지우기"
                className="w-5 h-5 rounded-full bg-bluegrey-7 text-white text-body-5 flex items-center justify-center shrink-0"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table (desktop) / Card list (mobile) */}
        <div>
          {matches.length === 0 ? (
            <div className="py-24 text-center border-y border-bluegrey-7">
              <div className="w-[72px] h-[72px] rounded-[18px] bg-blue-1 flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-blue-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
              <div className="text-sub-tit-3 font-bold text-grey-12 tracking-[-0.5px] mb-2">
                검색 결과가 없습니다
              </div>
              <div className="text-body-3 text-grey-5">
                이름 또는 휴대폰 번호 뒷자리를 다시 확인해 주세요.
              </div>
            </div>
          ) : (
            <>
              {/* 모바일: 카드 리스트 — 컬럼이 많은 테이블은 좁은 화면에서 텍스트가
                  세로로 깨져 읽을 수 없다 */}
              <div className="md:hidden border-y border-bluegrey-3">
                {pageItems.map((m) => (
                  <MemberCard
                    key={m.id}
                    m={m}
                    searchQ={q}
                    onClick={() => openMember(m.id)}
                  />
                ))}
              </div>

              {/* 데스크탑: 테이블 */}
              <div className="hidden md:block overflow-x-auto border-y border-bluegrey-7">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bluegrey-1">
                      {["이름", "직분", "구역/소그룹", "생년월일", "휴대폰", "주소", "가족"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`${i === 1 || i === 5 ? "text-center" : "text-left"} text-body-2 font-semibold text-bluegrey-8 tracking-[-1px] py-5 whitespace-nowrap ${
                              i === 0 ? "pl-10 pr-4" : i === 6 ? "pl-4 pr-10" : "px-4"
                            }`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((m, i) => (
                      <MemberRow
                        key={m.id}
                        m={m}
                        isAlt={i % 2 === 1}
                        searchQ={q}
                        onClick={() => openMember(m.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {matches.length > PAGE_SIZE && (
          <NumberedPagination
            total={matches.length}
            perPage={PAGE_SIZE}
            current={page}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
