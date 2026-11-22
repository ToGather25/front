import api from "./api";

/**
 * 이미지 파일 업로드(관리자 공통) — 홈 배너/행사 대표 이미지/갤러리 사진 등에서 쓴다.
 * 백엔드에 아직 없는 엔드포인트(docs/backend-requests.md §4-2 참고) — 구현되기 전까지는
 * 실패한다(업로드 UI는 이 실패를 에러 메시지로 보여준다).
 * @param {File} file
 * @returns {Promise<string>} 업로드된 이미지의 공개 URL
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/church/admin/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.url;
}
