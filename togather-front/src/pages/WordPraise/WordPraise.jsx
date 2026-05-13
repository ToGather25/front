import { useState } from "react";

const PLAYLISTS = [
  {
    id: "pl1",
    title: "2026년 봄 주일 찬양",
    description: "봄 시즌 주일 예배 찬양 모음",
    songs: [
      { id: 1, title: "주님 한 분만으로", artist: "찬양팀", duration: "4:32", videoId: null },
      { id: 2, title: "하나님의 영광이", artist: "찬양팀", duration: "5:10", videoId: null },
      { id: 3, title: "내 구주 예수님", artist: "찬양팀", duration: "3:58", videoId: null },
      { id: 4, title: "주님을 찬양해", artist: "찬양팀", duration: "4:20", videoId: null },
      { id: 5, title: "새 힘 얻으리", artist: "찬양팀", duration: "5:45", videoId: null },
    ],
  },
  {
    id: "pl2",
    title: "2026년 겨울 특별 찬양",
    description: "성탄절 및 신년 특별 예배 찬양",
    songs: [
      { id: 6, title: "기쁘다 구주 오셨네", artist: "찬양팀", duration: "3:48", videoId: null },
      { id: 7, title: "천사들의 노래가", artist: "찬양팀", duration: "4:05", videoId: null },
      { id: 8, title: "하나님이 세상을 이처럼", artist: "찬양팀", duration: "4:55", videoId: null },
    ],
  },
];

export default function WordPraise() {
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]);
  const [activeSong, setActiveSong] = useState(PLAYLISTS[0].songs[0]);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[200px] bg-blue-9 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-10/80 via-blue-9/60 to-blue-7/40" />
        <div className="relative max-w-[1576px] mx-auto px-8 pb-8 w-full">
          <h1 className="text-headline-4 font-bold text-white">찬양 플레이리스트</h1>
        </div>
      </div>

      <div className="max-w-[1576px] mx-auto px-8 py-14">
        {/* Playlist tabs */}
        <div className="flex gap-3 mb-10">
          {PLAYLISTS.map((pl) => (
            <button
              key={pl.id}
              onClick={() => { setActivePlaylist(pl); setActiveSong(pl.songs[0]); }}
              className={`px-5 py-2.5 rounded-full text-body-3 font-medium transition-all ${
                activePlaylist.id === pl.id
                  ? "bg-primary text-white"
                  : "border border-bluegrey-2 text-grey-9 hover:border-blue-4 hover:text-primary"
              }`}
            >
              {pl.title}
            </button>
          ))}
        </div>

        <div className="flex gap-10 items-start">
          {/* Player */}
          <div className="flex-1">
            <div className="w-full rounded-2xl overflow-hidden bg-grey-11 mb-6" style={{ aspectRatio: "16/9" }}>
              {activeSong.videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeSong.videoId}?autoplay=1`}
                  title={activeSong.title}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  {/* Music note icon */}
                  <svg className="w-16 h-16 text-grey-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3v10.55A4 4 0 107 17V7h8V3H9z"/>
                  </svg>
                  <p className="text-grey-5 text-body-3">영상이 연결되면 여기서 재생됩니다.</p>
                </div>
              )}
            </div>

            {/* Current song info */}
            <div className="px-1">
              <h2 className="text-sub-tit-3 font-bold text-grey-11 mb-1">{activeSong.title}</h2>
              <p className="text-body-3 text-grey-7">{activeSong.artist} · {activePlaylist.title}</p>
            </div>
          </div>

          {/* Song list */}
          <div className="w-[300px] shrink-0">
            <h3 className="text-body-2 font-bold text-grey-10 mb-4">{activePlaylist.description}</h3>
            <div className="flex flex-col gap-1">
              {activePlaylist.songs.map((song, idx) => (
                <button
                  key={song.id}
                  onClick={() => setActiveSong(song)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSong.id === song.id
                      ? "bg-primary text-white"
                      : "hover:bg-bluegrey-1 text-grey-9"
                  }`}
                >
                  <span className={`text-body-4 w-5 text-center shrink-0 ${activeSong.id === song.id ? "text-white/70" : "text-grey-5"}`}>
                    {activeSong.id === song.id ? (
                      <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4l14 8-14 8z"/>
                      </svg>
                    ) : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-3 font-medium truncate">{song.title}</p>
                    <p className={`text-body-4 ${activeSong.id === song.id ? "text-white/70" : "text-grey-5"}`}>{song.artist}</p>
                  </div>
                  <span className={`text-body-4 shrink-0 ${activeSong.id === song.id ? "text-white/70" : "text-grey-5"}`}>{song.duration}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
