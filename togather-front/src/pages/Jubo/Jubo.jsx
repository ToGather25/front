import { useSearchParams } from "react-router";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getJuboIssue } from "@/services/juboService";
import JuboPageSystem from "@/components/jubo/JuboPageSystem";
import { useJuboPdfDownload } from "@/components/jubo/useJuboPdfDownload";

export default function Jubo() {
  const { church } = useChurch();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issue");
  const { data: issue } = useFetch(
    () => (issueId ? getJuboIssue(church.id, issueId) : Promise.resolve(null)),
    [church.id, issueId],
    null,
  );
  const { PrintArea, download, isDownloading } = useJuboPdfDownload();

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
          onDownloadPdf={() => download(issue)}
          isDownloadingPdf={isDownloading}
        />
      </div>

      {PrintArea}
    </div>
  );
}
