const videoModal = document.getElementById("video-modal");
const modalPlayer = document.getElementById("modal-player");
const videoTitle = document.getElementById("video-title");
const videoError = document.getElementById("video-error");
const videoStatus = document.getElementById("video-status");
let lastTrigger;
let savedScrollY = 0;

document.querySelectorAll(".btn-ouvir").forEach((link) => {
  link.setAttribute("aria-haspopup", "dialog");
  link.setAttribute("aria-controls", "video-modal");

  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    const params = new URL(link.href).searchParams;
    const chapter = params.get("chapter");
    if (!Object.hasOwn(chapterVideos, chapter)) return;

    event.preventDefault();
    lastTrigger = link;
    videoTitle.textContent = params.get("title") || "Ouça agora";
    modalPlayer.title = videoTitle.textContent;
    videoError.hidden = true;
    videoStatus.hidden = false;
    modalPlayer.poster = link.closest(".livro").querySelector(".capa").src;
    modalPlayer.src = chapterVideos[chapter];
    videoModal.showModal();
    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("video-modal-open");
    modalPlayer.load();
    // O clique em OUVIR também inicia a reprodução, sem um segundo clique.
    modalPlayer.play().catch((error) => {
      if (error.name === "NotAllowedError" && videoModal.open) {
        videoStatus.hidden = true;
        videoError.textContent = "O navegador bloqueou a reprodução automática. Toque no play para ouvir.";
        videoError.hidden = false;
      }
    });
  });
});

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
  window.scrollTo(0, savedScrollY);
  lastTrigger?.focus({ preventScroll: true });
});

modalPlayer.addEventListener("error", () => {
  if (!modalPlayer.hasAttribute("src")) return;
  videoStatus.hidden = true;
  const chapter = new URL(lastTrigger.href).searchParams.get("chapter");
  videoError.textContent = `Não foi possível reproduzir o capítulo ${chapter}. Tente abrir o vídeo novamente.`;
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
