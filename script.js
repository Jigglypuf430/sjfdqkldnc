// Tilt-driven hologram that reads CSS sensitivity and degrades nicely
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.holo-overlay');
  const wrapper = overlay?.parentElement; // .holo
  if (!overlay || !wrapper) return;

  // read --tilt-sensitivity off the wrapper (so you can tweak in CSS)
  const getScale = () =>
    parseFloat(getComputedStyle(wrapper).getPropertyValue('--tilt-sensitivity')) || 1;

  // Smooth background-position updates with rAF
  let targetX = 50, targetY = 50, rafId = null;
  const tick = () => {
    overlay.style.backgroundPosition = `${targetX}% ${targetY}%`;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  function onTilt(e) {
    const g = Math.max(-90, Math.min(90, e.gamma || 0)); // L/R
    const b = Math.max(-90, Math.min(90, e.beta  || 0)); // F/B
    const s = getScale();
    targetX = Math.max(0, Math.min(100, 50 + (g / 90) * 50 * s));
    targetY = Math.max(0, Math.min(100, 50 + (b / 90) * 50 * s));
  }

  // iOS 13+ permission (must be from a user gesture)
  const enableTilt = () => {
    if (window.DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(res => { if (res === 'granted') window.addEventListener('deviceorientation', onTilt); })
        .catch(() => { /* ignore */ });
    } else {
      window.addEventListener('deviceorientation', onTilt);
    }
    document.body.removeEventListener('click', enableTilt);
  };
  document.body.addEventListener('click', enableTilt, { once: true });

  // Desktop fallback: move with the mouse (so you can test quickly)
  window.addEventListener('pointermove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    targetX = Math.max(0, Math.min(100, x));
    targetY = Math.max(0, Math.min(100, y));
  }, { passive: true });
});
