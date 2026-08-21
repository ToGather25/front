import { useState, useEffect } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getMembers, getMemberDetail } from "@/services/memberService";
import PrevNextPagination from "@/components/common/PrevNextPagination";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const DUMMY_PENDING = [
  {
    id: 101,
    name: "홍길동",
    birthdate: "1990.05.12",
    phone: "010-1111-2222",
    appliedAt: "2026.07.08",
  },
  {
    id: 102,
    name: "김새신",
    birthdate: "1998.11.30",
    phone: "010-3333-4444",
    appliedAt: "2026.07.09",
  },
  {
    id: 103,
    name: "이방문",
    birthdate: "2001.03.22",
    phone: "010-5555-6666",
    appliedAt: "2026.07.10",
  },
];

const EMPTY_PAGE = { page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false, hasPrevious: false };

function toDate(iso) {
  return iso ? iso.slice(0, 10) : "-";
}

function MemberDetailModal({ detail, loading, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <p className="text-body-3 text-grey-6 text-center py-8">불러오는 중...</p>
        ) : !detail ? (
          <p className="text-body-3 text-grey-6 text-center py-8">정보를 찾을 수 없습니다.</p>
        ) : (
          <>
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-6">{detail.name}</h3>
            <div className="flex flex-col gap-3 text-body-4">
              <div className="flex justify-between">
                <span className="text-grey-6">생년월일</span>
                <span className="text-grey-10 font-mono">{detail.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">연락처</span>
                <span className="text-grey-10 font-mono">{detail.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">등록일</span>
                <span className="text-grey-10 font-mono">{toDate(detail.registeredAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">신규 여부</span>
                <span className="text-grey-10">{detail.newcomer ? "새가족" : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-6">계정 연동</span>
                <span className="text-grey-10">{detail.hasAccount ? "연동됨" : "미연동"}</span>
              </div>
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default function MembersManage() {
  const { church } = useChurch();
  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pendingList, setPendingList] = useState(DUMMY_PENDING);
  const [approvingId, setApprovingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: { members, pageInfo } = { members: [], pageInfo: EMPTY_PAGE },
    loading,
  } = useFetch(
    () => getMembers(church.id, { keyword, page }),
    [church.id, keyword, page],
    { members: [], pageInfo: EMPTY_PAGE },
  );

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getMemberDetail(church.id, detailId).then((d) => {
      if (!cancelled) {
        setDetail(d);
        setDetailLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [church.id, detailId]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    // TODO: PATCH /api/admin/members/:id/approve → 승인 처리 + 알림톡 발송
    await new Promise((r) => setTimeout(r, 700));
    setPendingList((prev) => prev.filter((p) => p.id !== id));
    setApprovingId(null);
  };

  const tabCls = (tab) =>
    `px-5 py-2.5 text-body-3 font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-grey-6 hover:text-grey-9"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">교인 관리</h1>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-grey-2 mb-5">
        <button className={tabCls("active")} onClick={() => setActiveTab("active")}>
          교인 목록
          <span className="ml-1.5 text-body-5 text-grey-5">({pageInfo.totalElements})</span>
        </button>
        <button className={tabCls("pending")} onClick={() => setActiveTab("pending")}>
          승인 대기
          {pendingList.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold">
              {pendingList.length}
            </span>
          )}
        </button>
      </div>

      {/* ── 교인 목록 탭 ── */}
      {activeTab === "active" && (
        <>
          <div className="bg-white rounded-2xl border border-grey-2 p-4 mb-4 flex items-center gap-3">
            <div className="relative">
              <input
                className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
                placeholder="이름 / 연락처 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <img
                src={IcoSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                alt=""
              />
            </div>
            <span className="ml-auto text-body-5 text-grey-5">총 {pageInfo.totalElements}명</span>
          </div>

          <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2">
                  <th className="text-center px-2 py-3 w-12">No</th>
                  <th className="text-left px-4 py-3">이름</th>
                  <th className="text-left px-4 py-3">생년월일</th>
                  <th className="text-left px-4 py-3">연락처</th>
                  <th className="text-left px-4 py-3">등록일</th>
                  <th className="text-center px-4 py-3">신규</th>
                  <th className="text-center px-4 py-3 w-20">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-grey-5 text-body-3">
                      불러오는 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-grey-5 text-body-3">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`hover:bg-grey-1 transition-colors ${i < members.length - 1 ? "border-b border-grey-2" : ""}`}
                    >
                      <td className="text-body-5 text-grey-5 text-center px-2 py-3.5">
                        {(page - 1) * pageInfo.size + i + 1}
                      </td>
                      <td className="text-body-4 font-semibold text-grey-10 px-4 py-3.5">
                        {m.name}
                      </td>
                      <td className="text-body-5 text-grey-7 font-mono px-4 py-3.5">
                        {m.birthDate}
                      </td>
                      <td className="text-body-5 text-grey-6 font-mono px-4 py-3.5">{m.phone}</td>
                      <td className="text-body-5 text-grey-5 font-mono px-4 py-3.5">
                        {toDate(m.registeredAt)}
                      </td>
                      <td className="text-center px-4 py-3.5">
                        {m.newcomer && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-body-5 font-semibold bg-[#e0f5eb] text-[#008848]">
                            새가족
                          </span>
                        )}
                      </td>
                      <td className="text-center px-4 py-3.5">
                        <button
                          onClick={() => setDetailId(m.id)}
                          className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors"
                        >
                          상세
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pageInfo.totalPages > 1 && (
            <PrevNextPagination page={page} hasNext={pageInfo.hasNext} onChange={setPage} />
          )}
        </>
      )}

      {/* ── 승인 대기 탭 ── */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
          <div
            className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
            style={{ gridTemplateColumns: "48px 100px 120px 150px 120px 110px" }}
          >
            <span className="text-center">No</span>
            <span>이름</span>
            <span>생년월일</span>
            <span>휴대폰</span>
            <span>신청일</span>
            <span className="text-center">처리</span>
          </div>
          {pendingList.length === 0 ? (
            <div className="py-16 text-center text-grey-5 text-body-3">
              대기 중인 가입 신청이 없습니다.
            </div>
          ) : (
            pendingList.map((p, i) => (
              <div
                key={p.id}
                className={`grid items-center px-6 py-4 hover:bg-grey-1 transition-colors ${i < pendingList.length - 1 ? "border-b border-grey-2" : ""}`}
                style={{ gridTemplateColumns: "48px 100px 120px 150px 120px 110px" }}
              >
                <span className="text-body-5 text-grey-5 text-center">{i + 1}</span>
                <span className="text-body-4 font-semibold text-grey-10">{p.name}</span>
                <span className="text-body-5 text-grey-7">{p.birthdate}</span>
                <span className="text-body-5 text-grey-6">{p.phone}</span>
                <span className="text-body-5 text-grey-5">{p.appliedAt}</span>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={approvingId === p.id}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-body-5 font-semibold hover:bg-blue-8 disabled:bg-blue-3 transition-colors"
                  >
                    {approvingId === p.id ? "처리 중..." : "승인"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {detailId && (
        <MemberDetailModal
          detail={detail}
          loading={detailLoading}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
