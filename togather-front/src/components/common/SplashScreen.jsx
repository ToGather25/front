import churchLogo from "@/assets/icons/옥길교회_logo_세로.png";
import togatherLogo from "@/assets/icons/ToGather_logo.png";

export default function SplashScreen({ show }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center bg-grey-1 md:hidden transition-opacity duration-500 ease-out ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!show}
    >
      <div className="flex-[1.2]" />
      <img src={churchLogo} alt="옥길교회" className="w-28" />
      <p className="mt-5 text-center text-body-4 text-grey-6 leading-relaxed">
        같이, 가치있는
        <br />
        신앙생활
      </p>
      <div className="flex-[2]" />
      <img src={togatherLogo} alt="ToGather" className="mb-10 w-28 opacity-40" />
    </div>
  );
}
