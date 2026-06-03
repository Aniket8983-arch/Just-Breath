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
   3. SCREEN NAVIGATION
   showScreen() is the single source of truth for all
   screen transitions in the application.
   ============================================================ */

/**
 * Show a screen by its ID, hiding everything else.
 *
 * Strategy:
 *  • Home (<main id="home">) is shown/hidden via inline display style
 *    because it is not a .screen element.
 *  • All .screen <section> elements are shown by toggling .is-active
 *    (CSS rule: .screen.is-active { display: flex }).
 *  • aria-hidden is kept in sync on every element for accessibility.
 *
 * @param {string} screenId — one of the SCREENS constant values
 */
const showScreen = (screenId) => {
  const homeEl = $('#home');

  /* 1. Deactivate every .screen section */
  document.querySelectorAll('.screen').forEach((section) => {
    section.classList.remove('is-active');
    section.setAttribute('aria-hidden', 'true');
  });

  if (screenId === SCREENS.HOME) {
    /* 2a. Returning home — restore the <main> element */
    if (homeEl) {
      homeEl.style.display = '';
      homeEl.removeAttribute('aria-hidden');
    }
  } else {
    /* 2b. Navigating to a screen — hide home, activate target */
    if (homeEl) {
      homeEl.style.display = 'none';
      homeEl.setAttribute('aria-hidden', 'true');
    }

    const target = $(`#${screenId}`);
    if (target) {
      target.classList.add('is-active');
      target.removeAttribute('aria-hidden');
      /* Scroll the new screen to top in case user had scrolled */
      target.scrollTop = 0;
    }
  }

  console.log(`%c[Nav] → ${screenId}`, 'color: #C9A84C; font-style: italic;');
};

/**
 * Navigate back to the Home screen.
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
    'back-meditation-setup',
  ];

  backButtonIds.forEach((id) => {
    const btn = $(`#${id}`);
    if (!btn) return;
    btn.addEventListener('click', goHome);
  });

  const btnEndBreathing = $('#back-breathing-session');
  if (btnEndBreathing) {
    btnEndBreathing.addEventListener('click', endBreathingSession);
  }

  const btnEndMeditation = $('#back-meditation-session');
  if (btnEndMeditation) {
    btnEndMeditation.addEventListener('click', endMeditationSession);
  }

  /* ---- Completion screen actions ---- */
  const btnCompletionHome = $('#btn-completion-home');
  if (btnCompletionHome) {
    btnCompletionHome.addEventListener('click', goHome);
  }

  const btnCompletionBreathingAgain = $('#btn-completion-breathing-again');
  if (btnCompletionBreathingAgain) {
    btnCompletionBreathingAgain.addEventListener('click', () => {
      showScreen(SCREENS.BREATHING_SETUP);
    });
  }

  const btnCompletionMeditationAgain = $('#btn-completion-meditation-again');
  if (btnCompletionMeditationAgain) {
    btnCompletionMeditationAgain.addEventListener('click', () => {
      showScreen(SCREENS.MEDITATION_SETUP);
    });
  }

  /* ---- Setup → Session proceed buttons ---- */
  const btnBeginBreathing = $('#btn-begin-breathing');
  if (btnBeginBreathing) {
    /* startBreathingSession() is defined in module 7 below */
    btnBeginBreathing.addEventListener('click', startBreathingSession);
  }

  const btnBeginMeditation = $('#btn-begin-meditation');
  if (btnBeginMeditation) {
    btnBeginMeditation.addEventListener('click', startMeditationSession);
  }

  /* ---- Pause buttons ---- */
  const btnPauseBreathing = $('#btn-pause-breathing');
  if (btnPauseBreathing) {
    btnPauseBreathing.addEventListener('click', () => {
      if (!breathingSession.isActive) return;

      if (breathingSession.isPaused) {
        breathingSession.isPaused = false;
        btnPauseBreathing.textContent = 'Pause';
        breathingSession.intervalId = setInterval(tickBreathing, 1000);
      } else {
        breathingSession.isPaused = true;
        btnPauseBreathing.textContent = 'Resume';
        if (breathingSession.intervalId) {
          clearInterval(breathingSession.intervalId);
          breathingSession.intervalId = null;
        }
      }
    });
  }

  const btnPauseMeditation = $('#btn-pause-meditation');
  if (btnPauseMeditation) {
    btnPauseMeditation.addEventListener('click', () => {
      if (!meditationSession.isActive) return;

      if (meditationSession.isPaused) {
        meditationSession.isPaused = false;
        btnPauseMeditation.textContent = 'Pause';
        meditationSession.intervalId = setInterval(tickMeditation, 1000);
      } else {
        meditationSession.isPaused = true;
        btnPauseMeditation.textContent = 'Resume';
        if (meditationSession.intervalId) {
          clearInterval(meditationSession.intervalId);
          meditationSession.intervalId = null;
        }
      }
    });
  }
};

