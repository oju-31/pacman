export interface Position {
  x: number;
  y: number;
}

export interface GameEntity {
  x: number;
  y: number;
  size: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  PELLET = 2,
  POWER_PELLET = 3
}
