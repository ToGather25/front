import { createContext, useContext, useState, useEffect } from "react";
import defaultConfig from "@/config/church.config";
import { getTenant } from "@/services/tenantService";
import { setCurrentChurchId } from "@/services/api";

const ChurchContext = createContext(null);

/**
 * ChurchProvider
 *
 * /api/tenant를 호출해 테넌트(교회) 설정을 가져온다. 응답을 church.config.js(defaultConfig) 위에
 * 얕게 병합하므로, 백엔드가 일부 필드를 안 내려줘도 화면이 깨지지 않는다.
 * 단, nav(사이트 메뉴 구조)는 프론트 전용 라우팅 데이터라 병합 대상에서 제외하고 항상 defaultConfig를 쓴다.
 *
 * 조회가 실패해도(백엔드 미배포, 도메인 미등록 등) 에러 화면을 띄우지 않고 defaultConfig를 그대로
 * 유지한 채 "ready"로 전환한다 — 이 저장소는 배포 시 그 자체로 defaultConfig(알곡교회)의 프론트
 * 역할을 하므로, API가 없다는 이유로 화면이 안 보이면 안 된다. 개발자 확인용으로 console.warn만 남긴다.
 *
 * initialChurch: 테스트에서 커스텀 config를 주입할 때만 사용(실제 앱에서는 전달하지 않음) —
 * 주어지면 fetch 자체를 생략한다.
 */
export function ChurchProvider({ children, initialChurch }) {
  const [state, setState] = useState({
    church: initialChurch ?? defaultConfig,
    status: initialChurch ? "ready" : "loading",
  });

  useEffect(() => {
    if (initialChurch) return;
    const domain = import.meta.env.VITE_DEV_CHURCH_DOMAIN || window.location.hostname;
    getTenant(domain)
      .then((data) => {
        setCurrentChurchId(data.id);
        // nav는 이 리액트 앱 전용 라우팅 구조(레이블+경로)라 백엔드가 값을 줄 이유가 없는 필드다 —
        // 얕은 병합에 맡기면 백엔드가 내려주는 무관한 nav(예: 빈 배열)가 GNB 메뉴를 통째로 지워버린다.
        setState({
          church: { ...defaultConfig, ...data, nav: defaultConfig.nav },
          status: "ready",
        });
      })
      .catch((err) => {
        console.warn("[ChurchProvider] 테넌트 조회 실패 — 로컬 기본 설정으로 표시합니다.", err);
        setState({ church: defaultConfig, status: "ready" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ChurchContext.Provider value={state}>{children}</ChurchContext.Provider>;
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside ChurchProvider");
  return { church: ctx.church, loading: ctx.status === "loading" };
}