/* ============================================================
   4. FLOATING SOUND FAB & DRAWER
   ============================================================ */

/**
 * Application state for sound settings.
 */
const soundSettings = {
  currentSound: 'rain', // default selection
};

const openSoundDrawer = () => {
  const drawer = $('#sound-drawer');
  if (drawer) {
    drawer.classList.add('is-active');
    drawer.setAttribute('aria-hidden', 'false');
  }
};

const closeSoundDrawer = () => {
  const drawer = $('#sound-drawer');
  if (drawer) {
    drawer.classList.remove('is-active');
    drawer.setAttribute('aria-hidden', 'true');
  }
};

const initSoundDrawer = () => {
  const fab = $('#sound-fab');
  const drawer = $('#sound-drawer');
  const closeBtn = $('#sound-drawer-close');
  const overlay = $('#sound-drawer-overlay');

  if (!fab || !drawer) return;

  // Set default selection in UI
  const defaultOpt = $('#sound-opt-rain');
  if (defaultOpt) {
    defaultOpt.classList.add('is-selected');
    defaultOpt.setAttribute('aria-checked', 'true');
  }

  /** Trigger a brief ripple animation on the FAB */
  const triggerRipple = () => {
    fab.classList.remove('is-rippling');
    // Force reflow so the animation restarts
    void fab.offsetWidth;
    fab.classList.add('is-rippling');
    fab.addEventListener('animationend', () => fab.classList.remove('is-rippling'), { once: true });
  };

  // Open drawer
  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerRipple();
    openSoundDrawer();
  });

  // Close drawer
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSoundDrawer);
  }

  // Close drawer on overlay click
  if (overlay) {
    overlay.addEventListener('click', closeSoundDrawer);
  }

  // Handle option selection
  const options = document.querySelectorAll('.sound-drawer__option');
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-checked', 'false');
      });
      opt.classList.add('is-selected');
      opt.setAttribute('aria-checked', 'true');

      soundSettings.currentSound = opt.dataset.sound;

      console.log(
        '%c[Sound Settings] current sound updated →',
        'color: #C9A84C; font-style: italic;',
        soundSettings.currentSound
      );
    });
  });

  // Close drawer on Escape keypress
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSoundDrawer();
    }
  });
};

/* ============================================================
   5. HOME BUTTON INTERACTIONS
   Wire the two Home Screen CTA buttons to their setup screens.
   showScreen() is now fully implemented in module 3.
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
   6. BREATHING SETUP STATE & CONTROLS
   Manages the three timing values (breath / hold / release).
   Values are stored in breathingSetup.timings and can be read
   by the Breathing Session screen when it is implemented.
   ============================================================ */

/**
 * Application state for the Breathing Setup screen.
 * Read this object from any future module to get the
 * user-selected timing values.
 *
 * @property {number} timings.breath  — inhale duration (seconds)
 * @property {number} timings.hold    — breath retention (seconds)
 * @property {number} timings.release — exhale duration (seconds)
 */
