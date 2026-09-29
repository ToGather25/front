# 주보 4페이지 시스템 설계

**작성일:** 2026-09-27  
**버전:** 1.0  
**상태:** 설계 중

---

## 1. 개요

기존 주보 페이지(Cover + Section2-5)를 새로운 4페이지 주보 시스템으로 재구현합니다.

**핵심 변경사항:**
- Cover: 표지처럼 큰 메인 페이지로 표시
- Section2-5: 4개의 독립적 주보 페이지로 리팩토링
- UI: 메인 콘텐츠 + 우측 축소 미리보기 (세로 3개)
- 상호작용: 미리보기 클릭 시 해당 페이지로 전환 + 애니메이션

---

## 2. 요구사항

### 2.1 기능 요구사항

| 요구사항 | 설명 |
|---------|------|
| **4페이지 관리** | Page 1(표지) + Page 2-4(주보 내용) |
| **메인 콘텐츠** | 현재 선택된 페이지를 크게 표시 |
| **우측 미리보기** | 나머지 3개 페이지를 축소(25% scale)해서 세로 배열 |
| **페이지 전환** | 미리보기 클릭 시 해당 페이지로 전환 |
| **애니메이션** | 페이지 전환 시 fade + slide 애니메이션 |
| **서브헤더** | "← 목록으로" \| 제목 \| "PDF 다운로드" |
| **PDF 다운로드** | 4페이지 통합 렌더링 (기존 방식 유지) |

### 2.2 페이지 구조

| 페이지 | 제목 | 콘텐츠 | 컴포넌트 |
|--------|------|--------|---------|
| **1** | 9월 27일 주보 | 사진 + MISSION + 말씀 + 교회정보 | JuboPage1.jsx |
| **2** | 예배 및 소식 | 예배안내(테이블) + 이번주소식(리스트) | JuboPage2.jsx |
| **3** | 봉사 및 예물 | 다음주봉사(리스트) + 향기로운예물(그리드) | JuboPage3.jsx |
| **4** | 기타안내 | 구역모임 + 섬기는분들 + 오시는길(지도+정보) | JuboPage4.jsx |

---

## 3. 아키텍처

### 3.1 컴포넌트 구조

```
Jubo.jsx (기존 유지)
└── JuboPageSystem.jsx (신규 - 4페이지 시스템)
    ├── JuboPage1.jsx (표지)
    ├── JuboPage2.jsx (예배 및 소식)
    ├── JuboPage3.jsx (봉사 및 예물)
    └── JuboPage4.jsx (기타안내)
```

### 3.2 상태 관리

**JuboPageSystem의 상태:**

```javascript
const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0-3
const [pages] = useState([
  { 
    id: 'page1', 
    title: '9월 27일 주보', 
    Component: JuboPage1 
  },
  { 
    id: 'page2', 
    title: '예배 및 소식', 
    Component: JuboPage2 
  },
  { 
    id: 'page3', 
    title: '봉사 및 예물', 
    Component: JuboPage3 
  },
  { 
    id: 'page4', 
    title: '기타안내', 
    Component: JuboPage4 
  },
]);
```

### 3.3 데이터 흐름

```
Jubo.jsx (issue 데이터)
  ↓
JuboPageSystem
  ├→ 메인 영역: 현재 페이지 (full size)
  ├→ 우측 미리보기: 나머지 3개 페이지 (scale 0.25)
  └→ 클릭 시: currentPageIndex 변경 + 애니메이션

각 JuboPage 컴포넌트:
  - Props: { data: issue, isPreview?: boolean }
  - isPreview=true일 때: scale transform으로 축소됨
```

---

## 4. 레이아웃

