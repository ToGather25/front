import { Link } from "react-router";
import LogoIcon from "@/assets/icons/512x512.png";
import { useChurch } from "@/contexts/ChurchContext";
import Section from "@/components/common/Section";
import SectionTitle from "@/components/common/SectionTitle";

export default function JuboPreviewSection() {
  const { church } = useChurch();
  const vision = church.yearlyVision ?? {};

  return (
    <Section className="py-12 pb-20 bg-bluegrey-1">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <SectionTitle>스마트 주보</SectionTitle>
          <Link
            to="/주보"
            className="flex items-center gap-1 text-body-3 font-medium text-grey-7 hover:text-blue-6 transition-colors"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <div className="bg-white border border-bluegrey-2 rounded-2xl p-6 flex items-center gap-5">
          {/* 이전 버튼 */}
          <button className="w-10 h-10 rounded-full bg-white border border-bluegrey-2 flex items-center justify-center hover:border-blue-5 hover:text-blue-6 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* 주보 내용 */}
          <div className="flex-1 flex gap-5 items-stretch min-h-[200px]">
            {/* 표어 카드 */}
            <div className="bg-blue-1 rounded-xl flex flex-col items-center justify-center gap-5 px-10 py-8">
              <div className="w-24 h-24 rounded-full bg-primary flex flex-col items-center justify-center text-white shadow-md">
                <span className="text-body-2 font-bold">{vision.year}</span>
                <span className="text-body-5 opacity-80">표어</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-body-2 font-semibold text-grey-11">{vision.verse}</p>
                <p className="text-body-4 text-grey-6">{church.name} 공동체</p>
              </div>
            </div>

            {/* 교회 이미지 */}
            <div className="flex-1 rounded-xl bg-bluegrey-2 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={LogoIcon} className="w-12 h-12 opacity-20" alt="" />
              </div>
              <div className="absolute bottom-4 left-4">
                <p className="text-body-5 text-grey-5">주보 이미지</p>
              </div>
            </div>
          </div>

          {/* 다음 버튼 */}
          <button className="w-10 h-10 rounded-full bg-white border border-bluegrey-2 flex items-center justify-center hover:border-blue-5 hover:text-blue-6 transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </Section>
  );
}
