import { ChurchProvider, useChurch } from "@/contexts/ChurchContext";

/**
 * 관리자 편집 화면의 draft 값을 실제 공개 컴포넌트에 그대로 흘려보내 미리보기를 만든다.
 * ChurchProvider가 initialChurch를 받으면 fetch를 생략하고 그 값을 즉시 "ready" 상태로 쓰므로,
 * 새 프리뷰 템플릿을 따로 만들지 않고 공개 페이지 컴포넌트(Greeting, Vision 등)를 그대로 재사용한다.
 */
export default function SectionPreviewFrame({ overrides, children }) {
  const { church } = useChurch();
  return <ChurchProvider initialChurch={{ ...church, ...overrides }}>{children}</ChurchProvider>;
}
