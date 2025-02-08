// Enhanced particle system with more complexity
class AdvancedParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.particleCount = 300; // More particles
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.createParticles();
    this.animate();
  }

  createParticles() {
    for(let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        color: `rgba(0, 159, 253, ${Math.random() * 0.5})`,
        trail: []
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // More complex particle movement
      particle.x += particle.speedX * 1.5;
      particle.y += particle.speedY * 1.5;
      
      // Wrap around screen
      particle.x = (particle.x + this.canvas.width) % this.canvas.width;
      particle.y = (particle.y + this.canvas.height) % this.canvas.height;

      // Mouse interaction
      if(this.mouse.x && this.mouse.y) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance < 150) {
          particle.speedX += dx * 0.0005;
          particle.speedY += dy * 0.0005;
        }
      }

      // Render particle
      this.ctx.beginPath();
      this.ctx.fillStyle = particle.color;
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

class WebsimAIExperience {
  constructor() {
    this.setupScrollEffects();
    this.setupNavigation();
    this.setupInteractions();
  }

  setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('active', entry.isIntersecting);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  }

  setupNavigation() {
    const startLearningBtn = document.getElementById('start-learning');
    if (startLearningBtn) {
      startLearningBtn.addEventListener('click', () => {
        document.getElementById('guide').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  setupInteractions() {
    // Add tooltips to nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.classList.add('nav-tooltip');
        tooltip.textContent = link.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = link.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + rect.width/2}px`;
        tooltip.style.transform = 'translateX(-50%)';
      });

      link.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.nav-tooltip');
        if (tooltip) tooltip.remove();
      });
    });
  }
}

// Initialize advanced particle system and other components
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.particles-canvas');
  new AdvancedParticleSystem(canvas);
  new WebsimAIExperience();
});
