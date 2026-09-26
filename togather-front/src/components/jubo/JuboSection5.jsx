import { useChurch } from "@/contexts/ChurchContext";

export default function JuboSection5() {
  const { church } = useChurch();

  return (
    <div className="flex flex-col gap-12 px-15 py-12">
      {/* 섬기는 분들 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">섬기는 분들</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          <div className="space-y-8">
            {/* 교역자 */}
            <div>
              <ol className="list-decimal ml-8 mb-3">
                <li className="text-body-3 font-semibold text-grey-12">교역자</li>
              </ol>
              <div className="grid grid-cols-3 gap-5 text-body-4 text-grey-8">
                <div>임재호(담임목사)</div>
                <div>박보아스(부목사)</div>
                <div>문건민(부목사)</div>
              </div>
            </div>

            {/* 장로 */}
            <div>
              <ol className="list-decimal ml-8 mb-3">
                <li className="text-body-3 font-semibold text-grey-12">장로</li>
              </ol>
              <div className="grid grid-cols-3 gap-5 text-body-4 text-grey-8">
                <div>이름(직책명)</div>
                <div>이름(직책명)</div>
                <div>이름(직책명)</div>
              </div>
            </div>

            {/* 찬양팀 */}
            <div>
              <ol className="list-decimal ml-8 mb-3">
                <li className="text-body-3 font-semibold text-grey-12">찬양팀</li>
              </ol>
              <div className="grid grid-cols-3 gap-5 text-body-4 text-grey-8">
                <div>피아노 | 김광미</div>
                <div>역할 | 이름</div>
                <div>역할 | 이름</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오시는 길 */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <div className="w-2 h-7 bg-primary rounded" />
          <h3 className="text-headline-5 font-bold text-grey-12">오시는 길</h3>
        </div>

        <div className="bg-bluegrey-1 rounded-5 px-12 py-10">
          {/* 지도 */}
          <div className="aspect-video bg-grey-2 rounded-5 mb-8 flex items-center justify-center text-grey-6">
            <span className="text-body-3">지도가 표시됩니다</span>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-5">
            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">주소</div>
              <div className="text-body-3 text-grey-9">경기도 부천시 양지로 166번길 34 (옥길동)</div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">전화</div>
              <div className="flex gap-5 text-body-3 text-grey-9">
                <div>
                  <span>TEL</span>
                  <span className="mx-2">02) 2615-4067</span>
                </div>
                <div>
                  <span>|</span>
                </div>
                <div>
                  <span>FAX</span>
                  <span className="mx-2">02) 2683-4326</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="text-body-3 font-semibold text-grey-12 w-40 shrink-0">이메일</div>
              <div className="text-body-3 text-grey-9">okc0120@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