const breathingSetup = {
  timings: {
    breath:  4,   /* default — matches HTML initial value */
    hold:    7,   /* default — matches HTML initial value */
    release: 8,   /* default — matches HTML initial value */
  },

  /** Constraints */
  MIN: 1,
  MAX: 30,
};

/**
 * Initialise all timing controls on the Breathing Setup screen.
 *
 * Each control row has:
 *   data-control="breath|hold|release"  — which timing to update
 *   data-action="plus|minus"            — direction
 *
 * The output element id follows the pattern: val-{control}
 */
const initBreathingSetup = () => {

  /** Map control keys to their <output> element IDs */
  const OUTPUT_IDS = {
    breath:  'val-breath',
    hold:    'val-hold',
    release: 'val-release',
  };

  /**
   * Update the displayed value for one control and
   * toggle disabled state on its plus/minus buttons.
   *
   * @param {string} key — 'breath' | 'hold' | 'release'
   */
  const syncDisplay = (key) => {
    const val      = breathingSetup.timings[key];
    const outputEl = $(`#${OUTPUT_IDS[key]}`);

    if (!outputEl) return;

    /* Update text */
    outputEl.textContent = val;

    /* Brief colour-flash to confirm the change */
    outputEl.classList.remove('is-bumped');
    void outputEl.offsetWidth;           /* force reflow to restart transition */
    outputEl.classList.add('is-bumped');
    outputEl.addEventListener('transitionend', () => {
      outputEl.classList.remove('is-bumped');
    }, { once: true });

    /* Disable minus when at minimum */
    const minusBtn = $(`#btn-${key}-minus`);
    if (minusBtn) minusBtn.disabled = (val <= breathingSetup.MIN);

    /* Disable plus when at maximum */
    const plusBtn = $(`#btn-${key}-plus`);
    if (plusBtn) plusBtn.disabled = (val >= breathingSetup.MAX);
  };

  /**
   * Handle a stepper button click.
   * Reads data-control and data-action from the button element.
   *
   * @param {MouseEvent} e
   */
  const handleStepperClick = (e) => {
    const btn = e.target.closest('[data-control][data-action]');
    if (!btn) return;

    const key    = btn.dataset.control;   /* 'breath' | 'hold' | 'release' */
    const action = btn.dataset.action;    /* 'plus' | 'minus' */

    if (!(key in breathingSetup.timings)) return;

    const current = breathingSetup.timings[key];

    if (action === 'plus'  && current < breathingSetup.MAX) {
      breathingSetup.timings[key] = current + 1;
    } else if (action === 'minus' && current > breathingSetup.MIN) {
      breathingSetup.timings[key] = current - 1;
    }

    syncDisplay(key);

    /* Log current state for debugging */
    console.log(
      '%c[Breathing Setup] timings updated →',
      'color: #C9A84C; font-style: italic;',
      { ...breathingSetup.timings }
    );
  };

  /* ---- Attach one delegated listener to the entire screen ---- */
  const setupScreen = $('#screen-breathing-setup');
  if (setupScreen) {
    setupScreen.addEventListener('click', handleStepperClick);
  }

  /* ---- Initialise display and button states on load ---- */
  Object.keys(breathingSetup.timings).forEach(syncDisplay);
};

/* ============================================================
   7. BREATHING SESSION STATE
   Holds the timing values copied from the Setup screen at the
   moment Begin is pressed. Read by the Session screen and by
   future animation logic.
   ============================================================ */

/**
 * Active Breathing Session state.
 * Populated by startBreathingSession() — never mutated directly.
 *
 * @property {object}  timings         — locked-in timing values (seconds)
 * @property {number}  timings.breath  — inhale duration
 * @property {number}  timings.hold    — hold duration
 * @property {number}  timings.release — exhale duration
 * @property {boolean} isActive        — true once the session timer is running
 * @property {string}  currentPhase    — current phase: 'inhale' | 'hold' | 'exhale'
 * @property {number}  currentCount    — current count for the active phase
 * @property {number}  intervalId      — standard setInterval token
 * @property {boolean} isPaused        — pause state
 */
