function showListeningHistory() {
  const video = listeningHistory.read();
  const links = [...document.querySelectorAll('.livros-grid a')];
  const index = links.findIndex(link => new URL(link.href).searchParams.get('v') === video);
  const section = document.getElementById('continuar');
  section.hidden = index < 0;
  if (index < 0) return;

  const link = document.getElementById('continuar-link');
  link.href = links[index].href;
  link.textContent = `Continuar ouvindo: capítulo ${index + 1}`;
}

// Also refresh when returning through the browser's back/forward cache.
window.addEventListener('pageshow', showListeningHistory);
window.addEventListener('storage', showListeningHistory);
showListeningHistory();
