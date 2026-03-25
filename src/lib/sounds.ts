export function playSound(name: 'fanfare' | 'click' | 'success') {
  try {
    const audio = new Audio(`/sounds/${name}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Sound file may not exist yet — silently ignore
    });
  } catch {
    // Ignore errors if audio is not supported
  }
}
