const chapters = [
  "2S9QgPtjyAI", "lPirDihCzB8", "yMTu9f0mqvo", "L-cJjT9KlRk",
  "DkCm83-qrjA", "3wv9929uyDc", "iKdmuHML6kU", "MApiviptd2A",
  "461XjhCZVUY", "HCeaKSOB_3Y", "wI_oQcpL0as",
];
const params = new URLSearchParams(location.search);
const video = params.get("v");
const index = chapters.indexOf(video);
const heading = document.getElementById("titulo");
const player = document.getElementById("player");

function chapterUrl(index) {
  const query = new URLSearchParams({
    v: chapters[index],
  });
  return `player.html?${query}`;
}

if (index >= 0) {
  const title = `A reforma da natureza — Capítulo ${index + 1}`;
  heading.textContent = title;
  document.title = `${title} | Mundos Sonoros`;
  player.title = `Player do YouTube: ${title}`;
  player.src = `https://www.youtube.com/embed/${video}?autoplay=0&playsinline=1&hl=pt-BR`;
  document.querySelector('.video-box').hidden = false;
  document.getElementById('player-help').hidden = false;
  listeningHistory.save(video);
  for (const [id, target] of [["anterior", index - 1], ["proximo", index + 1]]) {
    if (target >= 0 && target < chapters.length) {
      const link = document.getElementById(id);
      link.href = chapterUrl(target);
      link.textContent = `${id === "anterior" ? "Capítulo anterior" : "Próximo capítulo"}: ${target + 1}`;
      link.hidden = false;
    }
  }
} else {
  heading.textContent = "Capítulo não encontrado";
  document.title = 'Capítulo não encontrado | Mundos Sonoros';
  document.querySelector(".video-box").hidden = true;
  const message = document.getElementById("player-message");
  message.textContent = "Escolha um dos capítulos na página inicial para começar a ouvir.";
  message.hidden = false;
}