### 4.1 JuboPageSystem 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  헤더: "스마트 주보" (남색)                          │
├─────────────────────────────────────────────────────┤
│  서브헤더: ← 목록으로 | 제목 | PDF 다운로드         │
├──────────────────────────┬──────────────────────────┤
│                          │  미리보기 1 (축소)      │
│  메인 콘텐츠             │  ┌──────────────┐        │
│  (현재 페이지)           │  │  Page X      │        │
│                          │  │              │        │
│  ┌────────────────────┐  │  └──────────────┘        │
│  │                    │  │                          │
│  │   JuboPageX        │  │  미리보기 2 (축소)      │
│  │   (full size)      │  │  ┌──────────────┐        │
│  │                    │  │  │  Page Y      │        │
│  │                    │  │  │              │        │
│  └────────────────────┘  │  └──────────────┘        │
│                          │                          │
│                          │  미리보기 3 (축소)      │
│                          │  ┌──────────────┐        │
│                          │  │  Page Z      │        │
│                          │  │              │        │
│                          │  └──────────────┘        │
└──────────────────────────┴──────────────────────────┘
```

### 4.2 미리보기 렌더링

```javascript
// 우측 미리보기: 나머지 3개 페이지를 세로로 쌓기
{pages.map((page, idx) => {
  if (idx === currentPageIndex) return null; // 현재 페이지 제외
  
  return (
    <div
      key={page.id}
      onClick={() => setCurrentPageIndex(idx)}
      style={{
        position: 'absolute',
        transform: `scale(0.25) translateY(${offset}px)`,
        opacity: 0.5,
        zIndex: 10 - idx,
        cursor: 'pointer',
      }}
    >
      <page.Component data={issue} isPreview={true} />
    </div>
  );
})}
```

---

## 5. 애니메이션

### 5.1 페이지 전환 애니메이션

**메인 콘텐츠:**
```css
.main-page {
  animation: fadeInSlide 0.4s ease-out;
  transition: opacity 0.4s ease-in-out;
}

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
```

**우측 미리보기:**
```javascript
// React에서 inline style transition으로 처리
style={{
  transform: `scale(0.25) translateY(${idx * 20}px)`,
  opacity: isActive ? 0 : 0.5,
  transition: 'all 0.4s ease-out',
}}
```

### 5.2 전환 흐름

1. 사용자가 우측 미리보기 클릭
2. `currentPageIndex` 변경
3. 메인 콘텐츠: fade out → fade in (새 페이지)
4. 우측 미리보기: 재배열 + smooth slide

---

## 6. PDF 다운로드

### 6.1 4페이지 통합 렌더링

```javascript
// 숨겨진 영역에 4페이지 모두 렌더링
<div className="jubo-print-wrapper-all" style={{ display: 'none' }}>
  <JuboPage1 data={issue} />
  <JuboPage2 data={issue} />
  <JuboPage3 data={issue} />
  <JuboPage4 data={issue} />
</div>

// handleDownloadPdf는 기존 방식 유지
// html2canvas → jsPDF로 4페이지를 6페이지 A4로 변환
```

---

## 7. 파일 구조

### 7.1 신규 생성

```
src/components/jubo/
├── JuboPageSystem.jsx (메인 시스템)
├── JuboPage1.jsx (표지)
├── JuboPage2.jsx (예배 및 소식)
├── JuboPage3.jsx (봉사 및 예물)
└── JuboPage4.jsx (기타안내)
```

### 7.2 수정

```
src/pages/Jubo/Jubo.jsx
- Remove: Cover 렌더링 (코드는 유지)
- Remove: JuboSection2-5 import & 렌더링
- Add: JuboPageSystem import & 렌더링
- Keep: PDF 다운로드 로직
```

### 7.3 유지

```
src/components/jubo/
├── Cover.jsx (유지 - 나중 사용을 위해)
└── 기타 (Vision.jsx 등 기존 컴포넌트)
```

---

## 8. 구현 전 확인사항

- [ ] Tailwind CSS에서 scale transform 지원 확인
- [ ] 애니메이션 성능 (4개 페이지 동시 렌더링)
- [ ] 모바일 반응형 (우측 미리보기 처리)
- [ ] PDF 다운로드 (4페이지 통합)

---

## 9. 다음 단계

1. **설계 승인** (이 문서)
2. **구현 계획 작성** (writing-plans 스킬)
3. **각 JuboPage 컴포넌트 구현**
4. **JuboPageSystem 구현**
5. **Jubo.jsx 통합**
6. **테스트 & 배포**

---

**승인 대기 중** ✋
