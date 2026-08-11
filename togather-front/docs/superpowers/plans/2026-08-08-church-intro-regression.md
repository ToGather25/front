# 교회소개(Church) 컴포넌트 분리 + 회귀 테스트 + 연락처 노출 gap 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/pages/Church/Church.jsx`(786줄, 8개 탭 섹션이 비-export 로컬 함수로 내장)를 `src/components/church/` 아래 개별 컴포넌트로 분리하고, 각각에 회귀 테스트를 붙이고, 명세서 gap(섬기는 사람들 연락처 노출)을 TDD로 수정한다.

**Architecture:** `Church.jsx`는 탭 상태(`useSearchParams`)와 `TAB_CONTENT` 매핑만 담당하는 얇은 셸로 남는다. 8개 섹션(Greeting, Vision, WorshipInfo, Staff, History, FloorGuide, Direction, TransportGuide)은 각자 `useChurch()`로 데이터를 직접 구독하는 독립 컴포넌트로 `src/components/church/`에 위치한다. 공용으로 쓰이는 `FallbackImage`도 별도 파일로 분리한다.

**Tech Stack:** React 19, Vitest(jsdom) + `@testing-library/react` + `@testing-library/user-event` + `jest-dom`, `react-router` v7 (`MemoryRouter`), 기존 `ChurchProvider`/`church.config.js`(로컬 목업 데이터, API 아님).

## Global Constraints

- 회원가입/로그인 등 다른 도메인, 지도 API 교체(구글맵), 교구버스 안내 신규 기능은 이번 계획 범위 밖이다 (스펙 "비목표" 참조).
- 카카오맵(`KakaoMap`, `KakaoMapRoute`) 컴포넌트는 수정하지 않는다. jsdom 테스트 환경에서는 `window.kakao`가 없어 두 컴포넌트 모두 즉시 에러 상태로 빠지며 크래시하지 않는다(내부에 이미 `if (!window.kakao...) setError(...)` 가드가 있음) — 별도 목킹 불필요.
- 테스트는 각 컴포넌트 파일과 co-located(`Xxx.jsx` 옆 `Xxx.test.jsx`)로 작성한다.
- 새 컴포넌트 파일은 원본 JSX/Tailwind 클래스를 그대로 유지한다(로직·스타일 변경 없음) — 예외: Task 4(History)에서 아이콘 전용 버튼에 `aria-label`을 추가하는 것과 Task 9(Staff)에서 연락처 노출을 제거하는 것, 이 두 가지만 의도된 동작 변경이다.
- `describe`/`it`/`expect`/`vi`/`beforeEach`는 `"vite-plus/test"`에서 import한다 (기존 `src/test/example.test.jsx` 컨벤션).

---

## Task 1: 테스트 공용 유틸 + FallbackImage 분리

**Files:**
- Create: `src/test/renderWithChurch.jsx`
- Create: `src/components/church/FallbackImage.jsx`
- Test: `src/components/church/FallbackImage.test.jsx`
- Modify: `src/pages/Church/Church.jsx:22-26` (삭제 대상 표시만, 실제 삭제는 Task 10에서 수행 — 이 태스크에서는 `Church.jsx`를 건드리지 않는다)

**Interfaces:**
- Produces: `renderWithChurch(ui, { withRouter } = {})` — `src/test/renderWithChurch.jsx`의 default export가 아닌 **named export** `renderWithChurch`. `ChurchProvider`로 항상 감싸고, `withRouter: true`면 추가로 `MemoryRouter`로 감싼다. 반환값은 `@testing-library/react`의 `render()` 결과와 동일.
- Produces: `FallbackImage` — `src/components/church/FallbackImage.jsx`의 default export. props: `{ src, alt, className, fallback }`. `src`가 없거나 로드 에러 시 `fallback`을 렌더.
- 이후 Task 8(Greeting), Task 9(Staff)이 `FallbackImage`를 `./FallbackImage`로 import해서 사용한다.

- [ ] **Step 1: `FallbackImage` 실패 테스트 작성**

```jsx
// src/components/church/FallbackImage.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import FallbackImage from "./FallbackImage";

describe("FallbackImage", () => {
  it("src가 있으면 이미지를 렌더한다", () => {
    render(
      <FallbackImage
        src="/photo.jpg"
        alt="사진"
        className="w-10 h-10"
        fallback={<div>대체 이미지</div>}
      />,
    );
    const img = screen.getByAltText("사진");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/photo.jpg");
  });

  it("src가 없으면 fallback을 렌더한다", () => {
    render(<FallbackImage src={null} alt="사진" fallback={<div>대체 이미지</div>} />);
    expect(screen.getByText("대체 이미지")).toBeInTheDocument();
    expect(screen.queryByAltText("사진")).not.toBeInTheDocument();
  });

  it("이미지 로드가 실패하면 fallback으로 전환된다", () => {
    render(<FallbackImage src="/broken.jpg" alt="사진" fallback={<div>대체 이미지</div>} />);
    const img = screen.getByAltText("사진");
    fireEvent.error(img);
    expect(screen.getByText("대체 이미지")).toBeInTheDocument();
    expect(screen.queryByAltText("사진")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/FallbackImage.test.jsx`
Expected: FAIL — `src/components/church/FallbackImage.jsx` 파일이 없어서 import 에러

- [ ] **Step 3: `FallbackImage` 구현 (원본 `Church.jsx:22-26`와 동일 로직)**

```jsx
// src/components/church/FallbackImage.jsx
import { useState } from "react";

export default function FallbackImage({ src, alt, className, fallback }) {
  const [error, setError] = useState(false);
  if (!src || error) return fallback;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/FallbackImage.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: `renderWithChurch` 테스트 헬퍼 작성 (테스트 없이 바로 구현 — 앱 로직이 아닌 테스트 인프라)**

```jsx
// src/test/renderWithChurch.jsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";

