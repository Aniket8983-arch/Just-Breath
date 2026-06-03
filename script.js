/**
 * Just Breath — Application JavaScript
 *
 * Modules:
 *  1. Utilities
 *  2. Screen Registry — IDs for all application screens
 *  3. Screen Navigation stubs (no functionality yet)
 *  4. Floating Sound FAB — toggle ambient sound (with graceful fallback)
 *  5. Home button interactions — wire Home buttons to screens
 *  6. Init
 *
 * Screens defined in index.html:
 *  #home                      — visible on load (main element)
 *  #screen-breathing-setup    — hidden on load
 *  #screen-breathing-session  — hidden on load
 *  #screen-meditation-setup   — hidden on load
 *  #screen-meditation-session — hidden on load
 *  #screen-completion         — hidden on load
 */

'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/* ============================================================
   2. SCREEN REGISTRY
   Central list of every screen ID in the application.
   ============================================================ */
const SCREENS = {
  HOME:               'home',                    /* <main> element */
  BREATHING_SETUP:    'screen-breathing-setup',
  BREATHING_SESSION:  'screen-breathing-session',
  MEDITATION_SETUP:   'screen-meditation-setup',
  MEDITATION_SESSION: 'screen-meditation-session',
  COMPLETION:         'screen-completion',
};

/* ============================================================
   3. SCREEN NAVIGATION STUBS
   No functionality implemented yet — structure only.
   Each function is a placeholder for the navigation logic
   that will be wired up in a future step.
   ============================================================ */

/**
 * Show a screen by its ID, hide all others.
 * Implementation placeholder — not functional yet.
 * @param {string} screenId — one of the SCREENS values
 */
const showScreen = (screenId) => {
  /* TODO: implement screen transition logic */
  console.log(`%c[Nav] → ${screenId}`, 'color: #C9A84C; font-style: italic;');
};

/**
 * Navigate back to the Home screen.
 * Implementation placeholder — not functional yet.
 */
const goHome = () => {
  showScreen(SCREENS.HOME);
};

/**
 * Initialise all navigation buttons across every screen.
 * Wires each back-button and action-button to placeholder handlers.
 */
const initScreens = () => {
  /* ---- Back / End buttons that return to home ---- */
  const backButtonIds = [
    'back-breathing-setup',
    'back-breathing-session',
    'back-meditation-setup',
    'back-meditation-session',
  ];

  backButtonIds.forEach((id) => {
    const btn = $(`#${id}`);
    if (!btn) return;
    btn.addEventListener('click', goHome);
  });

  /* ---- Completion screen actions ---- */
  const btnCompletionHome = $('#btn-completion-home');
  if (btnCompletionHome) {
    btnCompletionHome.addEventListener('click', goHome);
  }

  const btnCompletionAgain = $('#btn-completion-again');
  if (btnCompletionAgain) {
    btnCompletionAgain.addEventListener('click', () => {
      /* TODO: restart last session */
      console.log('%c[Nav] Go Again — placeholder', 'color: #C9A84C; font-style: italic;');
    });
  }

  /* ---- Setup → Session proceed buttons (placeholders) ---- */
  const btnBeginBreathing = $('#btn-begin-breathing');
  if (btnBeginBreathing) {
    btnBeginBreathing.addEventListener('click', () => {
      showScreen(SCREENS.BREATHING_SESSION);
    });
  }

  const btnBeginMeditation = $('#btn-begin-meditation');
  if (btnBeginMeditation) {
    btnBeginMeditation.addEventListener('click', () => {
      showScreen(SCREENS.MEDITATION_SESSION);
    });
  }

  /* ---- Pause buttons — placeholders, no timer yet ---- */
  const btnPauseBreathing = $('#btn-pause-breathing');
  if (btnPauseBreathing) {
    btnPauseBreathing.addEventListener('click', () => {
      /* TODO: pause breathing timer */
      console.log('%c[Session] Pause breathing — placeholder', 'color: #C9A84C; font-style: italic;');
    });
  }

  const btnPauseMeditation = $('#btn-pause-meditation');
  if (btnPauseMeditation) {
    btnPauseMeditation.addEventListener('click', () => {
      /* TODO: pause meditation timer */
      console.log('%c[Session] Pause meditation — placeholder', 'color: #C9A84C; font-style: italic;');
    });
  }
};

/* ============================================================
   4. FLOATING SOUND FAB
   ============================================================ */
const initSoundFab = () => {
  const fab        = $('#sound-fab');
  const ambientBar = $('#ambient-bar');

  if (!fab) return;

  /** Ambient audio — point to your file in assets/sounds/ */
  const AMBIENT_SRC = 'assets/sounds/rain.mp3';

  let audio     = null;
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
   5. HOME BUTTON INTERACTIONS
   Wire the two Home Screen CTA buttons to their setup screens.
   showScreen() is a console-only placeholder until navigation
   is implemented in a future step.
   ============================================================ */
const initHomeButtons = () => {
  const btnBreathing  = $('#btn-breathing');
  const btnMeditation = $('#btn-meditation');

  /** Pulse the breath circle as visual feedback (kept from original) */
  const pulseCircle = () => {
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
    btnBreathing.addEventListener('click', () => {
      pulseCircle();
      showScreen(SCREENS.BREATHING_SETUP);
    });
  }

  if (btnMeditation) {
    btnMeditation.addEventListener('click', () => {
      pulseCircle();
      showScreen(SCREENS.MEDITATION_SETUP);
    });
  }
};

/* ============================================================
   6. INIT — run everything once DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScreens();
  initSoundFab();
  initHomeButtons();

  console.log(
    '%c🧘 Just Breath — Screen structure ready.\n   Screens: ' +
      Object.values(SCREENS).join(' · '),
    'color: #F5D78E; font-size: 13px; font-weight: 600; padding: 4px 0;'
  );
});
