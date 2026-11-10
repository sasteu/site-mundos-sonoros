const lastChapterKey = "mundos-sonoros:last-local-chapter";

function readLastChapter() {
  try {
    return localStorage.getItem(lastChapterKey);
  } catch {
    return null;
  }
}

function saveLastChapter(chapter) {
  try {
    localStorage.setItem(lastChapterKey, chapter);
  } catch {
    // Listening still works if browser storage is unavailable.
  }
}
