/**
 * ===================================================================
 *  PROJECT: KARTHIK – A DIVINE BIRTHDAY EXPERIENCE
 * ===================================================================
 *  Main Controller:
 *  - GSAP Cinematic Trishul Throw & Impact Timeline
 *  - Audio Controller with Play/Pause & Autoplay on Interaction
 *  - Dynamic Fallback System for User Assets (PNG/JPG/SVG/MP4/MP3)
 *  - Seamless Two-Page Transition
 * ===================================================================
 */

function initExperience() {
  // Initialize Global Particle System
  const particles = new CosmicParticleSystem('cosmic-canvas');

  // Load Configurations
  const config = window.BIRTHDAY_CONFIG || {};

  // Setup DOM Elements
  const appContainer = document.getElementById('app-container');
  const pageOne = document.getElementById('page-one');
  const pageTwo = document.getElementById('page-two');
  const trishulImg = document.getElementById('trishul-img');
  const trishulAura = document.getElementById('trishul-aura');
  const entranceContent = document.getElementById('entrance-content');
  const continueBtn = document.getElementById('continue-btn');
  const impactFlash = document.getElementById('impact-flash');
  const replayBtn = document.getElementById('replay-btn');

  // Text Elements to populate from config if present
  populateConfigTexts(config);

  // Setup Shiva Background Media
  setupShivaMedia(config.pageTwo);

  // Setup Audio Engine
  const audioController = setupAudio(config.audio);

  // Load Trishul Image and immediately trigger entrance animation
  setupTrishulImage(config.pageOne, () => {
    playTrishulEntranceAnimation(particles);
  });

  // Auto-play uploaded audio on first tap/click on Page 1
  const startAudioOnFirstInteraction = () => {
    audioController.play();
    window.removeEventListener('pointerdown', startAudioOnFirstInteraction);
    window.removeEventListener('touchstart', startAudioOnFirstInteraction);
    window.removeEventListener('click', startAudioOnFirstInteraction);
  };
  window.addEventListener('pointerdown', startAudioOnFirstInteraction, { once: true });
  window.addEventListener('touchstart', startAudioOnFirstInteraction, { once: true });
  window.addEventListener('click', startAudioOnFirstInteraction, { once: true });

  // Setup Page Transitions via Trishul or Message Box Click (Only after landing)
  const handleTransition = () => {
    // Ensure the Trishul is clickable only after its entrance animation finishes!
    if (trishulImg && !trishulImg.classList.contains('interactive')) {
      return;
    }

    // 1. Trigger subtle golden-blue glow feedback on click
    if (typeof gsap !== 'undefined' && trishulImg) {
      gsap.to(trishulImg, {
        scale: 1.04,
        filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.95)) drop-shadow(0 0 55px rgba(56, 189, 248, 0.8)) brightness(1.25) contrast(1.15)',
        duration: 0.28,
        yoyo: true,
        repeat: 1
      });
    }

    if (config.audio && config.audio.playOnContinue) {
      audioController.play();
    }

    // Spark burst on click
    if (trishulImg && particles) {
      const rect = trishulImg.getBoundingClientRect();
      particles.triggerImpact(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    }

    // Smooth transition to Page 2 without reload
    setTimeout(() => {
      transitionToPageTwo();
    }, 320);
  };

  if (trishulImg) {
    trishulImg.addEventListener('click', handleTransition);
  }

  const messageCard = document.querySelector('.divine-message-card');
  if (messageCard) {
    messageCard.style.cursor = 'pointer';
    messageCard.addEventListener('click', handleTransition);
  }

  // Setup Scroll Down to Message on Page 2
  const scrollIndicator = document.getElementById('scroll-to-message');
  const blessingsSection = document.getElementById('blessings-content-section');
  if (scrollIndicator && blessingsSection) {
    scrollIndicator.addEventListener('click', () => {
      blessingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Setup Left of Screen Back Navigation to Page 1
  const leftScreenBack = document.getElementById('left-screen-back');
  if (leftScreenBack) {
    leftScreenBack.addEventListener('click', (e) => {
      e.stopPropagation();
      transitionToPageOne(particles);
    });
  }

  // Tapping anywhere on the left edge (<= 90px) on Page 2 returns to Trishul
  if (pageTwo) {
    pageTwo.addEventListener('click', (e) => {
      if (e.clientX <= 90) {
        transitionToPageOne(particles);
      }
    });
  }

  // Setup Next Page Button: "One More Blessing →" (Page 2 to Page 3)
  const toPageThreeBtn = document.getElementById('to-page-three-btn');
  if (toPageThreeBtn) {
    toPageThreeBtn.addEventListener('click', () => {
      transitionToPageThree();
    });
  }

  // Setup Page 3 "← Previous Blessing" button
  const page3BackBtn = document.getElementById('page3-back-btn');
  if (page3BackBtn) {
    page3BackBtn.addEventListener('click', () => {
      transitionFromThreeToTwo();
    });
  }

  // Setup Page 3 Left Screen Return Button
  const page3LeftBack = document.getElementById('page3-left-back');
  if (page3LeftBack) {
    page3LeftBack.addEventListener('click', (e) => {
      e.stopPropagation();
      transitionFromThreeToTwo();
    });
  }

  // Tapping anywhere on the left edge (<= 90px) on Page 3 returns to Page 2
  const pageThree = document.getElementById('page-three');
  if (pageThree) {
    pageThree.addEventListener('click', (e) => {
      if (e.clientX <= 90) {
        transitionFromThreeToTwo();
      }
    });
  }
}

// Guaranteed launch: executes immediately if DOM is ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExperience);
} else {
  initExperience();
}

/**
 * Populate texts from config.js while preserving user's customized HTML
 */
function populateConfigTexts(cfg) {
  if (!cfg) return;

  const setIfElem = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.innerHTML = val;
  };

  if (cfg.pageOne) {
    setIfElem('custom-message-text', cfg.pageOne.customMessage);
  }

  if (cfg.pageTwo) {
    setIfElem('shiva-mala-badge', cfg.pageTwo.shivaMalaBadge);
    setIfElem('main-birthday-title', cfg.pageTwo.mainBirthdayTitle);
    setIfElem('divine-salutation', cfg.pageTwo.salutation);
    setIfElem('core-blessing', cfg.pageTwo.coreBlessing);
    setIfElem('final-mantra', cfg.pageTwo.closingChant);

    if (cfg.pageTwo.messages && Array.isArray(cfg.pageTwo.messages)) {
      for (let i = 0; i < cfg.pageTwo.messages.length; i++) {
        setIfElem(`para-${i + 1}`, cfg.pageTwo.messages[i]);
      }
    }
  }

  if (cfg.pageThree) {
    setIfElem('page3-badge', cfg.pageThree.badge);
    setIfElem('page3-salutation', cfg.pageThree.salutation);
    setIfElem('page3-para-1', cfg.pageThree.para1);
    setIfElem('page3-para-2', cfg.pageThree.para2);
    setIfElem('page3-para-3', cfg.pageThree.para3);
    setIfElem('page3-climax', cfg.pageThree.climax);
    setIfElem('page3-mantra', cfg.pageThree.mantra);
    if (cfg.pageThree.heroImage) {
      const p3Img = document.getElementById('page3-hero-img');
      if (p3Img) p3Img.src = cfg.pageThree.heroImage;
    }
  }
}

