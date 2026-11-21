import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * iframe에 독립된 document를 만들어 그 안에 자식을 렌더링한다. md: 같은 Tailwind 매체 쿼리는
 * 부모 창 너비가 아니라 "이 iframe 자신의" 너비를 기준으로 평가되므로, 같은 화면에서 데스크톱
 * 폭과 모바일 폭을 동시에 띄워도 각각 실제 기기에서 보이는 반응형 레이아웃 그대로 나온다.
 * (일반 div로 폭만 좁히면 md: 조건은 여전히 부모 창 기준으로 참이라 모바일 박스가 데스크톱
 * 레이아웃이 눌린 모양으로 보인다 — 그래서 iframe이 필요하다.)
 */
export default function DevicePreviewFrame({ width, height, children }) {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    // about:blank은 iframe 엘리먼트가 DOM에 붙는 순간 동기적으로 이미 로드되어 있어서
    // "load" 이벤트 리스너를 붙이기 전에 이미 발생해버린다 — 그래서 바로 접근한다.
    const doc = iframeRef.current.contentDocument;
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });
    const root = doc.createElement("div");
    doc.body.appendChild(root);
    setMountNode(root);
  }, []);

  return (
    <iframe ref={iframeRef} src="about:blank" title="미리보기" width={width} height={height} className="border-0">
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}
