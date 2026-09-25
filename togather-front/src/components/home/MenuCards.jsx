import { useState } from "react";
import { useNavigate } from "react-router";
import IcoChurchDefault from "@/assets/icon-svg/church-default.svg";
import IcoChurchHover from "@/assets/icon-svg/church-hover.svg";
import IcoAnnouncementDefault from "@/assets/icon-svg/annotation-check-default.svg";
import IcoAnnouncementHover from "@/assets/icon-svg/annotation-check-hover.svg";
import IcoNotiDefault from "@/assets/icon-svg/notification-text-default.svg";
import IcoNotiHover from "@/assets/icon-svg/notification-text-hover.svg";
import IcoBookDefault from "@/assets/icon-svg/book-open-default.svg";
import IcoBookHover from "@/assets/icon-svg/book-open-hover.svg";

export default function MenuCards() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const menus = [
    {
      id: 1,
      title: "교회소개",
      iconDefault: IcoChurchDefault,
      iconHover: IcoChurchHover,
      href: "/교회소개",
    },
    {
      id: 2,
      title: "행사 ∙ 소식",
      iconDefault: IcoAnnouncementDefault,
      iconHover: IcoAnnouncementHover,
      href: "/교회행사",
    },
    {
      id: 3,
      title: "스마트 주보",
      iconDefault: IcoNotiDefault,
      iconHover: IcoNotiHover,
      href: "/주보",
    },
    {
      id: 4,
      title: "성경 타자",
      iconDefault: IcoBookDefault,
      iconHover: IcoBookHover,
      href: "/말씀/필사",
    },
  ];

  return (
    <div className="py-[100px] flex justify-center w-full">
      <div className="flex gap-6 w-[1196px]">
        {menus.map((menu) => {
          const isHovered = hoveredId === menu.id;
          return (
            <button
              key={menu.id}
              onClick={() => navigate(menu.href)}
              onMouseEnter={() => setHoveredId(menu.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex-1 h-[220px] rounded-[36px] p-5 flex flex-col gap-5 items-center justify-center transition-all shadow-lg ${
                isHovered
                  ? "bg-primary text-white"
                  : "bg-white text-grey-11 hover:shadow-xl"
              }`}
            >
              <img
                src={isHovered ? menu.iconHover : menu.iconDefault}
                alt={menu.title}
                className="w-[48px] h-[48px]"
              />
              <h3
                className={`text-[26px] font-medium ${
                  isHovered ? "text-white" : "text-grey-11"
                }`}
              >
                {menu.title}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
