import { useState } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import { useFetch } from "@/hooks/useFetch";
import { getChurchProfile } from "@/services/churchProfileService";
import { SectionTitle } from "./shared";

// 백엔드에 QR 코드 URL 필드가 아직 없다 — 계좌 정보가 채워지기 전까지 표시할 값이
// 없으므로, 값이 생기기 전까지는 계좌 카드만 보여준다(shared.js:qrCodeUrl 없음 분기 재사용).
const qrCodeUrl = null;

export default function Giving() {
  const { church } = useChurch();
  const { data: profile, loading } = useFetch(
    () => getChurchProfile(church.id),
    [church.id],
    null,
  );
  const [copied, setCopied] = useState(false);

  async function handleCopyAccount() {
    try {
      await navigator.clipboard.writeText(profile.offeringAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(계좌번호는 여전히 화면에 보임)
    }
  }

  if (loading) return null;

  if (!profile?.offeringAccountNumber) {
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
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          }
        >
          헌금
        </SectionTitle>
        <p className="mt-5 text-body-4 text-grey-6">등록된 헌금 계좌 안내가 없습니다.</p>
      </>
    );
  }

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
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        }
      >
        헌금
      </SectionTitle>
      <div className="mt-5 flex flex-col gap-4">
        <button
          onClick={handleCopyAccount}
          className="text-left border border-bluegrey-2 rounded-xl p-5 hover:border-primary transition-colors print:pointer-events-none"
        >
          <p className="text-body-5 text-grey-6 mb-1">{profile.offeringBankName}</p>
          <p className="text-sub-tit-4 font-bold text-grey-11 mb-1">
            {copied ? "복사되었습니다" : profile.offeringAccountNumber}
          </p>
          <p className="text-body-5 text-grey-7">예금주: {profile.offeringAccountHolder}</p>
        </button>

        {qrCodeUrl && (
          <div className="border border-bluegrey-2 rounded-xl p-5 flex flex-col items-center gap-3">
            <img src={qrCodeUrl} alt="헌금 QR 코드" className="w-40 h-40 object-contain" />
            <p className="text-body-5 text-grey-6">QR 코드를 스캔해 온라인 헌금 페이지로 이동</p>
          </div>
        )}
      </div>
      <p className="mt-6 text-caption text-grey-6">
        헌금 영수증은 연말정산 시 자동 반영되며, 별도 발급이 필요한 경우 사무실로 문의해 주세요.
      </p>
    </>
  );
}
