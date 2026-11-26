import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import BubbleLoader from "@/components/common/BubbleLoader";import { useFetch } from "@/hooks/useFetch";
import { getOffering } from "@/services/juboService";

const inputCls =
  "w-full border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-10 focus:outline-none focus:border-primary transition-colors";

const OfferingSectionEditor = forwardRef(function OfferingSectionEditor({ churchId }, ref) {
  const {
    data: initial,
    loading: prefillLoading,
    error: prefillError,
    refetch: refetchPrefill,
  } = useFetch(() => getOffering(churchId), [churchId], null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (initial) setGroups(initial);
  }, [initial]);

  function addGroup() {
    setGroups((prev) => [...prev, { title: "", items: [""] }]);
  }

  function updateGroupTitle(gi, value) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], title: value };
      return next;
    });
  }

  function removeGroup(gi) {
    setGroups((prev) => prev.filter((_, i) => i !== gi));
  }

  function addItem(gi) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: [...next[gi].items, ""] };
      return next;
    });
  }

  function updateItem(gi, ii, value) {
    setGroups((prev) => {
      const next = [...prev];
      const items = [...next[gi].items];
      items[ii] = value;
      next[gi] = { ...next[gi], items };
      return next;
    });
  }

  function removeItem(gi, ii) {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], items: next[gi].items.filter((_, i) => i !== ii) };
      return next;
    });
  }

  useImperativeHandle(ref, () => ({ getDraft: () => ({ OFFERING: groups }) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-3 font-bold text-grey-10">예물 안내</h3>
        <button onClick={addGroup} className="text-caption text-primary font-semibold" type="button">
          + 항목 추가
        </button>
      </div>
      {prefillLoading && <div className="flex justify-center py-2"><BubbleLoader size="sm" /></div>}
      {prefillError && (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-caption text-grey-5">직전 발행본을 불러오지 못했습니다.</p>
        </div>
      )}
      <div className="flex flex-col gap-4 mb-4">
        {groups.map((group, gi) => (
          <div key={gi} className="border border-grey-2 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                className={inputCls}
                placeholder="제목 (예: 십일조)"
                aria-label="제목"
                value={group.title}
                onChange={(e) => updateGroupTitle(gi, e.target.value)}
              />
              <button
                onClick={() => removeGroup(gi)}
                className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                type="button"
              >
                항목 삭제
              </button>
            </div>
            <div className="flex flex-col gap-2 pl-2">
              {group.items.map((item, ii) => (
                <div key={ii} className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    placeholder="예: OOO 외 00명"
                    aria-label="세부 항목"
                    value={item}
                    onChange={(e) => updateItem(gi, ii, e.target.value)}
                  />
                  <button
                    onClick={() => removeItem(gi, ii)}
                    className="shrink-0 text-caption text-grey-5 hover:text-red-500"
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(gi)}
                className="self-start text-caption text-primary"
                type="button"
              >
                + 세부 항목 추가
              </button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <p className="text-caption text-grey-5">등록된 항목이 없습니다.</p>}
      </div>
    </div>
  );
});

export default OfferingSectionEditor;
