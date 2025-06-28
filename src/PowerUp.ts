import { GameEntity } from './types.js';

export enum PowerUpType {
  EXTRA_LIFE = 'EXTRA_LIFE'
}

export class PowerUp implements GameEntity {
  public x: number;
  public y: number;
  public size: number = 16;
  public type: PowerUpType;
  public lifespan: number = 10000; // 10 seconds in milliseconds
  public createdAt: number;
  public isActive: boolean = true;
  private pulseAnimation: number = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.createdAt = Date.now();
  }

  update(): void {
    // Check if powerup has expired
    if (Date.now() - this.createdAt > this.lifespan) {
      this.isActive = false;
    }

    // Update pulse animation
    this.pulseAnimation += 0.2;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive) return;

    const centerX = this.x + this.size / 2;
    const centerY = this.y + this.size / 2;
    
    // Create pulsing effect
    const pulse = Math.sin(this.pulseAnimation) * 0.2 + 1;
    const currentSize = this.size * pulse;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(pulse, pulse);

    switch (this.type) {
      case PowerUpType.EXTRA_LIFE:
        this.renderHeart(ctx);
        break;
    }

    ctx.restore();

    // Add glow effect
    ctx.save();
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.3;
    
    ctx.translate(centerX, centerY);
    ctx.scale(pulse * 1.2, pulse * 1.2);
    this.renderHeart(ctx);
    
    ctx.restore();
  }

  private renderHeart(ctx: CanvasRenderingContext2D): void {
    const heartSize = this.size / 2;
    
    ctx.fillStyle = '#ff1493'; // Deep pink color
    ctx.beginPath();
    
    // Draw heart shape
    const x = -heartSize / 2;
    const y = -heartSize / 2;
    
    // Left curve
    ctx.arc(x + heartSize * 0.25, y + heartSize * 0.25, heartSize * 0.25, 0, Math.PI, true);
    // Right curve  
    ctx.arc(x + heartSize * 0.75, y + heartSize * 0.25, heartSize * 0.25, 0, Math.PI, true);
    // Bottom point
    ctx.lineTo(x + heartSize, y + heartSize * 0.75);
    ctx.lineTo(x + heartSize * 0.5, y + heartSize);
    ctx.lineTo(x, y + heartSize * 0.75);
    
    ctx.closePath();
    ctx.fill();

    // Add highlight
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    ctx.arc(x + heartSize * 0.3, y + heartSize * 0.3, heartSize * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  checkCollision(player: { x: number; y: number; size: number }): boolean {
    if (!this.isActive) return false;

    const dx = (this.x + this.size / 2) - (player.x + player.size / 2);
    const dy = (this.y + this.size / 2) - (player.y + player.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (this.size + player.size) / 2;
  }

  collect(): void {
    this.isActive = false;
  }
}
