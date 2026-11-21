// 교적부 목록(Gyojeokbu)과 상세 페이지(GyojeokbuDetail)가 함께 쓰는 조각.

const AVATAR_COLORS = [
  ["#3d5588", "#eceef3"],
  ["#2b3c61", "#d0d6e2"],
  ["#60749d", "#eceef3"],
  ["#344874", "#d0d6e2"],
  ["#4b3734", "#f5ede9"],
  ["#cc6600", "#fff0e0"],
  ["#1a7bc0", "#e3f2fd"],
  ["#008848", "#e0f5eb"],
];

/** avatarTone 같은 저장된 필드 없이도 같은 이름이면 항상 같은 색이 나오도록 이름에서 직접 색을 뽑는다. */
function toneFromName(name) {
  let hash = 0;
  for (const ch of name || "") hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return hash + 1;
}

export function Avatar({ name, tone, size = "sm" }) {
  const [bg, fg] = AVATAR_COLORS[((tone ?? toneFromName(name)) - 1) % AVATAR_COLORS.length];
  const dim =
    size === "xl"
      ? "w-24 h-24 text-headline-4"
      : size === "lg"
        ? "w-16 h-16 text-sub-tit-2"
        : "w-9 h-9 text-body-3";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: bg, color: fg }}
    >
      {(name || "?").slice(0, 1)}
    </div>
  );
}

export function RoleChip({ role }) {
  return (
    <span className="inline-flex px-3.5 py-1.5 rounded-full bg-blue-1 text-blue-6 text-body-4 font-semibold whitespace-nowrap">
      {role}
    </span>
  );
}
