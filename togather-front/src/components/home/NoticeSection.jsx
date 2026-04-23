import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getNotices } from "@/services/noticeService";
import Section from "@/components/common/Section";
import SectionTitle from "@/components/common/SectionTitle";

export default function NoticeSection() {
  const { church } = useChurch();
  const { data: notices = [] } = useFetch(
    () => getNotices(church.id),
    [church.id],
    []
  );
  const featured = notices.find((n) => n.featured);
  const cards = notices.filter((n) => !n.featured);

  return (
    <Section className="py-12 bg-bluegrey-1">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionTitle>공지 알림</SectionTitle>
          <button className="flex items-center gap-1 text-body-3 font-medium text-grey-7 hover:text-blue-6 transition-colors">
            더보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* 주요 공지 */}
        {featured && (
          <div className="bg-white border border-bluegrey-2 rounded-2xl flex items-center gap-4 px-6 py-4">
            <span className="shrink-0 bg-blue-1 text-blue-6 text-body-5 font-semibold px-3 py-1 rounded-md">
              {featured.type}
            </span>
            <p className="flex-1 text-body-2 text-grey-11 font-medium truncate">{featured.title}</p>
            <span className="shrink-0 text-body-4 text-grey-6">{featured.date}</span>
          </div>
        )}

        {/* 카드 그리드 */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-bluegrey-2 rounded-2xl p-5 flex flex-col gap-2 hover:border-blue-3 transition-colors cursor-pointer"
            >
              <p className="text-body-2 font-semibold text-grey-11 truncate">{n.title}</p>
              <p className="text-body-4 text-grey-7 line-clamp-2 whitespace-pre-line">
                {n.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
