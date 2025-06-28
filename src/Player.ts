import { Direction, GameEntity } from './types.js';
import { GameBoard } from './GameBoard.js';

export class Player implements GameEntity {
  public x: number;
  public y: number;
  public size: number = 20;
  public speed: number = 2;
  public direction: Direction = Direction.RIGHT;
  public nextDirection: Direction = Direction.RIGHT;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(gameBoard: GameBoard): void {
    // Try to change direction if requested
    if (this.canMove(this.nextDirection, gameBoard)) {
      this.direction = this.nextDirection;
    }

    // Move in current direction
    if (this.canMove(this.direction, gameBoard)) {
      switch (this.direction) {
        case Direction.UP:
          this.y -= this.speed;
          break;
        case Direction.DOWN:
          this.y += this.speed;
          break;
        case Direction.LEFT:
          this.x -= this.speed;
          break;
        case Direction.RIGHT:
          this.x += this.speed;
          break;
      }
    }

    // Handle screen wrapping (tunnel effect)
    if (this.x < 0) {
      this.x = gameBoard.cols * gameBoard.cellSize - this.size;
    } else if (this.x > gameBoard.cols * gameBoard.cellSize) {
      this.x = 0;
    }
  }

  private canMove(direction: Direction, gameBoard: GameBoard): boolean {
    let nextX = this.x;
    let nextY = this.y;

    switch (direction) {
      case Direction.UP:
        nextY -= this.speed;
        break;
      case Direction.DOWN:
        nextY += this.speed;
        break;
      case Direction.LEFT:
        nextX -= this.speed;
        break;
      case Direction.RIGHT:
        nextX += this.speed;
        break;
    }

    // Check all corners of the player
    const corners = [
      { x: nextX, y: nextY },
      { x: nextX + this.size, y: nextY },
      { x: nextX, y: nextY + this.size },
      { x: nextX + this.size, y: nextY + this.size }
    ];

    return !corners.some(corner => gameBoard.isWall(corner.x, corner.y));
  }

  setDirection(direction: Direction): void {
    this.nextDirection = direction;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const centerX = this.x + this.size / 2;
    const centerY = this.y + this.size / 2;
    const radius = this.size / 2;

    // Draw yellow body first
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw black mouth based on direction
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    
    let mouthStartAngle = 0;
    let mouthEndAngle = 0;

    switch (this.direction) {
      case Direction.RIGHT:
        mouthStartAngle = -0.3 * Math.PI;
        mouthEndAngle = 0.3 * Math.PI;
        break;
      case Direction.LEFT:
        mouthStartAngle = 0.7 * Math.PI;
        mouthEndAngle = 1.3 * Math.PI;
        break;
      case Direction.UP:
        mouthStartAngle = 1.2 * Math.PI;
        mouthEndAngle = 1.8 * Math.PI;
        break;
      case Direction.DOWN:
        mouthStartAngle = 0.2 * Math.PI;
        mouthEndAngle = 0.8 * Math.PI;
        break;
    }

    // Create mouth by drawing a triangle
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, mouthStartAngle, mouthEndAngle);
    ctx.closePath();
    ctx.fill();
  }
}