/**
 * Trishul image loader with automatic fallback and instant trigger
 */
function setupTrishulImage(pageOneConfig, onReady) {
  const trishulImg = document.getElementById('trishul-img');
  const primarySrc = (pageOneConfig && pageOneConfig.trishulImage) || 'assets/images/trishul.png';
  const fallbackSrc = 'assets/images/trishul.svg';

  if (!trishulImg) {
    if (onReady) onReady();
    return;
  }

  trishulImg.onerror = function() {
    this.onerror = null;
    this.src = fallbackSrc;
  };

  trishulImg.src = primarySrc;
  if (onReady) {
    onReady();
  }
}

/**
 * Shiva Video / Image Background Setup
 */
function setupShivaMedia(pageTwoConfig) {
  const videoEl = document.getElementById('shiva-video-bg');
  const imageEl = document.getElementById('shiva-image-bg');

  const mode = (pageTwoConfig && pageTwoConfig.mediaMode) || 'auto';
  const videoSrc = (pageTwoConfig && pageTwoConfig.videoSrc) || 'assets/media/mahadev_edited.mp4';
  const imageSrc = (pageTwoConfig && pageTwoConfig.imageSrc) || 'assets/images/shiva.jpg';
  const imageFallback = 'assets/images/shiva.svg';

  // Helper to activate Image mode
  const activateImage = () => {
    if (videoEl) videoEl.style.display = 'none';
    if (!imageEl) return;

    imageEl.style.display = 'block';
    const testImg = new Image();
    testImg.onload = () => {
      imageEl.src = imageSrc;
      imageEl.classList.add('loaded');
    };
    testImg.onerror = () => {
      console.log(`[Divine Experience] Shiva image "${imageSrc}" not found. Using divine Kailash SVG asset.`);
      imageEl.src = imageFallback;
      imageEl.classList.add('loaded');
    };
    testImg.src = imageSrc;
  };

  // Helper to activate Video mode
  const activateVideo = () => {
    if (!videoEl) {
      activateImage();
      return;
    }
    videoEl.src = videoSrc;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.loop = true;
    videoEl.style.display = 'block';
    if (imageEl) imageEl.style.display = 'none';

    // Graceful loader dismissal
    const videoLoader = document.getElementById('video-loader');
    const hideLoader = () => {
      if (videoLoader) videoLoader.classList.add('hidden');
    };
    videoEl.addEventListener('playing', hideLoader);
    videoEl.addEventListener('canplay', hideLoader);
    videoEl.addEventListener('loadeddata', hideLoader);
    setTimeout(hideLoader, 1500);

    videoEl.play().catch(err => {
      console.log(`[Divine Experience] Video ready for playback: ${err.message}`);
    });
  };

  if (mode === 'video') {
    activateVideo();
  } else if (mode === 'image') {
    activateImage();
  } else {
    activateVideo();
  }
}

