const videoModal = document.getElementById("video-modal");
const modalPlayer = document.getElementById("modal-player");
const videoTitle = document.getElementById("video-title");
const videoError = document.getElementById("video-error");
const videoStatus = document.getElementById("video-status");
const continueSection = document.getElementById("continuar");
const continueLink = document.getElementById("continuar-link");
const catalogue = new Map([...document.querySelectorAll(".livro .btn-ouvir")].map((link) => [
  new URL(link.href).searchParams.get("chapter"),
  link,
]));
const chapterNavigation = [
  [document.getElementById("modal-anterior"), -1, "Capítulo anterior"],
  [document.getElementById("modal-proximo"), 1, "Próximo capítulo"],
];
let lastTrigger;
let savedScrollY = 0;
let currentChapter;

function refreshHistory() {
  const chapter = readLastChapter();
  const link = catalogue.get(chapter);
  continueSection.hidden = !link;
  if (!link) return;
  continueLink.href = link.href;
  continueLink.textContent = `Continuar ouvindo: capítulo ${chapter}`;
}

function openChapter(chapter, trigger) {
  const link = catalogue.get(chapter);
  if (!link || !Object.hasOwn(chapterVideos, chapter)) return;

  const wasOpen = videoModal.open;
  currentChapter = chapter;
  videoTitle.textContent = chapterTitle(chapter);
  modalPlayer.setAttribute("aria-label", `Player: ${videoTitle.textContent}`);
  videoError.hidden = true;
  videoStatus.hidden = false;
  modalPlayer.poster = link.closest(".livro").querySelector(".capa").src;
  modalPlayer.src = chapterVideos[chapter];

  if (wasOpen) {
    videoTitle.focus();
  } else {
    lastTrigger = trigger;
    savedScrollY = window.scrollY;
    videoModal.showModal();
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("video-modal-open");
  }

  for (const [button, offset, label] of chapterNavigation) {
    const destination = adjacentChapter(chapter, offset);
    button.hidden = !catalogue.has(destination);
    if (!button.hidden) button.textContent = `${label}: ${destination}`;
  }

  saveLastChapter(chapter);
  modalPlayer.load();
  // A ação de ouvir também inicia a reprodução, sem um segundo clique.
  modalPlayer.play().catch((error) => {
    if (error.name === "NotAllowedError" && videoModal.open && currentChapter === chapter) {
      videoStatus.hidden = true;
      videoError.textContent = "O navegador bloqueou o início da reprodução. Acione o botão de reprodução para ouvir.";
      videoError.hidden = false;
    }
  });
}

for (const link of [...catalogue.values(), continueLink]) {
  link.setAttribute("aria-haspopup", "dialog");
  link.setAttribute("aria-controls", "video-modal");

  link.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const params = new URL(link.href).searchParams;
    const chapter = params.get("chapter");
    if (!Object.hasOwn(chapterVideos, chapter)) return;

    event.preventDefault();
    openChapter(chapter, link);
  });
}

for (const [button, offset] of chapterNavigation) {
  button.addEventListener("click", () => openChapter(adjacentChapter(currentChapter, offset)));
}

window.addEventListener("pageshow", refreshHistory);
window.addEventListener("storage", refreshHistory);
refreshHistory();

document.getElementById("close-video").addEventListener("click", () => {
  videoModal.close();
});

videoModal.addEventListener("click", (event) => {
  const bounds = videoModal.getBoundingClientRect();
  if (
    event.target === videoModal &&
    (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom)
  ) {
    videoModal.close();
  }
});

videoModal.addEventListener("close", () => {
  modalPlayer.pause();
  modalPlayer.removeAttribute("src");
  modalPlayer.load();
  videoError.hidden = true;
  videoStatus.hidden = true;
  document.body.classList.remove("video-modal-open");
  document.body.style.top = "";
  lastTrigger?.focus({ preventScroll: true });
  refreshHistory();
  window.scrollTo(0, savedScrollY);
});

modalPlayer.addEventListener("error", () => {
  if (!modalPlayer.hasAttribute("src")) return;
  videoStatus.hidden = true;
  videoError.textContent = `Não foi possível reproduzir o capítulo ${currentChapter}. Tente abrir o vídeo novamente.`;
  videoError.hidden = false;
});

modalPlayer.addEventListener("waiting", () => {
  if (videoModal.open && videoError.hidden) videoStatus.hidden = false;
});

for (const event of ["playing", "canplay", "pause"]) {
  modalPlayer.addEventListener(event, () => {
    videoStatus.hidden = true;
  });
}
