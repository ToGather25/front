import { useParams, useNavigate, Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getMemberDirectory } from "@/services/memberService";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import BubbleLoader from "@/components/common/BubbleLoader";
import GyojeokbuMemberDetail from "./GyojeokbuMemberDetail";

export default function GyojeokbuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { church } = useChurch();

  // 교인 한 명만 조회하는 API가 따로 없어, 목록을 다시 불러와 그 안에서 찾는다
  // (교적부 목록과 같은 /church/members 응답을 쓴다).
  const { data: members, loading } = useFetch(() => getMemberDirectory(), [church.id], []);

  if (!currentUser) {
    return (
      <LoginRequiredModal
        message="교적부를 이용하려면 로그인해 주세요."
        onCancel={() => navigate("/")}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center py-24">
        <BubbleLoader size="sm" />
      </div>
    );
  }

  const idx = members.findIndex((x) => x.id === id);
  const m = members[idx];

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
        index={idx}
        total={members.length}
        onBack={() => navigate("/교적부")}
        onPrev={idx > 0 ? () => navigate(`/교적부/${members[idx - 1].id}`) : null}
        onNext={idx < members.length - 1 ? () => navigate(`/교적부/${members[idx + 1].id}`) : null}
      />
    </div>
  );
}