/**
 * Audio Controller
 */
function setupAudio(audioConfig) {
  const audioEl = document.getElementById('bg-audio');
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status-text');
  const volumeSlider = document.getElementById('audio-volume-slider');

  if (!audioEl) return { play: () => {}, pause: () => {} };

  const src = (audioConfig && audioConfig.src) || 'assets/audio/devotional-music.mp3';
  audioEl.src = src;
  audioEl.volume = (audioConfig && audioConfig.defaultVolume !== undefined) ? audioConfig.defaultVolume : 0.7;

  if (volumeSlider) {
    volumeSlider.value = audioEl.volume;
    volumeSlider.addEventListener('input', (e) => {
      audioEl.volume = parseFloat(e.target.value);
    });
  }

  const labelDefault = (audioConfig && audioConfig.labelText) || 'Music 🎵';
  const labelPlaying = (audioConfig && audioConfig.playingText) || 'Playing 🎵';

  if (audioStatusText) audioStatusText.textContent = labelDefault;

  let isPlaying = false;

  const playAudio = () => {
    // Avoid unwanted audio restarting if already playing
    if (isPlaying && !audioEl.paused) {
      return;
    }
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        if (audioBtn) audioBtn.classList.add('playing');
        if (audioStatusText) audioStatusText.textContent = labelPlaying;
      }).catch(err => {
        console.log('[Divine Experience] Audio play deferred or file not found:', err.message);
      });
    }
  };

  const pauseAudio = () => {
    audioEl.pause();
    isPlaying = false;
    if (audioBtn) audioBtn.classList.remove('playing');
    if (audioStatusText) audioStatusText.textContent = labelDefault;
  };

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    });
  }

  return {
    play: playAudio,
    pause: pauseAudio,
    toggle: () => (isPlaying ? pauseAudio() : playAudio())
  };
}

/**
 * THE DIVINE TRISHUL ENTRANCE ANIMATION (PAGE ONE)
 * Exact 6-Stage Cinematic Timeline:
 * STAGE 1 (0–1.0s) : Dark divine atmosphere, subtle blue & golden ambient light, tiny floating stardust particles.
 * STAGE 2 (1.0–2.5s): Trishul descends vertically from above the viewport towards center with energy trail.
 * STAGE 3 (2.5–3.0s): Powerful landing impact at 2.5s (screen shake, haptic vibration, controlled flash, circular shockwave).
 * STAGE 4 (3.0–4.0s): Water splash & circular energy wave (water droplets with specular highlights spreading outward).
 * STAGE 5 (4.0–5.0s): Trishul settles upright & stationary, soft divine golden-blue aura breathes (no continuous float/zoom).
 * STAGE 6 (5.0–6.0s): Birthday website text reveals ("Press the Trishul to witness the divine presence of Mahadev...").
 * AFTER 6.0s       : Trishul becomes interactive for smooth navigation to Page 2.
 */