const breathingSession = {
  timings: {
    breath:  0,
    hold:    0,
    release: 0,
  },
  isActive: false,
  currentPhase: '',
  currentCount: 0,
  intervalId: null,
  isPaused: false,
};

/**
 * Stops the breathing session countdown timer and resets state.
 */
const stopBreathingTimer = () => {
  if (breathingSession.intervalId) {
    clearInterval(breathingSession.intervalId);
    breathingSession.intervalId = null;
  }
  breathingSession.isActive = false;
  breathingSession.isPaused = false;

  const pauseBtn = $('#btn-pause-breathing');
  if (pauseBtn) {
    pauseBtn.textContent = 'Pause';
  }

  const visualiser = $('#breathing-visualiser');
  if (visualiser) {
    visualiser.style.transform = '';
    visualiser.style.transition = '';
  }
};

/**
 * End the breathing session and return home.
 */
const endBreathingSession = () => {
  stopBreathingTimer();
  goHome();
};

/**
 * Updates the screen element contents and the circle size.
 */
const updateBreathingUI = () => {
  const phaseTitleEl = $('#breathing-phase-title');
  const phaseEl = $('#breathing-phase');
  const countEl = $('#breathing-count');
  const visualiser = $('#breathing-visualiser');

  const { currentPhase, currentCount, timings } = breathingSession;

  let phaseText = '';
  if (currentPhase === 'inhale') {
    phaseText = 'Inhale';
  } else if (currentPhase === 'hold') {
    phaseText = 'Hold';
  } else if (currentPhase === 'exhale') {
    phaseText = 'Exhale';
  }

  if (phaseTitleEl) {
    phaseTitleEl.textContent = phaseText;
  }
  if (phaseEl) {
    phaseEl.textContent = phaseText;
  }
  if (countEl) {
    countEl.textContent = currentCount;
  }

  if (visualiser) {
    let scale = 1.0;
    if (currentPhase === 'inhale') {
      const duration = timings.breath;
      const progress = (duration - currentCount) / duration;
      scale = 1.0 + progress * 0.5;
    } else if (currentPhase === 'hold') {
      scale = 1.5;
    } else if (currentPhase === 'exhale') {
      const duration = timings.release;
      const progress = (duration - currentCount) / duration;
      scale = 1.5 - progress * 0.5;
    }
    visualiser.style.transform = `scale(${scale})`;
  }
};

/**
 * Timer tick function called every second.
 */
const tickBreathing = () => {
  if (breathingSession.isPaused) return;

  breathingSession.currentCount--;

  if (breathingSession.currentCount <= 0) {
    if (breathingSession.currentPhase === 'inhale') {
      breathingSession.currentPhase = 'hold';
      breathingSession.currentCount = breathingSession.timings.hold;
    } else if (breathingSession.currentPhase === 'hold') {
      breathingSession.currentPhase = 'exhale';
      breathingSession.currentCount = breathingSession.timings.release;
    } else if (breathingSession.currentPhase === 'exhale') {
      breathingSession.currentPhase = 'inhale';
      breathingSession.currentCount = breathingSession.timings.breath;
    }
  }

  updateBreathingUI();
};

/**
 * Called when the user presses "Begin Session" on the Setup screen.
 *
 * Steps:
 *  1. Read the current values from breathingSetup.timings.
 *  2. Store them in breathingSession.timings (session state).
 *  3. Push the values into the Session screen's display elements.
 *  4. Navigate to the Breathing Session screen.
 */
