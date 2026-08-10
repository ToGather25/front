import { useState, useRef } from "react";
import ImgUpload from "@/assets/icon-svg/mypage-img-upload.svg";
import { MOCK_USER } from "./mockData";
import { ReadonlyField, InputField, ModalOverlay } from "./shared";

function IconUpload() {
  return <img src={ImgUpload} className="w-4 h-4" alt="" />;
}

export default function InfoTab({ onNavigateDept }) {
  const [modal, setModal] = useState(null);
  const [userForm, setUserForm] = useState({
    name: MOCK_USER.name,
    phone: MOCK_USER.phone,
    email: MOCK_USER.email,
    address: MOCK_USER.address,
    currentPw: "",
    newPw: "",
  });
  const fileInputRef = useRef(null);

  function resetInfo() {
    setUserForm({
      name: MOCK_USER.name,
      phone: MOCK_USER.phone,
      email: MOCK_USER.email,
      address: MOCK_USER.address,
      currentPw: "",
      newPw: "",
    });
  }

  return (
    <div className="space-y-5">
      {/* 내 프로필 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sub-tit-4 font-bold text-grey-11">내 프로필</h2>
          <button
            onClick={() => setModal("withdraw-confirm")}
            className="text-body-5 text-grey-6 border border-grey-4 rounded-full px-4 py-1.5 hover:bg-grey-2 transition-colors"
          >
            회원 탈퇴
          </button>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-grey-5 flex items-center justify-center text-headline-5 font-bold text-white shrink-0">
            {MOCK_USER.name[0]}
          </div>
          <div>
            <p className="text-body-3 font-bold text-grey-10 mb-1">{MOCK_USER.name}</p>
            <p className="text-body-5 text-grey-6 mb-3">
              JPG · PNG · 5MB 이하의 정사각형 이미지를 권장합니다.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-primary text-white text-body-5 rounded-lg px-4 py-2 hover:bg-blue-8 transition-colors"
            >
              <IconUpload />
              이미지 업로드
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          </div>
        </div>
      </section>

      {/* 기본 정보 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">기본 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="이름"
              value={userForm.name}
              onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
            />
            <ReadonlyField
              label="생년월일"
              value={MOCK_USER.birthdate}
              note="생년월일은 문의로 변경 가능합니다."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="휴대폰"
              value={userForm.phone}
              onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <InputField
              label="이메일"
              value={userForm.email}
              onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <InputField
            label="주소"
            value={userForm.address}
            onChange={(e) => setUserForm((f) => ({ ...f, address: e.target.value }))}
          />
        </div>
      </section>

      {/* 교적 정보 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">교적 정보</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadonlyField label="등록일" value={MOCK_USER.registeredDate} />
            <ReadonlyField label="세례일" value={MOCK_USER.baptismDate} />
          </div>
          <p className="text-body-5 text-grey-7">
            ※ 부서 · 직책 정보는 좌측{" "}
            <button onClick={onNavigateDept} className="font-semibold text-grey-9 underline">
              부서 / 직책
            </button>{" "}
            메뉴에서 확인하실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 보안 */}
      <section className="bg-white border border-grey-3 rounded-2xl p-8">
        <h2 className="text-sub-tit-4 font-bold text-grey-11 mb-6">보안</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="현재 비밀번호"
            type="password"
            value={userForm.currentPw}
            onChange={(e) => setUserForm((f) => ({ ...f, currentPw: e.target.value }))}
            placeholder="••••••••"
          />
          <InputField
            label="새 비밀번호"
            type="password"
            value={userForm.newPw}
            onChange={(e) => setUserForm((f) => ({ ...f, newPw: e.target.value }))}
            placeholder="8자 이상"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          onClick={resetInfo}
          className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
        >
          취소
        </button>
        <button className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors">
          저장하기
        </button>
      </div>

      {modal === "withdraw-confirm" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              회원 탈퇴를 진행하시겠습니까?
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              탈퇴를 진행하면 계정 정보가 삭제되며, 일부 데이터는 복구할 수 없습니다.
              <br />
              탈퇴 신청 후 관리자의 검토를 거쳐 최종 처리됩니다.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModal(null)}
                className="border border-grey-4 text-grey-8 rounded-full px-6 py-2.5 text-body-4 hover:bg-grey-1 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setModal("withdraw-done")}
                className="bg-primary text-white rounded-full px-6 py-2.5 text-body-4 hover:bg-blue-8 transition-colors"
              >
                탈퇴 신청
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {modal === "withdraw-done" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="text-center pt-2">
            <h3 className="text-sub-tit-4 font-bold text-grey-11 mb-3">
              탈퇴 신청이 접수되었습니다.
            </h3>
            <p className="text-body-5 text-grey-6 leading-relaxed mb-8">
              검토 완료 후 탈퇴가 최종 처리되며, 처리까지는 약 30일 정도 소요됩니다.
              <br />
              처리 전까지 서비스 이용이 제한될 수 있습니다.
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
