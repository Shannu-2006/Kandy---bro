/**
 * ===================================================================
 *  DIVINE PARTICLES & COSMIC VISUAL FX ENGINE
 * ===================================================================
 *  High-performance HTML5 Canvas rendering for:
 *  - Cosmic Twinkling Stars
 *  - Floating Sacred Golden Embers & Vibhuti (Holy Ash)
 *  - Trishul Flight Energy Trail
 *  - Trishul Impact Shockwaves & Radial Holy Burst
 * ===================================================================
 */

class CosmicParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Star & Ember collections
    this.stars = [];
    this.embers = [];
    this.trailParticles = [];
    this.shockwaves = [];
    this.burstParticles = [];
    this.waterDrops = [];

    // Configuration
    this.starCount = 120;
    this.emberCount = 45;
    this.isActive = true;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Populate initial stars
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.3 ? '#e0f2fe' : '#fbbf24'
      });
    }

    // Populate sacred embers
    for (let i = 0; i < this.emberCount; i++) {
      this.embers.push(this.createEmber());
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  createEmber(yInitial) {
    return {
      x: Math.random() * this.width,
      y: yInitial !== undefined ? yInitial : Math.random() * this.height,
      radius: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.6 + 0.25,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      fadeSpeed: Math.random() * 0.005 + 0.002,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 
        ? { r: 251, g: 191, b: 36 } // Golden Divine
        : { r: 56, g: 189, b: 248 }  // Cosmic Shiva Cyan
    };
  }

  // Triggered dynamically during Trishul flight
  addTrailParticle(x, y, vx, vy) {
    for (let i = 0; i < 3; i++) {
      this.trailParticles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (vx || 0) * 0.15 + (Math.random() - 0.5) * 2,
        vy: (vy || 0) * 0.15 + (Math.random() - 0.5) * 2,
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.025,
        color: Math.random() > 0.35 ? '#38bdf8' : '#f59e0b'
      });
    }
  }

  // Triggered at Trishul impact point
  triggerImpact(x, y) {
    // 1. Expanding shockwave rings
    for (let i = 0; i < 3; i++) {
      this.shockwaves.push({
        x: x,
        y: y,
        radius: 10 + i * 20,
        maxRadius: Math.max(this.width, this.height) * 0.8,
        speed: 16 - i * 3,
        alpha: 0.9,
        color: i % 2 === 0 ? '56, 189, 248' : '251, 191, 36'
      });
    }

    // 2. Burst of divine holy sparks
    const sparkCount = 80;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 12 + 3;
      this.burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.012,
        friction: 0.96,
        color: Math.random() > 0.4 ? '#fef08a' : '#38bdf8'
      });
    }
  }

  // Triggered during Stage 4: Water splash & circular energy wave
  addWaterSplash(x, y) {
    // 1. Expanding circular water energy wave
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 0.55,
      speed: 10,
      alpha: 0.85,
      color: '186, 230, 253' // Celestial Ganga Jal blue
    });

    // 2. Water droplets spreading outward with realistic physics
    const dropCount = 45;
    for (let i = 0; i < dropCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.waterDrops.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward splash trajectory
        radius: Math.random() * 3 + 1.5,
        alpha: 0.9,
        decay: Math.random() * 0.018 + 0.01,
        gravity: 0.16
      });
    }
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Twinkling Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.alpha += s.twinkleSpeed;
      if (s.alpha > 1 || s.alpha < 0.2) {
        s.twinkleSpeed = -s.twinkleSpeed;
      }
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      this.ctx.fill();
    }

    // 2. Draw Floating Sacred Embers (Rising slowly upward)
    for (let i = 0; i < this.embers.length; i++) {
      const e = this.embers[i];
      e.wobble += e.wobbleSpeed;
      e.x += Math.sin(e.wobble) * 0.6 + e.speedX;
      e.y -= e.speedY;

      // Wrap around screen
      if (e.y < -10) {
        this.embers[i] = this.createEmber(this.height + 10);
      }
      if (e.x < -10) e.x = this.width + 10;
      if (e.x > this.width + 10) e.x = -10;

      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgb(${e.color.r}, ${e.color.g}, ${e.color.b})`;
      this.ctx.globalAlpha = e.alpha;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = `rgb(${e.color.r}, ${e.color.g}, ${e.color.b})`;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 3. Draw Trishul Flight Trail
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.radius *= 0.97;

      if (p.alpha <= 0 || p.radius <= 0.3) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 4. Draw Impact Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha -= 0.02;

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha})`;
      this.ctx.lineWidth = 4 * sw.alpha + 1;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = `rgba(${sw.color}, 0.8)`;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // 5. Draw Impact Burst Sparks
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.vx *= bp.friction;
      bp.vy *= bp.friction;
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.alpha -= bp.decay;

      if (bp.alpha <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = bp.color;
      this.ctx.globalAlpha = bp.alpha;
      this.ctx.shadowBlur = 14;
      this.ctx.shadowColor = bp.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 6. Draw Realistic Glistening Water Droplets (Stage 4)
    for (let i = this.waterDrops.length - 1; i >= 0; i--) {
      const wd = this.waterDrops[i];
      wd.vy += wd.gravity;
      wd.x += wd.vx * 0.96;
      wd.y += wd.vy;
      wd.alpha -= wd.decay;

      if (wd.alpha <= 0) {
        this.waterDrops.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(wd.x, wd.y, wd.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(186, 230, 253, ${wd.alpha * 0.8})`;
      this.ctx.fill();

      // Specular glistening light reflection on each water droplet
      this.ctx.beginPath();
      this.ctx.arc(wd.x - wd.radius * 0.3, wd.y - wd.radius * 0.3, wd.radius * 0.35, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${wd.alpha})`;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame(this.animate);
  }
}

window.CosmicParticleSystem = CosmicParticleSystem;
