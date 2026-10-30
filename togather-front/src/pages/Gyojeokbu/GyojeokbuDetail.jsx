import { useParams, useNavigate, Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import MEMBERS from "@/config/members.config";
import GyojeokbuMemberDetail from "./GyojeokbuMemberDetail";

export default function GyojeokbuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="교적부를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  const idx = MEMBERS.findIndex((x) => x.id === id);
  const m = MEMBERS[idx];

  if (!m) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-body-2 text-grey-6">교인 정보를 찾을 수 없습니다.</p>
        <Link to="/교적부" className="text-blue-6 font-semibold hover:underline">
          교적부로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <GyojeokbuMemberDetail
        member={m}
        allMembers={MEMBERS}
        index={idx}
        total={MEMBERS.length}
        isAdmin={currentUser?.isAdmin}
        onBack={() => navigate("/교적부")}
        onPrev={idx > 0 ? () => navigate(`/교적부/${MEMBERS[idx - 1].id}`) : null}
        onNext={idx < MEMBERS.length - 1 ? () => navigate(`/교적부/${MEMBERS[idx + 1].id}`) : null}
        onSelectMember={(targetId) => navigate(`/교적부/${targetId}`)}
      />
    </div>
  );
}
