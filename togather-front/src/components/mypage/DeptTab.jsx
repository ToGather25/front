import { useState } from "react";
import UserBlack from "@/assets/icon-svg/mypage-user-black.svg";
import { MOCK_DEPT, MOCK_GROUPS } from "./mockData";
import { ReadonlyField, ModalOverlay, IconBack } from "./shared";

export default function DeptTab() {
  const [deptChangeMode, setDeptChangeMode] = useState(false);
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-5">
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        {!deptChangeMode ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sub-tit-4 font-bold text-grey-11">부서 / 직책 정보</h2>
              <button
                onClick={() => setDeptChangeMode(true)}
                className="text-body-5 text-primary hover:underline"
              >
                변경 신청하기
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField
                  label="직분"
                  value={MOCK_DEPT.position}
                  note="사무실 문의로 변경 가능합니다."
                />
                <ReadonlyField label="소속 부서" value={MOCK_DEPT.department} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="직책" value={MOCK_DEPT.duty} />
                <ReadonlyField label="구역" value={MOCK_DEPT.district} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="소그룹 / 셀" value={MOCK_DEPT.group} />
                <ReadonlyField label="임직일" value={MOCK_DEPT.ordainedDate} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setDeptChangeMode(false)}
                className="text-grey-6 hover:text-grey-9 transition-colors"
              >
                <IconBack />
              </button>
              <h2 className="text-sub-tit-4 font-bold text-grey-11">부서 / 직책 변경 신청</h2>
            </div>
            <div className="space-y-4">
              <ReadonlyField
                label="직분"
                value={MOCK_DEPT.position}
                note="사무실 문의로 변경 가능합니다."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="직책" value={MOCK_DEPT.duty} />
                <ReadonlyField label="구역" value={MOCK_DEPT.district} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="소그룹 / 셀" value={MOCK_DEPT.group} />
                <ReadonlyField label="임직일" value={MOCK_DEPT.ordainedDate} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeptChangeMode(false)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setDeptChangeMode(false);
                  setModal("dept-change-done");
                }}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                신청하기
              </button>
            </div>
          </>
        )}
      </section>

      {!deptChangeMode && (
        <section className="bg-white border border-grey-3 rounded-2xl p-8">
          <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-5">참여 중인 부서 / 모임</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_GROUPS.map((g) => (
              <div key={g.id} className="border border-grey-3 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-grey-2 flex items-center justify-center shrink-0">
                  <img src={UserBlack} className="w-4 h-4" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-4 font-semibold text-grey-10">{g.name}</p>
                  <p className="text-body-5 text-grey-6 mt-0.5 leading-relaxed">{g.info}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {modal === "dept-change-done" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">신청이 접수되었습니다.</h3>
            <p className="text-body-5 text-grey-6 mb-8">
              검토 후 최종 처리 되며, 처리까지는 약 30일 정도 소요됩니다.
            </p>
            <button
              onClick={() => setModal(null)}
              className="bg-primary text-white rounded-full px-8 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
            >
              확인
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
