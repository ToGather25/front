import { useState } from "react";

const TABS = [
  "인사말", "교회 비전", "예배 안내", "섬기는 사람들",
  "교회 연혁", "층별 안내", "오시는 길", "차량운행 안내",
];

// ── 인사말 ─────────────────────────────────────────────
function Greeting() {
  return (
    <div className="flex gap-10 items-start">
      <div className="flex-1">
        <h2 className="text-sub-tit-1 font-bold text-grey-11 mb-6">할렐루야!</h2>
        <div className="flex flex-col gap-4 text-body-2 text-grey-8 leading-relaxed">
          <p>투게더교회 홈페이지를 방문해 주셔서 감사합니다.</p>
          <p>저희 교회를 소개하겠습니다.</p>
          <p>
            첫째, 저희 교회는 대한예수교장로회 고신교단에 속한 보수적인 교회입니다.<br />
            1938년 9월 10일 대한예수교장로회 제27차 총회는 일제의 악랄하여 신사참배를 가결하였고 한상동 목사, 주남선 목사,
            손명복 전도사 등 신실한 형들은 신사참배를 반대하여 투옥되었습니다. 그들은 해방 후 출옥하여 한국교회를
            재건하기 위해 1946년 9월 20일에 개혁주의 보수인 신학교를 개교하였고, 이 학교는 후에 고려신학대학교로 발전하여
            현재는 고신교단으로 발전하였습니다.
          </p>
          <p>
            둘째, 저희 교회는 순수한 복음을 선포하고 가르치는 교회입니다.<br />
            개혁주의 신앙과 신학의 기초 위에 그리스도 중심의 말씀을 선포하며, 순수한 복음을 가르치는 교회입니다.
          </p>
          <p>
            셋째, 저희 교회는 다음세대를 길러내는 교회입니다.<br />
            저희 교회는 유치부, 초등부, 중고등부, 대학부, 청년부들에게 하나님의 말씀인 성경을 가르치고, 보수적인 신앙을
            전수하고 또 받아 자라도록 노력하는 주님의 교회입니다.
          </p>
          <p>
            이렇게 저희 투게더교회는 주의 복음과 사랑을 자녀들에게 전수하고,
            이곳과 세계에 전파 하기 위해 노력하는 주님의 교회입니다. 감사합니다.
          </p>
          <p className="text-right text-body-3 text-grey-7 mt-4">투게더교회 담임목사 <strong>김함께</strong></p>
        </div>
      </div>
      <div className="w-48 h-64 bg-grey-3 rounded-2xl shrink-0 flex items-center justify-center text-grey-5 text-body-4">
        목사님 사진
      </div>
    </div>
  );
}

