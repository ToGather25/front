# Figma → React/Tailwind 검증 및 수정

Figma 디자인 노드를 현재 React + Tailwind 구현과 비교 검증하고, 불일치 항목을 자동으로 수정합니다.

## 입력 형식

```
/figma-verify <Figma URL 또는 nodeId> [파일 경로(선택)]
```

예시:
- `/figma-verify https://www.figma.com/design/2KLWYlKyG81yEqobYDFyZc/...?node-id=12-2131`
- `/figma-verify 12:2131 src/pages/Church/Church.jsx`

## 실행 절차

### 1단계 — Figma 디자인 수집

`mcp__figma__get_design_context` 로 해당 노드의 디자인 정보(스크린샷 포함)를 가져온다.

- fileKey: CLAUDE.md에 명시된 `2KLWYlKyG81yEqobYDFyZc` 사용 (URL에서 추출 가능 시 URL 우선)
- nodeId: URL의 `node-id` 파라미터 또는 직접 입력값 (형식: `숫자:숫자`, URL의 `-`는 `:`로 변환)

### 2단계 — 대응 코드 파악

파일 경로가 명시된 경우 해당 파일을 읽는다.
명시되지 않은 경우 노드 이름과 CLAUDE.md의 페이지 목록을 대조해 자동으로 파일을 특정한다.

### 3단계 — 디자인 토큰 로드

`src/styles/tokens.css` 의 `@theme {}` 블록을 읽어 실제 사용 가능한 Tailwind 클래스 목록을 파악한다.

### 4단계 — 5가지 항목 검증

아래 기준으로 Figma 값과 코드를 1:1 대조한다.

#### A. Auto Layout → Flex 변환
| Figma | Tailwind |
|---|---|
| Horizontal | `flex-row` |
| Vertical | `flex-col` |
| gap | `gap-{n}` (4px 단위: 4→1, 8→2, 12→3, 16→4, 20→5, 24→6...) |
| align-items | `items-start/center/end` |
| justify-content | `justify-start/center/end/between` |
| wrap | `flex-wrap` |

#### B. Spacing / Padding / Gap
Figma px → Tailwind 단위 변환 (1 단위 = 4px):
- padding 값이 `@theme` 토큰과 일치하는지 확인
- 임의 값(`p-[20px]`)이 토큰 단위로 표현 가능한지 확인
- 하드코딩된 `style={{ margin: ... }}` 은 Tailwind 클래스로 교체

#### C. Typography
`src/styles/tokens.css` 정의 기준:
- font-size → `text-{headline|sub-tit|body|btn|field}-{n}` 클래스
- font-weight: 700=`font-bold`, 600=`font-semibold`, 500=`font-medium`, 400=`font-normal`
- line-height는 해당 text 클래스에 이미 포함되어 있으므로 별도 `leading-*` 중복 지정 불필요

#### D. Absolute Positioning
- Figma의 absolute 요소는 `absolute`, `top-*`, `left-*`, `right-*`, `bottom-*` 유지
- 부모 컨테이너에 `relative` 확인
- `translate-x/y` 변환도 Figma 값과 일치 여부 확인

#### E. 컴포넌트 구조
- 반복되는 UI 블록(3회 이상)은 별도 컴포넌트로 분리되어 있는지 확인
- Button, Card, Badge 등 원자 컴포넌트는 `src/components/ui/` 에 있어야 함

### 5단계 — 검증 리포트 출력

```
## 검증 결과: [노드명] (nodeId: XX:XX)

### ✅ 일치 항목
- ...

### ❌ 불일치 항목
| 항목 | Figma 값 | 현재 코드 | 수정 필요 |
|------|---------|---------|---------|
| ...  | ...     | ...     | ...     |

### 🔧 수정 예정 파일
- src/...
```

### 6단계 — 자동 수정

불일치 항목이 있으면 다음 원칙으로 코드를 수정한다:

**절대 지키는 규칙:**
1. Figma 수치를 임의로 변경하지 않는다
2. 토큰에 없는 값은 Tailwind arbitrary value (`[값]`)로 정확히 표현한다
3. 기존에 동작하는 로직(상태, 이벤트 핸들러)은 건드리지 않는다
4. 색상은 반드시 `tokens.css` 의 커스텀 색상(`primary`, `blue-*`, `grey-*` 등)을 우선 사용한다
5. 수정 후 스크린샷과 재대조해 레이아웃이 일치하는지 서술한다

## 참고: 이 프로젝트 토큰 체계

```
색상: primary, pale, blue-1~10, bluegrey-1~10, point-1~10, grey-1~12
타이포: text-headline-1~5, text-sub-tit-1~5, text-body-1~5, text-btn-*, text-field-*
폰트 패밀리: font-pretendard
```

Figma 디자인 시스템 fileKey: `2KLWYlKyG81yEqobYDFyZc`, nodeId: `5:722`
