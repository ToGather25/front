import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { getAdminMenus, updateAdminMenus } from "@/services/menuService";
import BubbleLoader from "@/components/common/BubbleLoader";

const MAX_DEPTH = 3;

const inputCls =
  "border border-grey-3 rounded-lg px-3 py-1.5 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

function emptyNode() {
  return { code: "", label: "", to: "", visible: true, children: [] };
}

// path(인덱스 배열)로 트리의 특정 노드가 담긴 배열과 그 안의 인덱스를 찾는다 —
// 추가/삭제/이동/수정이 전부 "부모 배열 하나를 통째로 바꾼다"로 환원된다.
function withNodeList(tree, path, fn) {
  if (path.length === 1) return fn(tree, path[0]);
  const [head, ...rest] = path;
  return tree.map((node, i) =>
    i === head ? { ...node, children: withNodeList(node.children, rest, fn) } : node,
  );
}

function updateAt(tree, path, field, value) {
  return withNodeList(tree, path, (list, i) =>
    list.map((n, idx) => (idx === i ? { ...n, [field]: value } : n)),
  );
}

function removeAt(tree, path) {
  return withNodeList(tree, path, (list, i) => list.filter((_, idx) => idx !== i));
}

function moveAt(tree, path, dir) {
  return withNodeList(tree, path, (list, i) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
}

function addChildAt(tree, path) {
  return withNodeList(tree, path, (list, i) =>
    list.map((n, idx) => (idx === i ? { ...n, children: [...n.children, emptyNode()] } : n)),
  );
}

/** 저장 직전에만 orderNo를 배열 순서로 매긴다 — 편집 중에는 사용자에게 숫자를 안 보여준다. */
function withOrderNo(nodes) {
  return nodes.map((n, i) => ({ ...n, orderNo: i, children: withOrderNo(n.children ?? []) }));
}

function MenuNode({ node, path, onUpdate, onRemove, onMove, onAddChild, depth }) {
  return (
    <div className="border border-grey-2 rounded-xl p-3" style={{ marginLeft: depth * 24 }}>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          className={`${inputCls} w-32`}
          placeholder="코드 (예: INTRO)"
          aria-label="메뉴 코드"
          value={node.code}
          onChange={(e) => onUpdate(path, "code", e.target.value.toUpperCase())}
        />
        <input
          className={`${inputCls} w-28`}
          placeholder="이름"
          aria-label="메뉴 이름"
          value={node.label}
          onChange={(e) => onUpdate(path, "label", e.target.value)}
        />
        <input
          className={`${inputCls} flex-1 min-w-[140px]`}
          placeholder="경로 (예: /교회소개)"
          aria-label="메뉴 경로"
          value={node.to}
          onChange={(e) => onUpdate(path, "to", e.target.value)}
        />
        <label className="flex items-center gap-1.5 text-body-5 text-grey-7 shrink-0">
          <input
            type="checkbox"
            checked={node.visible}
            onChange={(e) => onUpdate(path, "visible", e.target.checked)}
            className="accent-primary"
          />
          노출
        </label>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMove(path, -1)}
            aria-label="위로 이동"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(path, 1)}
            aria-label="아래로 이동"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-grey-5 hover:bg-grey-2"
          >
            ↓
          </button>
          {depth + 1 < MAX_DEPTH && (
            <button
              type="button"
              onClick={() => onAddChild(path)}
              className="text-caption text-primary font-semibold px-2"
            >
              + 하위
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(path)}
            className="text-caption text-grey-5 hover:text-red-500 px-2"
          >
            삭제
          </button>
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {node.children.map((child, i) => (
            <MenuNode
              key={i}
              node={child}
              path={[...path, i]}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMove={onMove}
              onAddChild={onAddChild}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenusManage() {
  const { data: initial, loading, error, refetch } = useFetch(() => getAdminMenus(), [], null);
  const [tree, setTree] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (initial) setTree(initial);
  }, [initial]);

  function update(path, field, value) {
    setTree((t) => updateAt(t, path, field, value));
  }
  function remove(path) {
    setTree((t) => removeAt(t, path));
  }
  function move(path, dir) {
    setTree((t) => moveAt(t, path, dir));
  }
  function addChild(path) {
    setTree((t) => addChildAt(t, path));
  }
  function addTopLevel() {
    setTree((t) => [...t, emptyNode()]);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      await updateAdminMenus(withOrderNo(tree));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[MenusManage] 저장 실패:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">메뉴 관리</h1>
        <div className="flex items-center gap-3">
          {saveError && <span className="text-body-5 text-red-500">저장 실패, 다시 시도해 주세요.</span>}
          {saved && <span className="text-body-5 text-blue-7">저장됨</span>}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-2 p-6">
        <p className="text-body-5 text-grey-5 mb-4">
          노출 해제한 메뉴는 그 하위 메뉴까지 공개 화면에서 함께 숨겨집니다. 최대 3단계까지
          만들 수 있습니다.
        </p>
        {loading ? (
          <div className="flex justify-center py-8">
            <BubbleLoader size="sm" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2">
            <p className="text-body-4 text-grey-5">메뉴를 불러오지 못했습니다.</p>
            <button onClick={refetch} className="text-body-5 text-primary underline">
              다시 시도
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tree.map((node, i) => (
              <MenuNode
                key={i}
                node={node}
                path={[i]}
                onUpdate={update}
                onRemove={remove}
                onMove={move}
                onAddChild={addChild}
                depth={0}
              />
            ))}
            {tree.length === 0 && (
              <p className="text-body-5 text-grey-5 py-4">등록된 메뉴가 없습니다.</p>
            )}
            <button
              onClick={addTopLevel}
              className="mt-1 flex items-center gap-2 text-body-4 text-primary font-medium hover:underline w-fit"
            >
              + 메뉴 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
