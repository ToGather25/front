import { useEffect, useRef, useState } from "react";

/**
 * 운행 경로가 표시되는 카카오맵 컴포넌트
 *
 * @param {string} address  - 교회 주소 (목적지 마커)
 * @param {number} level    - 확대 수준
 * @param {Array}  routes   - [{ name, color, waypoints: [{lat, lng, label}] }]
 * @param {string} className
 */
export default function KakaoMapRoute({ address, level = 5, routes = [], className = "" }) {
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

          const churchCoords = new window.kakao.maps.LatLng(
            parseFloat(result[0].y),
            parseFloat(result[0].x)
          );

          const map = new window.kakao.maps.Map(containerRef.current, {
            center: churchCoords,
            level,
          });

          map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);

          // 교회 목적지 마커
          new window.kakao.maps.Marker({
            map,
            position: churchCoords,
            title: "교회",
          });
          new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px 10px;font-size:12px;font-family:Pretendard,sans-serif;white-space:nowrap;font-weight:600;">교회 (도착)</div>`,
          }).open(map, new window.kakao.maps.Marker({ map: null, position: churchCoords }));

          // 경로가 있는 코스만 처리
          const bounds = new window.kakao.maps.LatLngBounds();
          bounds.extend(churchCoords);
          let hasAnyRoute = false;

          routes.forEach(({ name, color, waypoints }) => {
            if (!waypoints || waypoints.length === 0) return;
            hasAnyRoute = true;

            const path = [
              ...waypoints.map(({ lat, lng }) => new window.kakao.maps.LatLng(lat, lng)),
              churchCoords,
            ];

            // 경로 선
            new window.kakao.maps.Polyline({
              map,
              path,
              strokeWeight: 4,
              strokeColor: color,
              strokeOpacity: 0.85,
              strokeStyle: "solid",
            });

            // 경유지 마커
            waypoints.forEach(({ lat, lng, label }, i) => {
              const pos = new window.kakao.maps.LatLng(lat, lng);
              bounds.extend(pos);

              const markerImg = new window.kakao.maps.MarkerImage(
                `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34">
                    <path fill="${color}" d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 20 14 20S28 23.625 28 14C28 6.268 21.732 0 14 0z"/>
                    <text x="14" y="18" text-anchor="middle" fill="white" font-size="11" font-family="Pretendard,sans-serif" font-weight="700">${i + 1}</text>
                  </svg>`
                )}`,
                new window.kakao.maps.Size(28, 34),
                { offset: new window.kakao.maps.Point(14, 34) }
              );

              const marker = new window.kakao.maps.Marker({ map, position: pos, image: markerImg });

              if (label) {
                new window.kakao.maps.InfoWindow({
                  content: `<div style="padding:4px 8px;font-size:11px;font-family:Pretendard,sans-serif;white-space:nowrap;color:${color};font-weight:600;">${label}</div>`,
                  disableAutoPan: true,
                }).open(map, marker);
              }
            });
          });

          if (hasAnyRoute) {
            map.setBounds(bounds);
          }
        });
      } catch (e) {
        setError("지도를 불러오는 중 오류가 발생했습니다.");
        console.error("[KakaoMapRoute]", e);
      }
    });
  }, [address, level, routes]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-bluegrey-1 rounded-xl text-[13px] text-grey-6 ${className}`}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