const startBreathingSession = () => {
  /* 1. Read values from setup state */
  const { breath, hold, release } = breathingSetup.timings;

  /* 2. Store in session state */
  breathingSession.timings.breath  = breath;
  breathingSession.timings.hold    = hold;
  breathingSession.timings.release = release;
  breathingSession.isActive        = true;
  breathingSession.isPaused        = false;
  breathingSession.currentPhase    = 'inhale';
  breathingSession.currentCount    = breath;

  /* 3. Update Session screen display elements */
  const labelEl = $('#breathing-session-label');  /* nav step span */
  const visualiser = $('#breathing-visualiser');

  if (labelEl) {
    /* Show the locked-in pattern in the nav bar, e.g. "4s · 7s · 8s" */
    labelEl.textContent = `${breath}s \u00b7 ${hold}s \u00b7 ${release}s`;
  }

  if (visualiser) {
    visualiser.style.transition = 'transform 1s linear';
  }

  updateBreathingUI();

  // Clear any existing timer just in case
  if (breathingSession.intervalId) {
    clearInterval(breathingSession.intervalId);
  }
  breathingSession.intervalId = setInterval(tickBreathing, 1000);

  console.log(
    '%c[Breathing Session] State locked in \u2192',
    'color: #C9A84C; font-style: italic;',
    { ...breathingSession.timings }
  );

  /* 4. Navigate to the Session screen */
  showScreen(SCREENS.BREATHING_SESSION);
};

/* ============================================================
   7.5 MEDITATION SETUP STATE & CONTROLS
   ============================================================ */

/**
 * Application state for the Meditation Setup screen.
 */
const meditationSetup = {
  duration: 5,   // default 5 minutes
  focus: 'calm', // default focus mode
};

/**
 * Active Meditation Session state.
 */
const meditationSession = {
  duration: 0,
  focus: '',
  isActive: false,
  isPaused: false,
  timeLeft: 0,
  intervalId: null,
};

/**
 * Stops the meditation session countdown timer and resets state.
 */
const stopMeditationTimer = () => {
  if (meditationSession.intervalId) {
    clearInterval(meditationSession.intervalId);
    meditationSession.intervalId = null;
  }
  meditationSession.isActive = false;
  meditationSession.isPaused = false;

  const pauseBtn = $('#btn-pause-meditation');
  if (pauseBtn) {
    pauseBtn.textContent = 'Pause';
  }

  const progressEl = $('#meditation-progress');
  if (progressEl) {
    progressEl.style.width = '0%';
    progressEl.setAttribute('aria-valuenow', '0');
  }
};

/**
 * End the meditation session and return home.
 */
const endMeditationSession = () => {
  stopMeditationTimer();
  goHome();
};

/**
 * Complete the meditation session and transition to Completion screen.
 */
const completeMeditationSession = () => {
  const { duration } = meditationSession;
  stopMeditationTimer();

  const titleEl = $('#completion-title');
  if (titleEl) {
    titleEl.textContent = 'Session Complete 🎉';
  }

  const quoteEl = $('#completion-quote');
  if (quoteEl) {
    quoteEl.innerHTML = '<p>"Quiet the mind, and the soul will speak."</p>';
  }

  const statType = $('#stat-type');
  const statDuration = $('#stat-duration');
  const statRounds = $('#stat-rounds');

  if (statType) statType.textContent = 'Meditation';
  if (statDuration) statDuration.textContent = `${duration} min`;
  if (statRounds) statRounds.textContent = '–';

  showScreen(SCREENS.COMPLETION);
};

/**
 * Updates the meditation time display and progress bar.
 */
const updateMeditationUI = () => {
  const timeLeftEl = $('#meditation-time-left');
  const progressEl = $('#meditation-progress');

  const { timeLeft, duration } = meditationSession;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (timeLeftEl) {
    timeLeftEl.textContent = formattedTime;
  }

  if (progressEl) {
    const totalSeconds = duration * 60;
    const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    progressEl.style.width = `${progressPercent}%`;
    progressEl.setAttribute('aria-valuenow', Math.round(progressPercent));
  }
};

/**
 * Timer tick function called every second for meditation.
 */
