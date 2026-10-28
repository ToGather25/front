function waitForKakaoSdk() {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps) {
      reject(new Error("카카오맵 SDK를 불러올 수 없습니다."));
      return;
    }
    window.kakao.maps.load(resolve);
  });
}

function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
        reject(new Error("주소를 찾을 수 없습니다."));
        return;
      }
      resolve({ x: result[0].x, y: result[0].y });
    });
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 주소를 카카오 정적 지도(Static Map) PNG의 data URL로 바꾼다 — PDF처럼 화면을
 * 그대로 캡처해야 하는 곳에서 쓴다. 평소 쓰는 동적 지도(KakaoMap)는 타일이
 * CORS 미허용 이미지라 html2canvas가 픽셀을 읽지 못해 빈 칸으로 찍힌다.
 *
 * REST API 키(VITE_KAKAO_REST_KEY, JS SDK appkey와는 별개)가 없거나 지오코딩/
 * 요청이 실패하면 null을 반환한다 — 호출부가 대체 UI(주소 텍스트 등)를 보여줘야 한다.
 */
export async function fetchKakaoStaticMapDataUrl(address, { width = 600, height = 400, level = 3 } = {}) {
  const restKey = import.meta.env.VITE_KAKAO_REST_KEY;
  if (!restKey || !address) return null;

  try {
    await waitForKakaoSdk();
    const { x, y } = await geocodeAddress(address);
    const params = new URLSearchParams({
      center: `${x},${y}`,
      size: `${width}x${height}`,
      level: String(level),
      markers: `location:${x},${y}|option:false`,
    });
    const res = await fetch(`https://dapi.kakao.com/v2/maps/staticmap?${params.toString()}`, {
      headers: { Authorization: `KakaoAK ${restKey}` },
    });
    if (!res.ok) return null;
    return await blobToDataUrl(await res.blob());
  } catch (error) {
    console.error("[kakaoStaticMap]", error);
    return null;
  }
}
