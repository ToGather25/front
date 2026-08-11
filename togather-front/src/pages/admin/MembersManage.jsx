import { useState } from "react";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";
import MEMBERS from "@/config/members.config";

const DEPARTMENTS = ["전체", ...new Set(MEMBERS.map((m) => m.department))];
const POSITIONS = ["전체", ...new Set(MEMBERS.map((m) => m.role))];

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

export default function MembersManage() {
  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
  const [dept, setDept] = useState("전체");
  const [position, setPosition] = useState("전체");
  const [search, setSearch] = useState("");
  const [pendingList, setPendingList] = useState(DUMMY_PENDING);
  const [approvingId, setApprovingId] = useState(null);

  const matchesPosition = (m) => {
    if (position === "전체") return true;
    if (position === "집사") return m.role.includes("집사") && !m.role.includes("안수집사");
    return m.role.includes(position);
  };

  const filtered = MEMBERS.filter((m) => dept === "전체" || m.department === dept)
    .filter(matchesPosition)
    .filter(
      (m) => m.name.includes(search) || m.email?.includes(search) || m.phone.includes(search),
    );

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
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-grey-3 text-body-4 font-medium text-grey-7 hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            엑셀 다운로드
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors flex items-center gap-2">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            교인 등록
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-grey-2 mb-5">
        <button className={tabCls("active")} onClick={() => setActiveTab("active")}>
          교인 목록
          <span className="ml-1.5 text-body-5 text-grey-5">({MEMBERS.length})</span>
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
          <div className="bg-white rounded-2xl border border-grey-2 p-4 mb-4 flex flex-wrap items-center gap-3">
            <div>
              <label className="text-body-5 font-semibold text-grey-6 mr-2">부서</label>
              <select
                className="border border-grey-3 rounded-xl px-3 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary bg-white"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-body-5 font-semibold text-grey-6 mr-2">직책</label>
              <select
                className="border border-grey-3 rounded-xl px-3 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary bg-white"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {POSITIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto relative">
              <input
                className="border border-grey-3 rounded-xl pl-9 pr-4 py-2 text-body-4 text-grey-9 focus:outline-none focus:border-primary w-64"
                placeholder="이름 / 연락처 / 이메일 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <img
                src={IcoSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                alt=""
              />
            </div>
            <span className="text-body-5 text-grey-5">총 {filtered.length}명</span>
          </div>

          <div className="bg-white rounded-2xl border border-grey-2 overflow-hidden">
            <div
              className="grid text-body-5 font-semibold text-grey-7 bg-grey-1 border-b border-grey-2 px-6 py-3"
              style={{ gridTemplateColumns: "48px 80px 80px 80px 140px 1fr 110px 100px" }}
            >
              <span className="text-center">No</span>
              <span>이름</span>
              <span>부서</span>
              <span>직책</span>
              <span>연락처</span>
              <span>이메일</span>
              <span>등록일</span>
              <span className="text-center">관리</span>
            </div>
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-grey-5 text-body-3">검색 결과가 없습니다.</div>
            ) : (
              filtered.map((m, i) => (
                <div
                  key={m.id}
                  className={`grid items-center px-6 py-3.5 hover:bg-grey-1 transition-colors ${i < filtered.length - 1 ? "border-b border-grey-2" : ""}`}
                  style={{ gridTemplateColumns: "48px 80px 80px 80px 140px 1fr 110px 100px" }}
                >
                  <span className="text-body-5 text-grey-5 text-center">{i + 1}</span>
                  <span className="text-body-4 font-semibold text-grey-10">{m.name}</span>
                  <span className="text-body-5 text-grey-7">{m.department}</span>
                  <span className="text-body-5 text-grey-7">{m.role}</span>
                  <span className="text-body-5 text-grey-6">{m.phone}</span>
                  <span className="text-body-5 text-grey-6 truncate">{m.email}</span>
                  <span className="text-body-5 text-grey-5">{m.registered}</span>
                  <div className="flex gap-1.5 justify-center">
                    <button className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-primary hover:text-primary transition-colors">
                      상세
                    </button>
                    <button className="px-2.5 py-1 rounded-lg border border-grey-3 text-body-5 text-grey-7 hover:border-red-400 hover:text-red-500 transition-colors">
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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
    </div>
  );
}
