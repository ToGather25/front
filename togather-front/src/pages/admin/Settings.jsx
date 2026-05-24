import { useState } from "react";

const inputCls = "w-full border border-grey-3 rounded-xl px-4 py-3 text-body-3 text-grey-10 focus:outline-none focus:border-primary transition-colors";
const labelCls = "block text-body-5 font-semibold text-grey-7 mb-1.5";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-2 p-7">
      <h2 className="text-sub-tit-5 font-bold text-grey-10 mb-6 pb-4 border-b border-grey-2">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const [info, setInfo] = useState({
    name: "알곡교회",
    nameEn: "Algok Church",
    denomination: "대한예수교장로회 (합동)",
    pastor: "김영수 담임목사",
    address: "서울특별시 강남구 언주로 123",
    tel: "02-123-4567",
    fax: "02-123-4568",
    email: "office@algok.com",
    website: "https://www.algok.com",
    youtube: "https://www.youtube.com/@algok-church",
    instagram: "",
    facebook: "",
  });

  const [theme, setTheme] = useState({
    primaryColor: "#3B5280",
    fontFamily: "Pretendard",
  });

  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const update = field => e => setInfo(p => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-5 font-bold text-grey-11">사이트 기본 설정</h1>
        <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-primary text-white text-body-4 font-semibold hover:bg-blue-8 transition-colors">
          {saved ? "저장 완료 ✓" : "변경사항 저장"}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Church basic info */}
        <Section title="교회 기본 정보">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>교회명 (한국어)</label>
              <input className={inputCls} value={info.name} onChange={update("name")} />
            </div>
            <div>
              <label className={labelCls}>교회명 (영문)</label>
              <input className={inputCls} value={info.nameEn} onChange={update("nameEn")} />
            </div>
            <div>
              <label className={labelCls}>교단</label>
              <input className={inputCls} value={info.denomination} onChange={update("denomination")} />
            </div>
            <div>
              <label className={labelCls}>담임 목사</label>
              <input className={inputCls} value={info.pastor} onChange={update("pastor")} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>주소</label>
              <input className={inputCls} value={info.address} onChange={update("address")} />
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="연락처 정보">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>전화번호</label>
              <input className={inputCls} value={info.tel} onChange={update("tel")} placeholder="02-000-0000" />
            </div>
            <div>
              <label className={labelCls}>팩스</label>
              <input className={inputCls} value={info.fax} onChange={update("fax")} placeholder="02-000-0001" />
            </div>
            <div>
              <label className={labelCls}>이메일</label>
              <input className={inputCls} value={info.email} onChange={update("email")} placeholder="office@church.com" />
            </div>
            <div>
              <label className={labelCls}>홈페이지 URL</label>
              <input className={inputCls} value={info.website} onChange={update("website")} placeholder="https://www.church.com" />
            </div>
          </div>
        </Section>

        {/* SNS */}
        <Section title="SNS 채널">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>유튜브 URL</label>
              <input className={inputCls} value={info.youtube} onChange={update("youtube")} placeholder="https://www.youtube.com/@..." />
            </div>
            <div>
              <label className={labelCls}>인스타그램 URL</label>
              <input className={inputCls} value={info.instagram} onChange={update("instagram")} placeholder="https://www.instagram.com/..." />
            </div>
            <div>
              <label className={labelCls}>페이스북 URL</label>
              <input className={inputCls} value={info.facebook} onChange={update("facebook")} placeholder="https://www.facebook.com/..." />
            </div>
          </div>
        </Section>

        {/* Logo */}
        <Section title="로고 및 파비콘">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>교회 로고</label>
              <div className="border-2 border-dashed border-grey-3 rounded-xl p-6 flex flex-col items-center gap-2 text-grey-5 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p className="text-body-4">클릭하여 업로드</p>
                <p className="text-body-5">PNG, SVG (투명 배경 권장)</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>파비콘</label>
              <div className="border-2 border-dashed border-grey-3 rounded-xl p-6 flex flex-col items-center gap-2 text-grey-5 cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p className="text-body-4">클릭하여 업로드</p>
                <p className="text-body-5">ICO, PNG 32×32</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Theme */}
        <Section title="테마 설정">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>메인 색상</label>
              <div className="flex items-center gap-3">
                <input type="color" value={theme.primaryColor}
                  onChange={e => setTheme(p => ({...p, primaryColor: e.target.value}))}
                  className="w-12 h-12 rounded-lg border border-grey-3 cursor-pointer p-1" />
                <input className={inputCls} value={theme.primaryColor}
                  onChange={e => setTheme(p => ({...p, primaryColor: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>기본 폰트</label>
              <select className={inputCls + " bg-white"} value={theme.fontFamily}
                onChange={e => setTheme(p => ({...p, fontFamily: e.target.value}))}>
                <option>Pretendard</option>
                <option>Noto Sans KR</option>
                <option>Nanum Gothic</option>
              </select>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