const tickMeditation = () => {
  if (meditationSession.isPaused) return;

  meditationSession.timeLeft--;

  if (meditationSession.timeLeft <= 0) {
    completeMeditationSession();
    return;
  }

  updateMeditationUI();
};

/**
 * Initialise Meditation Setup selectors.
 */
const initMeditationSetup = () => {
  // Set defaults in UI
  const defDurBtn = $('#dur-med-5');
  if (defDurBtn) defDurBtn.classList.add('is-selected');

  const defOptCard = $('#opt-calm');
  if (defOptCard) defOptCard.classList.add('is-selected');

  // Handle duration preset clicks
  const durationBtns = document.querySelectorAll('.screen__duration-btn');
  durationBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      durationBtns.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      // Parse minutes from button id (e.g. dur-med-15 -> 15)
      const minutes = parseInt(btn.id.replace('dur-med-', ''), 10);
      meditationSetup.duration = minutes;

      console.log(
        '%c[Meditation Setup] duration updated →',
        'color: #C9A84C; font-style: italic;',
        meditationSetup.duration
      );
    });
  });

  // Handle focus card clicks
  const optionCards = document.querySelectorAll('#screen-meditation-setup .screen__option');
  optionCards.forEach((card) => {
    card.addEventListener('click', () => {
      optionCards.forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');

      if (card.id === 'opt-calm') {
        meditationSetup.focus = 'calm';
      } else if (card.id === 'opt-focus') {
        meditationSetup.focus = 'focus';
      } else if (card.id === 'opt-sleep') {
        meditationSetup.focus = 'sleep';
      }

      console.log(
        '%c[Meditation Setup] focus updated →',
        'color: #C9A84C; font-style: italic;',
        meditationSetup.focus
      );
    });
  });
};

/**
 * Called when the user clicks "Begin Meditation" on Setup screen.
 */
const startMeditationSession = () => {
  const { duration, focus } = meditationSetup;

  meditationSession.duration = duration;
  meditationSession.focus = focus;
  meditationSession.isActive = true;
  meditationSession.isPaused = false;
  meditationSession.timeLeft = duration * 60;

  // Update session screen label (e.g. "Calm & Relax (15m)")
  const labelEl = $('#meditation-session-label');
  if (labelEl) {
    let focusLabel = 'Calm & Relax';
    if (focus === 'focus') focusLabel = 'Focus & Clarity';
    if (focus === 'sleep') focusLabel = 'Sleep & Rest';
    labelEl.textContent = `${focusLabel} (${duration}m)`;
  }

  // Update guidance text
  const guidanceEl = $('#meditation-guidance');
  if (guidanceEl) {
    guidanceEl.textContent = 'Stay Present';
  }

  // Update session screen time display (e.g. "05:00")
  updateMeditationUI();

  // Reset Pause button text to "Pause" just in case
  const pauseBtn = $('#btn-pause-meditation');
  if (pauseBtn) {
    pauseBtn.textContent = 'Pause';
  }

  // Clear existing timer if any
  if (meditationSession.intervalId) {
    clearInterval(meditationSession.intervalId);
  }
  meditationSession.intervalId = setInterval(tickMeditation, 1000);

  console.log(
    '%c[Meditation Session] State locked in \u2192',
    'color: #C9A84C; font-style: italic;',
    { ...meditationSession }
  );

  showScreen(SCREENS.MEDITATION_SESSION);
};

/* ============================================================
   8. INIT — run everything once DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScreens();
  initSoundDrawer();
  initHomeButtons();
  initBreathingSetup();
  initMeditationSetup();

  console.log(
    '%c🧘 Just Breath — Navigation active.\n' +
    '   Start Breathing → Breathing Setup\n' +
    '   Start Meditation → Meditation Setup\n' +
    '   Back buttons → Home',
    'color: #F5D78E; font-size: 13px; font-weight: 600; padding: 4px 0;'
  );
});

