import { createContext, useContext, useState, useEffect } from "react";
import defaultConfig from "@/config/church.config";

const ChurchContext = createContext(null);

/**
 * ChurchProvider
 *
 * SaaS 멀티테넌트 지원:
 * - 현재: 로컬 config 파일 사용 (개발/더미)
 * - 운영: 서브도메인 기반 API 호출로 교체
 *
 * 교체 시 fetchChurchConfig() 내부만 수정하면 됩니다.
 *
 * initialChurch: 테스트에서 커스텀 config를 주입할 때만 사용 (실제 앱에서는 전달하지 않음).
 */
export function ChurchProvider({ children, initialChurch }) {
  const [church, setChurch] = useState(initialChurch ?? defaultConfig); // oxlint-disable-line no-unused-vars -- TODO 구현 시 사용
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: 운영 환경에서 서브도메인/도메인 기반으로 교체
    // const domain = window.location.hostname;
    // fetchChurchByDomain(domain).then(setChurch).finally(() => setLoading(false));
    setLoading(false);
  }, []);

  return <ChurchContext.Provider value={{ church, loading }}>{children}</ChurchContext.Provider>;
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside ChurchProvider");
  return ctx;
}
