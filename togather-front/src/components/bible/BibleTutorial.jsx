import { useState } from "react";

const TUTORIAL_SEEN_KEY = "bible-tutorial-seen";

export default function BibleTutorial() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(TUTORIAL_SEEN_KEY));

  if (!visible) return null;

  function handleClose() {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[150] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full px-8 py-8 flex flex-col items-center gap-5 text-center">
        <p className="text-sub-tit-4 font-bold text-grey-12">성경 읽기 이용 방법</p>
        <div className="flex flex-col gap-3 text-body-4 text-grey-7">
          <p>구절을 한 번 클릭하면 읽음 표시가 됩니다.</p>
          <p>구절을 두 번 클릭하면 좋아요가 됩니다.</p>
        </div>
        <button
          onClick={handleClose}
          className="w-full py-2.5 rounded-full bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
