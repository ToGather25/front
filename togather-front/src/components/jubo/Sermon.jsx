import { useState } from "react";
import IcoHeartRed from "@/assets/icon-svg/heart-red.svg";
import IcoHeartStroke from "@/assets/icon-svg/heart-stroke.svg";
import juboConfig from "@/config/jubo.config";
import { SectionTitle } from "./shared";

export default function Sermon() {
  const { sermon } = juboConfig;
  const [liked, setLiked] = useState(false);

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
            <path d="M12 6.253v13M12 6.253C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      >
        말씀
      </SectionTitle>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h2 className="text-sub-tit-3 font-bold text-grey-11">{sermon.title}</h2>
        <button
          onClick={() => setLiked((prev) => !prev)}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className="shrink-0 print:hidden"
        >
          <img src={liked ? IcoHeartRed : IcoHeartStroke} className="w-6 h-6" alt="" />
        </button>
      </div>
      <blockquote className="mt-5 pl-5 border-l-4 border-primary text-body-3 text-grey-9 leading-relaxed">
        {sermon.scripture}
      </blockquote>
      {sermon.outline?.length > 0 && (
        <div className="mt-6">
          <p className="text-body-5 font-bold text-grey-9 mb-2">설교 개요</p>
          <ul className="list-disc list-inside space-y-1">
            {sermon.outline.map((item, i) => (
              <li key={i} className="text-caption text-grey-7">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
