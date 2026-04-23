import { Link } from "react-router";

export default function PageNotFound() {
  return (
    <div>
      <h2>404 ERROR</h2>
      <p>죄송합니다. 페이지를 찾을 수 없습니다.</p>
      <p>존재하지 않는 주소를 입력하셨거나,</p>
      <p>요청하신 페이지의 주소가 변경/삭제되어 찾을 수 없습니다.</p>
      <Link to="/" className="btn">
        홈
      </Link>
    </div>
  );
}