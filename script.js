/**
 * JustBreath — Main JavaScript
 *
 * Modules:
 *  1. Utilities
 *  2. Navigation (header scroll + hamburger)
 *  3. Hero clock / footer year
 *  4. Breathing Exercises configuration
 *  5. Breathing Timer engine
 *  6. Ambient Sounds controller
 *  7. Init
 */

'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */

/**
 * Shorthand query selector.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand query selector all.
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ============================================================
   2. NAVIGATION
   ============================================================ */
const initNavigation = () => {
  const header     = $('#site-header');
  const hamburger  = $('#nav-hamburger');
  const navLinks   = $('#nav-links');

  // Scroll shadow
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navLinks.addEventListener('click', (e) => {
    if (e.target.matches('.nav__link')) {
      navLinks.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
};

/* ============================================================
   3. FOOTER YEAR
   ============================================================ */
const initFooterYear = () => {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
};

/* ============================================================
   4. BREATHING EXERCISES CONFIGURATION
   ============================================================ */

/**
 * Each exercise defines a sequence of phases.
 * Each phase: { label, duration (seconds), circleState }
 * circleState drives the CSS class on the breath circle.
 */
const EXERCISES = {
  box: {
    name: 'Box Breathing',
    phases: [
      { label: 'Inhale',  duration: 4, circleState: 'is-inhale' },
      { label: 'Hold',    duration: 4, circleState: 'is-hold'   },
      { label: 'Exhale',  duration: 4, circleState: 'is-exhale' },
      { label: 'Hold',    duration: 4, circleState: 'is-hold'   },
    ],
  },
  '478': {
    name: '4-7-8 Breathing',
    phases: [
      { label: 'Inhale',  duration: 4, circleState: 'is-inhale' },
      { label: 'Hold',    duration: 7, circleState: 'is-hold'   },
      { label: 'Exhale',  duration: 8, circleState: 'is-exhale' },
    ],
  },
  diaphragm: {
    name: 'Diaphragmatic',
    phases: [
      { label: 'Inhale',  duration: 5, circleState: 'is-inhale' },
      { label: 'Exhale',  duration: 5, circleState: 'is-exhale' },
    ],
  },
};

/* ============================================================
   5. BREATHING TIMER ENGINE
   ============================================================ */
const initTimer = () => {
  // ---- DOM refs ----
  const timerExerciseName = $('#timer-exercise-name');
  const phaseLabel        = $('#timer-phase-label');
  const countEl           = $('#timer-count');
  const startPauseBtn     = $('#btn-start-pause');
  const resetBtn          = $('#btn-reset');
  const sessionsEl        = $('#timer-sessions strong');
  const breathCircle      = $('#breath-circle');
  const breathCircleText  = $('#breath-circle-text');

  // ---- State ----
  let selectedExercise = null;  // key in EXERCISES
  let isRunning        = false;
  let intervalId       = null;
  let phaseIndex       = 0;
  let timeLeft         = 0;
  let sessionsCount    = 0;

  // ---- Helpers ----

  /** Apply a circle state (clears old ones first) */
  const setCircleState = (state) => {
    breathCircle.classList.remove('is-inhale', 'is-hold', 'is-exhale');
    if (state) breathCircle.classList.add(state);
  };

  /** Update the visible count and phase label */
  const updateDisplay = (phase, time) => {
    phaseLabel.textContent     = phase.label;
    countEl.textContent        = time;
    breathCircleText.textContent = phase.label;
  };

  /** Move to the next phase; wrap around and count sessions */
  const advancePhase = () => {
    const exercise = EXERCISES[selectedExercise];
    phaseIndex = (phaseIndex + 1) % exercise.phases.length;
    if (phaseIndex === 0) {
      sessionsCount++;
      sessionsEl.textContent = sessionsCount;
    }
    const phase = exercise.phases[phaseIndex];
    timeLeft = phase.duration;
    setCircleState(phase.circleState);
    updateDisplay(phase, timeLeft);
  };

  /** Main tick (called every second) */
  const tick = () => {
    timeLeft--;
    const phase = EXERCISES[selectedExercise].phases[phaseIndex];
    if (timeLeft <= 0) {
      advancePhase();
    } else {
      updateDisplay(phase, timeLeft);
    }
  };

  /** Start the timer */
  const start = () => {
    if (!selectedExercise) return;
    isRunning = true;
    startPauseBtn.textContent = 'Pause';

    const phase = EXERCISES[selectedExercise].phases[phaseIndex];
    setCircleState(phase.circleState);
    updateDisplay(phase, timeLeft);

    intervalId = setInterval(tick, 1000);
  };

  /** Pause the timer */
  const pause = () => {
    isRunning = false;
    startPauseBtn.textContent = 'Resume';
    clearInterval(intervalId);
    intervalId = null;
  };

  /** Reset to beginning of exercise */
  const reset = () => {
    pause();
    phaseIndex   = 0;
    timeLeft     = 0;
    isRunning    = false;

    startPauseBtn.textContent = 'Start';
    phaseLabel.textContent    = '\u00A0';       // non-breaking space
    countEl.textContent       = '0';
    breathCircleText.textContent = 'Breathe';
    setCircleState(null);

    if (selectedExercise) {
      timeLeft = EXERCISES[selectedExercise].phases[0].duration;
      updateDisplay(EXERCISES[selectedExercise].phases[0], timeLeft);
    }
  };

  // ---- Event: select exercise via card button ----
  $('#exercise-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-exercise]');
    if (!btn || !btn.matches('.btn--card')) return;

    const key = btn.dataset.exercise;
    if (!EXERCISES[key]) return;

    // Deselect previously active card
    $$('.exercise-card').forEach(c => c.classList.remove('is-selected'));
    $$('.btn--card').forEach(b => b.classList.remove('is-active'));

    // Select new
    btn.closest('.exercise-card').classList.add('is-selected');
    btn.classList.add('is-active');

    // Reset timer with new exercise
    selectedExercise = key;
    phaseIndex   = 0;
    sessionsCount = 0;
    sessionsEl.textContent = '0';

    const exercise = EXERCISES[selectedExercise];
    timeLeft = exercise.phases[0].duration;

    timerExerciseName.textContent = exercise.name;
    startPauseBtn.disabled = false;
    resetBtn.disabled      = false;

    // If currently running, restart; otherwise just reset
    if (isRunning) {
      clearInterval(intervalId);
      intervalId = null;
      isRunning  = false;
      start();
    } else {
      reset();
    }

    // Scroll to timer section
    $('#timer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---- Event: start / pause ----
  startPauseBtn.addEventListener('click', () => {
    if (!selectedExercise) return;
    if (isRunning) {
      pause();
    } else {
      // If timeLeft is 0 it means we haven't started yet or reset
      if (timeLeft === 0) {
        timeLeft = EXERCISES[selectedExercise].phases[phaseIndex].duration;
      }
      start();
    }
  });

  // ---- Event: reset ----
  resetBtn.addEventListener('click', reset);
};

/* ============================================================
   6. AMBIENT SOUNDS CONTROLLER
   ============================================================ */
const initSounds = () => {
  /**
   * Map of sound keys → audio file paths.
   * Add your audio files to assets/sounds/ and update these paths.
   */
  const SOUND_FILES = {
    rain:   'assets/sounds/rain.mp3',
    ocean:  'assets/sounds/ocean.mp3',
    forest: 'assets/sounds/forest.mp3',
    bowl:   'assets/sounds/bowl.mp3',
  };

  // Cache of created Audio objects
  const audioInstances = {};

  /**
   * Get or create an Audio instance for a given sound key.
   * @param {string} key
   * @returns {HTMLAudioElement}
   */
  const getAudio = (key) => {
    if (!audioInstances[key]) {
      const audio = new Audio(SOUND_FILES[key]);
      audio.loop   = true;
      audio.volume = 0.5;
      audioInstances[key] = audio;
    }
    return audioInstances[key];
  };

  // Attach listeners to every sound toggle button
  $$('.sound-card__toggle').forEach((btn) => {
    const key       = btn.dataset.sound;
    const card      = btn.closest('.sound-card');
    const volumeSlider = $(`#vol-${key}`);
    const icon      = $('.sound-card__toggle-icon', btn);

    btn.addEventListener('click', async () => {
      const isPlaying = btn.getAttribute('aria-pressed') === 'true';

      if (isPlaying) {
        // Pause
        const audio = audioInstances[key];
        if (audio) audio.pause();
        btn.setAttribute('aria-pressed', 'false');
        card.classList.remove('is-playing');
        icon.textContent = '▶';
      } else {
        // Play
        try {
          const audio = getAudio(key);
          await audio.play();
          btn.setAttribute('aria-pressed', 'true');
          card.classList.add('is-playing');
          icon.textContent = '⏸';
        } catch (err) {
          // Gracefully handle missing audio files
          console.warn(`JustBreath: Could not play "${key}" sound.`, err);
          card.style.opacity = '0.5';
          card.title = `Audio file not found: ${SOUND_FILES[key]}`;
        }
      }
    });

    // Volume control
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        const audio = audioInstances[key];
        if (audio) {
          audio.volume = clamp(parseFloat(volumeSlider.value), 0, 1);
        }
      });
    }
  });
};

/* ============================================================
   7. INIT — run everything once DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFooterYear();
  initTimer();
  initSounds();

  console.log(
    '%c🌬 JustBreath loaded. Breathe easy.',
    'color: #48c9b0; font-size: 14px; font-weight: bold; padding: 6px;'
  );
});
