const STORAGE_KEY = "bible-reading-progress";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveLastPosition(book, chapter) {
  const all = readAll();
  all[book] = chapter;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getLastPosition(book) {
  return readAll()[book] ?? null;
}
