const chapterVideos = {
  ...Object.fromEntries(Array.from({ length: 11 }, (_, index) => [
    String(index + 1), `videos/capitulo-${index + 1}.mp4`
  ])),
  "12": "videos/CAPITULO 12 - O Laborat\u00f3rio do Visconde.mp4",
  "13": "videos/CAPITULO 13 - Os Estudos.mp4",
  "14": "videos/CAPITULO 14 - A Pulga Gigantesca.mp4"
};
