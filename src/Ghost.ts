import { Direction, GameEntity } from './types.js';
import { GameBoard } from './GameBoard.js';
import { Player } from './Player.js';

export class Ghost implements GameEntity {
  public x: number;
  public y: number;
  public size: number = 20;
  public speed: number = 1.2;
  public direction: Direction = Direction.UP;
  public color: string;
  private directionChangeTimer: number = 0;
  private stuckCounter: number = 0;

  constructor(x: number, y: number, color: string = '#ff0000') {
    this.x = x;
    this.y = y;
    this.color = color;
    // Start with a random direction
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
  }

  update(gameBoard: GameBoard, player: Player): void {
    this.directionChangeTimer++;

    // Get all possible directions
    const allDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const validDirections = allDirections.filter(dir => this.canMove(dir, gameBoard));

    // If no valid directions, try to get unstuck
    if (validDirections.length === 0) {
      this.stuckCounter++;
      console.log(`Ghost at (${this.x}, ${this.y}) is stuck! Counter: ${this.stuckCounter}`);
      
      if (this.stuckCounter > 5) {
        // Force move to get unstuck - try each direction with reduced collision checking
        for (const dir of allDirections) {
          const nextPos = this.getNextPosition(dir);
          if (nextPos.x >= 0 && nextPos.x < (gameBoard.cols * gameBoard.cellSize - this.size) &&
              nextPos.y >= 0 && nextPos.y < (gameBoard.rows * gameBoard.cellSize - this.size)) {
            this.direction = dir;
            this.stuckCounter = 0;
            break;
          }
        }
      }
      return;
    }

    this.stuckCounter = 0;

    // Decide when to change direction
    const shouldChangeDirection = 
      this.directionChangeTimer > 30 || // Change every 30 frames
      !this.canMove(this.direction, gameBoard) || // Current direction blocked
      Math.random() < 0.05; // 5% chance to change direction randomly

    if (shouldChangeDirection && validDirections.length > 0) {
      // Avoid immediate reversals unless it's the only option
      const oppositeDir = this.getOppositeDirection(this.direction);
      let smartDirections = validDirections.filter(dir => dir !== oppositeDir);
      
      if (smartDirections.length === 0) {
        smartDirections = validDirections;
      }

      // Choose direction that gets closer to Pacman
      this.direction = this.chooseBestDirection(smartDirections, player);
      this.directionChangeTimer = 0;
    }

    // Move in current direction if possible
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
    } else {
      // If we can't move in current direction, pick a new one immediately
      if (validDirections.length > 0) {
        this.direction = this.chooseBestDirection(validDirections, player);
      }
    }

    // Handle screen wrapping (tunnel effect)
    if (this.x < -this.size) {
      this.x = gameBoard.cols * gameBoard.cellSize;
    } else if (this.x > gameBoard.cols * gameBoard.cellSize) {
      this.x = -this.size;
    }
  }

  private chooseBestDirection(validDirections: Direction[], player: Player): Direction {
    let bestDirection = validDirections[0];
    let shortestDistance = Infinity;

    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    for (const dir of validDirections) {
      const nextPos = this.getNextPosition(dir);
      const ghostCenterX = nextPos.x + this.size / 2;
      const ghostCenterY = nextPos.y + this.size / 2;
      
      const distance = Math.sqrt(
        Math.pow(ghostCenterX - playerCenterX, 2) + 
        Math.pow(ghostCenterY - playerCenterY, 2)
      );

      // Add small random factor to prevent predictable behavior
      const randomFactor = Math.random() * 5;
      const adjustedDistance = distance + randomFactor;

      if (adjustedDistance < shortestDistance) {
        shortestDistance = adjustedDistance;
        bestDirection = dir;
      }
    }

    return bestDirection;
  }

  private getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
      case Direction.UP: return Direction.DOWN;
      case Direction.DOWN: return Direction.UP;
      case Direction.LEFT: return Direction.RIGHT;
      case Direction.RIGHT: return Direction.LEFT;
    }
  }

  private getNextPosition(direction: Direction): { x: number; y: number } {
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

    return { x: nextX, y: nextY };
  }

  private canMove(direction: Direction, gameBoard: GameBoard): boolean {
    const nextPos = this.getNextPosition(direction);

    // Check if the ghost would be within bounds
    if (nextPos.x < 0 || nextPos.x + this.size > gameBoard.cols * gameBoard.cellSize ||
        nextPos.y < 0 || nextPos.y + this.size > gameBoard.rows * gameBoard.cellSize) {
      return false;
    }

    // Check fewer points for more forgiving collision detection
    const checkPoints = [
      { x: nextPos.x + 2, y: nextPos.y + 2 }, // Top-left with margin
      { x: nextPos.x + this.size - 2, y: nextPos.y + 2 }, // Top-right with margin
      { x: nextPos.x + 2, y: nextPos.y + this.size - 2 }, // Bottom-left with margin
      { x: nextPos.x + this.size - 2, y: nextPos.y + this.size - 2 }, // Bottom-right with margin
      { x: nextPos.x + this.size / 2, y: nextPos.y + this.size / 2 } // Center
    ];

    // If any check point hits a wall, can't move
    return !checkPoints.some(point => gameBoard.isWall(point.x, point.y));
  }

  checkCollision(player: Player): boolean {
    const ghostCenterX = this.x + this.size / 2;
    const ghostCenterY = this.y + this.size / 2;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    
    const dx = ghostCenterX - playerCenterX;
    const dy = ghostCenterY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Collision if distance is less than combined radii (with a bit of tolerance)
    const collisionDistance = (this.size + player.size) / 2 - 2;
    return distance < collisionDistance;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Ghost body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, Math.PI, 0);
    ctx.rect(this.x, this.y + this.size / 2, this.size, this.size / 2);
    ctx.fill();

    // Ghost bottom wavy part
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.size);
    for (let i = 0; i < this.size; i += 4) {
      ctx.lineTo(this.x + i, this.y + this.size - (i % 8 < 4 ? 0 : 4));
    }
    ctx.lineTo(this.x + this.size, this.y + this.size / 2);
    ctx.lineTo(this.x, this.y + this.size / 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.3, 3, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 0.7, this.y + this.size * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.3, 1, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 0.7, this.y + this.size * 0.3, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}
