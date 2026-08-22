import { Link, useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { searchEvents, getRecentEvents } from "@/services/eventsService";
import { EVENT_SORT_OPTIONS, getDepartmentStyle } from "@/config/events.config";
import { formatMonthDay } from "@/utils/date";
import EventSearchBar from "@/components/events/EventSearchBar";
import HighlightText from "@/components/common/HighlightText";

function EventResultRow({ event, query }) {
  const ds = getDepartmentStyle(event.department);
  return (
    <Link
      to={`/교회행사/${event.id}`}
      className="flex items-start gap-4 px-1 py-4 hover:bg-bluegrey-1 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <span className={`text-body-5 font-semibold ${ds.text}`}>{event.department}</span>
        <p className="text-body-2 font-bold text-grey-11 truncate mt-1">
          <HighlightText text={event.title} query={query} />
        </p>
        <p className="text-body-4 text-grey-7 line-clamp-1 mt-1">
          <HighlightText text={event.description} query={query} />
        </p>
      </div>
      <span className="text-body-4 text-grey-6 shrink-0 tabular-nums">
        {formatMonthDay(event.date)}
      </span>
    </Link>
  );
}

export default function EventSearch() {
  const { church } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "date";

  const { data: results = [], loading } = useFetch(
    () => searchEvents(church.id, { q, sort }),
    [church.id, q, sort],
    [],
  );
  const { data: recent = [] } = useFetch(() => getRecentEvents(church.id, 5), [church.id], []);

  const handleSearch = (value) => {
    setSearchParams(value ? { q: value, sort } : { sort });
  };

  const handleSortChange = (e) => {
    setSearchParams(q ? { q, sort: e.target.value } : { sort: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <div
        className="sticky z-30 bg-white border-b border-bluegrey-2 py-3 mb-6 transition-[top] duration-300 ease-in-out"
        style={{ top: "var(--header-offset)" }}
      >
        <EventSearchBar defaultValue={q} onSubmit={handleSearch} autoFocus />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-grey-2 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div>
          <p className="text-body-2 text-grey-8 font-semibold mb-8">
            '{q}'에 대한 검색 결과가 없습니다.
          </p>
          {recent.length > 0 && (
            <div>
              <p className="text-body-3 font-semibold text-grey-9 mb-2">최근 등록된 행사</p>
              <div className="flex flex-col divide-y divide-bluegrey-2">
                {recent.map((evt) => (
                  <EventResultRow key={evt.id} event={evt} query="" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-body-4 text-grey-7">
              검색결과 <b className="text-primary">{results.length}</b>건
            </p>
            <select
              value={sort}
              onChange={handleSortChange}
              className="border border-grey-3 rounded-xl px-3 py-2 text-body-5 text-grey-9 focus:outline-none focus:border-primary bg-white"
            >
              {EVENT_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col divide-y divide-bluegrey-2">
            {results.map((evt) => (
              <EventResultRow key={evt.id} event={evt} query={q} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
