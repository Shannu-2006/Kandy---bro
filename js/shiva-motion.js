/**
 * ===================================================================
 *  LORD SHIVA LIVING MOTION ENGINE
 * ===================================================================
 *  Realistic motion graphics overlay for Mount Kailash visual:
 *  - Peaceful blinking eyes with natural eyelid animation cycle
 *  - Living, undulating sacred serpent (Vasuki) coiled around neck
 *  - Third eye (Trinetra) divine breathing glow
 *  - Gentle Himalayan snowfall particles
 * ===================================================================
 */

class ShivaLivingMotion {
  constructor(canvasId, containerId) {
    this.canvas = document.getElementById(canvasId);
    this.container = document.getElementById(containerId);
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;

    // Blink State
    this.blinkProgress = 0; // 0 = open, 1 = closed
    this.isBlinking = false;
    this.blinkTimer = 0;
    this.nextBlinkInterval = 180 + Math.random() * 120; // in frames (~3-5 sec)

    // Snake State
    this.snakeWaveTime = 0;
    this.tongueProgress = 0;

    // Snow Flakes
    this.snowFlakes = [];
    this.initSnow();

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initSnow() {
    this.snowFlakes = [];
    for (let i = 0; i < 45; i++) {
      this.snowFlakes.push({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        r: Math.random() * 2 + 0.8,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: Math.random() * 0.4 - 0.2,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Coordinate Anchors based on 1376x768 painting:
    // Face center ~ 50.5% width, 36% height
    const faceX = this.width * 0.505;
    const faceY = this.height * 0.36;
    const eyeDist = this.width * 0.024; // distance between eyes
    const eyeWidth = this.width * 0.016;
    const eyeHeight = this.height * 0.012;

    // 1. UPDATE BLINK CYCLE
    this.blinkTimer++;
    if (this.blinkTimer > this.nextBlinkInterval) {
      this.isBlinking = true;
      this.blinkTimer = 0;
      this.nextBlinkInterval = 160 + Math.random() * 140; // 3 to 5 seconds
    }

    if (this.isBlinking) {
      this.blinkProgress += 0.12; // speed of blink
      if (this.blinkProgress >= Math.PI) {
        this.blinkProgress = 0;
        this.isBlinking = false;
      }
    }

    const currentClosure = this.isBlinking ? Math.sin(this.blinkProgress) : 0;

    // 2. DRAW REALISTIC BLINKING EYELIDS
    if (currentClosure > 0.05) {
      this.drawEyelid(faceX - eyeDist, faceY, eyeWidth, eyeHeight, currentClosure);
      this.drawEyelid(faceX + eyeDist, faceY, eyeWidth, eyeHeight, currentClosure);
    }

    // 3. DRAW DIVINE THIRD EYE PULSE (Trinetra)
    const thirdEyeY = faceY - this.height * 0.038;
    const pulse = (Math.sin(Date.now() * 0.003) + 1) * 0.5;
    this.drawThirdEyeGlow(faceX, thirdEyeY, pulse);

    // 4. DRAW LIVING UNDULATING SNAKE (Vasuki around the neck)
    this.snakeWaveTime += 0.035;
    const neckY = faceY + this.height * 0.085;
    this.drawLivingSnake(faceX, neckY, this.snakeWaveTime);

    // 5. DRAW HIMALAYAN SNOW PARTICLES
    this.drawSnow();

    requestAnimationFrame(this.animate);
  }

  drawEyelid(x, y, w, h, closure) {
    this.ctx.save();
    
    // Natural skin tone blend with shadow for peaceful eyelid closure
    this.ctx.beginPath();
    const curH = h * closure;
    this.ctx.ellipse(x, y, w, Math.max(1, curH), 0, 0, Math.PI * 2);
    
    // Soft realistic eye shadow & skin tone
    const grad = this.ctx.createLinearGradient(x, y - curH, x, y + curH);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.85)');
    grad.addColorStop(0.5, 'rgba(51, 65, 85, 0.95)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
    
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Subtle gentle eyelash line
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + curH * 0.3, w * 0.9, 1.2, 0, 0, Math.PI);
    this.ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawThirdEyeGlow(x, y, pulse) {
    this.ctx.save();
    const radius = 6 + pulse * 4;
    const grad = this.ctx.createRadialGradient(x, y, 1, x, y, radius);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radius * 0.6, radius, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawLivingSnake(neckX, neckY, time) {
    this.ctx.save();

    // Sinuous undulating motion for the snake's body and hood
    const wave = Math.sin(time) * 4;
    const wave2 = Math.cos(time * 0.8) * 3;

    // Snake Position on Shiva's right shoulder/neck
    const snakeHeadX = neckX + this.width * 0.055 + wave;
    const snakeHeadY = neckY - this.height * 0.02 + wave2;

    // 1. Subtle breathing body ring around neck
    this.ctx.beginPath();
    this.ctx.arc(neckX, neckY, this.width * 0.045 + Math.sin(time * 1.5) * 1.5, 0.2, Math.PI - 0.2);
    this.ctx.strokeStyle = 'rgba(22, 101, 52, 0.4)';
    this.ctx.lineWidth = 10;
    this.ctx.stroke();

    // 2. Snake Hood (Raised peacefully on Shiva's shoulder)
    this.ctx.beginPath();
    this.ctx.ellipse(snakeHeadX, snakeHeadY, 12, 18, 0.25 + Math.sin(time) * 0.08, 0, Math.PI * 2);
    const hoodGrad = this.ctx.createRadialGradient(snakeHeadX, snakeHeadY, 2, snakeHeadX, snakeHeadY, 16);
    hoodGrad.addColorStop(0, '#4ade80');
    hoodGrad.addColorStop(0.5, '#16a34a');
    hoodGrad.addColorStop(1, '#14532d');
    this.ctx.fillStyle = hoodGrad;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
    this.ctx.fill();

    // 3. Glowing Serpent Eyes (Peaceful divine snake)
    const eyeOffsetX = Math.cos(0.25) * 4;
    const eyeOffsetY = Math.sin(0.25) * 4;
    this.ctx.beginPath();
    this.ctx.arc(snakeHeadX + eyeOffsetX - 2, snakeHeadY - 4 + eyeOffsetY, 2, 0, Math.PI * 2);
    this.ctx.arc(snakeHeadX + eyeOffsetX + 5, snakeHeadY - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fill();

    // 4. Subtle Flickering Sacred Tongue (Every ~4 seconds)
    if (Math.sin(time * 2.2) > 0.88) {
      this.ctx.beginPath();
      this.ctx.moveTo(snakeHeadX + 8, snakeHeadY);
      this.ctx.lineTo(snakeHeadX + 16, snakeHeadY + Math.sin(time * 10) * 2);
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawSnow() {
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this.snowFlakes.length; i++) {
      const sf = this.snowFlakes[i];
      sf.y += sf.speedY;
      sf.x += sf.speedX;

      if (sf.y > this.height) {
        sf.y = -10;
        sf.x = Math.random() * this.width;
      }
      if (sf.x > this.width) sf.x = 0;
      if (sf.x < 0) sf.x = this.width;

      this.ctx.beginPath();
      this.ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
      this.ctx.globalAlpha = sf.alpha;
      this.ctx.fill();
    }
    this.ctx.restore();
  }
}

window.ShivaLivingMotion = ShivaLivingMotion;
