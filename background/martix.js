class MatrixRain {
  constructor() {
    this.canvas = document.getElementById('matrix-rain');
    this.ctx = this.canvas.getContext('2d');
    
    this.fontSize = 14;
    this.columns = 0;
    this.drops = [];
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Neon colors array
    this.colors = [
      '#00FFFF', // Cyan
      '#00FF00', // Green
      '#800080'  // Purple
    ];
    
    this.symbols = '711131719XYZ'.split('');
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Safely calculate columns and initialize drops array
    const newColumns = Math.floor(this.canvas.width / this.fontSize);
    
    // Only create new drops array if columns changed
    if (newColumns !== this.columns) {
      this.columns = newColumns;
      this.drops = new Array(this.columns).fill(1);
    }
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getRandomSymbol() {
    return this.symbols[Math.floor(Math.random() * this.symbols.length)];
  }

  draw() {
    // Semi-transparent black to create fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.getRandomSymbol();
      const color = this.getRandomColor();
      
      // Add glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = color;
      this.ctx.fillStyle = color;
      this.ctx.font = `${this.fontSize}px monospace`;
      
      // Draw the symbol
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

      // Reset drop if it reaches bottom or randomly
      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      
      // Move drop down
      this.drops[i]++;
    }
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize Matrix Rain effect when document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new MatrixRain();
});
