import { createContext, useContext, useState, useEffect } from "react";
import defaultConfig from "@/config/church.config";
import { getTenant } from "@/services/tenantService";
import { getChurchIntro, INTRO_SECTION_TO_CONFIG_KEY } from "@/services/churchIntroService";
import { getWorshipSchedule } from "@/services/worshipScheduleService";
import { getChurchProfile } from "@/services/churchProfileService";
import { setCurrentChurchId } from "@/services/api";

const ChurchContext = createContext(null);

/** null/undefined 값은 병합에서 제외한다 — 백엔드 미설정 필드가 기본값을 덮어쓰면 안 된다. */
function definedOnly(obj) {
  return Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v != null));
}

/**
 * 교회소개 섹션 응답(TYPE → JSON)을 church 객체 키로 변환한다.
 * 백엔드는 프론트 shape 그대로 저장하므로 값은 변환 없이 그대로 쓴다.
 */
function introToChurchFields(intro) {
  const out = {};
  for (const [type, key] of Object.entries(INTRO_SECTION_TO_CONFIG_KEY)) {
    if (intro?.[type] != null) out[key] = intro[type];
  }
  return out;
}

/** 실패한 조회는 조용히 건너뛴다 — 기본 설정으로 계속 보여준다. */
function valueOf(settled, label) {
  if (settled.status === "fulfilled") return settled.value;
  console.warn(`[ChurchProvider] ${label} 조회 실패 — 기본 설정을 사용합니다.`, settled.reason);
  return null;
}

/**
 * ChurchProvider
 *
 * 부팅 시 교회 데이터를 서버에서 받아 church.config.js(defaultConfig) 위에 얹는다.
 *   1) /api/tenant            — 테넌트 식별(id) + 교회 기본 정보
 *   2) /intro, /worship-schedule, /church/profile — 교회별 콘텐츠(병렬)
 *
 * 병합 결과는 useChurch()를 쓰는 모든 화면에 그대로 반영되므로, 각 컴포넌트는
 * 여전히 church.greeting / church.worshipSchedule / church.social.instagram 만 읽으면 된다.
 *
 * 어느 단계가 실패해도 에러 화면을 띄우지 않고 defaultConfig를 유지한 채 "ready"로 전환한다 —
 * 이 저장소는 배포 시 그 자체로 defaultConfig(옥길교회)의 프론트 역할을 하므로, API가 없다는
 * 이유로 화면이 안 보이면 안 된다. 개발자 확인용으로 console.warn만 남긴다.
 * nav(사이트 메뉴 구조)는 프론트 전용 라우팅 데이터라 항상 defaultConfig를 쓴다.
 *
 * initialChurch: 테스트에서 커스텀 config를 주입할 때만 사용(주어지면 fetch 자체를 생략한다).
 */
export function ChurchProvider({ children, initialChurch }) {
  const [state, setState] = useState({
    church: initialChurch ?? defaultConfig,
    status: initialChurch ? "ready" : "loading",
  });

  useEffect(() => {
    if (initialChurch) return;
    let cancelled = false;

    async function load() {
      let church = defaultConfig;

      // 1) 테넌트 — 이후 요청의 X-Church-Id를 정하므로 먼저 단독으로 조회한다.
      try {
        const tenant = await getTenant(
          import.meta.env.VITE_DEV_CHURCH_DOMAIN || window.location.hostname,
        );
        setCurrentChurchId(tenant.id);
        church = { ...church, ...definedOnly(tenant) };
      } catch (err) {
        console.warn("[ChurchProvider] 테넌트 조회 실패 — 로컬 기본 설정으로 표시합니다.", err);
      }

      // 2) 교회별 콘텐츠 — 하나가 실패해도 나머지는 반영한다.
      const [intro, schedule, profile] = await Promise.allSettled([
        getChurchIntro(church.id),
        getWorshipSchedule(),
        getChurchProfile(church.id),
      ]);

      church = { ...church, ...introToChurchFields(valueOf(intro, "교회소개 콘텐츠")) };

      const worshipSchedule = valueOf(schedule, "예배 시간표");
      if (worshipSchedule?.regular?.length) church = { ...church, worshipSchedule };

      // 인스타그램은 교회 프로필(관리자 설정)에서 온다 — 미설정이면 기본값(보통 null)을 유지한다.
      const instagram = valueOf(profile, "교회 프로필")?.instagramUrl;
      if (instagram) church = { ...church, social: { ...church.social, instagram } };

      if (!cancelled) setState({ church: { ...church, nav: defaultConfig.nav }, status: "ready" });
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ChurchContext.Provider value={state}>{children}</ChurchContext.Provider>;
}

export function useChurch() {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error("useChurch must be used inside ChurchProvider");
  return { church: ctx.church, loading: ctx.status === "loading" };
}
