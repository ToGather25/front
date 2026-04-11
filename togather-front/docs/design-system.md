# 디자인 시스템

소스: Figma — `2KLWYlKyG81yEqobYDFyZc`

- **디자인 시스템 프레임**: node `5:722`
- **화면 디자인**: node `12:2131`

토큰 파일: `src/styles/tokens.css` (Tailwind v4 `@theme` 블록)

---

## 폰트

**Pretendard** — CDN via `index.css` 또는 `index.html`

```css
--font-pretendard: "Pretendard", -apple-system, BlinkMacSystemFont,
  "Apple SD Gothic Neo", sans-serif;
```

`body`에 `font-family: var(--font-pretendard)` 기본 적용.

---

## 색상 팔레트

### Primary

| 클래스 | 값 | 용도 |
|--------|-----|------|
| `bg-primary` / `text-primary` | `#3B5280` | 메인 네이비 블루 |
| `bg-pale` / `text-pale` | `#B8C4D8` | 연한 블루그레이 |

### Blue Scale (`blue-1` ~ `blue-10`)

밝은 쪽(1)에서 어두운 쪽(10)으로. Figma 실측값 기준.

| 클래스 | 값 |
|--------|-----|
| `blue-1` | `#eceef3` |
| `blue-2` | `#d0d6e2` |
| `blue-3` | `#acb6cc` |
| `blue-4` | `#8395b3` |
| `blue-5` | `#60749d` |
| `blue-6` | `#3d5588` |
| `blue-7` | `#344874` |
| `blue-8` | `#2b3c61` |
| `blue-9` | `#232f4f` |
| `blue-10` | `#1b263d` |

**주요 사용 패턴**:
- `bg-blue-8` — 활성 탭/버튼 배경
- `bg-blue-1` — 선택된 캘린더 날짜 배경, 카드 배경 연한 강조
- `text-blue-7` — 호버 텍스트 컬러
- `border-blue-10` — 활성 상태 테두리

### Blue-Grey Scale (`bluegrey-1` ~ `bluegrey-10`)

UI 구분선, 배경, 비활성 텍스트에 사용.

| 클래스 | 값 |
|--------|-----|
| `bluegrey-1` | `#f4f5f6` |
| `bluegrey-2` | `#e6e8ea` |
| `bluegrey-3` | `#d3d7db` |
| `bluegrey-4` | `#b1b8be` |
| `bluegrey-5` | `#8d969e` |
| `bluegrey-6` | `#6d7882` |
| `bluegrey-7` | `#58616a` |
| `bluegrey-8` | `#454d54` |
| `bluegrey-9` | `#333a40` |
| `bluegrey-10` | `#1e2124` |

**주요 사용 패턴**:
- `border-bluegrey-2` — 카드/구분선 테두리
- `bg-bluegrey-1` — 헤더 배경, 푸터 배경, 캘린더 요일 행
- `text-bluegrey-5` — 플레이스홀더, 빈 상태 안내 텍스트

### Point Scale (`point-1` ~ `point-10`)

따뜻한 브라운 계열 포인트 색상. 현재 주요 사용처 미정.

### Grey Scale (`grey-1` ~ `grey-12`)

순수 무채색. 텍스트, 아이콘, 배경 구분에 사용.

| 클래스 | 주요 사용처 |
|--------|------------|
| `grey-1` ~ `grey-3` | 카드/배경 연한 단계 |
| `grey-6` ~ `grey-8` | 부제목, 설명 텍스트 |
| `grey-9` ~ `grey-10` | 일반 본문 텍스트 |
| `grey-11` ~ `grey-12` | 강조 텍스트, 제목 |

---

## 타이포그래피

Tailwind 유틸리티 클래스로 사용. `text-{이름}` 형태.

### Headline (Bold 권장)

| 클래스 | 크기 | Line-height |
|--------|------|-------------|
| `text-headline-1` | 56px | 64px |
| `text-headline-2` | 48px | 52px |
| `text-headline-3` | 36px | 44px |
| `text-headline-4` | 24px | 32px |
| `text-headline-5` | 18px | 24px |

### Sub-title (SemiBold 권장)

| 클래스 | 크기 | Line-height |
|--------|------|-------------|
| `text-sub-tit-1` | 28px | 40px |
| `text-sub-tit-2` | 24px | 32px |
| `text-sub-tit-3` | 20px | 28px |
| `text-sub-tit-4` | 18px | 24px |
| `text-sub-tit-5` | 16px | 24px |

### Body (Regular)

| 클래스 | 크기 | Line-height |
|--------|------|-------------|
| `text-body-1` | 18px | 28px |
| `text-body-2` | 16px | 24px |
| `text-body-3` | 14px | 22px |
| `text-body-4` | 14px | 20px |
| `text-body-5` | 12px | 18px |

### Button / Link

| 클래스 | 크기 |
|--------|------|
| `text-btn-large` | 18px |
| `text-btn-normal` | 16px |
| `text-btn-medium` | 14px |
| `text-btn-small` | 14px |
| `text-btn-xs` | 12px |

### Field

| 클래스 | 크기 | 용도 |
|--------|------|------|
| `text-field-placeholder` | 16px | 입력 필드 플레이스홀더 |
| `text-field-title` | 12px | 필드 레이블 |
| `text-field-desc` | 12px | 필드 설명 |

---

## 레이아웃 기준

| 항목 | 값 |
|------|-----|
| 최대 너비 (페이지 컨테이너) | `max-w-[1576px]` |
| 최대 너비 (헤더/푸터) | `max-w-[1920px]` |
| 헤더 높이 | `h-[72px]` |
| 기본 가로 패딩 | `px-4` (페이지), `px-8`/`px-16` (헤더/푸터) |
| sticky 헤더 보정 (서브탭) | `top-[72px]` |