function playTrishulEntranceAnimation(particles) {
  const trishul = document.getElementById('trishul-img');
  const trishulAura = document.getElementById('trishul-aura');
  const appContainer = document.getElementById('app-container');
  const impactFlash = document.getElementById('impact-flash');
  const entranceContent = document.getElementById('entrance-content');
  const atmosphere = document.querySelector('.cosmic-atmosphere');

  if (!trishul) return;

  // Ensure Trishul is non-interactive until entire 6-stage sequence finishes
  trishul.classList.remove('interactive');

  // Safety watchdog: In case of any browser freeze or script block, guarantee visibility after 3.2s
  const safetyTimeout = setTimeout(() => {
    const computedOpacity = (typeof window !== 'undefined' && window.getComputedStyle) ? window.getComputedStyle(trishul).opacity : '1';
    if (trishul.style.opacity === '0' || computedOpacity === '0') {
      trishul.style.opacity = '1';
      trishul.style.transform = 'none';
      if (entranceContent) {
        entranceContent.style.opacity = '1';
        entranceContent.style.transform = 'none';
      }
      trishul.classList.add('interactive');
    }
  }, 3200);

  // Use GSAP if available, otherwise use native zero-dependency fallback
  if (typeof gsap !== 'undefined') {
    // Kill any existing tweens to support clean replays
    gsap.killTweensOf([trishul, trishulAura, entranceContent, impactFlash]);
    if (atmosphere) gsap.killTweensOf(atmosphere);

    // Initial State:
    // Trishul starts above viewport
    gsap.set(trishul, {
      opacity: 0,
      x: 0,
      y: -window.innerHeight - 150,
      rotation: 0,
      scale: 1
    });

    if (atmosphere) {
      gsap.set(atmosphere, { opacity: 0.85 });
    }
    if (trishulAura) {
      gsap.set(trishulAura, { opacity: 0, scale: 0.6 });
      trishulAura.classList.remove('active');
    }
    if (entranceContent) {
      gsap.set(entranceContent, { opacity: 0, y: 22 });
    }
    if (impactFlash) {
      gsap.set(impactFlash, { opacity: 0 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimeout);
      }
    });

    // =========================================================================
    // STAGE 1: 0–1.0s | DARK DIVINE ATMOSPHERE
    // Celestial space with subtle golden-blue stardust, Trishul hidden above
    // =========================================================================

    // =========================================================================
    // STAGE 2: 1.0–2.5s | TRISHUL DESCENDS FROM ABOVE
    // Mahadev releases his divine Trishul vertically from above towards center
    // =========================================================================
    // Fast opacity reveal as descent begins
    tl.to(trishul, {
      opacity: 1,
      duration: 0.2,
      ease: 'power1.out'
    }, 1.0);

    // Powerful vertical descent towards center
    tl.to(trishul, {
      y: 0,
      x: 0,
      rotation: 0,
      scale: 1,
      duration: 1.5,
      ease: 'power3.in',
      onUpdate: function() {
        if (particles) {
          const rect = trishul.getBoundingClientRect();
          const trailX = rect.left + rect.width * 0.5;
          const trailY = rect.top + rect.height * 0.35;
          particles.addTrailParticle(trailX, trailY, 0, -2);
        }
      }
    }, 1.0);

    // =========================================================================
    // STAGE 3: 2.5–3.0s | POWERFUL LANDING IMPACT
    // Landing impact at 2.5s: screen shake, controlled flash, shockwaves
    // =========================================================================
    tl.call(() => {
      triggerImpactEffects(particles, trishul, appContainer, impactFlash, null);
    }, null, 2.5);

    // =========================================================================
    // STAGE 4: 3.0–4.0s | WATER SPLASH & CIRCULAR ENERGY WAVE
    // Water droplets spreading outward with realistic physics and circular wave
    // =========================================================================
    tl.call(() => {
      if (particles) {
        const rect = trishul.getBoundingClientRect();
        const splashX = rect.left + rect.width * 0.5;
        // Originating from Shiva's hand / base of Trishul
        const splashY = rect.top + rect.height * 0.62;
        particles.addWaterSplash(splashX, splashY);
      }
    }, null, 3.0);

    // =========================================================================
    // STAGE 5: 4.0–5.0s | TRISHUL SETTLES & SOFT DIVINE GLOW APPEARS
    // Trishul remains perfectly stationary and upright (NO float/zoom)
    // =========================================================================
    if (trishulAura) {
      tl.to(trishulAura, {
        opacity: 0.85,
        scale: 1,
        duration: 1.0,
        ease: 'power2.out',
        onStart: () => {
          trishulAura.classList.add('active');
        }
      }, 4.0);
    }

    // =========================================================================
    // STAGE 6: 5.0–6.0s | BIRTHDAY WEBSITE TEXT REVEALS
    // "Press the Trishul to witness the divine presence of Mahadev..."
    // =========================================================================
    if (entranceContent) {
      tl.to(entranceContent, {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power2.out',
        onComplete: () => {
          // Trishul is clickable ONLY after landing animation finishes!
          trishul.classList.add('interactive');
        }
      }, 5.0);
    }

  } else {
    // Native animation fallback (works 100% offline without CDN)
    runNativeEntranceAnimation(trishul, trishulAura, appContainer, impactFlash, entranceContent, particles, safetyTimeout);
  }
}

