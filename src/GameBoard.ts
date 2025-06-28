import { CellType } from './types.js';

export class GameBoard {
  public maze: number[][];
  public cellSize: number = 25;
  public rows: number;
  public cols: number;

  constructor() {
    // Simple maze layout (1 = wall, 2 = pellet, 0 = empty)
    this.maze = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1,1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,0,0,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,2,1,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
      [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
      [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,0,0,0,1,1,1,0,1,1,1,2,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,2,2,2,2,2,2,2,2],
      [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,2,1,1,1,1,1,1],
      [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,2,1,0,0,0,0,0],
      [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,1,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,0,0,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
      [1,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,1],
      [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
      [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,0,0,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,0,0,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    this.rows = this.maze.length;
    this.cols = this.maze[0].length;
  }

  isWall(x: number, y: number): boolean {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return true;
    }
    
    return this.maze[row][col] === CellType.WALL;
  }

  isPellet(x: number, y: number): boolean {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false;
    }
    
    return this.maze[row][col] === CellType.PELLET;
  }

  collectPellet(x: number, y: number): boolean {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false;
    }
    
    if (this.maze[row][col] === CellType.PELLET) {
      this.maze[row][col] = CellType.EMPTY;
      return true;
    }
    
    return false;
  }

  countPellets(): number {
    let count = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.maze[row][col] === CellType.PELLET) {
          count++;
        }
      }
    }
    return count;
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        switch (this.maze[row][col]) {
          case CellType.WALL:
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(x, y, this.cellSize, this.cellSize);
            break;
          case CellType.PELLET:
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }
    }
  }
}
