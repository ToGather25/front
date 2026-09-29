# 주보 4페이지 시스템 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 주보 페이지를 4페이지 시스템으로 재구현 - 메인 콘텐츠 + 우측 축소 미리보기

**Architecture:** JuboPageSystem이 상태 관리 및 레이아웃 제어, 각 JuboPage 컴포넌트는 독립적 페이지 콘텐츠 렌더링. 메인 콘텐츠는 full size, 우측 미리보기는 scale(0.25) transform으로 축소.

**Tech Stack:** React 19, React Router v7, Tailwind CSS v4

**Spec:** docs/superpowers/specs/2026-09-27-jubo-4page-system-design.md

---

## Global Constraints

- React Router v7: `react-router`에서 import (NOT `react-router-dom`)
- Tailwind v4: CSS 변수는 `src/styles/tokens.css`의 `@theme` 블록 사용
- 경로 별칭: `@/` → `src/`
- 기존 Cover 컴포넌트는 삭제하지 말고 유지 (나중 사용 대비)

---

## Review Focus

1. **페이지 전환 시 메인 콘텐츠 렌더링:** 새 페이지로 전환 시 콘텐츠가 제대로 교체되는가?
2. **우측 미리보기 클릭 상호작용:** 미리보기 클릭 시 해당 페이지가 정확히 활성화되는가?
3. **애니메이션 성능:** 4개 페이지를 동시에 렌더링할 때 성능이 저하되지 않는가?
4. **PDF 다운로드 4페이지 통합:** 숨겨진 영역에 4페이지가 모두 렌더링되고 PDF 생성이 정상인가?
5. **모바일 반응형:** 우측 미리보기가 모바일에서 적절하게 처리되는가?

---

## File Structure

### 신규 생성

```
src/components/jubo/
├── JuboPageSystem.jsx        # 메인 시스템 (상태 관리, 레이아웃)
├── JuboPage1.jsx             # 표지 (사진 + MISSION + 말씀 + 정보)
├── JuboPage2.jsx             # 예배 및 소식 (예배안내 + 소식)
├── JuboPage3.jsx             # 봉사 및 예물 (봉사 + 헌금)
└── JuboPage4.jsx             # 기타안내 (구역모임 + 섬기는분들 + 오시는길)
```

### 수정

```
src/pages/Jubo/Jubo.jsx       # Section2-5 제거, JuboPageSystem 마운트
```

### 유지

```
src/components/jubo/Cover.jsx # 기존 Cover (삭제 금지, 나중 사용)
```

---

## Task 1: JuboPage1.jsx (표지) 구현

**Files:**
- Create: `src/components/jubo/JuboPage1.jsx`
- Test: 수동 테스트 (UI 렌더링)

**Interfaces:**
- Consumes: `{ data: { dateLabel, issueNo }, isPreview?: boolean }`
- Produces: React component that renders cover page content

**Description:** 표지 페이지 컴포넌트. 사진, MISSION, 말씀, 교회 정보를 포함. isPreview=true일 때도 동일 구조로 렌더링 (부모가 scale transform으로 축소).

- [ ] **Step 1: JuboPage1.jsx 기본 구조 작성**

Create `src/components/jubo/JuboPage1.jsx`:

