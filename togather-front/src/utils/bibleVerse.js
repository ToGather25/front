import { BOOK_ABBREV } from "@/config/bible.config";
import bibleData from "@/data/bible.json";

/** "골로새서 3:15-17" 같은 표기를 분해해 해당 구절 본문을 찾는다. 범위(-17)가 없으면 한 절만. */
export function lookupVerseText(scripture) {
  const m = scripture?.match(/^(\S+)\s*(\d+):(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const [, book, chapterStr, startStr, endStr] = m;
  const abbrev = BOOK_ABBREV[book];
  if (!abbrev) return null;
  const chapter = Number(chapterStr);
  const start = Number(startStr);
  const end = endStr ? Number(endStr) : start;
  const verses = [];
  for (let v = start; v <= end; v++) {
    const text = bibleData[`${abbrev}${chapter}:${v}`];
    if (text) verses.push(text.trim());
  }
  return verses.length ? verses.join(" ") : null;
}
