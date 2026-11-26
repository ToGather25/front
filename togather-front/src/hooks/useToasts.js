import { useState, useCallback, useRef } from "react";

/**
 * 짧은 비차단 피드백(토스트) 큐 — 여러 섹션을 연속으로 저장해도 각자 자기 토스트를
 * 띄우고 자동으로 사라진다(화면 고정 "저장됨" 문구 대신 쓴다).
 * @param {number} duration 자동으로 사라지기까지의 ms
 */
export function useToasts(duration = 2200) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const pushToast = useCallback(
    (message, tone = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration],
  );

  return { toasts, pushToast };
}
