import { useEffect, useRef, useState } from "react";

/**
 * 카카오맵 공통 컴포넌트
 *
 * 사전 조건: index.html에 다음 스크립트 포함 (libraries=services 필수)
 *   <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey={KEY}&autoload=false&libraries=services"></script>
 *
 * @param {string}  address   - 지도에 표시할 주소 (좌표 변환 + 마커 인포윈도우에 사용)
 * @param {number}  level     - 확대 수준 (기본 4, 낮을수록 확대)
 * @param {boolean} draggable - false이면 드래그/스크롤/더블클릭 비활성화 (기본 true)
 * @param {string}  className - 컨테이너 클래스
 */
export default function KakaoMap({ address, level = 4, draggable = true, className = "" }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    if (!window.kakao || !window.kakao.maps) {
      setError("카카오맵 SDK를 불러올 수 없습니다.");
      return;
    }

    window.kakao.maps.load(() => {
      try {
        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result, status) => {
          if (status !== window.kakao.maps.services.Status.OK) {
            setError("주소를 찾을 수 없습니다.");
            return;
          }

          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new window.kakao.maps.Map(containerRef.current, {
            center: coords,
            level,
            draggable,
            scrollwheel: draggable,
            disableDoubleClick: !draggable,
            disableDoubleClickZoom: !draggable,
          });

          // 마커
          const marker = new window.kakao.maps.Marker({ map, position: coords });

          // 인포윈도우 (주소 표시)
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 12px;font-size:13px;font-family:Pretendard,sans-serif;white-space:nowrap;">${address}</div>`,
          });
          infowindow.open(map, marker);

          // 지도 타입 컨트롤
          map.addControl(
            new window.kakao.maps.MapTypeControl(),
            window.kakao.maps.ControlPosition.TOPRIGHT
          );

          // 확대/축소 컨트롤
          map.addControl(
            new window.kakao.maps.ZoomControl(),
            window.kakao.maps.ControlPosition.RIGHT
          );
        });
      } catch (e) {
        setError("지도를 불러오는 중 오류가 발생했습니다.");
        console.error("[KakaoMap]", e);
      }
    });
  }, [address, level]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-bluegrey-1 rounded-xl text-body-4 text-grey-6 ${className}`}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