export function renderWithChurch(ui, { withRouter = false } = {}) {
  const wrapped = withRouter ? <MemoryRouter>{ui}</MemoryRouter> : ui;
  return render(<ChurchProvider>{wrapped}</ChurchProvider>);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/test/renderWithChurch.jsx src/components/church/FallbackImage.jsx src/components/church/FallbackImage.test.jsx
git commit -m "test: FallbackImage 분리 + renderWithChurch 테스트 헬퍼 추가"
```

---

## Task 2: Vision 분리

**Files:**
- Create: `src/components/church/Vision.jsx`
- Test: `src/components/church/Vision.test.jsx`

**Interfaces:**
- Consumes: 없음 (Task 1과 독립, 병렬 가능)
- Produces: `Vision` default export, props 없음. Task 10이 `import Vision from "@/components/church/Vision"`으로 사용.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/Vision.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Vision from "./Vision";

describe("Vision", () => {
  it("메인 문구를 렌더한다", () => {
    renderWithChurch(<Vision />);
    expect(screen.getByText(churchConfig.vision.mainTitle)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.vision.mainVerse)).toBeInTheDocument();
  });

  it("비전 3항목의 라벨과 설명을 모두 렌더한다", () => {
    renderWithChurch(<Vision />);
    churchConfig.vision.items.forEach(({ label, description }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/Vision.test.jsx`
Expected: FAIL — `./Vision` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:82-170`을 그대로 옮기고 `useChurch` import + default export만 추가)**

```jsx
// src/components/church/Vision.jsx
import { useChurch } from "@/contexts/ChurchContext";

export default function Vision() {
  const { church } = useChurch();
  const { mainTitle, mainVerse, items } = church.vision;

  const D = 280;
  const SIDE = 220;
  const TH = Math.round((SIDE * Math.sqrt(3)) / 2);
  const W = SIDE + D;
  const H = TH + D;

  const SIDE_TEXT_W = 160;
  const GAP = 40;
  const TOTAL_W = SIDE_TEXT_W + GAP + W + GAP + SIDE_TEXT_W;

  const layout = [
    { item: items[0], left: Math.round((W - D) / 2), top: 0, z: 3, delay: "0s" },
    { item: items[1], left: 0, top: TH, z: 2, delay: "0.25s" },
    { item: items[2], left: W - D, top: TH, z: 1, delay: "0.5s" },
  ];

  return (
    <div>
      <style>{`
        @keyframes circleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="bg-blue-1 rounded-2xl px-12 py-20 text-center mb-20">
        <p className="text-sub-tit-4 font-semibold text-grey-9">{mainTitle}</p>
        <p className="text-body-2 text-grey-8 mt-1">{mainVerse}</p>
      </div>

      <div className="overflow-x-auto">
        <div
          className="mx-auto flex flex-col items-center gap-4"
          style={{ width: TOTAL_W, maxWidth: "100%" }}
        >
          <p className="text-body-2 text-grey-7 text-center mb-2" style={{ width: W }}>
            {items[0].description}
          </p>

          <div className="flex items-start gap-10">
            <div className="flex flex-col shrink-0" style={{ width: SIDE_TEXT_W, height: H }}>
              <div style={{ height: TH }} />
              <div className="flex-1 flex items-center">
                <p className="text-body-2 text-grey-7 text-right w-full">{items[1].description}</p>
              </div>
            </div>

            <div className="relative shrink-0 m-5" style={{ width: W, height: H }}>
              {layout.map(({ item, left, top, z, delay }) => (
                <div
                  key={item.label}
                  className="absolute rounded-full border-2 border-grey-9 bg-transparent flex items-center justify-center"
                  style={{
                    width: D,
                    height: D,
                    left,
                    top,
                    zIndex: z,
                    animation: `circleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both`,
                  }}
                >
                  <span className="text-sub-tit-3 font-semibold text-grey-10 text-center px-8 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col shrink-0" style={{ width: SIDE_TEXT_W, height: H }}>
              <div style={{ height: TH }} />
              <div className="flex-1 flex items-center">
                <p className="text-body-2 text-grey-7 text-left w-full">{items[2].description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/Vision.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/Vision.jsx src/components/church/Vision.test.jsx
git commit -m "test: Church.jsx에서 Vision 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 3: WorshipInfo 분리

**Files:**
- Create: `src/components/church/WorshipInfo.jsx`
- Test: `src/components/church/WorshipInfo.test.jsx`

**Interfaces:**
- Consumes: 없음 (병렬 가능)
- Produces: `WorshipInfo` default export, props 없음.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/WorshipInfo.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import WorshipInfo from "./WorshipInfo";

describe("WorshipInfo", () => {
  it("정기 예배 행을 모두 렌더한다", () => {
    renderWithChurch(<WorshipInfo />);
    churchConfig.worshipSchedule.regular.forEach(({ name, time, location }) => {
      const row = screen.getByText(name).closest("tr");
      expect(row).not.toBeNull();
      expect(row).toHaveTextContent(time);
      expect(row).toHaveTextContent(location);
    });
  });

  it("주일학교예배 행을 모두 렌더한다", () => {
    renderWithChurch(<WorshipInfo />);
    churchConfig.worshipSchedule.departments.forEach(({ name, time, location }) => {
      const row = screen.getByText(name).closest("tr");
      expect(row).not.toBeNull();
      expect(row).toHaveTextContent(time);
      expect(row).toHaveTextContent(location);
    });
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/WorshipInfo.test.jsx`
Expected: FAIL — `./WorshipInfo` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:172-209` 그대로)**

```jsx
// src/components/church/WorshipInfo.jsx
import { useChurch } from "@/contexts/ChurchContext";

export default function WorshipInfo() {
  const { church } = useChurch();
  const { regular, departments } = church.worshipSchedule;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">정기 예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {regular.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">주일학교예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {departments.map(({ name, time, location }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/WorshipInfo.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/WorshipInfo.jsx src/components/church/WorshipInfo.test.jsx
git commit -m "test: Church.jsx에서 WorshipInfo 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 4: History 분리 (+ 아이콘 버튼 접근성 라벨 추가)

**Files:**
- Create: `src/components/church/History.jsx`
- Test: `src/components/church/History.test.jsx`

**Interfaces:**
- Consumes: 없음 (병렬 가능)
- Produces: `History` default export, props 없음.

**참고:** 원본의 상/하 이동 버튼은 SVG 아이콘만 있고 접근 가능한 이름이 없어(`aria-label` 없음) 테스트에서 버튼을 특정할 방법이 없다. 프로젝트 접근성 규칙("아이콘 버튼에 이름을 주지 않은 채 사용하지 않는다")에도 위배되므로, 분리하면서 `aria-label="이전 시대"` / `aria-label="다음 시대"`를 추가한다. 시각적 변화는 없다.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/History.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import History from "./History";

describe("History", () => {
  it("처음에는 최신 2개 시대만 노출되고 이전 시대 버튼은 비활성화된다", () => {
    renderWithChurch(<History />);
    expect(screen.getByText("2020~")).toBeInTheDocument();
    expect(screen.getByText("2010~")).toBeInTheDocument();
    expect(screen.queryByText("2000~")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 시대" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 시대" })).toBeEnabled();
  });

  it("다음 시대 버튼을 누르면 다음 2개 시대 그룹으로 이동한다", async () => {
    renderWithChurch(<History />);
    fireEvent.click(screen.getByRole("button", { name: "다음 시대" }));
    await waitFor(() => expect(screen.getByText("2000~")).toBeInTheDocument());
    expect(screen.queryByText("2020~")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 시대" })).toBeEnabled();
  });

  it("마지막 시대 그룹에서는 다음 시대 버튼이 비활성화된다", async () => {
    renderWithChurch(<History />);
    fireEvent.click(screen.getByRole("button", { name: "다음 시대" }));
    await waitFor(() => expect(screen.getByText("2000~")).toBeInTheDocument());
    expect(screen.getByText("1990~")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 시대" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/History.test.jsx`
Expected: FAIL — `./History` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:451-566` + `aria-label` 2곳 추가)**

```jsx
// src/components/church/History.jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

const HISTORY_ROW = ({ era, events, isLast, style }) => (
  <div className="flex gap-5" style={style}>
    <div className="flex flex-col items-center">
      <div className="w-3.5 h-3.5 rounded-full bg-blue-7 ring-4 ring-blue-1 shrink-0 mt-1.5 z-10" />
      {!isLast && <div className="w-px flex-1 bg-grey-3 mt-1.5" />}
    </div>
    <div className="flex-1 pb-6">
      <h3 className="text-headline-4 font-bold text-grey-11 mb-2">{era}</h3>
      <div className="border border-bluegrey-2 rounded-xl overflow-hidden">
        {events.map(({ date, content }, i) => (
          <div
            key={i}
            className="flex items-start gap-4 px-4 py-2.5 border-b border-grey-2 last:border-b-0 text-body-4"
          >
            <span className="text-blue-7 w-24 shrink-0 font-medium">{date}</span>
            <span className="text-grey-8">{content}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function History() {
  const { church } = useChurch();
  const [startIdx, setStartIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const VISIBLE = 2;
  const items = church.history;
  const canUp = startIdx > 0;
  const canDown = startIdx + VISIBLE < items.length;
  const visible = items.slice(startIdx, startIdx + VISIBLE);

  const go = (delta) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setStartIdx((i) => i + delta);
      setFading(false);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOutUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-14px); }
        }
      `}</style>

      {(canUp || canDown) && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => go(-1)}
            disabled={!canUp || fading}
            aria-label="이전 시대"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canUp && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            disabled={!canDown || fading}
            aria-label="다음 시대"
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              canDown && !fading
                ? "border-blue-7 text-blue-7 hover:bg-blue-1"
                : "border-grey-3 text-grey-4 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {visible.map(({ era, events }, i) => (
        <HISTORY_ROW
          key={`${startIdx}-${era}`}
          era={era}
          events={events}
          isLast={i === visible.length - 1 && !canDown}
          style={
            fading
              ? { animation: `fadeOutUp 0.28s ease-in ${i * 0.06}s both` }
              : { animation: `fadeUp 0.4s ease-out ${i * 0.1}s both` }
          }
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/History.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/History.jsx src/components/church/History.test.jsx
git commit -m "test: Church.jsx에서 History 컴포넌트 분리 + 이동 버튼 aria-label 추가 + 회귀 테스트"
```

---

## Task 5: FloorGuide 분리

**Files:**
- Create: `src/components/church/FloorGuide.jsx`
- Test: `src/components/church/FloorGuide.test.jsx`

**Interfaces:**
- Consumes: 없음 (병렬 가능)
- Produces: `FloorGuide` default export, props 없음.

**참고:** 현재 `church.config.js`의 `floorGuide` 항목은 전부 `image`가 채워져 있어 실제 config로는 "이미지 없음" 분기를 재현할 수 없다. 이 분기는 `useChurch`를 모듈 목으로 대체해 검증한다(다른 태스크의 `renderWithChurch` 패턴과 다름 — 이 파일 전용).

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/FloorGuide.test.jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen, fireEvent } from "@testing-library/react";
import churchConfig from "@/config/church.config";
import { useChurch } from "@/contexts/ChurchContext";
import FloorGuide from "./FloorGuide";

vi.mock("@/contexts/ChurchContext", () => ({ useChurch: vi.fn() }));

describe("FloorGuide", () => {
  beforeEach(() => {
    vi.mocked(useChurch).mockReturnValue({ church: churchConfig, loading: false });
  });

  it("층 목록을 렌더하고 기본으로 첫 번째 층 사진을 보여준다", () => {
    render(<FloorGuide />);
    expect(screen.getByText("청년부실, 사무실")).toBeInTheDocument();
    expect(screen.getByAltText("4층 사진")).toBeInTheDocument();
  });

  it("다른 층 행을 클릭하면 우측 사진이 전환된다", () => {
    render(<FloorGuide />);
    fireEvent.click(screen.getByText("1층").closest("tr"));
    expect(screen.getByAltText("1층 사진")).toBeInTheDocument();
    expect(screen.queryByAltText("4층 사진")).not.toBeInTheDocument();
  });

  it("선택한 층에 이미지가 없으면 대체 아이콘 문구를 보여준다", () => {
    vi.mocked(useChurch).mockReturnValue({
      church: { floorGuide: [{ floor: "5층", rooms: "테스트실", image: null }] },
      loading: false,
    });
    render(<FloorGuide />);
    expect(screen.getByText("5층 사진")).toBeInTheDocument();
    expect(screen.queryByAltText("5층 사진")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/FloorGuide.test.jsx`
Expected: FAIL — `./FloorGuide` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:568-635` 그대로)**

```jsx
// src/components/church/FloorGuide.jsx
import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";

export default function FloorGuide() {
  const { church } = useChurch();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = church.floorGuide[selectedIdx];

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      <style>{`@keyframes floorFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <div className="flex-1 min-w-0">
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">층별 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {church.floorGuide.map(({ floor, rooms }, i) => (
              <tr
                key={floor}
                onClick={() => setSelectedIdx(i)}
                className={`border-b border-grey-3 cursor-pointer transition-colors ${
                  i === selectedIdx ? "bg-blue-1" : "hover:bg-grey-1"
                }`}
              >
                <td
                  className={`py-3.5 pl-2 w-28 font-semibold ${i === selectedIdx ? "text-primary" : "text-grey-8"}`}
                >
                  {floor}
                </td>
                <td className={`py-3.5 ${i === selectedIdx ? "text-grey-9" : "text-grey-7"}`}>
                  {rooms}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full md:w-[420px] md:shrink-0">
        <div
          key={selected.floor}
          className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-bluegrey-2"
          style={{ animation: "floorFadeIn 0.3s ease both" }}
        >
          {selected.image ? (
            <img
              src={selected.image}
              alt={`${selected.floor} 사진`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-grey-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-body-5">{selected.floor} 사진</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/FloorGuide.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/FloorGuide.jsx src/components/church/FloorGuide.test.jsx
git commit -m "test: Church.jsx에서 FloorGuide 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 6: Direction 분리

**Files:**
- Create: `src/components/church/Direction.jsx`
- Test: `src/components/church/Direction.test.jsx`

**Interfaces:**
- Consumes: `KakaoMap` default export from `@/components/common/KakaoMap` (기존, 변경 없음)
- Produces: `Direction` default export, props 없음.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/Direction.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Direction from "./Direction";

describe("Direction", () => {
  it("주차 안내 행을 모두 렌더한다", () => {
    renderWithChurch(<Direction />);
    churchConfig.parking.details.forEach(({ label, value }) => {
      const row = screen.getByText(label).closest("tr");
      expect(row).toHaveTextContent(value);
    });
  });

  it("교회 주소 텍스트를 지도 아래에 렌더한다", () => {
    renderWithChurch(<Direction />);
    expect(screen.getByText(churchConfig.address)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/Direction.test.jsx`
Expected: FAIL — `./Direction` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:637-668` 그대로)**

```jsx
// src/components/church/Direction.jsx
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";

export default function Direction() {
  const { church } = useChurch();
  return (
    <div className="flex flex-col md:flex-row md:gap-12 md:items-start">
      <div className="flex-1">
        <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">주차 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {church.parking.details.map(({ label, value }) => (
              <tr key={label} className="border-b border-grey-3">
                <td className="py-4 font-semibold text-grey-10 w-36">{label}</td>
                <td className="py-4 text-grey-6">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full md:w-[480px] md:shrink-0">
        <KakaoMap
          level={church.location.level}
          address={church.address}
          className="w-full h-72 rounded-2xl overflow-hidden mb-3"
        />
        <p className="text-body-4 text-grey-7">{church.address}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/Direction.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/Direction.jsx src/components/church/Direction.test.jsx
git commit -m "test: Church.jsx에서 Direction 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 7: TransportGuide 분리

**Files:**
- Create: `src/components/church/TransportGuide.jsx`
- Test: `src/components/church/TransportGuide.test.jsx`

**Interfaces:**
- Consumes: `KakaoMapRoute` default export from `@/components/common/KakaoMapRoute` (기존, 변경 없음)
- Produces: `TransportGuide` default export, props 없음.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/TransportGuide.test.jsx
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import churchConfig from "@/config/church.config";
import { useChurch } from "@/contexts/ChurchContext";
import TransportGuide from "./TransportGuide";

vi.mock("@/contexts/ChurchContext", () => ({ useChurch: vi.fn() }));

describe("TransportGuide", () => {
  beforeEach(() => {
    vi.mocked(useChurch).mockReturnValue({ church: churchConfig, loading: false });
  });

  it("코스별 이름과 일정을 렌더한다", () => {
    render(<TransportGuide />);
    churchConfig.transportGuide.routes.forEach(({ name, schedule }) => {
      const row = screen.getByText(name).closest("tr");
      expect(row).toHaveTextContent(schedule);
    });
  });

  it("경유지가 있는 코스가 하나라도 있으면 범례를 보여준다", () => {
    render(<TransportGuide />);
    expect(screen.getByText("운행코스 1")).toBeInTheDocument();
    expect(
      screen.queryByText("경유지 좌표를 입력하면 지도에 경로가 표시됩니다."),
    ).not.toBeInTheDocument();
  });

  it("모든 코스에 경유지가 없으면 안내 문구를 보여준다", () => {
    vi.mocked(useChurch).mockReturnValue({
      church: {
        address: "테스트 주소",
        location: { level: 5 },
        transportGuide: {
          routes: [{ name: "운행코스 1", schedule: "시간 미정", color: "#3B5280", waypoints: [] }],
        },
      },
      loading: false,
    });
    render(<TransportGuide />);
    expect(
      screen.getByText("경유지 좌표를 입력하면 지도에 경로가 표시됩니다."),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/TransportGuide.test.jsx`
Expected: FAIL — `./TransportGuide` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:670-731` 그대로)**

```jsx
// src/components/church/TransportGuide.jsx
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMapRoute from "@/components/common/KakaoMapRoute";

export default function TransportGuide() {
  const { church } = useChurch();
  const { routes } = church.transportGuide;
  const hasAnyRoute = routes.some((r) => r.waypoints?.length > 0);

  return (
    <div className="flex flex-col md:flex-row md:gap-10 md:items-start">
      <div className="flex-1">
        <h3 className="text-sub-tit-3 font-bold text-grey-11 mb-4">코스 안내</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {routes.map(({ name, schedule, color }) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-4 w-8 pr-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: color ?? "var(--color-primary)" }}
                  />
                </td>
                <td className="py-4 font-semibold text-grey-10 w-28">{name}</td>
                <td className="py-4 text-grey-6">{schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!hasAnyRoute && (
          <p className="mt-4 text-body-5 text-grey-5">
            경유지 좌표를 입력하면 지도에 경로가 표시됩니다.
          </p>
        )}
      </div>

      <div className="w-full md:w-[480px] md:shrink-0">
        <KakaoMapRoute
          address={church.address}
          level={church.location?.level ?? 5}
          routes={routes}
          className="w-full h-[300px] rounded-2xl overflow-hidden"
        />
        {hasAnyRoute && (
          <div className="mt-3 flex flex-wrap gap-3">
            {routes
              .filter((r) => r.waypoints?.length > 0)
              .map(({ name, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-body-5 text-grey-7">{name}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/TransportGuide.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/TransportGuide.jsx src/components/church/TransportGuide.test.jsx
git commit -m "test: Church.jsx에서 TransportGuide 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 8: Greeting 분리

**Files:**
- Create: `src/components/church/Greeting.jsx`
- Test: `src/components/church/Greeting.test.jsx`

**Interfaces:**
- Consumes: `FallbackImage` default export from `./FallbackImage` (Task 1) — **Task 1 완료 후 시작**
- Produces: `Greeting` default export, props 없음.

- [ ] **Step 1: 실패 테스트 작성**

```jsx
// src/components/church/Greeting.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Greeting from "./Greeting";

describe("Greeting", () => {
  it("인사말 제목과 첫 번째 본문 단락을 렌더한다", () => {
    renderWithChurch(<Greeting />);
    expect(screen.getByText(churchConfig.greeting.title)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.greeting.paragraphs[0])).toBeInTheDocument();
  });

  it("서명 줄(교회명·직함·이름)을 렌더한다", () => {
    renderWithChurch(<Greeting />);
    const { church, title, name } = churchConfig.greeting.signature;
    expect(
      screen.getByText(
        (_, node) => node?.tagName === "P" && node.textContent.trim() === `${church} ${title} ${name}`,
      ),
    ).toBeInTheDocument();
  });

  it("담임목사 사진이 없으면 대체 아바타를 렌더한다(실제 이미지 없음)", () => {
    renderWithChurch(<Greeting />);
    expect(screen.queryByAltText("담임목사 사진")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/Greeting.test.jsx`
Expected: FAIL — `./Greeting` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:29-80` 그대로, `FallbackImage`는 `./FallbackImage`에서 import)**

```jsx
// src/components/church/Greeting.jsx
import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import LogoIcon from "@/assets/icons/알곡교회_logo.png";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";

export default function Greeting() {
  const { church } = useChurch();
  const { title, paragraphs, signature } = church.greeting;
  const { image: pastorImage } = church.staff.headPastor;

  return (
    <div className="flex flex-col-reverse md:flex-row md:gap-10 md:items-start">
      <div className="flex-1">
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-6">{title}</h2>
        <div className="flex flex-col gap-4 text-body-2 text-grey-8">
          {paragraphs.map((text, i) => (
            <p key={i}>
              {text.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
          <div className="flex items-center justify-end gap-3 mt-4">
            <p className="text-body-3 text-grey-7">
              {signature.church} {signature.title} <strong>{signature.name}</strong>
            </p>
            <FallbackImage
              src={signature.signatureImage}
              alt="서명"
              className="h-10 w-auto object-contain"
              fallback={
                <img
                  src={church.logoUrl ?? LogoIcon}
                  alt="교회 로고"
                  className="h-10 w-auto object-contain opacity-40"
                />
              }
            />
          </div>
        </div>
      </div>
      <FallbackImage
        src={pastorImage}
        alt="담임목사 사진"
        className="w-full h-48 md:w-48 md:h-64 rounded-2xl shrink-0 object-cover"
        fallback={
          <div className="w-full h-48 md:w-48 md:h-64 bg-grey-3 rounded-2xl shrink-0 flex items-center justify-center">
            <img src={AvatarIcon} alt="" className="w-12 h-12 opacity-60" />
          </div>
        }
      />
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/Greeting.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/church/Greeting.jsx src/components/church/Greeting.test.jsx
git commit -m "test: Church.jsx에서 Greeting 컴포넌트 분리 + 회귀 테스트"
```

---

## Task 9: Staff 분리 + 연락처 노출 gap 수정 (TDD)

**Files:**
- Create: `src/components/church/Staff.jsx`
- Test: `src/components/church/Staff.test.jsx`

**Interfaces:**
- Consumes: `FallbackImage` default export from `./FallbackImage` (Task 1) — **Task 1 완료 후 시작**
- Produces: `Staff` default export, props 없음.

이 태스크는 두 단계로 나뉜다: (A) 기존 동작 회귀 테스트, (B) 연락처 미노출이라는 **새 요구사항**을 실패 테스트로 먼저 추가한 뒤 구현 — 원본에는 있던 `ContactLinks`/`PhoneIcon`/`MailIcon`을 아예 만들지 않는 것으로 "구현"한다.

- [ ] **Step 1: 회귀 + 신규 요구사항 테스트를 함께 작성**

```jsx
// src/components/church/Staff.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithChurch } from "@/test/renderWithChurch";
import churchConfig from "@/config/church.config";
import Staff from "./Staff";

describe("Staff", () => {
  it("기본 진입 시 교역자 칩이 선택되어 담임목사와 교역자 목록을 보여준다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(screen.getByText(churchConfig.staff.headPastor.name)).toBeInTheDocument();
    expect(screen.getByText(churchConfig.staff.clergy[0].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.elders[0].name)).not.toBeInTheDocument();
  });

  it("칩을 클릭하면 해당 그룹으로 전환된다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.click(screen.getByRole("button", { name: "시무장로" }));
    expect(screen.getByText(churchConfig.staff.elders[0].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.headPastor.name)).not.toBeInTheDocument();
  });

  it("이름으로 검색하면 일치하는 사람만 남는다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.type(
      screen.getByPlaceholderText("이름으로 검색"),
      churchConfig.staff.clergy[1].name,
    );
    expect(screen.getByText(churchConfig.staff.clergy[1].name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.staff.clergy[0].name)).not.toBeInTheDocument();
  });

  it("검색 결과가 없으면 안내 문구를 보여준다", async () => {
    const user = userEvent.setup();
    renderWithChurch(<Staff />, { withRouter: true });
    await user.type(screen.getByPlaceholderText("이름으로 검색"), "존재하지않는이름");
    expect(screen.getByText("해당하는 교역자가 없습니다.")).toBeInTheDocument();
  });

  it("담임목사 카드에 전화번호·이메일 링크를 노출하지 않는다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(screen.queryByRole("link", { name: churchConfig.staff.headPastor.tel })).toBeNull();
    expect(
      document.querySelector(`a[href^="tel:${churchConfig.staff.headPastor.tel}"]`),
    ).toBeNull();
    expect(
      document.querySelector(`a[href^="mailto:${churchConfig.staff.headPastor.email}"]`),
    ).toBeNull();
  });

  it("일반 사역자 카드에도 전화번호·이메일 링크를 노출하지 않는다", () => {
    renderWithChurch(<Staff />, { withRouter: true });
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `pnpm test:run src/components/church/Staff.test.jsx`
Expected: FAIL — `./Staff` 모듈 없음

- [ ] **Step 3: 구현 (원본 `Church.jsx:211-449`에서 `MailIcon`/`PhoneIcon`/`ContactLinks`와 그 호출부, `PersonCard`의 `tel`/`email` prop을 제거)**

```jsx
// src/components/church/Staff.jsx
import { useState } from "react";
import { Link } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import FallbackImage from "./FallbackImage";
import AvatarIcon from "@/assets/icon-svg/mypage-user-blue.svg";
import IcoSearch from "@/assets/icon-svg/search-grey.svg";

const MicIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
    />
  </svg>
);

function StaffAvatar({ image, name, className }) {
  return (
    <FallbackImage
      src={image}
      alt={name}
      className={`${className} object-cover shrink-0`}
      fallback={
        <div className={`${className} bg-grey-3 shrink-0 flex items-center justify-center`}>
          <img src={AvatarIcon} alt="" className="w-1/3 h-1/3 opacity-60" />
        </div>
      }
    />
  );
}

function PersonCard({ name, role, image, location, showSermon = false }) {
  return (
    <div className="border border-bluegrey-2 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-3">
        <StaffAvatar image={image} name={name} className="w-20 aspect-[1/1.2] rounded-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-body-3 font-semibold text-grey-11 truncate">{name}</p>
              {location && (
                <span className="px-2 py-0.5 rounded-full bg-point-1 text-point-7 text-body-5 font-semibold shrink-0">
                  {location}
                </span>
              )}
            </div>
            {showSermon && (
              <Link
                to="/말씀/설교"
                className="flex items-center gap-1 text-body-5 text-blue-7 border border-blue-7 px-2 py-0.5 rounded-full shrink-0"
              >
                <MicIcon />
                설교영상
              </Link>
            )}
          </div>
          <p className="text-body-5 text-grey-7">{role}</p>
        </div>
      </div>
    </div>
  );
}

const STAFF_CHIPS = ["교역자", "시무장로", "협동·사역장로", "은퇴장로", "파송선교사"];

export default function Staff() {
  const { church } = useChurch();
  const { headPastor, clergy, elders, associateElders, retiredElders, missionaries } = church.staff;
  const [activeChip, setActiveChip] = useState("교역자");
  const [query, setQuery] = useState("");

  const GROUPS = {
    교역자: clergy,
    시무장로: elders,
    "협동·사역장로": associateElders,
    은퇴장로: retiredElders,
    파송선교사: missionaries,
  };

  const q = query.trim().toLowerCase();
  const matchesQuery = (name) => !q || name.toLowerCase().includes(q);

  const filteredGroup = GROUPS[activeChip].filter((p) => matchesQuery(p.name));
  const showHeadPastor = activeChip === "교역자" && matchesQuery(headPastor.name);
  const isEmpty = filteredGroup.length === 0 && !showHeadPastor;

  return (
    <div>
      <div className="relative max-w-xs mb-4">
        <img src={IcoSearch} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" alt="" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="w-full pl-10 pr-4 py-2.5 border border-bluegrey-2 rounded-xl text-body-3 text-grey-9 placeholder:text-grey-5 focus:border-blue-6 focus:ring-2 focus:ring-blue-3/40 outline-none transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {STAFF_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-5 py-2 rounded-full text-body-3 font-semibold transition-all ${
              activeChip === chip
                ? "bg-primary text-white"
                : "border border-bluegrey-2 text-grey-8 hover:border-blue-5 hover:text-primary"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <p className="text-center text-body-3 text-grey-5 py-16">해당하는 교역자가 없습니다.</p>
      ) : (
        <div>
          {showHeadPastor && (
            <div className="border border-primary/20 bg-blue-1/30 rounded-2xl p-7 mb-6 flex flex-col md:flex-row gap-6 md:gap-8">
              <StaffAvatar
                image={headPastor.image}
                name={headPastor.name}
                className="w-44 aspect-[1/1.2] rounded-2xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <span className="text-caption font-bold text-primary uppercase tracking-widest">
                      담임목사
                    </span>
                    <h3 className="text-sub-tit-3 font-bold text-grey-12 mt-0.5">
                      {headPastor.name}
                    </h3>
                  </div>
                  <Link
                    to="/말씀/설교"
                    className="flex items-center gap-1.5 text-body-4 text-blue-7 border border-blue-7 px-4 py-1.5 rounded-full shrink-0"
                  >
                    <MicIcon />
                    설교영상
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-bluegrey-2">
                  <div>
                    <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">학력</p>
                    <ul className="flex flex-col gap-1.5">
                      {headPastor.education.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                          <span className="text-primary shrink-0 mt-1">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-caption font-bold text-grey-7 mb-2 tracking-wider">약력</p>
                    <ul className="flex flex-col gap-1.5">
                      {headPastor.career.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-body-4 text-grey-8">
                          <span className="text-primary shrink-0 mt-1">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredGroup.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGroup.map((p) => (
                <PersonCard key={p.name} {...p} showSermon={activeChip === "교역자"} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행해서 통과 확인**

Run: `pnpm test:run src/components/church/Staff.test.jsx`
Expected: PASS (6 tests) — 특히 마지막 2개(연락처 미노출)는 Step 1에서 실패했다가 Step 3 구현으로 통과해야 한다.

- [ ] **Step 5: Commit**

```bash
git add src/components/church/Staff.jsx src/components/church/Staff.test.jsx
git commit -m "fix: 섬기는 사람들 카드 연락처(전화·이메일) 노출 제거 + 컴포넌트 분리 + 회귀 테스트

명세서: '연락처는 지금으로서는 웹에서 조회 안되게' — 교적부 연동 전까지 비노출"
```

---

## Task 10: Church.jsx를 셸로 축소 + 통합 테스트

**Files:**
- Modify: `src/pages/Church/Church.jsx` (전체 재작성 — 786줄 → 셸 컴포넌트만 남김)
- Test: `src/pages/Church/Church.test.jsx`

**의존성:** Task 1~9 전부 완료 후 시작 (모든 섹션 컴포넌트가 `src/components/church/`에 존재해야 함)

**Interfaces:**
- Consumes: Task 2~9에서 만든 8개 컴포넌트의 default export 전부(`Greeting`, `Vision`, `WorshipInfo`, `Staff`, `History`, `FloorGuide`, `Direction`, `TransportGuide`)
- Produces: `Church` default export (라우터에서 `src/App.jsx`가 이미 `import Church from "@/pages/Church/Church"`로 사용 중 — 변경 없음)

- [ ] **Step 1: 통합 테스트 작성**

```jsx
// src/pages/Church/Church.test.jsx
import { describe, it, expect } from "vite-plus/test";
import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";
import churchConfig from "@/config/church.config";
import { render } from "@testing-library/react";
import Church from "./Church";

function renderChurch() {
  return render(
    <MemoryRouter initialEntries={["/교회소개"]}>
      <ChurchProvider>
        <Church />
      </ChurchProvider>
    </MemoryRouter>,
  );
}

describe("Church 셸", () => {
  it("초기 탭은 인사말이고 Greeting 콘텐츠가 보인다", () => {
    renderChurch();
    expect(screen.getByRole("button", { name: "인사말" })).toHaveClass("border-blue-8");
    expect(screen.getByText(churchConfig.greeting.title)).toBeInTheDocument();
  });

  it("탭 버튼을 클릭하면 해당 섹션으로 전환된다", () => {
    renderChurch();
    fireEvent.click(screen.getByRole("button", { name: "섬기는 사람들" }));
    expect(screen.getByText(churchConfig.staff.headPastor.name)).toBeInTheDocument();
    expect(screen.queryByText(churchConfig.greeting.title)).not.toBeInTheDocument();
  });

  it("8개 탭 버튼이 모두 렌더된다", () => {
    renderChurch();
    [
      "인사말",
      "교회 비전",
      "교회 연혁",
      "예배 안내",
      "섬기는 사람들",
      "층별 안내",
      "오시는 길",
      "차량운행 안내",
    ].forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인 (아직 `Church.jsx`가 옛 모놀리식 코드라 섹션 텍스트는 보이지만 목표는 셸 전환 후에도 통과하는 것 — 우선 새 파일 기준으로 셸이 없으면 어떻게 깨지는지 확인)**

Run: `pnpm test:run src/pages/Church/Church.test.jsx`
Expected: 현재 `Church.jsx`가 이미 모놀리식으로 같은 내용을 렌더하므로 이 시점엔 우연히 PASS할 수 있다 — 그래도 다음 Step으로 진행해 셸 리팩터 후 동일하게 PASS하는지가 진짜 검증이다.

- [ ] **Step 3: `Church.jsx`를 셸로 재작성**

```jsx
// src/pages/Church/Church.jsx
import { useSearchParams } from "react-router";
import Greeting from "@/components/church/Greeting";
import Vision from "@/components/church/Vision";
import WorshipInfo from "@/components/church/WorshipInfo";
import Staff from "@/components/church/Staff";
import History from "@/components/church/History";
import FloorGuide from "@/components/church/FloorGuide";
import Direction from "@/components/church/Direction";
import TransportGuide from "@/components/church/TransportGuide";

const TABS = [
  "인사말",
  "교회 비전",
  "교회 연혁",
  "예배 안내",
  "섬기는 사람들",
  "층별 안내",
  "오시는 길",
  "차량운행 안내",
];

const TAB_CONTENT = {
  인사말: <Greeting />,
  "교회 비전": <Vision />,
  "교회 연혁": <History />,
  "예배 안내": <WorshipInfo />,
  "섬기는 사람들": <Staff />,
  "층별 안내": <FloorGuide />,
  "오시는 길": <Direction />,
  "차량운행 안내": <TransportGuide />,
};

export default function Church() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "인사말";

  return (
    <div>
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">교회 소개</h1>
        </div>
      </div>

      <div className="border-b border-bluegrey-2 bg-white sticky top-14 md:top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-8">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
                className={`px-5 py-5 text-body-2 whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === tab
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1576px] mx-auto px-4 pt-6 pb-10 md:px-8 md:pt-10 md:pb-20">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 전체 테스트 스위트 실행해서 회귀 없는지 확인**

Run: `pnpm test:run`
Expected: PASS — Task 1~10에서 만든 모든 테스트(FallbackImage, Vision, WorshipInfo, History, FloorGuide, Direction, TransportGuide, Greeting, Staff, Church) + 기존 `src/test/example.test.jsx` 전부 통과. 실패하는 테스트가 있으면 해당 컴포넌트 파일을 원본 `Church.jsx`와 다시 대조해 diff를 없앤다(이번 태스크에서 로직을 바꾸지 않았어야 함).

- [ ] **Step 5: 빌드 확인**

Run: `pnpm run build`
Expected: 에러 없이 빌드 완료 (미사용 import·미해결 참조가 없는지 최종 확인)

- [ ] **Step 6: Commit**

```bash
git add src/pages/Church/Church.jsx src/pages/Church/Church.test.jsx
git commit -m "refactor: Church.jsx를 탭 셸로 축소, 8개 섹션은 src/components/church/로 이전 완료

BREAKING: 없음 — 외부 사용처(App.jsx)는 그대로 default export를 사용"
```

---

## 태스크 의존 관계 요약 (병렬 실행 가이드)

```
Task 1 (FallbackImage + renderWithChurch)
  ├─▶ Task 8 (Greeting)
  └─▶ Task 9 (Staff)

Task 2 (Vision)         — 독립, Task 1과 동시 진행 가능
Task 3 (WorshipInfo)    — 독립, Task 1과 동시 진행 가능
Task 4 (History)        — 독립, Task 1과 동시 진행 가능
Task 5 (FloorGuide)     — 독립, Task 1과 동시 진행 가능
Task 6 (Direction)      — 독립, Task 1과 동시 진행 가능
Task 7 (TransportGuide) — 독립, Task 1과 동시 진행 가능

Task 10 (Church.jsx 셸 전환) — Task 1~9 전부 완료 후 시작
```

Task 1과 Task 2~7은 **7개 서브에이전트를 동시에** 투입할 수 있다. Task 8·9는 Task 1이 끝난 뒤 투입한다. Task 10은 나머지 9개가 모두 끝난 뒤 마지막 한 태스크로 진행한다.

## Self-Review 메모

- **스펙 커버리지:** 설계 문서의 "컴포넌트 구조"(9개 파일), "연락처 정책 변경"(Task 9), "테스트 계획"(Task 1~10 전부), "확인 필요"(탭 순서 — 현행 유지로 반영, 별도 태스크 불필요) 항목 모두 태스크로 매핑됨.
- **플레이스홀더 스캔:** 전 태스크 코드 블록에 TODO/TBD 없음.
- **타입/시그니처 일관성:** `renderWithChurch(ui, { withRouter })`가 Task 1에서 정의된 시그니처 그대로 Task 2·3·4·6·8·9에서 동일하게 사용됨. `FallbackImage({ src, alt, className, fallback })` prop 이름이 Task 1·8·9에서 일관됨.