```jsx
export default function JuboPage1({ data, isPreview = false }) {
  return (
    <div className="w-full bg-white">
      {/* 예배 사진 */}
      <div className="aspect-video bg-grey-2 rounded-5 mb-8 flex items-center justify-center">
        <span className="text-body-3 text-grey-6">예배 사진 영역</span>
      </div>

      {/* 날짜 */}
      <div className="text-right text-body-3 text-primary mb-8">
        {data?.dateLabel || "2026/09/27"}
      </div>

      {/* MISSION */}
      <div className="mb-8">
        <span className="text-caption text-grey-6">MISSION</span>
        <div className="text-headline-5 font-bold text-grey-12 mt-2">
          함께 모여<br />
          하나님께로,<br />
          ToGather
        </div>
      </div>

      {/* 말씀 */}
      <div className="mb-8 bg-grey-1 rounded-5 p-8">
        <span className="text-body-4 text-grey-6 block mb-4">2026년 말씀</span>
        <div className="text-center">
          <div className="text-heading-3 font-bold text-grey-12 mb-2">
            거기서<br />
            나오라
          </div>
          <span className="text-body-4 text-grey-6">[교회 로고]</span>
        </div>
      </div>

      {/* 교회 정보 (좌측 파란색 박스) */}
      <div className="bg-blue-9 text-white rounded-5 p-8">
        <div className="font-bold mb-6">www.okc.com</div>
        <div className="space-y-3 text-body-4">
          <div className="flex gap-2">
            <span>📍</span>
            <span>경기도 부천시 양지로 166번길 34 (옥길동)</span>
          </div>
          <div className="flex gap-2">
            <span>📞</span>
            <div>
              <div>TEL. 02) 2615-4067</div>
              <div>FAX. 02) 2683-4326</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span>📧</span>
            <span>okc0120@gmail.com</span>
          </div>
        </div>
      </div>

      {/* 로고 */}
      <div className="text-center mt-8">
        <span className="text-body-4 text-primary">⛪ 옥길교회</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 브라우저에서 렌더링 확인**

Jubo.jsx를 일시적으로 수정해서 `<JuboPage1 data={{ dateLabel: "테스트" }} />`를 렌더링하고 화면 확인. 표지 콘텐츠가 제대로 보이는지 확인.

---

## Task 2: JuboPage2.jsx (예배 및 소식) 구현

**Files:**
- Create: `src/components/jubo/JuboPage2.jsx`

**Interfaces:**
- Consumes: `{ data: { /* 예배 데이터 */ }, isPreview?: boolean }`
- Produces: React component with "예배 안내" + "이번주 소식" sections

**Description:** 예배 및 소식 페이지. 기존 JuboSection2를 리팩토링해서 새 구조에 맞게 수정.

- [ ] **Step 1: JuboPage2.jsx 작성 (기존 JuboSection2 기반)**

Create `src/components/jubo/JuboPage2.jsx`:

```jsx
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getWorshipServices, getWorshipOrder } from "@/services/juboService";

