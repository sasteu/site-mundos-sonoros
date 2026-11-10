// Store only a known video ID, never a URL or playback position.
const listeningHistory = {
  key: 'mundos-sonoros:last-chapter',
  read() {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  },
  save(video) {
    try {
      localStorage.setItem(this.key, video);
    } catch {
      // Private browsing, storage policy or quota must not block listening.
    }
  },
};
