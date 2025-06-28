import { Player } from './Player.js';
import { Ghost } from './Ghost.js';
import { GameBoard } from './GameBoard.js';
import { Direction } from './types.js';
import { SoundManager } from './SoundManager.js';
import { PowerUp, PowerUpType } from './PowerUp.js';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private ghosts: Ghost[];
  private gameBoard: GameBoard;
  private score: number = 0;
  private lives: number = 3;
  private gameRunning: boolean = true;
  private gamePaused: boolean = false;
  private gameStarted: boolean = false;
  private scoreElement: HTMLElement;
  private livesElement: HTMLElement;
  private soundManager: SoundManager;
  private powerUps: PowerUp[] = [];
  private lastPowerUpSpawn: number = 0;
  private powerUpSpawnInterval: number = 30000; // 30 seconds

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.scoreElement = document.getElementById('score')!;
    this.livesElement = document.getElementById('lives')!;
    
    // Initialize sound manager
    this.soundManager = new SoundManager();
    
    this.gameBoard = new GameBoard();
    
    // Position player at a safe starting position
    this.player = new Player(25, 25); // Cell (1,1) - safe pellet location
    
    // Create ghosts in known safe open areas
    this.ghosts = this.createGhosts();

    this.updateLives();
    this.setupControls();
    this.setupGameControls();
    this.gameLoop();
  }

  // Public methods for game control
  public startGame(): void {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.gameRunning = true;
      this.gamePaused = false;
      this.lastPowerUpSpawn = Date.now(); // Reset power-up timer
      this.soundManager.playSound('gameStart');
      this.soundManager.playBackgroundMusic();
      console.log('Game Started!');
    }
  }

  public pauseGame(): void {
    if (this.gameStarted && this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      this.soundManager.playSound('pause');
      
      if (this.gamePaused) {
        this.soundManager.stopBackgroundMusic();
      } else {
        this.soundManager.playBackgroundMusic();
      }
      
      console.log(this.gamePaused ? 'Game Paused' : 'Game Resumed');
    }
  }

  public resetGame(): void {
    this.gameStarted = false;
    this.gameRunning = true;
    this.gamePaused = false;
    this.score = 0;
    this.lives = 3;
    this.powerUps = [];
    this.lastPowerUpSpawn = 0;
    this.updateScore();
    this.updateLives();
    
    // Stop background music
    this.soundManager.stopBackgroundMusic();
    
    // Reset game board
    this.gameBoard = new GameBoard();
    
    // Reset player position
    this.player = new Player(25, 25);
    
    // Reset ghosts
    this.ghosts = this.createGhosts();
    
    console.log('Game Reset!');
  }

  public toggleMute(): boolean {
    return this.soundManager.toggleMute();
  }

  private setupGameControls(): void {
    // Create control buttons
    this.createControlButtons();
  }

  private createControlButtons(): void {
    // Check if controls already exist
    if (document.getElementById('game-controls')) {
      return;
    }

    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'game-controls';
    controlsDiv.style.cssText = `
      margin: 10px 0;
      text-align: center;
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    `;

    // Start button
    const startBtn = document.createElement('button');
    startBtn.id = 'start-btn';
    startBtn.textContent = 'Start Game';
    startBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background-color: #00ff00;
      color: #000;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    startBtn.addEventListener('click', () => this.startGame());

    // Pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pause-btn';
    pauseBtn.textContent = 'Pause';
    pauseBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background-color: #ffff00;
      color: #000;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    pauseBtn.addEventListener('click', () => {
      this.pauseGame();
      pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';
    });

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset-btn';
    resetBtn.textContent = 'Reset Game';
    resetBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background-color: #ff0000;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    resetBtn.addEventListener('click', () => {
      this.resetGame();
      const pauseBtnElement = document.getElementById('pause-btn') as HTMLButtonElement;
      if (pauseBtnElement) {
        pauseBtnElement.textContent = 'Pause';
      }
    });

    // Mute button
    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.textContent = '🔊 Sound';
    muteBtn.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background-color: #9932cc;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    muteBtn.addEventListener('click', () => {
      const isMuted = this.toggleMute();
      muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
    });

    controlsDiv.appendChild(startBtn);
    controlsDiv.appendChild(pauseBtn);
    controlsDiv.appendChild(resetBtn);
    controlsDiv.appendChild(muteBtn);

    // Insert controls after the score but before the canvas
    const scoreDiv = document.querySelector('.score');
    if (scoreDiv && scoreDiv.parentNode) {
      scoreDiv.parentNode.insertBefore(controlsDiv, scoreDiv.nextSibling);
    }
  }

  private createGhosts(): Ghost[] {
    // Find safe positions by checking the maze
    const safePositions = this.findSafePositions();
    
    const colors = ['#ff0000', '#ffb8ff', '#00ffff'];
    const ghosts: Ghost[] = [];
    
    for (let i = 0; i < 3 && i < safePositions.length; i++) {
      const pos = safePositions[i];
      ghosts.push(new Ghost(pos.x, pos.y, colors[i]));
    }
    
    return ghosts;
  }

  private findSafePositions(): {x: number, y: number}[] {
    const positions: {x: number, y: number}[] = [];
    const cellSize = this.gameBoard.cellSize;
    
    // Check specific known safe areas in the maze
    const testPositions = [
      {row: 5, col: 15}, // Center corridor
      {row: 3, col: 5},  // Left side
      {row: 3, col: 25}, // Right side
      {row: 11, col: 15}, // Lower center
      {row: 17, col: 8},  // Lower left
      {row: 17, col: 22}, // Lower right
    ];
    
    for (const testPos of testPositions) {
      const x = testPos.col * cellSize;
      const y = testPos.row * cellSize;
      
      // Check if this position is safe (not a wall)
      if (!this.gameBoard.isWall(x + 10, y + 10)) {
        positions.push({x, y});
        if (positions.length >= 3) break;
      }
    }
    
    // Fallback positions if we can't find enough safe spots
    if (positions.length < 3) {
      positions.push(
        {x: 400, y: 300},
        {x: 100, y: 100},
        {x: 700, y: 100}
      );
    }
    
    return positions;
  }

  private setupControls(): void {
    // Ensure the canvas can receive focus
    this.canvas.tabIndex = 0;
    this.canvas.focus();
    
    // Add keyboard event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle game control keys
      switch (event.key) {
        case 'p':
        case 'P':
          this.pauseGame();
          const pauseBtnElement = document.getElementById('pause-btn') as HTMLButtonElement;
          if (pauseBtnElement) {
            pauseBtnElement.textContent = this.gamePaused ? 'Resume' : 'Pause';
          }
          event.preventDefault();
          return;
        case 'r':
        case 'R':
          this.resetGame();
          const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
          if (pauseBtn) {
            pauseBtn.textContent = 'Pause';
          }
          event.preventDefault();
          return;
        case 's':
        case 'S':
          if (!this.gameStarted) {
            this.startGame();
            event.preventDefault();
            return;
          }
          break;
        case 'm':
        case 'M':
          const isMuted = this.toggleMute();
          const muteBtn = document.getElementById('mute-btn') as HTMLButtonElement;
          if (muteBtn) {
            muteBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
          }
          event.preventDefault();
          return;
      }

      // Don't process movement if game hasn't started or is paused
      if (!this.gameStarted || this.gamePaused) {
        if (event.key === ' ' && !this.gameRunning) {
          this.resetGame();
          event.preventDefault();
        }
        return;
      }

      // Handle game over restart
      if (!this.gameRunning) {
        if (event.key === ' ') {
          this.resetGame();
          this.startGame();
          event.preventDefault();
        }
        return;
      }

      let directionChanged = false;
      
      // Movement controls
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.player.setDirection(Direction.UP);
          directionChanged = true;
          break;
        case 'ArrowDown':
          // Only use 's' for movement if game is started (to avoid conflict with start)
          if (this.gameStarted) {
            this.player.setDirection(Direction.DOWN);
            directionChanged = true;
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.player.setDirection(Direction.LEFT);
          directionChanged = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.player.setDirection(Direction.RIGHT);
          directionChanged = true;
          break;
      }
      
      if (directionChanged) {
        event.preventDefault();
      }
    };

    // Add event listeners to both document and canvas
    document.addEventListener('keydown', handleKeyDown);
    this.canvas.addEventListener('keydown', handleKeyDown);
    
    // Keep canvas focused when clicked
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });
    
    // Focus canvas when mouse enters
    this.canvas.addEventListener('mouseenter', () => {
      this.canvas.focus();
    });
  }

  private gameLoop(): void {
    // Only update game logic if game is started, running, and not paused
    if (this.gameStarted && this.gameRunning && !this.gamePaused) {
      this.update();
    }
    
    // Always render (to show pause screen, start screen, etc.)
    this.render();
    
    // Continue the game loop
    requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    // Update player
    this.player.update(this.gameBoard);

    // Check pellet collection
    if (this.gameBoard.isPellet(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2)) {
      if (this.gameBoard.collectPellet(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2)) {
        this.score += 10;
        this.updateScore();
        this.soundManager.playSound('pellet'); // Play pellet sound
      }
    }

    // Update ghosts
    this.ghosts.forEach(ghost => {
      ghost.update(this.gameBoard, this.player);
    });

    // Spawn power-ups every 30 seconds
    this.spawnPowerUps();

    // Update power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      powerUp.update();
      
      // Check collision with player
      if (powerUp.checkCollision(this.player)) {
        this.collectPowerUp(powerUp);
        return false; // Remove from array
      }
      
      return powerUp.isActive; // Keep active power-ups
    });

    // Check collisions with ghosts
    this.ghosts.forEach(ghost => {
      if (ghost.checkCollision(this.player)) {
        this.loseLife();
      }
    });

    // Check win condition
    if (this.gameBoard.countPellets() === 0) {
      this.gameWin();
    }
  }

  private spawnPowerUps(): void {
    const now = Date.now();
    if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
      const safePosition = this.findSafePowerUpPosition();
      if (safePosition) {
        const powerUp = new PowerUp(safePosition.x, safePosition.y, PowerUpType.EXTRA_LIFE);
        this.powerUps.push(powerUp);
        this.lastPowerUpSpawn = now;
        console.log('Extra life spawned at:', safePosition);
      }
    }
  }

  private findSafePowerUpPosition(): {x: number, y: number} | null {
    const cellSize = this.gameBoard.cellSize;
    const maxAttempts = 50;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const row = Math.floor(Math.random() * this.gameBoard.rows);
      const col = Math.floor(Math.random() * this.gameBoard.cols);
      const x = col * cellSize + cellSize / 4;
      const y = row * cellSize + cellSize / 4;
      
      // Check if position is not a wall and not too close to player
      if (!this.gameBoard.isWall(x, y) && !this.gameBoard.isWall(x + 16, y + 16)) {
        const distanceToPlayer = Math.sqrt(
          Math.pow(x - this.player.x, 2) + Math.pow(y - this.player.y, 2)
        );
        
        // Make sure it's not too close to player (at least 100 pixels away)
        if (distanceToPlayer > 100) {
          return {x, y};
        }
      }
    }
    
    return null; // Couldn't find a safe position
  }

  private collectPowerUp(powerUp: PowerUp): void {
    powerUp.collect();
    
    switch (powerUp.type) {
      case PowerUpType.EXTRA_LIFE:
        this.lives++;
        this.updateLives();
        this.soundManager.playSound('extraLife'); // Use extra life sound
        console.log('Extra life collected! Lives:', this.lives);
        break;
    }
  }

  private loseLife(): void {
    this.lives--;
    this.updateLives();
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position but continue game
      this.player = new Player(25, 25);
      this.soundManager.playSound('ghost');
      console.log('Life lost! Lives remaining:', this.lives);
      
      // Brief pause before continuing
      setTimeout(() => {
        // Game continues...
      }, 1000);
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Always render the game board, player, and ghosts
    this.gameBoard.render(this.ctx);
    this.player.render(this.ctx);
    this.ghosts.forEach(ghost => {
      ghost.render(this.ctx);
    });

    // Render power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.render(this.ctx);
    });

    // Debug info - show distance and ghost states
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ghosts.forEach((ghost, index) => {
      const dx = (ghost.x + ghost.size/2) - (this.player.x + this.player.size/2);
      const dy = (ghost.y + ghost.size/2) - (this.player.y + this.player.size/2);
      const distance = Math.sqrt(dx*dx + dy*dy);
      this.ctx.fillText(`Ghost ${index+1}: ${Math.round(distance)}px at (${Math.round(ghost.x)}, ${Math.round(ghost.y)})`, 10, 20 + index * 15);
    });

    // Show power-up info
    if (this.powerUps.length > 0) {
      this.ctx.fillText(`Power-ups active: ${this.powerUps.length}`, 10, 80);
    }

    // Show next power-up timer
    const timeSinceLastSpawn = Date.now() - this.lastPowerUpSpawn;
    const timeUntilNext = Math.max(0, this.powerUpSpawnInterval - timeSinceLastSpawn);
    if (this.gameStarted && this.gameRunning && !this.gamePaused && timeUntilNext > 0) {
      this.ctx.fillText(`Next ❤️ in: ${Math.ceil(timeUntilNext / 1000)}s`, 10, 100);
    }

    // Show game state overlays
    if (!this.gameStarted) {
      this.renderStartScreen();
    } else if (this.gamePaused) {
      this.renderPauseScreen();
    } else if (!this.gameRunning) {
      this.renderGameOverScreen();
    }
  }

  private renderStartScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAC-MAN', this.canvas.width / 2, this.canvas.height / 2 - 140);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Click START GAME or press S to begin', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.font = '18px Arial';
    this.ctx.fillText('Controls:', this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillText('Arrow Keys or WASD - Move', this.canvas.width / 2, this.canvas.height / 2 + 5);
    this.ctx.fillText('P - Pause/Resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('R - Reset Game', this.canvas.width / 2, this.canvas.height / 2 + 55);
    this.ctx.fillText('M - Toggle Sound', this.canvas.width / 2, this.canvas.height / 2 + 80);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#ff69b4';
    this.ctx.fillText('❤️ Collect hearts for extra lives!', this.canvas.width / 2, this.canvas.height / 2 + 110);
    this.ctx.fillText('Hearts appear every 30 seconds', this.canvas.width / 2, this.canvas.height / 2 + 130);
    
    this.ctx.textAlign = 'left';
  }

  private renderPauseScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press P to resume or click PAUSE button', this.canvas.width / 2, this.canvas.height / 2 + 50);
    
    this.ctx.textAlign = 'left';
  }

  private renderGameOverScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    
    if (this.gameBoard.countPellets() === 0) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 50);
    } else {
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
    }
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('Press SPACE or RESET to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
    
    this.ctx.textAlign = 'left';
  }

  private updateScore(): void {
    this.scoreElement.textContent = this.score.toString();
  }

  private updateLives(): void {
    // Create heart symbols for lives display
    const heartsDisplay = '❤️'.repeat(this.lives);
    this.livesElement.textContent = heartsDisplay || '💀'; // Skull if no lives
  }

  private gameOver(): void {
    this.gameRunning = false;
    this.soundManager.stopBackgroundMusic();
    this.soundManager.playSound('gameOver');
  }

  private gameWin(): void {
    this.gameRunning = false;
    this.score += 1000; // Bonus for winning
    this.updateScore();
    this.soundManager.stopBackgroundMusic();
    this.soundManager.playSound('win');
  }
}
