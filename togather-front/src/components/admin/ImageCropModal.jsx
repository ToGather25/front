import { useEffect, useRef, useState } from "react";

/**
 * 업로드 전 간단한 크롭(위치 이동 + 확대) 모달 — 외부 크롭 라이브러리 없이 캔버스로
 * 직접 구현한다. 회전/필터 없이 "비율에 맞게 잘라낸다" 수준만 지원한다.
 *
 * 동작: 이미지를 항상 뷰포트(=목표 비율 박스) 전체를 덮도록(cover) 표시하고, 사용자는
 * 드래그로 위치를 옮기고 슬라이더로 확대할 수 있다 — 뷰포트 밖으로 빈 공간이 보이는
 * 일은 없도록 매번 offset을 클램프한다.
 */
export default function ImageCropModal({ file, aspect, onCancel, onConfirm }) {
  const probeRef = useRef(null); // 치수 측정 + 캔버스 소스로 쓰는 별도 Image (화면에 그리는 img와 분리)
  const viewportRef = useRef(null);
  const dragRef = useRef(null);

  const [objectUrl] = useState(() => URL.createObjectURL(file));
  const [natural, setNatural] = useState(null); // { width, height }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [confirming, setConfirming] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(objectUrl), [objectUrl]);

  // 화면에 보여주는 <img>는 로드되기 전까지 width/height가 0이라, 브라우저에 따라 디코딩
  // 자체를 미루기도 한다 — 그래서 치수 측정은 크기 제약이 없는 별도 Image 객체로 한다.
  // 이 객체를 그대로 캔버스 드로잉 소스로도 재사용해 "측정은 됐는데 화면 img는 아직 디코딩
  // 안 됨" 같은 타이밍 문제를 원천적으로 피한다.
  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      probeRef.current = probe;
      setNatural({ width: probe.naturalWidth, height: probe.naturalHeight });
    };
    probe.src = objectUrl;
    return () => {
      cancelled = true;
    };
  }, [objectUrl]);

  // 뷰포트(크롭 박스) 픽셀 크기 — 화면에 맞춰 한 번만 계산한다.
  const [viewport] = useState(() => {
    let width = Math.min(560, window.innerWidth - 64);
    let height = width / aspect;
    const maxHeight = window.innerHeight * 0.6;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspect;
    }
    return { width, height };
  });

  const baseScale = natural
    ? Math.max(viewport.width / natural.width, viewport.height / natural.height)
    : 1;
  const scale = baseScale * zoom;
  const imgW = natural ? natural.width * scale : 0;
  const imgH = natural ? natural.height * scale : 0;

  function clampOffset(pos, w, h) {
    const minX = Math.min(0, viewport.width - w);
    const minY = Math.min(0, viewport.height - h);
    return {
      x: Math.min(0, Math.max(minX, pos.x)),
      y: Math.min(0, Math.max(minY, pos.y)),
    };
  }

  // 로드 완료 직후 중앙 정렬, 확대 슬라이더 조작 시에도 빈 공간이 생기지 않게 재클램프.
  useEffect(() => {
    if (!natural) return;
    setOffset((prev) => {
      if (prev.x === 0 && prev.y === 0 && zoom === 1) {
        return { x: (viewport.width - imgW) / 2, y: (viewport.height - imgH) / 2 };
      }
      return clampOffset(prev, imgW, imgH);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural, zoom]);

  function handlePointerDown(e) {
    if (!natural) return;
    viewportRef.current?.setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  }

  function handlePointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(
        { x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy },
        imgW,
        imgH,
      ),
    );
  }

  function handlePointerUp(e) {
    if (viewportRef.current?.hasPointerCapture?.(e.pointerId)) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }

  function handleConfirm() {
    setConfirming(true);
    const outputWidth = Math.round(viewport.width * 2);
    const outputHeight = Math.round(outputWidth / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sWidth = viewport.width / scale;
    const sHeight = viewport.height / scale;
    ctx.drawImage(probeRef.current, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

    const outputType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
    canvas.toBlob(
      (blob) => {
        onConfirm(new File([blob], file.name, { type: outputType }));
      },
      outputType,
      0.92,
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,.6)" }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
        <h3 className="text-sub-tit-5 font-bold text-grey-11 self-start">이미지 위치 조정</h3>

        <div
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative overflow-hidden rounded-lg bg-grey-11 cursor-grab active:cursor-grabbing touch-none"
          style={{ width: viewport.width, height: viewport.height }}
        >
          <img
            src={objectUrl}
            alt=""
            data-testid="image-crop-source"
            draggable={false}
            className="absolute select-none max-w-none"
            style={{ left: offset.x, top: offset.y, width: imgW, height: imgH }}
          />
        </div>

        <div className="w-full flex items-center gap-3">
          <span className="text-body-5 text-grey-5 shrink-0">확대</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>

        <div className="flex gap-3 justify-end w-full mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-grey-3 text-body-4 text-grey-7 hover:bg-grey-1 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!natural || confirming}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
