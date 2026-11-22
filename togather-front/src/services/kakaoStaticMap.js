import api from "./api";

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 교회 주소의 카카오 정적 지도(Static Map) PNG를 data URL로 바꾼다 — PDF처럼 화면을
 * 그대로 캡처해야 하는 곳에서 쓴다. 평소 쓰는 동적 지도(KakaoMap)는 타일이
 * CORS 미허용 이미지라 html2canvas가 픽셀을 읽지 못해 빈 칸으로 찍힌다.
 *
 * 지오코딩과 카카오 REST API 키는 서버가 들고 있다(교회 settings.address 기준) — 프론트는
 * churchId만 넘긴다. 요청이 실패하면 null을 반환한다 — 호출부가 대체 UI(주소 텍스트 등)를
 * 보여줘야 한다.
 */
export async function fetchKakaoStaticMapDataUrl(churchId, { level = 3 } = {}) {
  if (!churchId) return null;

  try {
    const res = await api.get(`/churches/${churchId}/jubo/map-image`, {
      params: { level },
      responseType: "blob",
    });
    return await blobToDataUrl(res.data);
  } catch (error) {
    console.error("[kakaoStaticMap]", error);
    return null;
  }
}