export default function JuboPage2({ data, isPreview = false }) {
  const { church } = useChurch();
  const {
    data: services = [],
    loading: servicesLoading,
  } = useFetch(() => getWorshipServices(church.id), [church.id], []);
  const {
    data: orderMap = {},
    loading: orderLoading,
  } = useFetch(() => getWorshipOrder(church.id), [church.id], {});

  const activeLabel = services[0]?.label ?? null;
  const order = activeLabel ? (orderMap[activeLabel] ?? []) : [];
  const loading = servicesLoading || orderLoading;

  return (
    <div className="w-full bg-white">
      {/* 예배 안내 */}
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">예배 안내</h3>
        </div>

        {loading ? (
          <p className="text-center text-body-4 text-grey-5 py-8">불러오는 중...</p>
        ) : order.length === 0 ? (
          <p className="text-center text-body-4 text-grey-5 py-8">예배 정보가 없습니다.</p>
        ) : (
          <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
            <div className="grid grid-cols-2 gap-x-25 gap-y-5">
              {order.map(({ role, name }, i) => (
                <div key={i} className="flex gap-5">
                  <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">{role}</div>
                  <div className="text-body-3 text-grey-8">{name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 이번주 소식 */}
      <div>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">이번주 소식</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">소식 제목</div>
                <div className="text-body-3 text-grey-8">소식 내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 렌더링 확인**

임시로 Jubo.jsx에서 `<JuboPage2 data={{}} />`를 렌더링하고 화면 확인.

---

## Task 3: JuboPage3.jsx (봉사 및 예물) 구현

**Files:**
- Create: `src/components/jubo/JuboPage3.jsx`

**Interfaces:**
- Consumes: `{ data: {}, isPreview?: boolean }`
- Produces: React component with "다음주 봉사 안내" + "향기로운 예물" sections

- [ ] **Step 1: JuboPage3.jsx 작성 (기존 JuboSection3 기반)**

Create `src/components/jubo/JuboPage3.jsx`:

```jsx
export default function JuboPage3({ data, isPreview = false }) {
  return (
    <div className="w-full bg-white">
      {/* 다음주 봉사 안내 */}
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">다음주 봉사 안내</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">제목</div>
                <div className="text-body-3 text-grey-8">내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 향기로운 예물 */}
      <div>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">향기로운 예물</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-6">
            {['십일조', '선교 헌금', '건축 헌금'].map((title) => (
              <div key={title} className="flex gap-5">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">{title}</div>
                <div className="flex-1 grid grid-cols-4 gap-5 text-body-4 text-grey-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>임재호(유정아)</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 렌더링 확인**

---

## Task 4: JuboPage4.jsx (기타안내) 구현

**Files:**
- Create: `src/components/jubo/JuboPage4.jsx`

**Interfaces:**
- Consumes: `{ data: {}, isPreview?: boolean }`
- Produces: React component with "구역 모임" + "섬기는 분들" + "오시는 길" sections

- [ ] **Step 1: JuboPage4.jsx 작성 (기존 JuboSection4/5 기반)**

Create `src/components/jubo/JuboPage4.jsx`:

```jsx
export default function JuboPage4({ data, isPreview = false }) {
  return (
    <div className="w-full bg-white">
      {/* 구역 모임 */}
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">구역 모임</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5 pb-6 border-b border-bluegrey-2 last:border-0 last:pb-0">
                <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">구역명</div>
                <div className="text-body-3 text-grey-8">구역 내용을 입력하세요.</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 섬기는 분들 */}
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">섬기는 분들</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-8">
            {['교역자', '장로', '찬양팀'].map((title) => (
              <div key={title}>
                <ol className="list-decimal ml-8 mb-3">
                  <li className="text-body-3 font-semibold text-grey-12">{title}</li>
                </ol>
                <div className="grid grid-cols-3 gap-5 text-body-4 text-grey-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>이름(직책명)</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오시는 길 */}
      <div>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">오시는 길</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          {/* 지도 */}
          <div className="aspect-video bg-grey-2 rounded-5 mb-8 flex items-center justify-center text-grey-6">
            <span className="text-body-3">지도가 표시됩니다</span>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-5">
            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">주소</div>
              <div className="text-body-3 text-grey-9">경기도 부천시 양지로 166번길 34 (옥길동)</div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">전화</div>
              <div className="flex gap-5 text-body-3 text-grey-9">
                <div>TEL <span className="mx-2">02) 2615-4067</span></div>
                <div>|</div>
                <div>FAX <span className="mx-2">02) 2683-4326</span></div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">이메일</div>
              <div className="text-body-3 text-grey-9">okc0120@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 렌더링 확인**

---

## Task 5: JuboPageSystem.jsx (메인 시스템) 구현

**Files:**
- Create: `src/components/jubo/JuboPageSystem.jsx`

**Interfaces:**
- Consumes: `{ issue: { dateLabel, issueNo, ... } }`
- Produces: React component with full 4-page system (main + preview)

**Description:** 4페이지 시스템의 핵심. 상태 관리, 페이지 전환 로직, 애니메이션, 레이아웃 제어.

- [ ] **Step 1: JuboPageSystem.jsx 기본 구조 작성**

Create `src/components/jubo/JuboPageSystem.jsx`:

```jsx
import { useState } from "react";
import JuboPage1 from "./JuboPage1";
import JuboPage2 from "./JuboPage2";
import JuboPage3 from "./JuboPage3";
import JuboPage4 from "./JuboPage4";

const PAGES = [
  { id: "page1", title: "주보", Component: JuboPage1 },
  { id: "page2", title: "예배 및 소식", Component: JuboPage2 },
  { id: "page3", title: "봉사 및 예물", Component: JuboPage3 },
  { id: "page4", title: "기타안내", Component: JuboPage4 },
];

export default function JuboPageSystem({ issue, onDownloadPdf }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const handlePageChange = (newIndex) => {
    setCurrentPageIndex(newIndex);
  };

  return (
    <div className="bg-white">
      {/* 서브 헤더 */}
      <div className="border-b border-bluegrey-2">
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => {}} // 목록으로 이동 로직 (아직 미구현)
            className="flex items-center gap-2 text-body-4 font-medium text-primary hover:opacity-70"
          >
            <span>←</span>
            <span>목록으로</span>
          </button>

          <h2 className="text-headline-5 font-bold text-grey-12">
            {issue?.dateLabel || "주보"}
          </h2>

          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 bg-primary text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity text-body-4 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
              />
            </svg>
            <span>PDF 다운로드</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 + 우측 미리보기 */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="flex gap-8 items-start relative">
          {/* 중앙 메인 콘텐츠 */}
          <div className="flex-1">
            <div
              key={PAGES[currentPageIndex].id}
              className="bg-grey-1 rounded-5 overflow-hidden animate-fadeInSlide"
            >
              <div className="p-12">
                {PAGES[currentPageIndex].Component ? (
                  <PAGES[currentPageIndex].Component data={issue} isPreview={false} />
                ) : null}
              </div>
            </div>
          </div>

          {/* 우측 미리보기 (세로 3개) */}
          <div className="w-80 shrink-0 relative" style={{ height: "400px" }}>
            {PAGES.map((page, idx) => {
              if (idx === currentPageIndex) return null;

              return (
                <button
                  key={page.id}
                  onClick={() => handlePageChange(idx)}
                  className="absolute inset-0 bg-white rounded-5 shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:opacity-100"
                  style={{
                    transform: `scale(0.25) translateY(${idx < currentPageIndex ? (idx * 20) : ((idx - 1) * 20)}px)`,
                    opacity: 0.4,
                    zIndex: 10 - idx,
                  }}
                >
                  <div className="p-4 pointer-events-none">
                    <page.Component data={issue} isPreview={true} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 숨겨진 PDF 렌더 영역 */}
      <div className="jubo-print-wrapper-all" style={{ display: "none", position: "absolute", left: "-9999px" }}>
        {PAGES.map((page) => (
          <div key={page.id}>
            <page.Component data={issue} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Tailwind에 fadeInSlide 애니메이션 추가**

Edit `src/index.css`:

```css
@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInSlide {
  animation: fadeInSlide 0.4s ease-out;
}
```

- [ ] **Step 3: 미리보기 렌더링 계산 로직 수정**

위의 Step 1 코드의 `translateY` 계산이 정확한지 재검토하고 수정:

```jsx
// 현재 페이지 인덱스에 따라 나머지 페이지들의 위치 계산
const getPreviewOffset = (idx) => {
  if (idx < currentPageIndex) return idx * 20;
  return (idx - 1) * 20;
};

// 사용
style={{
  transform: `scale(0.25) translateY(${getPreviewOffset(idx)}px)`,
}}
```

- [ ] **Step 4: 렌더링 확인**

Jubo.jsx에서 `<JuboPageSystem issue={issue} onDownloadPdf={handleDownloadPdf} />`로 렌더링하고 확인.

---

## Task 6: Jubo.jsx 통합

**Files:**
- Modify: `src/pages/Jubo/Jubo.jsx`

**Interfaces:**
- Uses: JuboPageSystem, Cover (유지만)
- Updates: renderContent 함수 제거, JuboPageSystem 마운트

- [ ] **Step 1: 불필요한 import 제거**

Edit `src/pages/Jubo/Jubo.jsx`:

제거할 import:
```jsx
import JuboSection2 from "@/components/jubo/JuboSection2";
import JuboSection3 from "@/components/jubo/JuboSection3";
import JuboSection4 from "@/components/jubo/JuboSection4";
import JuboSection5 from "@/components/jubo/JuboSection5";
import Worship from "@/components/jubo/Worship";
import News from "@/components/jubo/News";
import Service from "@/components/jubo/Service";
import Offering from "@/components/jubo/Offering";
import Support from "@/components/jubo/Support";
import District from "@/components/jubo/District";
import Ministers from "@/components/jubo/Ministers";
import Direction from "@/components/jubo/Direction";
```

추가할 import:
```jsx
import JuboPageSystem from "@/components/jubo/JuboPageSystem";
```

- [ ] **Step 2: SECTIONS 상수와 renderContent 함수 제거**

제거할 코드:
```javascript
const SECTIONS = [ ... ];
const ALL_TABS = [ ... ];
function renderContent(section, issue) { ... }
```

- [ ] **Step 3: 메인 JSX 수정 - Cover 렌더링 제거, JuboPageSystem 마운트**

현재 코드:
```jsx
{isCoverPage ? (
  <div className="flex justify-center py-12">
    ...Cover...
  </div>
) : (
  <div className="bg-white">
    {/* 서브헤더 */}
    ...
    {/* JuboPageSystem 대신 기존 레이아웃 */}
  </div>
)}
```

수정 후:
```jsx
<div className="bg-white">
  {/* 항상 JuboPageSystem 렌더링 */}
  <JuboPageSystem issue={issue} onDownloadPdf={handleDownloadPdf} />
</div>
```

- [ ] **Step 4: PDF 다운로드 로직 유지**

`handleDownloadPdf` 함수는 유지. JuboPageSystem에 `onDownloadPdf` prop으로 전달.

- [ ] **Step 5: 테스트**

`/주보?issue=1`로 접속해서 새로운 4페이지 시스템 확인. 페이지 전환, 미리보기 클릭, PDF 다운로드 모두 작동하는지 확인.

---

## Task 7: 통합 테스트 & 최적화

**Files:**
- Test: Manual browser testing
- Optional: Performance check

- [ ] **Step 1: 주요 기능 테스트**

- [ ] **Step 1a: 페이지 전환**
  - 우측 미리보기 클릭 시 해당 페이지로 전환되는지 확인
  - 메인 콘텐츠가 애니메이션과 함께 변경되는지 확인
  - 미리보기 위치가 올바르게 재배열되는지 확인

- [ ] **Step 1b: 애니메이션**
  - 페이지 전환 시 fade-in 애니메이션이 부드러운지 확인
  - 우측 미리보기 이동이 자연스러운지 확인

- [ ] **Step 1c: PDF 다운로드**
  - PDF 다운로드 버튼 클릭
  - 4페이지가 모두 포함되어 있는지 확인

- [ ] **Step 1d: 서브헤더**
  - "← 목록으로" 버튼이 보이는지 확인
  - 제목이 정확히 표시되는지 확인
  - "PDF 다운로드" 버튼이 보이는지 확인

- [ ] **Step 2: 모바일 반응형 테스트 (선택사항)**

모바일 브라우저에서:
  - 우측 미리보기가 깨지지 않는지 확인
  - 텍스트가 제대로 읽히는지 확인

- [ ] **Step 3: 성능 체크**

브라우저 DevTools Performance 탭:
  - 페이지 전환 시 렌더링 시간이 합리적인지 확인 (< 1초)
  - 프레임 드롭이 없는지 확인

- [ ] **Step 4: 정리**

기존 JuboSection2-5, Worship, News, Service, Offering, Support, District, Ministers, Direction 파일들은 아직 삭제하지 않음 (다른 곳에서 사용할 수 있으므로).

---

## Review Focus - Test Checklist

각 review focus에 대한 테스트를 다음 task에서 수행:

- [ ] **페이지 전환 렌더링:** Task 7, Step 1a에서 검증
- [ ] **미리보기 클릭 상호작용:** Task 7, Step 1a에서 검증
- [ ] **애니메이션 성능:** Task 7, Step 1b-3에서 검증
- [ ] **PDF 다운로드:** Task 7, Step 1c에서 검증
- [ ] **모바일 반응형:** Task 7, Step 2에서 검증

---

## 총 작업 예상 시간

- Task 1-4: 각 5-10분 (총 20-40분)
- Task 5: 15-20분
- Task 6: 10-15분
- Task 7: 10-15분

**전체: 약 55-90분**
