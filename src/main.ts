import { Game } from './Game.js';

// Make game instance globally accessible for debugging
declare global {
  interface Window {
    pacmanGame: Game;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
  if (canvas) {
    const game = new Game(canvas);
    window.pacmanGame = game; // Make it globally accessible
    console.log('Pacman game initialized! Use window.pacmanGame to access game controls.');
  } else {
    console.error('Canvas element not found!');
  }
});