// ── 교회 비전 ──────────────────────────────────────────
function Vision() {
  return (
    <div>
      <div className="bg-grey-2 rounded-2xl p-6 text-center mb-10">
        <p className="text-sub-tit-4 font-semibold text-grey-10">투게더교회 공동체 비전 ToGather</p>
        <p className="text-body-2 text-grey-7 mt-1">"함께 모여 하나님 아버지께로"</p>
      </div>
      <div className="relative flex flex-col items-start gap-6 ml-20">
        {[
          { label: "Together", description: "첫번째 비전에 대한 내용을 입력하세요." },
          { label: "To father", description: "두번째 비전에 대한 내용을 입력하세요." },
          { label: "To gather", description: "세번째 비전에 대한 내용을 입력하세요." },
        ].map(({ label, description }, i) => (
          <div key={label} className="flex items-center gap-8" style={{ marginLeft: i * 40 }}>
            <div className="w-36 h-36 rounded-full border-2 border-bluegrey-3 flex items-center justify-center shrink-0">
              <span className="text-sub-tit-4 font-semibold text-grey-9">{label}</span>
            </div>
            <p className="text-body-2 text-grey-7">── {description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 예배 안내 ──────────────────────────────────────────
function WorshipInfo() {
  const regularSchedule = [
    ["1부 예배", "주일 오전 9시", "1부 예배"],
    ["2부 예배", "주일 오전 11시", "1부 예배"],
    ["오후 예배", "주일 오후 2시", "1부 예배"],
    ["수요 예배", "수요일 오전 10시", "1부 예배"],
    ["금요기도회", "금요일 오후", "1부 예배"],
    ["새벽기도회", "매일 오전 5시반", "1부 예배"],
  ];
  const sundaySchool = [
    ["유치부", "주일 오전 11시", "1층 유치부실"],
    ["초등부", "주일 오전 11시", "B1층 초등부실"],
    ["중등부", "주일 오전 11시", "B1층 초등부실"],
    ["대학·청년부", "주일 오후 3시", "1층 카페"],
  ];
  return (
    <div className="grid grid-cols-2 gap-10">
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">정기 예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {regularSchedule.map(([name, time, location]) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">주일학교예배</h3>
        <table className="w-full text-body-4 border-t border-bluegrey-3">
          <tbody>
            {sundaySchool.map(([name, time, location]) => (
              <tr key={name} className="border-b border-grey-3">
                <td className="py-3 text-grey-8 w-28">{name}</td>
                <td className="py-3 text-grey-8">{time}</td>
                <td className="py-3 text-grey-7">{location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 섬기는 사람들 ──────────────────────────────────────
function Staff() {
  return (
    <div>
      <div className="flex items-center gap-2 border border-bluegrey-2 rounded-full px-4 py-2 mb-6 max-w-md">
        <svg className="w-4 h-4 text-grey-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input className="flex-1 outline-none text-body-4 text-grey-8 placeholder:text-grey-5" placeholder="교역자 검색" />
      </div>
      <div className="flex gap-2 mb-8">
        {["#담임목사", "#간사", "#협동장로", "#부목사"].map((tag) => (
          <span key={tag} className="px-3 py-1 bg-grey-2 text-body-5 text-grey-7 rounded-full">{tag}</span>
        ))}
      </div>

      <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">담임목사</h3>
      <div className="border border-bluegrey-2 rounded-2xl p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-grey-3 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <p className="text-body-3 font-semibold text-grey-11">김함께 목사</p>
              <button className="text-body-5 text-blue-7 border border-blue-7 px-3 py-0.5 rounded-full">글 남기기</button>
            </div>
            <p className="text-body-5 text-grey-6">02-1234-5678</p>
            <p className="text-body-5 text-grey-6">gather@gmail.com</p>
            <p className="text-body-4 text-grey-7 mt-2">교회 내 역할 및 소속 부서 등을 입력하세요.</p>
          </div>
          <div className="flex flex-col gap-2 text-body-5 text-grey-7 w-40">
            <div>
              <p className="text-grey-5 text-body-5">학력</p>
              <p>OOO대학교 졸업</p>
              <p>OOO신대학원 졸업</p>
              <p>미국 OOO대학교 신학대학원</p>
            </div>
            <div className="mt-1">
              <p className="text-grey-5 text-body-5">약력</p>
              <p>OO교회 nnn사 사역</p>
              <p>전 OO교회 담임목사</p>
              <p>2008' OO역 박사 취득</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-sub-tit-4 font-semibold text-grey-11 mb-4">교역자</h3>
      <div className="grid grid-cols-2 gap-4">
        {["김무리 목사", "김모두 전도사", "임축복 목사", "이행복 전도사"].map((name) => (
          <div key={name} className="border border-bluegrey-2 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-grey-3 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-body-4 font-semibold text-grey-11">{name}</p>
                  <button className="text-body-5 text-blue-7 border border-blue-7 px-2 py-0.5 rounded-full">글 남기기</button>
                </div>
                <p className="text-body-5 text-grey-6">02-1234-5678</p>
                <p className="text-body-5 text-grey-6">gather@gmail.com</p>
                <p className="text-body-5 text-grey-7 mt-1">교회 내 역할 및 소속 부서 등을 입력하세요.</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 교회 연혁 ──────────────────────────────────────────
function History() {
  const decades = [
    {
      era: "2020~",
      events: [
        ["2026.01.01", "내용을 입력하세요."],
        ["2025.12.01", "내용을 입력하세요."],
        ["2025.01.01", "내용을 입력하세요."],
        ["2024.12.01", "내용을 입력하세요."],
        ["2024.07.01", "내용을 입력하세요."],
        ["2024.02.22", "내용을 입력하세요."],
        ["2023.11.13", "내용을 입력하세요."],
        ["2023.02.01", "내용을 입력하세요."],
        ["2022.12.06", "내용을 입력하세요."],
        ["2022.03.20", "내용을 입력하세요."],
        ["2021.10.13", "내용을 입력하세요."],
        ["2020.01.01", "내용을 입력하세요."],
      ],
    },
    {
      era: "2010~",
      events: [
        ["2019.01.01", "내용을 입력하세요."],
        ["2019.12.01", "내용을 입력하세요."],
        ["2018.12.01", "내용을 입력하세요."],
        ["2017.07.01", "내용을 입력하세요."],
        ["2017.02.22", "내용을 입력하세요."],
        ["2016.11.13", "내용을 입력하세요."],
        ["2016.02.01", "내용을 입력하세요."],
        ["2015.12.08", "내용을 입력하세요."],
        ["2014.03.20", "내용을 입력하세요."],
        ["2013.10.13", "내용을 입력하세요."],
        ["2013.01.01", "내용을 입력하세요."],
      ],
    },
  ];
  return (
    <div className="max-w-xl">
      {decades.map(({ era, events }) => (
        <div key={era} className="mb-8">
          <h3 className="text-headline-3 font-bold text-grey-11 mb-4">{era}</h3>
          <ul className="flex flex-col gap-2">
            {events.map(([date, content]) => (
              <li key={date} className="flex items-start gap-4 text-body-4">
                <span className="text-blue-7 shrink-0">◆</span>
                <span className="text-grey-7 w-24 shrink-0">{date}</span>
                <span className="text-grey-9">{content}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── 층별 안내 ──────────────────────────────────────────
function FloorGuide() {
  const floors = [
    ["4층", "청년부실, 사무실"],
    ["3층", "목양실, 당회실, 방송실, 재정부실"],
    ["2층", "본당, 자모실"],
    ["1층", "식당, 새가족실, 카페, 유치부실"],
    ["B1층", "중고등부실, 초등부실, 소회의실1, 소회의실2, 소회의실3"],
  ];
  return (
    <div className="max-w-lg">
      <table className="w-full text-body-4 border-t border-bluegrey-3">
        <tbody>
          {floors.map(([floor, rooms]) => (
            <tr key={floor} className="border-b border-grey-3">
              <td className="py-4 font-semibold text-grey-10 w-16">{floor}</td>
              <td className="py-4 text-grey-8">{rooms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 오시는 길 ──────────────────────────────────────────
function Direction() {
  return (
    <div className="max-w-2xl">
      <div className="w-full h-72 bg-grey-3 rounded-2xl flex items-center justify-center text-grey-6 mb-4">
        지도 영역 (카카오맵/구글맵 연동)
      </div>
      <p className="text-body-4 text-grey-7">경기도 부천시 양지로 166번길 34 (옥길동)</p>
    </div>
  );
}

// ── 차량운행 안내 ──────────────────────────────────────
function TransportGuide() {
  const routes = ["운행코스 1", "운행코스 2", "운행코스 3", "운행코스 4", "운행코스 5"];
  return (
    <div className="max-w-2xl">
      <table className="w-full text-body-4 border-t border-bluegrey-3 mb-8">
        <tbody>
          {routes.map((route) => (
            <tr key={route} className="border-b border-grey-3">
              <td className="py-4 font-semibold text-grey-10 w-32">{route}</td>
              <td className="py-4 text-grey-6">시간을 입력하세요.</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full h-64 bg-grey-3 rounded-2xl flex items-center justify-center text-grey-6">
        지도 영역 (카카오맵/구글맵 연동)
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  "인사말": <Greeting />,
  "교회 비전": <Vision />,
  "예배 안내": <WorshipInfo />,
  "섬기는 사람들": <Staff />,
  "교회 연혁": <History />,
  "층별 안내": <FloorGuide />,
  "오시는 길": <Direction />,
  "차량운행 안내": <TransportGuide />,
};

export default function Church() {
  const [activeTab, setActiveTab] = useState("인사말");

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[120px] bg-blue-9 flex items-end">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-[1576px] mx-auto px-4 pb-5 w-full">
          <h1 className="text-2xl font-bold text-white">교회 소개</h1>
        </div>
      </div>

      {/* Sub-tab Navigation — Figma main_box_nav 스타일 */}
      <div className="border-b border-bluegrey-2 bg-white sticky top-[72px] z-40">
        <div className="max-w-[1576px] mx-auto px-4">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-5 text-base whitespace-nowrap border-b-2 transition-colors font-medium ${
                  activeTab === tab
                    ? "border-blue-8 text-blue-8 font-semibold"
                    : "border-transparent text-bluegrey-6 hover:text-bluegrey-10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1576px] mx-auto px-4 py-10">
        {TAB_CONTENT[activeTab]}
      </div>
    </div>
  );
}
