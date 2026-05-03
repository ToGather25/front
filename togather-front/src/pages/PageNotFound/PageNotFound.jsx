import { Link } from "react-router";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-[120px] font-bold text-blue-2 leading-none select-none">404</p>
      <h2 className="text-sub-tit-2 font-bold text-grey-10 mt-4 mb-3">페이지를 찾을 수 없습니다</h2>
      <p className="text-body-3 text-grey-6 mb-1">존재하지 않는 주소를 입력하셨거나,</p>
      <p className="text-body-3 text-grey-6 mb-10">요청하신 페이지의 주소가 변경 또는 삭제되었습니다.</p>
      <Link
        to="/"
        className="px-8 py-3 bg-blue-7 text-white text-body-3 font-semibold rounded-lg hover:bg-blue-8 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}