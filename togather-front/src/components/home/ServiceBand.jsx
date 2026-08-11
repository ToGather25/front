import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import { Link } from "react-router";

export default function ServiceBand() {
  const { church } = useChurch();
  const services = church.worshipSchedule?.regular ?? [];

  return (
    <Section className="pb-[120px] bg-white">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-caption font-semibold tracking-[0.22em] text-blue-6 uppercase mb-3">
            SERVICES
          </p>
          <h3 className="text-section-title font-bold tracking-[-1.2px] text-grey-12 m-0">
            예배 안내
          </h3>
        </div>
        <Link
          to="/말씀/안내"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-grey-7 hover:text-blue-6 transition-colors"
        >
          전체 안내
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Service strip */}
      <div
        className="grid border-t-2 border-blue-6"
        style={{ gridTemplateColumns: `repeat(${Math.min(services.length, 5)}, 1fr)` }}
      >
        {services.slice(0, 5).map((s, i) => (
          <div
            key={s.name}
            className={`pt-7 pb-4 pr-10 ${i > 0 ? "pl-10 border-l border-grey-4" : ""}`}
          >
            <p className="text-caption text-grey-6 mb-4 tracking-[0.04em]">{s.name}</p>
            <p className="text-headline-4 font-bold text-primary tracking-[-0.5px] leading-none mb-2">
              {s.time}
            </p>
            {s.location && <p className="text-body-5 text-grey-5">{s.location}</p>}
          </div>
        ))}
      </div>
    </Section>
  );
}