/**
 * Zero-dependency native animation fallback (in case GSAP CDN is unreachable / offline)
 */
function runNativeEntranceAnimation(trishul, trishulAura, appContainer, impactFlash, entranceContent, particles, safetyTimeout) {
  trishul.style.transition = 'none';
  trishul.style.transform = `translate3d(0, -${window.innerHeight + 150}px, 0)`;
  trishul.style.opacity = '0';
  if (entranceContent) {
    entranceContent.style.opacity = '0';
    entranceContent.style.transform = 'translateY(22px)';
  }

  // Stage 1 (0 to 1.0s): peaceful celestial atmosphere
  setTimeout(() => {
    // Stage 2 (1.0 to 2.5s): Trishul descends vertically
    trishul.style.transition = 'transform 1.5s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.2s ease-out';
    trishul.style.transform = 'translate3d(0, 0, 0)';
    trishul.style.opacity = '1';

    // Stage 3 (2.5s): Landing Impact
    setTimeout(() => {
      triggerImpactEffects(particles, trishul, appContainer, impactFlash, null);

      // Stage 4 (3.0s): Water Splash
      setTimeout(() => {
        if (particles) {
          const rect = trishul.getBoundingClientRect();
          particles.addWaterSplash(rect.left + rect.width * 0.5, rect.top + rect.height * 0.62);
        }

        // Stage 5 (4.0s): Settles & Glow
        setTimeout(() => {
          if (trishulAura) trishulAura.classList.add('active');

          // Stage 6 (5.0s): Text Reveal
          setTimeout(() => {
            if (entranceContent) {
              entranceContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
              entranceContent.style.opacity = '1';
              entranceContent.style.transform = 'translateY(0)';
            }
            trishul.classList.add('interactive');
            if (safetyTimeout) clearTimeout(safetyTimeout);
          }, 1000);
        }, 1000);
      }, 500);
    }, 1500);
  }, 1000);
}

/**
 * Impact Moment: Screen Shake, Subtle Vibration, Shockwave, Flash & Sacred Sparks
 */
function triggerImpactEffects(particles, trishul, appContainer, impactFlash, trishulAura) {
  const rect = trishul.getBoundingClientRect();
  const impactX = rect.left + rect.width * 0.5;
  const impactY = rect.top + rect.height * 0.5;

  // 1. Subtle vibration / screen shake (0.5s duration)
  if (appContainer) {
    appContainer.classList.add('screen-shake');
    setTimeout(() => {
      appContainer.classList.remove('screen-shake');
    }, 500);
  }

  // 2. Mobile Haptic Vibration if supported
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([40, 50, 40]); } catch (e) {}
  }

  // 3. Bright but controlled golden-blue cinematic flash
  if (impactFlash) {
    impactFlash.style.opacity = '0.75';
    setTimeout(() => {
      impactFlash.style.opacity = '0';
    }, 320);
  }

  // 4. Circular Shockwave Rings & Holy Sparks
  if (particles) {
    particles.triggerImpact(impactX, impactY);
  }

  // 5. Activate Aura if requested
  if (trishulAura) {
    trishulAura.classList.add('active');
  }
}

/**
 * Transition from Page One to Page Two
 */
