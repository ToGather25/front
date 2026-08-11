import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

const CATEGORY_EMOJI = { 사역: "🙏", 병중: "❤️‍🩹", 선교: "🌍", 소그룹: "🏠" };

export default function PrayerTopics() {
  const { prayerTopics } = juboConfig;

  return (
    <>
      <SectionTitle
        icon={
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M12 21c-4-3.5-8-6.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4.5-4 7.5-8 11z" />
          </svg>
        }
      >
        기도제목
      </SectionTitle>
      {prayerTopics.length === 0 ? (
        <p className="mt-8 text-center text-body-4 text-grey-5">이번 주 기도제목을 준비 중입니다</p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {prayerTopics.map((item, i) => (
            <div key={i} className="border border-bluegrey-2 rounded-xl p-4 flex items-start gap-3">
              {item.category && (
                <span className="text-xl shrink-0" aria-hidden="true">
                  {CATEGORY_EMOJI[item.category] ?? "🙏"}
                </span>
              )}
              <div>
                <p className="text-body-4 font-semibold text-grey-10">{item.title}</p>
                <p className="text-body-5 text-grey-6 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
