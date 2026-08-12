import { createContext, useContext, useState, useEffect } from "react";
import defaultConfig from "@/config/church.config";
import { getTenant } from "@/services/tenantService";
import { setCurrentChurchId } from "@/services/api";

const ChurchContext = createContext(null);

function TenantErrorScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-1 px-6">
      <p className="text-body-2 text-grey-8">교회 정보를 찾을 수 없습니다.</p>
    </div>
  );
}

/**
 * ChurchProvider
 *
 * /api/tenant를 호출해 테넌트(교회) 설정을 가져온다. 응답을 church.config.js(defaultConfig) 위에
 * 얕게 병합하므로, 백엔드가 일부 필드를 안 내려줘도 화면이 깨지지 않는다.
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
        setState({ church: { ...defaultConfig, ...data }, status: "ready" });
      })
      .catch(() => setState((s) => ({ ...s, status: "error" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChurchContext.Provider value={state}>
      {state.status === "error" ? <TenantErrorScreen /> : children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside ChurchProvider");
  return { church: ctx.church, loading: ctx.status === "loading" };
}