function transitionToPageTwo() {
  const pageOne = document.getElementById('page-one');
  const pageTwo = document.getElementById('page-two');

  if (!pageOne || !pageTwo) return;

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

    // Fade out page 1
    tl.to(pageOne, {
      opacity: 0,
      y: -40,
      scale: 0.96,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => {
        pageOne.classList.add('hidden');
        pageOne.style.display = 'none';
        pageTwo.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });

    // Reveal page 2
    tl.to(pageTwo, {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'power3.out',
      onStart: () => {
        pageTwo.classList.add('active');
        const videoEl = document.getElementById('shiva-video-bg');
        if (videoEl) {
          videoEl.muted = true;
          videoEl.play().catch(e => {});
        }
      }
    }, "-=0.2");

    // Reveal blessing paragraphs ONE AT A TIME
    const blessingParas = pageTwo.querySelectorAll('.blessing-para-reveal');
    tl.fromTo(blessingParas, 
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.35, // Sequential paragraph reveal!
        ease: 'power2.out'
      },
      "-=0.4"
    );

  } else {
    pageOne.classList.add('hidden');
    pageOne.style.display = 'none';
    pageTwo.style.display = 'flex';
    pageTwo.classList.add('active');
    pageTwo.style.opacity = '1';
  }
}

/**
 * Transition back to Page One (Replay experience)
 */
function transitionToPageOne(particles) {
  const pageOne = document.getElementById('page-one');
  const pageTwo = document.getElementById('page-two');
  const trishul = document.getElementById('trishul-img');

  if (!pageOne || !pageTwo) return;

  // Disable click on Trishul during re-entry flight
  if (trishul) {
    trishul.classList.remove('interactive');
  }

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

    tl.to(pageTwo, {
      opacity: 0,
      scale: 0.97,
      duration: 0.7,
      ease: 'power3.in',
      onComplete: () => {
        pageTwo.classList.remove('active');
        pageTwo.style.display = 'none';
        pageOne.style.display = 'flex';
        pageOne.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });

    tl.to(pageOne, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
      onComplete: () => {
        playTrishulEntranceAnimation(particles);
      }
    });

  } else {
    pageTwo.classList.remove('active');
    pageTwo.style.display = 'none';
    pageOne.style.display = 'flex';
    pageOne.classList.remove('hidden');
    playTrishulEntranceAnimation(particles);
  }
}

/**
 * Transition from Page Two to Page Three (Mahadev's Eternal Promise)
 */
function transitionToPageThree() {
  const pageTwo = document.getElementById('page-two');
  const pageThree = document.getElementById('page-three');

  if (!pageTwo || !pageThree) return;

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

    // 1. Fade out Page 2
    tl.to(pageTwo, {
      opacity: 0,
      y: -30,
      scale: 0.97,
      duration: 0.75,
      ease: 'power3.inOut',
      onComplete: () => {
        pageTwo.classList.remove('active');
        pageTwo.style.display = 'none';
        pageThree.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });

    // 2. Reveal Page 3
    tl.to(pageThree, {
      opacity: 1,
      scale: 1,
      duration: 0.95,
      ease: 'power3.out',
      onStart: () => {
        pageThree.classList.add('active');
      }
    }, "-=0.15");

    // 3. Gentle cinematic reveal of Sacred Image Frame
    const imageFrame = document.getElementById('promise-image-frame');
    if (imageFrame) {
      tl.fromTo(imageFrame, 
        { opacity: 0, scale: 0.93, y: 35 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power2.out' },
        "-=0.6"
      );
    }

    // 4. Reveal emotional message paragraphs ONE BY ONE
    const promiseParas = pageThree.querySelectorAll('.page3-para-reveal');
    tl.fromTo(promiseParas, 
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.38, // Emotional sequential reveal
        ease: 'power2.out'
      },
      "-=0.5"
    );

  } else {
    pageTwo.classList.remove('active');
    pageTwo.style.display = 'none';
    pageThree.style.display = 'flex';
    pageThree.classList.add('active');
    pageThree.style.opacity = '1';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

/**
 * Transition back from Page Three to Page Two
 */
function transitionFromThreeToTwo() {
  const pageTwo = document.getElementById('page-two');
  const pageThree = document.getElementById('page-three');

  if (!pageTwo || !pageThree) return;

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

    tl.to(pageThree, {
      opacity: 0,
      scale: 0.97,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        pageThree.classList.remove('active');
        pageThree.style.display = 'none';
        pageTwo.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });

    tl.to(pageTwo, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
      onStart: () => {
        pageTwo.classList.add('active');
      }
    });

  } else {
    pageThree.classList.remove('active');
    pageThree.style.display = 'none';
    pageTwo.style.display = 'flex';
    pageTwo.classList.add('active');
    pageTwo.style.opacity = '1';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
