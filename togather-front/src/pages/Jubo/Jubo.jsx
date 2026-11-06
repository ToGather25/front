import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboWithSections } from "@/services/juboService";
import JuboPageSystem from "@/components/jubo/JuboPageSystem";
import { useJuboPdfDownload } from "@/components/jubo/useJuboPdfDownload";
import { resolveJuboVersion } from "@/components/jubo/juboVersions";

export default function Jubo() {
  const { church } = useChurch();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue");
  // 메타(호수/날짜/설교제목)와 섹션 전체(예배순서·헌금·소식 등)를 한 번에 받는다 — 각 페이지
  // 컴포넌트는 더 이상 섹션별로 따로 fetch하지 않고 issue.sections를 읽기만 한다.
  const { data: issue } = useFetch(
    () => getJuboWithSections(church.id, issueId || undefined),
    [church.id, issueId],
    null,
  );
  const { pages, printRows } = resolveJuboVersion(church);
  const { PrintArea, download, isDownloading } = useJuboPdfDownload(printRows);

  return (
    <div className="w-full bg-grey-1">
      {/* 헤더 */}
      <div className="relative h-[150px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1400px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">스마트 주보</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 - JuboPageSystem이 서브헤더를 포함 */}
      <div className="bg-white">
        <JuboPageSystem
          issue={issue}
          pages={pages}
          onDownloadPdf={() => download(issue)}
          isDownloadingPdf={isDownloading}
        />
      </div>

      {PrintArea}
    </div>
  );
}
