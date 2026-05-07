import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import { Link } from "react-router";

export default function ServiceBand() {
  const { church } = useChurch();
  const services = church.worshipSchedule?.regular ?? [];

  return (
    <Section className="py-[100px] bg-bluegrey-1">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
            SERVICES
          </p>
          <h3 className="text-[44px] font-bold tracking-[-1.2px] text-grey-12 m-0">
            예배 안내
          </h3>
        </div>
        <Link
          to="/교회소개"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors"
        >
          전체 안내
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(services.length, 5)}, 1fr)` }}
      >
        {services.slice(0, 5).map((s, i) => (
          <div
            key={s.name}
            className="bg-white rounded-[20px] border border-bluegrey-2 p-7 flex flex-col hover:-translate-y-1 hover:border-blue-4 transition-all duration-200"
            style={{ boxShadow: "0 14px 24px -8px rgba(0,0,0,0)" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 14px 24px -8px rgba(0,0,0,.10)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 14px 24px -8px rgba(0,0,0,0)")}
          >
            <div className="text-[13px] font-bold tracking-[0.14em] text-blue-6 mb-7">
              0{i + 1}
            </div>
            <div className="text-[20px] font-bold tracking-[-0.4px] text-grey-12 leading-[1.3]">
              {s.name}
            </div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.6px] text-blue-8 leading-[1.2]">
              {s.time}
            </div>
            {s.location && (
              <div className="mt-1.5 text-[14px] text-grey-7 leading-[1.4]">
                {s.location}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
