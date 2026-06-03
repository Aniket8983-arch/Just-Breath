/**
 * Just Breath — Home Screen JavaScript
 *
 * Handles:
 *  1. Floating Sound FAB — toggle ambient sound (with graceful fallback)
 *  2. Button interactions — ripple + toast feedback
 *  3. Ambient bar sync with sound state
 */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/* ============================================================
   1. FLOATING SOUND FAB
   ============================================================ */
const initSoundFab = () => {
  const fab         = $('#sound-fab');
  const ambientBar  = $('#ambient-bar');

  if (!fab) return;

  /** Ambient audio — point to your file in assets/sounds/ */
  const AMBIENT_SRC = 'assets/sounds/rain.mp3';

  let audio    = null;
  let isPlaying = false;

  /** Lazily create the Audio object (only on first click) */
  const getAudio = () => {
    if (!audio) {
      audio        = new Audio(AMBIENT_SRC);
      audio.loop   = true;
      audio.volume = 0.5;
    }
    return audio;
  };

  /** Trigger a brief ripple animation on the FAB */
  const triggerRipple = () => {
    fab.classList.remove('is-rippling');
    // Force reflow so the animation restarts
    void fab.offsetWidth;
    fab.classList.add('is-rippling');
    fab.addEventListener('animationend', () => fab.classList.remove('is-rippling'), { once: true });
  };

  fab.addEventListener('click', async () => {
    triggerRipple();

    if (isPlaying) {
      // — Pause —
      getAudio().pause();
      isPlaying = false;
      fab.setAttribute('aria-pressed', 'false');
      fab.title = 'Play ambient sound';
      if (ambientBar) ambientBar.classList.add('is-paused');
    } else {
      // — Play —
      try {
        await getAudio().play();
        isPlaying = true;
        fab.setAttribute('aria-pressed', 'true');
        fab.title = 'Pause ambient sound';
        if (ambientBar) ambientBar.classList.remove('is-paused');
      } catch (err) {
        // Audio file not found — gracefully notify in console only
        console.info(
          '%cJust Breath: Add an audio file to assets/sounds/rain.mp3 to enable ambient sound.',
          'color: #C9A84C; font-style: italic;'
        );
        // Still toggle visual state so the UI feels responsive
        isPlaying = true;
        fab.setAttribute('aria-pressed', 'true');
        fab.title = 'Pause ambient sound';
        if (ambientBar) ambientBar.classList.remove('is-paused');
      }
    }
  });

  // Initialise: bar starts paused (no sound on load)
  if (ambientBar) ambientBar.classList.add('is-paused');
};

/* ============================================================
   2. BUTTON INTERACTIONS
   ============================================================ */
const initButtons = () => {
  const btnBreathing  = $('#btn-breathing');
  const btnMeditation = $('#btn-meditation');

  /**
   * Show a minimal toast / console message.
   * Replace this stub with actual navigation when other screens exist.
   */
  const handleAction = (label) => {
    console.log(
      `%c🌬 Just Breath: "${label}" selected.`,
      'color: #C9A84C; font-weight: bold; font-size: 13px;'
    );

    // Pulse the breath circle as visual feedback
    const circle = $('#breath-circle');
    if (circle) {
      circle.style.transform = 'scale(1.18)';
      circle.style.boxShadow =
        '0 0 60px rgba(201,168,76,0.55), inset 0 0 40px rgba(201,168,76,0.25)';
      setTimeout(() => {
        circle.style.transform = '';
        circle.style.boxShadow = '';
      }, 600);
    }
  };

  if (btnBreathing) {
    btnBreathing.addEventListener('click', () => handleAction('Start Breathing'));
  }

  if (btnMeditation) {
    btnMeditation.addEventListener('click', () => handleAction('Start Meditation'));
  }
};

/* ============================================================
   3. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSoundFab();
  initButtons();

  console.log(
    '%c🧘 Just Breath — Home Screen ready.',
    'color: #F5D78E; font-size: 14px; font-weight: 600; padding: 4px 0;'
  );
});
