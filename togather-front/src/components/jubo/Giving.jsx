import { useState } from "react";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Giving() {
  const { giving } = juboConfig;
  const { bankAccount, qrCodeUrl } = giving;
  const [copied, setCopied] = useState(false);

  async function handleCopyAccount() {
    try {
      await navigator.clipboard.writeText(bankAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 조용히 무시(계좌번호는 여전히 화면에 보임)
    }
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
          <p className="text-body-5 text-grey-6 mb-1">{bankAccount.bank}</p>
          <p className="text-sub-tit-4 font-bold text-grey-11 mb-1">
            {copied ? "복사되었습니다" : bankAccount.accountNumber}
          </p>
          <p className="text-body-5 text-grey-7">예금주: {bankAccount.holder}</p>
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
