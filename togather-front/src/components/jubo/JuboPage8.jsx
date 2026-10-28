import { useContext } from "react";
import { useChurch } from "@/contexts/ChurchContext";
import KakaoMap from "@/components/common/KakaoMap";
import { JuboBookHeader, JuboBookFooter, JuboSectionTitle, JuboGreyBox } from "./shared";
import { JuboPrintModeContext } from "./juboPrintMode";
import locationIcon from "@/assets/icon-svg/footer-location.svg";
import phoneIcon from "@/assets/icon-svg/footer-phone.svg";
import mailIcon from "@/assets/icon-svg/footer-email.svg";

export default function JuboPage8({ data }) {
  const { church } = useChurch();
  const printMode = useContext(JuboPrintModeContext);
  const regular = (church.worshipSchedule?.regular ?? []).filter((s) => !s.name?.includes("학교"));
  const departments = church.worshipSchedule?.departments ?? [];

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <JuboBookHeader title="교회 안내" dateLabel={data?.dateLabel} />

      <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-4 flex flex-col gap-4">
        <div>
          <JuboSectionTitle title="예배 시간 안내" />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-1 rounded-lg">
              <p className="w-1/3 ml-6 bg-blue-4 text-white text-sm text-center py-2 rounded-b-lg">
                예배
              </p>
              <div className="px-5 py-4 space-y-3">
                {regular.map(({ name, time }) => (
                  <div key={name} className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-grey-9 text-center">{name}</span>
                    <span className="text-grey-6 text-center">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-blue-2 rounded-lg">
              <p className="w-1/3 ml-6 bg-blue-1 text-blue-6 text-sm text-center py-2 rounded-b-lg">
                주일학교
              </p>
              <div className="px-5 py-4 space-y-3">
                {departments.map(({ name, time }) => (
                  <div key={name} className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-grey-9 text-center">{name}</span>
                    <span className="text-grey-6 text-center">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <JuboSectionTitle title="오시는 길" />
          <JuboGreyBox className="flex-1 min-h-0 flex flex-col gap-6 pr-8 pt-6">
            <div className="flex-1 min-h-[140px] border border-bluegrey-6 rounded-xl overflow-hidden">
              <KakaoMap
                address={church.address}
                level={4}
                draggable={false}
                showControls={false}
                printMode={printMode}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="space-y-1.5 text-xs text-grey-8 bg-white p-4 rounded-lg">
              <div className="flex items-center gap-1.5">
                <img src={locationIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
                <span>{church.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <img src={phoneIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
                <span>
                  TEL {church.tel} {church.fax && `| FAX ${church.fax}`}
                </span>
              </div>
              {church.email && (
                <div className="flex items-center gap-1.5">
                  <img src={mailIcon} alt="" className="w-3.5 h-3.5 shrink-0" />
                  <span>{church.email}</span>
                </div>
              )}
            </div>
          </JuboGreyBox>
        </div>
      </div>

      <JuboBookFooter church={church} />
    </div>
  );
}
